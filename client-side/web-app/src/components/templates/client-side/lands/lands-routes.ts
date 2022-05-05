import { CLIENT_SIDE_INDEX_ROUTE } from '../index/index-routes';

const pathSegment = '/lands';

export const LANDS_ROUTE = {
  pathSegment,
  path: `${CLIENT_SIDE_INDEX_ROUTE.path}${pathSegment}`,
  geHref: () => LANDS_ROUTE.path,
  label: 'Build lands',
};
