import Image from 'next/image';
import { cn, imgUrl } from '@/lib/utils';

interface LogoProps {
  className?: string;
  priority?: boolean;
}

/**
 * TSIANFAN brand logo.
 *
 * Renders the official PNG logo (685×161) which contains the full
 * TSIANFAN wordmark, 谦帆 Chinese text, DISPLAY tagline, and ® symbol.
 * The image has its own brand-orange colouring — no `currentColor`
 * or text-colour utility is needed.
 */
export function Logo({ className, priority = false }: LogoProps) {
  return (
    <Image
      src={imgUrl('/images/logo-tsianfan.png')}
      alt="TSIANFAN"
      width={685}
      height={161}
      priority={priority}
      className={cn('h-8 w-auto', className)}
    />
  );
}
