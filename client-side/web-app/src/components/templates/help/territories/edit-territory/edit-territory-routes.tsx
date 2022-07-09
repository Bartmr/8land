import { HELP_ROUTE } from '../../help-routes';

export const HOW_TO_EDIT_TERRITORY_ROUTE = {
  path: `${HELP_ROUTE.path}/edit-territory`,
  getHref: () => HOW_TO_EDIT_TERRITORY_ROUTE.path,
  title: 'Edit territory',
};
