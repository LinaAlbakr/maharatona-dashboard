export const PACKAGE_AD_TYPE_OPTIONS = ['MAIN', 'FIELD', 'BOTH'] as const;

type TranslateFn = (key: string, options?: { defaultValue?: string }) => string;

const PACKAGE_AD_TYPE_LABELS: Record<
  (typeof PACKAGE_AD_TYPE_OPTIONS)[number],
  { key: string; defaultValue: string }
> = {
  MAIN: { key: 'LABEL.PACKAGE_TYPE_HOMEPAGE', defaultValue: 'Homepage' },
  FIELD: { key: 'LABEL.PACKAGE_TYPE_CATEGORY', defaultValue: 'Category' },
  BOTH: { key: 'LABEL.BOTH', defaultValue: 'Both' },
};

export function getPackageAdTypeLabel(type: string, t: TranslateFn): string {
  const config = PACKAGE_AD_TYPE_LABELS[type as keyof typeof PACKAGE_AD_TYPE_LABELS];
  if (!config) return type;
  return t(config.key, { defaultValue: config.defaultValue });
}
