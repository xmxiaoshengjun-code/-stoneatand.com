import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 44"
      fill="currentColor"
      aria-label="TSIANFAN"
      className={cn('w-auto', className)}
    >
      <text
        x="0"
        y="34"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="28"
        fontWeight="700"
        letterSpacing="3"
      >
        TSIANFAN
      </text>
    </svg>
  );
}
