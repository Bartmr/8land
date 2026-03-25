import { HELP_ROUTE } from '../../help-routes';

export const LAND_IDEAS_ROUTE = {
  path: `${HELP_ROUTE.path}/lands/land-ideas`,
  getHref: () => LAND_IDEAS_ROUTE.path,
  title: 'Land Ideas',
};
