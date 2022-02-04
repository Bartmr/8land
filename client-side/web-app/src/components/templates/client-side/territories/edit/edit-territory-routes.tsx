import { TERRITORIES_ROUTE } from '../territories-routes';

export const EDIT_TERRITORY_ROUTE = {
  label: 'My territories',
  path: `${TERRITORIES_ROUTE.path}`,
  getHref: (id: string) => `${EDIT_TERRITORY_ROUTE.path}/${id}`,
};
