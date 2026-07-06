import type { IBannerCenter } from 'src/types/banners';

export type BannerMediaSource = Pick<
  IBannerCenter,
  'path_ar' | 'path_en' | 'path' | 'mediaTypeAr' | 'mediaTypeEn' | 'mediaType'
>;

export function isArabicLanguage(language?: string): boolean {
  return String(language ?? '').toLowerCase().startsWith('ar');
}

export function pickBannerLocaleMedia(
  banner: BannerMediaSource | undefined,
  language?: string
): { path: string; mediaType: 'IMAGE' | 'VIDEO' } {
  const isAr = isArabicLanguage(language);

  const path = isAr
    ? banner?.path_ar || banner?.path || ''
    : banner?.path_en || banner?.path || '';

  const rawType = isAr
    ? banner?.mediaTypeAr || banner?.mediaType
    : banner?.mediaTypeEn || banner?.mediaType;

  const mediaType = String(rawType ?? 'IMAGE').toUpperCase() === 'VIDEO' ? 'VIDEO' : 'IMAGE';

  return { path, mediaType };
}

/** Both locale assets for admin detail views (always show EN + AR). */
export function getBannerLocaleMediaPair(banner: BannerMediaSource | undefined): {
  ar: { path: string; mediaType: 'IMAGE' | 'VIDEO' };
  en: { path: string; mediaType: 'IMAGE' | 'VIDEO' };
} {
  return {
    ar: pickBannerLocaleMedia(banner, 'ar'),
    en: pickBannerLocaleMedia(banner, 'en'),
  };
}

export function pickLocalizedText(
  language: string | undefined,
  ar?: string | null,
  en?: string | null,
  fallback = ''
): string {
  const isAr = isArabicLanguage(language);
  const primary = isAr ? ar : en;
  const secondary = isAr ? en : ar;
  return String(primary || secondary || fallback).trim() || fallback;
}
