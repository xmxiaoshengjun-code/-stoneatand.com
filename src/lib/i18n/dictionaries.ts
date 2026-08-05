/**
 * Dictionary loader for server-side translations.
 * Uses dynamic import to load only the needed locale file.
 */

import type { Locale } from './config';

// Type derived from the English dictionary
export type Dictionary = typeof import('@/messages/en.json');

const cache = new Map<Locale, Dictionary>();

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (cache.has(locale)) {
    return cache.get(locale)!;
  }

  let dict: Dictionary;

  switch (locale) {
    case 'fr':
      dict = (await import('@/messages/fr.json')).default as unknown as Dictionary;
      break;
    case 'de':
      dict = (await import('@/messages/de.json')).default as unknown as Dictionary;
      break;
    case 'it':
      dict = (await import('@/messages/it.json')).default as unknown as Dictionary;
      break;
    case 'es':
      dict = (await import('@/messages/es.json')).default as unknown as Dictionary;
      break;
    default:
      dict = (await import('@/messages/en.json')).default as unknown as Dictionary;
  }

  // If .default is undefined (webpack returns JSON directly), use the module itself
  if (!dict) {
    switch (locale) {
      case 'fr': dict = await import('@/messages/fr.json') as unknown as Dictionary; break;
      case 'de': dict = await import('@/messages/de.json') as unknown as Dictionary; break;
      case 'it': dict = await import('@/messages/it.json') as unknown as Dictionary; break;
      case 'es': dict = await import('@/messages/es.json') as unknown as Dictionary; break;
      default: dict = await import('@/messages/en.json') as unknown as Dictionary;
    }
  }

  cache.set(locale, dict);
  return dict;
}
