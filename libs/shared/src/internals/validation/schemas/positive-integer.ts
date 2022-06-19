import { number } from 'not-me/lib/schemas/number/number-schema';
export const positiveInteger = () => {
  return number()
    .test((n) => {
      if (n == null) {
        return null;
      }

      if (Number.isInteger(n)) {
        return null;
      } else {
        return 'Must be an integer';
      }
    })
    .test((n) => {
      if (n == null) {
        return null;
      }

      if (n >= 0) {
        return null;
      } else {
        return 'Must be a positive number';
      }
    });
};
