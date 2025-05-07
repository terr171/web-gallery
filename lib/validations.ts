import { z } from "zod";

// Zod's current string().nanoid() function has internal length check, so it has to be 21 characters long.
// Implemented regex version of nanoid() instead.
export const publicIdSchema = z.object({
  publicId: z
    .string()
    .length(12, { message: "Invalid project identifier length" })
    .regex(/^[A-Za-z0-9_-]{12}$/, { message: "Invalid project identifier." }),
});

export type PublicIdInput = z.infer<typeof publicIdSchema>;
