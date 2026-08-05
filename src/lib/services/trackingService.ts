import { prisma } from '@/lib/prisma';

/**
 * Tracking Service - records visitor behavior events for analytics.
 */
export class TrackingService {
  /**
   * Records a tracking event.
   */
  async trackEvent(data: {
    sessionId?: string;
    customerId?: number;
    eventType: string;
    pageUrl?: string;
    productId?: number;
    searchData?: string;
    duration?: number;
    country?: string;
    referrer?: string;
    deviceType?: string;
    sourceCategory?: string;
  }) {
    const now = new Date().toISOString();

    // Use raw SQL to include the new columns (referrer, deviceType, sourceCategory)
    // that were added via ALTER TABLE and are not in the Prisma Client.
    await prisma.$executeRawUnsafe(
      `INSERT INTO TrackingEvent (sessionId, customerId, eventType, pageUrl, productId, searchData, duration, country, referrer, deviceType, sourceCategory, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      data.sessionId || null,
      data.customerId || null,
      data.eventType || 'unknown',
      data.pageUrl || null,
      data.productId || null,
      data.searchData || null,
      data.duration || null,
      data.country || null,
      data.referrer || null,
      data.deviceType || null,
      data.sourceCategory || null,
      now
    );

    // Return a minimal object for compatibility with existing callers
    return { sessionId: data.sessionId || null, eventType: data.eventType || 'unknown' };
  }

  /**
   * Fetches tracking statistics for admin dashboard.
   */
  async getStats(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalEvents, uniqueVisitors, productViews, inquirySubmits, chatStarted] = await Promise.all([
      prisma.trackingEvent.count({ where: { createdAt: { gte: since } } }),
      prisma.trackingEvent.findMany({
        where: { createdAt: { gte: since }, sessionId: { not: null } },
        select: { sessionId: true },
        distinct: ['sessionId'],
      }),
      prisma.trackingEvent.count({
        where: { createdAt: { gte: since }, eventType: 'product_view' },
      }),
      prisma.trackingEvent.count({
        where: { createdAt: { gte: since }, eventType: 'inquiry_submit' },
      }),
      prisma.trackingEvent.count({
        where: { createdAt: { gte: since }, eventType: 'chat_start' },
      }),
    ]);

    return {
      totalEvents,
      uniqueVisitors: uniqueVisitors.length,
      productViews,
      inquirySubmits,
      chatStarted,
      period: `${days} days`,
    };
  }

  /**
   * Fetches comprehensive dashboard statistics including today's UV/PV,
   * average page duration, top pages, top countries, and 7-day trend.
   * Supports a timeRange parameter for chart data filtering.
   */
  async getDashboardStats(timeRange: 'today' | 'yesterday' | '7d' | '30d' = '7d') {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Compute the "since" date based on timeRange
    const since = this.computeSinceDate(timeRange);

    // Today's UV (unique visitors via distinct sessionId)
    const todayVisitors = await prisma.trackingEvent.findMany({
      where: { createdAt: { gte: todayStart }, sessionId: { not: null } },
      select: { sessionId: true },
      distinct: ['sessionId'],
    });
    const todayUV = todayVisitors.length;

    // Today's PV (page view events)
    const todayPV = await prisma.trackingEvent.count({
      where: { createdAt: { gte: todayStart }, eventType: 'page_view' },
    });

    // Average page duration (from page_leave events today)
    const pageLeaveEvents = await prisma.trackingEvent.findMany({
      where: { createdAt: { gte: todayStart }, eventType: 'page_leave', duration: { not: null } },
      select: { duration: true },
    });
    const avgDuration =
      pageLeaveEvents.length > 0
        ? Math.round(
            pageLeaveEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / pageLeaveEvents.length
          )
        : 0;

    // Top 5 pages by PV (within timeRange)
    const topPagesRaw = await prisma.trackingEvent.groupBy({
      by: ['pageUrl'],
      where: { eventType: 'page_view', pageUrl: { not: null }, createdAt: { gte: since } },
      _count: { eventType: true },
      orderBy: { _count: { eventType: 'desc' } },
      take: 5,
    });
    const topPages = topPagesRaw.map((p) => ({
      url: p.pageUrl || '/',
      pv: p._count.eventType,
    }));

    // Top 10 countries (within timeRange)
    const topCountriesRaw = await prisma.trackingEvent.groupBy({
      by: ['country'],
      where: { country: { not: null }, createdAt: { gte: since } },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });
    const topCountries = topCountriesRaw
      .filter((c) => c.country && c.country.trim().length > 0)
      .map((c) => ({
        country: c.country || 'Unknown',
        count: c._count.country,
      }));

    // 7-day trend (UV + PV per day)
    const trend: Array<{ date: string; uv: number; pv: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [dayVisitors, dayPV] = await Promise.all([
        prisma.trackingEvent.findMany({
          where: { createdAt: { gte: dayStart, lt: dayEnd }, sessionId: { not: null } },
          select: { sessionId: true },
          distinct: ['sessionId'],
        }),
        prisma.trackingEvent.count({
          where: { createdAt: { gte: dayStart, lt: dayEnd }, eventType: 'page_view' },
        }),
      ]);

      trend.push({
        date: dayStart.toISOString().slice(0, 10),
        uv: dayVisitors.length,
        pv: dayPV,
      });
    }

    // Fetch chart data (hourly trend, traffic sources, device distribution)
    const [hourlyTrend, trafficSources, deviceDistribution] = await Promise.all([
      this.getHourlyStats(timeRange),
      this.getTrafficSources(timeRange),
      this.getDeviceDistribution(timeRange),
    ]);

    return {
      todayUV,
      todayPV,
      avgDuration,
      topPages,
      topCountries,
      trend,
      topCountriesTop10: topCountries,
      hourlyTrend,
      trafficSources,
      deviceDistribution,
      timeRange,
    };
  }

  /** Computes the "since" Date for a given time range string. */
  private computeSinceDate(timeRange: 'today' | 'yesterday' | '7d' | '30d'): Date {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timeRange) {
      case 'today':
        return todayStart;
      case 'yesterday': {
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        return yesterdayStart;
      }
      case '30d': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        return thirtyDaysAgo;
      }
      case '7d':
      default: {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return sevenDaysAgo;
      }
    }
  }

  /** Retrieves hourly visit counts for the given time range (24-hour breakdown). */
  async getHourlyStats(timeRange: 'today' | 'yesterday' | '7d' | '30d' = '7d'): Promise<
    Array<{ hour: string; pv: number }>
  > {
    const since = this.computeSinceDate(timeRange);
    const sinceStr = since.toISOString();

    const rows = await prisma.$queryRawUnsafe<
      Array<{ hour: string; pv: number }>
    >(
      `SELECT strftime('%H', createdAt) as hour, COUNT(*) as pv
       FROM TrackingEvent
       WHERE createdAt >= ? AND eventType = 'page_view'
       GROUP BY hour
       ORDER BY hour ASC`,
      sinceStr
    );

    // Ensure all 24 hours are present (fill missing with 0)
    const result: Array<{ hour: string; pv: number }> = [];
    const hourMap = new Map(rows.map((r) => [r.hour, r.pv]));
    for (let h = 0; h < 24; h++) {
      const hourStr = String(h).padStart(2, '0');
      result.push({ hour: `${hourStr}:00`, pv: hourMap.get(hourStr) ?? 0 });
    }
    return result;
  }

  /** Retrieves traffic source distribution for the given time range. */
  async getTrafficSources(
    timeRange: 'today' | 'yesterday' | '7d' | '30d' = '7d'
  ): Promise<Array<{ source: string; count: number }>> {
    const since = this.computeSinceDate(timeRange);
    const sinceStr = since.toISOString();

    const rows = await prisma.$queryRawUnsafe<
      Array<{ sourceCategory: string; count: number }>
    >(
      `SELECT sourceCategory, COUNT(*) as count
       FROM TrackingEvent
       WHERE createdAt >= ? AND sourceCategory IS NOT NULL
       GROUP BY sourceCategory
       ORDER BY count DESC`,
      sinceStr
    );

    return rows.map((r) => ({
      source: r.sourceCategory,
      count: r.count,
    }));
  }

  /** Retrieves device type distribution for the given time range. */
  async getDeviceDistribution(
    timeRange: 'today' | 'yesterday' | '7d' | '30d' = '7d'
  ): Promise<Array<{ device: string; count: number }>> {
    const since = this.computeSinceDate(timeRange);
    const sinceStr = since.toISOString();

    const rows = await prisma.$queryRawUnsafe<
      Array<{ deviceType: string; count: number }>
    >(
      `SELECT deviceType, COUNT(*) as count
       FROM TrackingEvent
       WHERE createdAt >= ? AND deviceType IS NOT NULL
       GROUP BY deviceType
       ORDER BY count DESC`,
      sinceStr
    );

    return rows.map((r) => ({
      device: r.deviceType,
      count: r.count,
    }));
  }
}

export const trackingService = new TrackingService();
