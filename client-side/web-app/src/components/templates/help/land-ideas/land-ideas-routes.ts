import { HELP_ROUTE } from '../help-routes';

export const LAND_IDEAS_ROUTE = {
  path: `${HELP_ROUTE.path}/land-ideas`,
  getHref: () => LAND_IDEAS_ROUTE.path,
  title: 'Land Ideas',
};
