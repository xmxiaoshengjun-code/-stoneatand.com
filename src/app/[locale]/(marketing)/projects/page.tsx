import type { Metadata } from 'next';
import Image from 'next/image';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { projectService } from '@/lib/services/projectService';
import { isLocale, localizePath, buildAbsoluteAlternates, buildCanonical, type Locale } from '@/lib/i18n/config';
import { ProjectCard } from '@/components/projects/ProjectCard';

export function generateMetadata(): Metadata {
  return {
    title: 'Projects',
    description: 'Explore our completed tile display installation projects worldwide. Real-world case studies showcasing TSIANFAN display solutions.',
    alternates: {
      canonical: buildCanonical('/projects'),
      ...buildAbsoluteAlternates('/projects'),
    },
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

  const breadcrumbItems = [
    { label: 'Home', href: lh('/') },
    { label: 'Projects' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Hero section — showroom background with dark overlay to match homepage */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/showrooms/ai-showroom-cta.webp"
            alt="TSIANFAN display rack project showroom"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/70" />
        </div>
        <div className="container-custom relative z-10 py-16 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-white/70">
            Case Studies
          </p>
          <h1 className="mb-4 text-4xl font-bold text-white">Our Projects</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/80">
            Real-world installations showcasing our display solutions across the globe.
          </p>
        </div>
      </section>

      <div className="container-custom py-10">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} locale={locale} />
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
