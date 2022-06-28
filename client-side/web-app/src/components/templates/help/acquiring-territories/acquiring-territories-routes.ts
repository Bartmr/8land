import { HELP_ROUTE } from '../help-routes';

export const ACQUIRING_TERRITORIES_ROUTE = {
  path: `${HELP_ROUTE.path}/acquiring-territories`,
  title: 'Acquiring Territories',
  getHref: () => ACQUIRING_TERRITORIES_ROUTE.path,
};
