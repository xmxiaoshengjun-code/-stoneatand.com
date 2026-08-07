import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { projectService } from '@/lib/services/projectService';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareButtons } from '@/components/common/ShareButtons';
import { ProjectGallery } from '@/components/projects/ProjectGallery';
import { SITE_CONFIG } from '@/lib/constants/seo';
import Link from 'next/link';
import { LOCALES, isLocale, localizePath, buildAbsoluteAlternates, buildCanonical, type Locale } from '@/lib/i18n/config';

/** Parse the raw images JSON string from DB into a string array. */
function parseImages(imagesStr: string | null): string[] {
  if (!imagesStr || imagesStr.trim() === '') return [];
  try {
    const parsed = JSON.parse(imagesStr);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
    }
    if (typeof parsed === 'string' && parsed.length > 0) return [parsed];
  } catch {
    return [imagesStr];
  }
  return [];
}

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

  const images = parseImages(project.images);
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

          {/* Project Gallery + Info */}
          <div className="mx-auto mt-6 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              {/* Gallery - takes 3/5 on desktop */}
              {images.length > 0 && (
                <div className="lg:col-span-3">
                  <ProjectGallery images={images} title={project.title} />
                </div>
              )}

              {/* Info - takes 2/5 on desktop */}
              <div className="lg:col-span-2">
                <h1 className="mb-4 text-3xl font-semibold text-gray-900 md:text-4xl">
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
                  <p className="mb-6 text-lg text-gray-600">
                    {project.description}
                  </p>
                )}

                <div className="mt-4">
                  <Button asChild variant="brand">
                    <Link href={lh('/contact')}>Request a Similar Solution</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Content HTML below the gallery */}
            {project.content && (
              <div
                className="prose prose-lg mt-10 max-w-none"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            )}

            {/* Share buttons */}
            <div className="mt-8">
              <ShareButtons url={shareUrl} title={project.title} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
