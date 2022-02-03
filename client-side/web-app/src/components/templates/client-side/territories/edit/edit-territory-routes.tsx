import { TERRITORIES_ROUTE } from '../territories-routes';

const pathSegment = '/territories';

export const EDIT_TERRITORY_ROUTE = {
  pathSegment,
  title: 'My territories',
  path: `${TERRITORIES_ROUTE.path}${pathSegment}`,
  getHref: (id: string) => `${EDIT_TERRITORY_ROUTE.path}/${id}`,
};
