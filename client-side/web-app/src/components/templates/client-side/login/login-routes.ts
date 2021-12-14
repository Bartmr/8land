import { CLIENT_SIDE_ROUTES } from '../client-side-routes';

export const LOGIN_ROUTE = {
  title: 'Login',
  path: `${CLIENT_SIDE_ROUTES.path}/login`,
  getHref: () => LOGIN_ROUTE.path,
};
