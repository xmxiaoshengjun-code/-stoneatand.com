import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { SectionTitle } from '@/components/common/SectionTitle';
import { projectService } from '@/lib/services/projectService';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin } from 'lucide-react';
import { isLocale, localizePath, buildAlternates, type Locale } from '@/lib/i18n/config';

export function generateMetadata(): Metadata {
  return {
    title: 'Projects',
    description: 'Explore our completed tile display installation projects worldwide.',
    alternates: buildAlternates('/projects'),
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);
  const projects = await projectService.getProjects(20);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: lh('/') },
            { label: 'Projects' },
          ]}
        />
        <SectionTitle
          eyebrow="Case Studies"
          title="Our Projects"
          description="Real-world installations showcasing our display solutions across the globe."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={lh(`/projects/${project.slug}`)}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="mb-2 text-base font-medium text-gray-900 hover:text-brand-400">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="mb-4 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                  <div className="space-y-1 text-xs text-gray-400">
                    {project.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </div>
                    )}
                    {project.projectDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.projectDate)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            <p>No projects to display yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
