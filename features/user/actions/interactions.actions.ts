"use server";
import {
  comments,
  projectLikes,
  projects,
  userFollows,
  users,
} from "@/database/schema/schema";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { checkPermission } from "@/features/authz/authz";

import { getUserFromSession, validateInput } from "@/lib/actions-utility";
import { PublicIdInput, publicIdSchema } from "@/lib/validations";
import {
  CreateCommentInput,
  createCommentSchema,
  DeleteCommentInput,
  deleteCommentSchema,
  UsernameInput,
  usernameSchema,
} from "@/features/user/lib/validations";
import { revalidatePath } from "next/cache";
import { CommentData } from "@/features/project/lib/project.types";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Internal helper function to retrieve the internal database ID (`projects.id`)
 * for a given public-facing project ID (`projects.publicId`).
 * This avoids exposing internal IDs in the API while allowing actions to reference the correct project.
 * @param {PublicIdInput} input - Object containing the publicId.
 * @returns {Promise<ActionResult<string>>} ActionResult containing the internal project ID or an error.
 */
async function getProjectIdByPublicId(
  input: PublicIdInput,
): Promise<ActionResult<string>> {
  // #1. Input Validation
  const validationResult = validateInput(publicIdSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }

  const { publicId } = validationResult.response;

  // #2. Query database
  try {
    const projectResult = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.publicId, publicId))
      .limit(1);

    if (projectResult.length === 0) {
      return { success: false, error: "Project not found" };
    }
    return { success: true, response: projectResult[0].id };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to find project" };
  }
}

// ============================================================================
// Comment Actions
// ============================================================================

/**
 * Creates a new comment on a project for the logged-in user.
 * Increments the project's comment count within a transaction.
 * @param {CreateCommentInput} input - The project's public ID and the new comment content.
 * @returns {Promise<ActionResult<CommentData>>} ActionResult containing the newly created comment data (including ownership flag) or an error.
 */
export async function createComment(
  input: CreateCommentInput,
): Promise<ActionResult<CommentData>> {
  // #1. Input Validation
  const validationResult = validateInput(createCommentSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { publicId, newComment } = validationResult.response;

  // #2. Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };
  const {
    id: userId,
    name: username,
    avatarUrl: avatarUrl,
  } = checkAuth.response.user;

  // #3. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "create",
    resource: "comment",
  });

  if (!permission)
    return {
      success: false,
      error: "You do not have permission to create a comment",
    };

  // #4. Query database and insert data
  try {
    const findProject = await getProjectIdByPublicId({ publicId: publicId });
    if (!findProject.success) return findProject;
    const projectId = findProject.response;

    const insertedComment = await db.transaction(async (tx) => {
      const [comment] = await tx
        .insert(comments)
        .values({
          projectId,
          userId,
          content: newComment,
        })
        .returning({
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
        });
      await tx
        .update(projects)
        .set({
          commentsCount: sql`${projects.commentsCount} + 1`,
        })
        .where(eq(projects.id, projectId));
      return comment;
    });
    const commentData: CommentData = {
      ...insertedComment,
      isOwner: true,
      user: {
        username: username,
        avatarUrl: avatarUrl,
      },
    };

    return { success: true, response: commentData };
  } catch {
    return { success: false, error: "Failed to add comment" };
  }
}

/**
 * Deletes a comment made by the logged-in user.
 * Decrements the project's comment count within a transaction.
 * Requires the user to be authenticated and authorized (comment owner or admin).
 * @param {DeleteCommentInput} input - The ID of the comment to delete.
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure.
 */
export async function deleteComment(
  input: DeleteCommentInput,
): Promise<ActionResult> {
  // #1. Input Validation
  const validationResult = validateInput(deleteCommentSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { commentId } = validationResult.response;

  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };
  const currentUser = checkAuth.response.user;

  try {
    const commentResult = await db
      .select()
      .from(comments)
      .where(
        and(eq(comments.id, commentId), eq(comments.userId, currentUser.id)),
      );

    const commentToDelete = commentResult[0];

    // #3. User Authorization
    const permission = checkPermission({
      user: checkAuth.response.user,
      action: "delete",
      resource: "comment",
      resourceOwnerId: commentToDelete.userId,
    });

    if (!permission)
      return {
        success: false,
        error: "You do not have permission to delete this comment",
      };

    // #4. Query database and delete comment
    const projectId = commentToDelete.projectId;
    await db.transaction(async (tx) => {
      await tx.delete(comments).where(eq(comments.id, commentId));
      await tx
        .update(projects)
        .set({
          commentsCount: sql`${projects.commentsCount}
          - 1`,
        })
        .where(eq(projects.id, projectId));
    });
    return { success: true, response: null };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to delete comment" };
  }
}

// ============================================================================
// Project Like Actions
// ============================================================================

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
 * Allows the logged-in user to like a project.
 * Increments the project's like count within a transaction.
 * Prevents double-liking.
 * @param {PublicIdInput} input - The public ID of the project to like.
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure (e.g., if already liked).
 */
