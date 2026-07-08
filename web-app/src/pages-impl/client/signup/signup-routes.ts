import { CLIENT_ROUTES } from "../client-routes";

export const SIGNUP_ROUTE = {
  title: 'Sign Up',
  path: `${CLIENT_ROUTES.path}/signup`,
  getHref: ({ next }: { next: string | null }) => {
    const urlSearchParams = new URLSearchParams();

    if (next) {
      urlSearchParams.append('next', next);
    }

    return `${SIGNUP_ROUTE.path}?${urlSearchParams.toString()}`;
  },
};