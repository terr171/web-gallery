/**
 * Function to revalidate cache when a user creates, updates, or deletes a project
 *
 * @param username username of the owner of project that was modified
 */
import { revalidatePath } from "next/cache";

export const revalidateOnProjectChange = (username: string) => {
  revalidatePath("/featured");
  revalidatePath("/explore");
  revalidatePath(`/user/${username}`);
};
