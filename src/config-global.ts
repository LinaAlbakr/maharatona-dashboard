import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export const HOST_API = process.env.NEXT_PUBLIC_HOST_API;
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API;

/** Server origin for routes outside `/api` (e.g. `GET /maintenance`). Expects `HOST_API` like `http://host:port/api`. */
export function getServerRootUrl(): string {
  if (!HOST_API) return '';
  return HOST_API.replace(/\/?api\/?$/, '');
}

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'
