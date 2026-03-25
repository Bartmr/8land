import { TERRITORIES_ROUTE } from '../territories-routes';

export const EDIT_TERRITORY_ROUTE = {
  label: 'Edit Territory',
  path: `${TERRITORIES_ROUTE.path}`,
  getHref: (id: string) => `${EDIT_TERRITORY_ROUTE.path}/${id}`,
};
