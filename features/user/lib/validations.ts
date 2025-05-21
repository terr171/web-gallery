import { z } from "zod";
import { publicIdSchema } from "@/lib/validations";

export const usernameSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
});

export const getUserDataSchema = usernameSchema;

export const getFollowsSchema = usernameSchema.extend({
  offset: z.coerce.number().int().nonnegative().optional().default(0),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export const createCommentSchema = publicIdSchema.extend({
  newComment: z
    .string()
    .min(1, { message: "Comment cannot be empty." })
    .max(250, { message: "Comment cannot exceed 1000 characters." }),
});

export const deleteCommentSchema = z.object({
  commentId: z.string().uuid({ message: "Invalid comment identifier." }),
});

export type UsernameInput = z.infer<typeof usernameSchema>;
export type GetUserDataInput = z.infer<typeof getUserDataSchema>;
export type GetFollowsInput = z.input<typeof getFollowsSchema>;
export type GetFollowsOutput = z.infer<typeof getFollowsSchema>;

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
