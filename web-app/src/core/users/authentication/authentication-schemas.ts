import { z } from "zod";

export const AuthenticationSessionSchema = z.object({
  userId: z.string(),
  isAdmin: z.boolean(),
  appId: z.string(),
});
