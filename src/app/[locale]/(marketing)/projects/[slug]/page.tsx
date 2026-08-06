import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { projectService } from '@/lib/services/projectService';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareButtons } from '@/components/common/ShareButtons';
import { SITE_CONFIG } from '@/lib/constants/seo';
import Link from 'next/link';
import { LOCALES, isLocale, localizePath, buildAbsoluteAlternates, buildCanonical, type Locale } from '@/lib/i18n/config';

interface PageProps {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await projectService.getProjectBySlug(params.slug);
  if (!project) return { title: 'Project Not Found' };

  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const path = `/projects/${project.slug}`;

  return {
    title: project.title,
    description: project.description || '',
    alternates: {
      canonical: buildCanonical(path, locale),
      ...buildAbsoluteAlternates(path),
    },
  };
}

export async function generateStaticParams() {
  const projects = await projectService.getProjects(100);
  const params: { slug: string; locale: string }[] = [];
  for (const project of projects) {
    for (const locale of LOCALES) {
      params.push({ slug: project.slug, locale });
    }
  }
  return params;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);

  const project = await projectService.getProjectBySlug(params.slug);
  if (!project) notFound();

  const shareUrl = `${SITE_CONFIG.url}${lh('/projects')}/${project.slug}`;

  const breadcrumbItems = [
    { label: 'Home', href: lh('/') },
    { label: 'Projects', href: lh('/projects') },
    { label: project.title },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <main className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              {project.title}
            </h1>

            <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-500">
              {project.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </div>
              )}
              {project.projectDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(project.projectDate)}
                </div>
              )}
            </div>

            {project.description && (
              <p className="mb-6 text-lg text-gray-700">
                {project.description}
              </p>
            )}

            {project.content && (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            )}

            <div className="mt-8">
              <ShareButtons url={shareUrl} title={project.title} />
            </div>

            <div className="mt-12">
              <Button asChild variant="brand">
                <Link href={lh('/contact')}>Request a Similar Solution</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
