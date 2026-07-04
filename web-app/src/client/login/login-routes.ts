import { CLIENT_ROUTES } from '../client-routes';

export const LOGIN_ROUTE = {
  title: 'Login',
  path: `${CLIENT_ROUTES.path}/login`,
  getHref: ({ next }: { next: string | null }) => {
    const urlSearchParams = new URLSearchParams();

    if (next) {
      urlSearchParams.append('next', next);
    }

    return `${LOGIN_ROUTE.path}?${urlSearchParams.toString()}`;
  },
};
