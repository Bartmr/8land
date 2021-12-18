import { LANDS_ROUTE } from '../lands-routes';

const pathSegment = '/create';

export const CREATE_LAND_ROUTE = {
  pathSegment,
  path: `${LANDS_ROUTE.path}${pathSegment}`,
  getHref: () => CREATE_LAND_ROUTE,
  label: 'Create Land',
};
