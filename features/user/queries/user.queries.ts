import {
  GetFollowsInput,
  GetFollowsOutput,
  getFollowsSchema,
  GetUserDataInput,
  getUserDataSchema,
} from "@/features/user/lib/validations";
import { UserProfile } from "@/features/user/lib/user.types";
import { validateInput } from "@/lib/actions-utility";
import { db } from "@/database/drizzle";
import { count, desc, eq, sum } from "drizzle-orm";
import { projectLikes, projects, userFollows, users } from "@/database/schema";

/**
 * Fetches comprehensive data for a user's profile, including aggregated stats.
 * Calculates total likes received, total followers, and total project views for the specified user.
 * @param {GetUserDataInput} input - Object containing the username of the profile to fetch.
 * @returns {Promise<ActionResult<UserProfile>>} ActionResult containing the user profile data or an error.
 */
export const getUserData = async (
  input: GetUserDataInput,
): Promise<ActionResult<UserProfile>> => {
  // #1. Input Validation
  const validationResult = validateInput(getUserDataSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const username = validationResult.response.username;

  // #2. Query database to get user data
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    if (!user) {
      return {
        success: false,
        error: "Specified user doesn't exist",
      };
    }

    const [queryTotalLikes, queryTotalFollows, queryTotalViews] =
      await Promise.all([
        db
          .select({ count: count() })
          .from(projectLikes)
          .innerJoin(projects, eq(projectLikes.projectId, projects.id))
          .where(eq(projects.userId, user.id)),
        db
          .select({ count: count() })
          .from(userFollows)
          .where(eq(userFollows.followingId, user.id)),
        db
          .select({ totalViews: sum(projects.views) })
          .from(projects)
          .where(eq(projects.userId, user.id)),
      ]);

    const totalLikes = queryTotalLikes[0]?.count || 0;
    const totalFollows = queryTotalFollows[0]?.count || 0;
    const totalViews = Number(queryTotalViews[0]?.totalViews || 0);

    return {
      success: true,
      response: {
        username: user.username,
        avatarUrl: user.avatarUrl,
        totalLikes: totalLikes,
        totalFollows: totalFollows,
        totalViews: totalViews,
      },
    };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to get user data" };
  }
};

/**
 * Fetches a paginated list of users who follow the specified user (followers).
 *
 * @param {GetFollowsInput} input - Object containing the target username, offset, and limit for pagination.
 * @returns {Promise<ActionResult<UserProfile[]>>} ActionResult containing a list of follower profiles (username/avatar) or an error.
 * Note: The returned UserProfile objects will likely only contain username and avatarUrl, not full stats.
 */
export async function getFollowers(
  input: GetFollowsInput,
): Promise<ActionResult<UserProfile[]>> {
  // #1. Input Validation
  const validationResult = validateInput(getFollowsSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }

  const { username, offset, limit } =
    validationResult.response as GetFollowsOutput;

  // #2. Query database
  try {
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userResult.length === 0) {
      return { success: false, error: "User not found" };
    }

    const userId = userResult[0].id;

    const followers: UserProfile[] = await db
      .select({
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followerId, users.id))
      .where(eq(userFollows.followingId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limit)
      .offset(offset);

    return { success: true, response: followers };
  } catch (error) {
    console.error("Error fetching followers:", error);
    return { success: false, error: "Failed to fetch followers" };
  }
}
