import Cookie from 'js-cookie';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

function jwtDecode(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------

export const tokenExpired = (exp: number) => {
  // eslint-disable-next-line prefer-const
  let expiredTimer;

  const currentTime = Date.now() / 1000;

  // `exp` is in seconds (per JWT spec) but setTimeout expects milliseconds.
  // Without converting, we were scheduling the logout ~1000x sooner than intended.
  const timeLeftMs = Math.max(0, (exp - currentTime) * 1000);

  clearTimeout(expiredTimer);

  expiredTimer = setTimeout(() => {
    alert('Token expired');

    // sessionStorage.removeItem('accessToken');
    Cookie.remove('access_token');
    Cookie.remove('user');

    window.location.href = paths.auth.jwt.login;
  }, timeLeftMs);
};

// ----------------------------------------------------------------------

export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    // sessionStorage.setItem('accessToken', accessToken);

    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    // This function below will handle when token is expired
    const { exp } = jwtDecode(accessToken); // ~3 days by minimals server
    tokenExpired(exp); // TODO: uncomment this line when deploy
  } else {
    // sessionStorage.removeItem('accessToken');
    Cookie.remove('access_token');
    Cookie.remove('user');
    delete axios.defaults.headers.common.Authorization;
  }
};

export const getAccessToken = () => {};
