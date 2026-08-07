import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { formatDate, imgUrl } from '@/lib/utils';
import { localizePath, type Locale } from '@/lib/i18n/config';
import type { ProjectWithImages } from '@/lib/services/projectService';

/**
 * Props for the ProjectCard component.
 */
interface ProjectCardProps {
  /** The project data with parsed images array. */
  project: ProjectWithImages;
  /** The current locale for link localisation. */
  locale: Locale;
}

/**
 * Renders a single project case-study card.
 *
 * Layout:
 *  ┌─────────────────────┐
 *  │   Image (4:3)        │  ← first image or gradient placeholder
 *  ├─────────────────────┤
 *  │  Title               │
 *  │  Description (2ln)   │
 *  │  📍 Location  📅 Date│
 *  └─────────────────────┘
 *
 * The entire card is wrapped in a <Link> to the project detail page.
 */
export function ProjectCard({ project, locale }: ProjectCardProps) {
  const lh = (href: string) => localizePath(href, locale);
  const href = lh(`/projects/${project.slug}`);
  const heroImage = project.images.length > 0 ? project.images[0] : null;

  return (
    <Link href={href} className="block h-full">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        {/* Image area — 4:3 aspect ratio */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {heroImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imgUrl(heroImage)}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-gray-200">
              <MapPin className="h-10 w-10 text-gray-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="space-y-2 p-5">
          <h3 className="text-base font-semibold text-gray-900 transition-colors hover:text-brand-600">
            {project.title}
          </h3>
          {project.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
              {project.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-gray-400">
            {project.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {project.location}
              </span>
            )}
            {project.projectDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(project.projectDate)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
