import { SUPPORT_ROUTE } from '../support-routes';

export const ACQUIRING_TERRITORIES_ROUTE = {
  path: `${SUPPORT_ROUTE.path}/acquiring-territories`,
  title: 'Acquiring Territories',
  getHref: () => ACQUIRING_TERRITORIES_ROUTE.path,
};
