'use client';

import { useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * CopyProtection component.
 *
 * When copyProtectionEnabled is 'true' in public settings, this component
 * registers event listeners that:
 * - Prevent the browser context menu (right-click)
 * - Prevent text selection (except in input/textarea elements)
 * - Prevent copy operations (except in input/textarea elements)
 *
 * The component renders null and does not affect page layout.
 * When disabled, no event listeners are registered.
 */
export function CopyProtection() {
  const { data } = useSWR('/api/public-settings', fetcher);
  const enabled = data?.data?.copyProtectionEnabled === 'true';

  useEffect(() => {
    if (!enabled) return;

    const isFormField = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tagName = target.tagName.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (!isFormField(e.target)) {
        e.preventDefault();
      }
    };

    const handleSelectStart = (e: Event) => {
      if (!isFormField(e.target)) {
        e.preventDefault();
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (!isFormField(e.target)) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy);
    };
  }, [enabled]);

  // This component renders nothing — it's purely for event interception
  return null;
}
