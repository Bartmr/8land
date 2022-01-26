import { Role } from 'libs/shared/src/auth/auth.enums';

export const ROLES_LEVELS: { [K in Role]: number } = {
  [Role.EndUser]: 1,
  [Role.Admin]: 2,
};

export { Role };
