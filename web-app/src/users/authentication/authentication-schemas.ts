import { z } from "zod";

export const AuthenticationSessionSchema = z.object({
  user_id: z.string(),
  name: z.string(),
  email: z.string(),
  permissions: z.object({
    can_add_clients: z.boolean(),
    accounting_firm_admin: z.boolean(),
    is_support: z.boolean().nullable(),
  }),
  accepted_terms_and_conditions: z.string().nullable(),
  terms_and_conditions_expire_at: z.string().nullable(),
});
