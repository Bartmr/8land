import { LANDS_ROUTE } from '../lands-routes';

const pathSegment = '/edit';

export const EDIT_LAND_ROUTE = {
  pathSegment,
  path: `${LANDS_ROUTE.path}${pathSegment}`,
  getHref: () => EDIT_LAND_ROUTE,
  label: 'Edit Land',
};
