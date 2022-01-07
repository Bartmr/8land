import { CLIENT_SIDE_ROUTES } from '../client-side-routes';
import { CLIENT_SIDE_INDEX_ROUTE } from '../index/index-routes';

export const LOGIN_ROUTE = {
  title: 'Login',
  path: `${CLIENT_SIDE_ROUTES.path}/login`,
  getHref: ({ next }: { next: string | null }) =>
    `${LOGIN_ROUTE.path}?next=${encodeURIComponent(
      next || CLIENT_SIDE_INDEX_ROUTE.getHref(),
    )}`,
};
