import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/services/projectService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/projects - Admin project list.
 * POST /api/admin/projects - Create a new project.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const result = await projectService.getAllProjects({
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 20,
      keyword: searchParams.get('keyword') || undefined,
    });
    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('GET /api/admin/projects error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch projects'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const project = await projectService.createProject(body);
    return NextResponse.json(successResponse(project, 'Project created'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/projects error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to create project'), { status: 500 });
  }
}
