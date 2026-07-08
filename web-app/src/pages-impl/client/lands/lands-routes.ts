import { CLIENT_SIDE_INDEX_ROUTE } from '../index/index-routes';

const pathSegment = '/lands';

export const LANDS_ROUTE = {
  pathSegment,
  path: `${CLIENT_SIDE_INDEX_ROUTE.path}${pathSegment}`,
  getHref: (params?: { deleted?: boolean }) => {
    const urlSearchParams = new URLSearchParams();

    if (params?.deleted) {
      urlSearchParams.set('deleted', 'true');
    }

    return `${LANDS_ROUTE.path}?${urlSearchParams.toString()}`;
  },
  label: 'Build lands',
};
