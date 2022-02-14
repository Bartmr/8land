import { SUPPORT_ROUTE } from '../support-routes';

export const ABOUT_ROUTE = {
  path: `${SUPPORT_ROUTE.path}/about`,
  getHref: () => ABOUT_ROUTE.path,
  title: 'About',
};
