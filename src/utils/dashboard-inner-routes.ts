import { paths } from 'src/routes/paths';

const normalizePath = (pathname: string) => {
  if (!pathname) return paths.dashboard.root;
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || paths.dashboard.root;
};

/** Top-level dashboard list pages — no back button. */
const LIST_ROUTES = new Set<string>([
  paths.dashboard.root,
  paths.dashboard.notifications,
  paths.dashboard.centers,
  paths.dashboard.courses,
  paths.dashboard.clients,
  paths.dashboard.payouts,
  paths.dashboard.invoices,
  paths.dashboard.categories,
  paths.dashboard.coupons,
  paths.dashboard.faq,
  paths.dashboard.citiesAndNeighborhoods,
  paths.dashboard.banners,
  paths.dashboard.pages.root,
  paths.dashboard.supportGroup.root,
  paths.dashboard.supportGroup.technical_support,
  paths.dashboard.supportGroup.contact_reasons,
  `${paths.dashboard.supportGroup.root}/calls-reasons`,
]);

export function shouldShowDashboardBackButton(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (!path.startsWith(paths.dashboard.root)) return false;
  return !LIST_ROUTES.has(path);
}

export function resolveDashboardBackFallback(pathname: string): string {
  const path = normalizePath(pathname);

  let match = path.match(/^\/dashboard\/centers\/([^/]+)\/add-program$/);
  if (match) return paths.dashboard.centerDetails(match[1]);

  match = path.match(/^\/dashboard\/centers\/([^/]+)$/);
  if (match) return paths.dashboard.centers;

  match = path.match(/^\/dashboard\/courses\/([^/]+)\/edit$/);
  if (match) return paths.dashboard.courseDetails(match[1]);

  match = path.match(/^\/dashboard\/courses\/([^/]+)$/);
  if (match) return paths.dashboard.courses;

  match = path.match(/^\/dashboard\/clients\/([^/]+)$/);
  if (match) return paths.dashboard.clients;

  match = path.match(/^\/dashboard\/banners\/([^/]+)$/);
  if (match) return paths.dashboard.banners;

  match = path.match(/^\/dashboard\/faq\/([^/]+)$/);
  if (match) return paths.dashboard.faq;

  match = path.match(/^\/dashboard\/cities-and-neighborhoods\/([^/]+)$/);
  if (match) return paths.dashboard.citiesAndNeighborhoods;

  match = path.match(/^\/dashboard\/support\/technical-support\/([^/]+)$/);
  if (match) return paths.dashboard.supportGroup.technical_support;

  if (path.startsWith(`${paths.dashboard.pages.root}/`)) {
    return paths.dashboard.pages.root;
  }

  if (path === paths.dashboard.changePhone) {
    return paths.dashboard.root;
  }

  return paths.dashboard.root;
}
