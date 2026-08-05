'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { slugify } from '@/lib/utils';

export function ProjectForm({ projectId }: { projectId?: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (projectId) {
      fetch(`/api/admin/projects/${projectId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.code === 200) setProject(data.data);
        });
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      title: formData.get('title'),
      slug: (formData.get('slug') as string) || slugify(formData.get('title') as string),
      description: formData.get('description') || null,
      content: formData.get('content') || null,
      location: formData.get('location') || null,
      projectDate: formData.get('projectDate') || null,
      isPublished: formData.get('isPublished') === 'on',
      sortOrder: Number(formData.get('sortOrder')) || 0,
    };

    try {
      const url = projectId ? `/api/admin/projects/${projectId}` : '/api/admin/projects';
      const method = projectId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.code === 200 || result.code === 201) {
        toast.success(projectId ? 'Project updated' : 'Project created');
        router.push('/admin/projects');
      } else {
        toast.error(result.message || 'Failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Project Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required defaultValue={project?.title as string} />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={project?.slug as string} placeholder="auto-generated from title" />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={project?.location as string} />
          </div>
          <div>
            <Label htmlFor="projectDate">Project Date</Label>
            <Input id="projectDate" name="projectDate" type="date" defaultValue={project?.projectDate ? new Date(project.projectDate as string).toISOString().slice(0, 10) : ''} />
          </div>
          <div>
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={project?.sortOrder as string || '0'} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} defaultValue={project?.description as string} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="content">Content (HTML)</Label>
            <Textarea id="content" name="content" rows={6} defaultValue={project?.content as string} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="isPublished" name="isPublished" defaultChecked={project?.isPublished !== false} />
            <Label htmlFor="isPublished">Published</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="brand" disabled={loading}>
          {loading ? 'Saving...' : projectId ? 'Update Project' : 'Create Project'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/projects')}>Cancel</Button>
      </div>
    </form>
  );
}
