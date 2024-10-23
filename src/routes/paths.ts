// ----------------------------------------------------------------------

import { ro } from 'date-fns/locale';

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    centers: `${ROOTS.DASHBOARD}/centers`,
    clients: `${ROOTS.DASHBOARD}/clients`,
    courses: `${ROOTS.DASHBOARD}/courses`,
    supportGroup: {
      root: `${ROOTS.DASHBOARD}/support`,
      calls_reasons: `${ROOTS.DASHBOARD}/support/calls-reasons`,
    },
  },
};
