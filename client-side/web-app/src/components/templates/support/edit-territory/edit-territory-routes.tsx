import { SUPPORT_ROUTE } from '../support-routes';

export const HOW_TO_EDIT_TERRITORY_ROUTE = {
  path: `${SUPPORT_ROUTE.path}/edit-territory`,
  getHref: () => HOW_TO_EDIT_TERRITORY_ROUTE.path,
  title: 'Edit territory',
};