export async function likeProject(input: PublicIdInput): Promise<ActionResult> {
  // #1. Data Validation
  const validationResult = validateInput(publicIdSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { publicId } = validationResult.response;

  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };
  const user = checkAuth.response.user;
  const { id: userId } = checkAuth.response.user;

  // #3. User Authorization
  const permission = checkPermission({
    user: user,
    action: "like",
    resource: "post",
  });

  if (!permission)
    return {
      success: false,
      error: "You do not have permission to like this project",
    };

  // #4. Query Database
  try {
    const findProject = await getProjectIdByPublicId({ publicId });
    if (!findProject.success) return findProject;
    const projectId = findProject.response;

    return await db.transaction(async (tx) => {
      const existingLike = await tx
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
        throw new Error("Already liked this project");
      }

      await tx.insert(projectLikes).values({
        projectId,
        userId,
      });

      await tx
        .update(projects)
        .set({
          likesCount: sql`${projects.likesCount} + 1`,
        })
        .where(eq(projects.id, projectId));

      return { success: true, response: null };
    });
  } catch (error) {
    console.log(error);
    if (
      error instanceof Error &&
      error.message === "Already liked this project"
    ) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Server Error. Failed to like this project",
    };
  }
}

/**
 * Allows the logged-in user to unlike a project they previously liked.
 * Decrements the project's like count within a transaction.
 * Prevents unliking if not previously liked.
 * @param {PublicIdInput} input - The public ID of the project to unlike.
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure (e.g., if not liked).
 */
export async function unlikeProject(
  input: PublicIdInput,
): Promise<ActionResult> {
  // #1. Input Validation
  const validationResult = validateInput(publicIdSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { publicId } = validationResult.response;

  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };
  const user = checkAuth.response.user;
  const { id: userId } = checkAuth.response.user;

  // #3. User Authorization
  const permission = checkPermission({
    user: user,
    action: "like",
    resource: "post",
  });

  if (!permission)
    return {
      success: false,
      error: "You do not have permission to unlike this project",
    };

  // #4. Query Database
  try {
    const findProject = await getProjectIdByPublicId({ publicId });
    if (!findProject.success) return findProject;
    const projectId = findProject.response;

    return await db.transaction(async (tx) => {
      const existingLike = await tx
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
        throw new Error("You haven't liked this project");
      }

      await tx
        .delete(projectLikes)
        .where(
          and(
            eq(projectLikes.projectId, projectId),
            eq(projectLikes.userId, userId),
          ),
        );

      await tx
        .update(projects)
        .set({
          likesCount: sql`${projects.likesCount} - 1`,
        })
        .where(eq(projects.id, projectId));

      return { success: true, response: null };
    });
  } catch (error) {
    console.log(error);
    if (
      error instanceof Error &&
      error.message === "You haven't liked this project"
    ) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to unlike project" };
  }
}

// ============================================================================
// User Follow Actions
// ============================================================================

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

/**
 * Allows the logged-in user to follow another user specified by username.
 * Prevents following oneself and double-following.
 * @param {UsernameInput} input - The username of the user to follow.
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure (e.g., if already following).
 */
export async function followUser(input: UsernameInput): Promise<ActionResult> {
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

  // #3. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "follow",
    resource: "user",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to follow this user",
    };
  // #4. Query Database and add entry
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

    return await db.transaction(async (tx) => {
      const existingFollow = await tx
        .select({ foundFollowerId: userFollows.followerId })
        .from(userFollows)
        .where(
          and(
            eq(userFollows.followerId, followerId),
            eq(userFollows.followingId, followingId),
          ),
        )
        .limit(1);

      if (existingFollow.length > 0) {
        return { success: false, error: "Already following this user" };
      }

      await tx.insert(userFollows).values({
        followerId,
        followingId,
      });
      return { success: true, response: null };
    });
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to follow user" };
  }
}

/**
 * Allows the logged-in user to unfollow another user specified by username.
 * Prevents unfollowing if not currently following.
 *
 * @param {UsernameInput} input - The username of the user to unfollow.
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure (e.g., if not following).
 */
export async function unfollowUser(
  input: UsernameInput,
): Promise<ActionResult> {
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

  // #3. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "follow",
    resource: "user",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to unfollow this user",
    };

  // #4. Query Database
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

    return await db.transaction(async (tx) => {
      const existingFollow = await tx
        .select({ foundFollowerId: userFollows.followerId })
        .from(userFollows)
        .where(
          and(
            eq(userFollows.followerId, followerId),
            eq(userFollows.followingId, followingId),
          ),
        )
        .limit(1);

      if (existingFollow.length === 0) {
        return { success: false, error: "Not following this user" };
      }

      await tx
        .delete(userFollows)
        .where(
          and(
            eq(userFollows.followerId, followerId),
            eq(userFollows.followingId, followingId),
          ),
        );

      return { success: true, response: null };
    });
  } catch {
    return { success: false, error: "Failed to unfollow user" };
  }
}

// ============================================================================
// Project View Action
// ============================================================================

/**
 * Increments the view count for a specific project.
 *
 * @param {PublicIdInput} input - The public ID of the project whose view count to increment.
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure.
 */
export async function incrementProjectViews(
  input: PublicIdInput,
): Promise<ActionResult> {
  // #1. Input Validation
  const validationResult = validateInput(publicIdSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { publicId } = validationResult.response;

  try {
    await db
      .update(projects)
      .set({
        views: sql`${projects.views} + 1`,
      })
      .where(eq(projects.publicId, publicId));

    return { success: true, response: null };
  } catch {
    return { success: false, error: "Failed to increment view count" };
  }
}
