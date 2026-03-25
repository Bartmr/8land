import { HELP_ROUTE } from '../help-routes';

export const ABOUT_ROUTE = {
  path: `${HELP_ROUTE.path}/about`,
  getHref: () => ABOUT_ROUTE.path,
  title: 'About',
};
