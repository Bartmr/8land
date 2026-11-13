import { CLIENT_ROUTES } from '../client-routes';

const pathSegment = '/user';

export const USER_ROUTE = {
  label: 'Profile',
  path: `${CLIENT_ROUTES.path}${pathSegment}`,
  pathSegment,
  getHref: (args?: { section?: 'escape' }) =>
    USER_ROUTE.path + (args?.section ? `#${args.section}` : ''),
};
