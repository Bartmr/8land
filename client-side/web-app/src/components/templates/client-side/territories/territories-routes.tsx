import { CLIENT_SIDE_ROUTES } from '../client-side-routes';

const pathSegment = '/territories';

export const TERRITORIES_ROUTE = {
  pathSegment,
  title: 'My territories',
  path: `${CLIENT_SIDE_ROUTES.path}${pathSegment}`,
  getHref: () => `${TERRITORIES_ROUTE.path}`,
};
