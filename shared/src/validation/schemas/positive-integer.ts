import { z } from 'zod';

export const positiveInteger = () => {
  return z.number().int('Must be an integer').min(0, 'Must be a positive number');
};
