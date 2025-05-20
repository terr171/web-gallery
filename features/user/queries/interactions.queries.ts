import { PublicIdInput, publicIdSchema } from "@/lib/validations";
import { getUserFromSession, validateInput } from "@/lib/actions-utility";
import { db } from "@/database/drizzle";
import { projectLikes, userFollows, users } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { UsernameInput, usernameSchema } from "@/features/user/lib/validations";
import { getProjectIdByPublicId } from "@/lib/actions/actions";

/**
 * Checks if the currently logged-in user has liked a specific project.
 * @param {PublicIdInput} input - The public ID of the project.
 * @returns {Promise<ActionResult<boolean>>} ActionResult containing true if liked, false otherwise, or an error.
 */
export const checkProjectLike = async (
  input: PublicIdInput,
): Promise<ActionResult<boolean>> => {
  // #1. Input Validation
  const validationResult = validateInput(publicIdSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { publicId } = validationResult.response;

  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };
  const userId = checkAuth.response.user.id;

  // #3. Query Database
  try {
    const findProject = await getProjectIdByPublicId({ publicId: publicId });
    if (!findProject.success) return findProject;
    const projectId = findProject.response;

    const existingLike = await db
      .select({ foundUserId: projectLikes.userId })
      .from(projectLikes)
      .where(
        and(
          eq(projectLikes.projectId, projectId),
          eq(projectLikes.userId, userId),
        ),
      )
      .limit(1);

    if (existingLike.length > 0) {
      return { success: true, response: true };
    }

    return { success: true, response: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to check project" };
  }
};
/**
 * Checks if the currently logged-in user is following another user specified by username.
 * @param {UsernameInput} input - The username of the user to check follow status against.
 * @returns {Promise<ActionResult<boolean>>} ActionResult containing true if following, false otherwise, or an error.
 */
export const checkUserFollow = async (
  input: UsernameInput,
): Promise<ActionResult<boolean>> => {
  // #1. Input Validation
  const validationResult = validateInput(usernameSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { username } = validationResult.response;

  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };
  const followerId = checkAuth.response.user.id;

  try {
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userResult.length === 0) {
      return { success: false, error: "User not found" };
    }

    const followingId = userResult[0].id;

    if (followerId === followingId) {
      return { success: false, error: "Cannot follow yourself" };
    }

    const existingFollow = await db
      .select({ foundFollowerId: userFollows.followerId })
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId),
        ),
      )
      .limit(1);

    return { success: true, response: existingFollow.length > 0 };
  } catch (error) {
    console.log(error);
    return { success: false, error: "An error occurred" };
  }
};
