import { cn } from '@/lib/utils';

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  light?: boolean;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center'
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'mb-3 text-xs font-bold uppercase tracking-[0.15em]',
            light ? 'text-brand-300' : 'text-brand-400'
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl',
          light ? 'text-white' : 'text-gray-900'
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-3 text-base leading-relaxed sm:text-lg',
            light ? 'text-white/75' : 'text-gray-600'
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
