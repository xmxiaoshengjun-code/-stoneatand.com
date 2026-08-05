import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/services/projectService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/projects/[id] - Fetch project by ID.
 * PUT /api/admin/projects/[id] - Update project.
 * DELETE /api/admin/projects/[id] - Delete project.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json(errorResponse(400, 'Invalid ID'), { status: 400 });

    const project = await projectService.getProjectById(id);
    if (!project) return NextResponse.json(errorResponse(404, 'Project not found'), { status: 404 });

    return NextResponse.json(successResponse(project));
  } catch (error) {
    console.error('GET /api/admin/projects/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch project'), { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json(errorResponse(400, 'Invalid ID'), { status: 400 });

    const body = await request.json();
    const project = await projectService.updateProject(id, body);
    return NextResponse.json(successResponse(project, 'Project updated'));
  } catch (error) {
    console.error('PUT /api/admin/projects/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update project'), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json(errorResponse(400, 'Invalid ID'), { status: 400 });

    await projectService.deleteProject(id);
    return NextResponse.json(successResponse(null, 'Project deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/projects/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete project'), { status: 500 });
  }
}
