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
  }) {
    return prisma.trackingEvent.create({ data });
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
   */
  async getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

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

    // Top 5 pages by PV (last 30 days)
    const topPagesRaw = await prisma.trackingEvent.groupBy({
      by: ['pageUrl'],
      where: { eventType: 'page_view', pageUrl: { not: null }, createdAt: { gte: sevenDaysAgo } },
      _count: { eventType: true },
      orderBy: { _count: { eventType: 'desc' } },
      take: 5,
    });
    const topPages = topPagesRaw.map((p) => ({
      url: p.pageUrl || '/',
      pv: p._count.eventType,
    }));

    // Top 5 countries (last 30 days)
    const topCountriesRaw = await prisma.trackingEvent.groupBy({
      by: ['country'],
      where: { country: { not: null }, createdAt: { gte: sevenDaysAgo } },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 5,
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

    return {
      todayUV,
      todayPV,
      avgDuration,
      topPages,
      topCountries,
      trend,
    };
  }
}

export const trackingService = new TrackingService();
