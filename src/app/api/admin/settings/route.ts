import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { settingsService } from '@/lib/services/settingsService';
import { successResponse, errorResponse } from '@/types/api';
import { comparePassword, hashPassword, requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/settings - Returns all site settings.
 * Sensitive fields (passwords, API keys) are returned as empty strings.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const settings = await settingsService.getSiteSettings();
    return NextResponse.json(successResponse(settings));
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch settings'), { status: 500 });
  }
}

/**
 * PUT /api/admin/settings - Updates site settings.
 * Handles both general settings and password change.
 */
export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { passwordChange, ...settings } = body;

    // Handle password change if provided
    if (passwordChange && passwordChange.currentPassword && passwordChange.newPassword) {
      // Get the admin user (first admin user)
      const users = await prisma.user.findMany({ take: 1 });
      if (users.length === 0) {
        return NextResponse.json(errorResponse(404, 'No admin user found'), { status: 404 });
      }

      const user = users[0];
      const isValid = await comparePassword(passwordChange.currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(errorResponse(400, 'Current password is incorrect'), { status: 400 });
      }

      if (passwordChange.newPassword !== passwordChange.confirmPassword) {
        return NextResponse.json(errorResponse(400, 'New passwords do not match'), { status: 400 });
      }

      if (passwordChange.newPassword.length < 6) {
        return NextResponse.json(errorResponse(400, 'Password must be at least 6 characters'), { status: 400 });
      }

      const hashedPassword = await hashPassword(passwordChange.newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    // Update general settings
    await settingsService.updateSiteSettings(settings);

    const updated = await settingsService.getSiteSettings();
    return NextResponse.json(successResponse(updated, 'Settings saved'));
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to save settings'), { status: 500 });
  }
}
