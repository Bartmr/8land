import { LANDS_ROUTE } from '../lands-routes';

const pathSegment = '/edit';

export const EDIT_LAND_ROUTE = {
  pathSegment,
  path: `${LANDS_ROUTE.path}${pathSegment}`,
  getHref: (id: string) => `${EDIT_LAND_ROUTE.path}/${id}`,
  label: 'Edit Land',
};
