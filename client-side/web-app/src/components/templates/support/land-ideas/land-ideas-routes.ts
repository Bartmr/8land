import { SUPPORT_ROUTE } from '../support-routes';

export const LAND_IDEAS_ROUTE = {
  path: `${SUPPORT_ROUTE.path}/land-ideas`,
  getHref: () => LAND_IDEAS_ROUTE.path,
  title: 'Land Ideas',
};
