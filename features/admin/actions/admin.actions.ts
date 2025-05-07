"use server";

import { db } from "@/database/drizzle";
import { and, asc, count, desc, eq, ilike, SQL, sql } from "drizzle-orm";
import {
  comments,
  PostTypes,
  projects,
  ProjectVisibility,
  UserRole,
  users,
} from "@/database/schema";
import { getUserFromSession, validateInput } from "@/lib/actions-utility";
import { checkPermission } from "@/features/authz/authz";
import { OrderByTypes } from "@/features/search/lib/types";
import {
  GetProjectsInputForAdmin,
  GetProjectsOutputForAdmin,
  getProjectsSchemaForAdmin,
  GetTotalProjectsInputForAdmin,
  GetTotalProjectsOutputForAdmin,
  getTotalProjectsSchemaForAdmin,
  GetTotalUsersInputForAdmin,
  GetTotalUsersOutputForAdmin,
  getTotalUsersSchemaForAdmin,
  GetUsersInputForAdmin,
  GetUsersOutputForAdmin,
  getUsersSchemaForAdmin,
} from "@/features/admin/lib/validations";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Shape of project data specifically formatted for the admin table UI.
 */
export type AdminTableProjectsInfo = {
  id: string;
  title: string;
  type: PostTypes;
  views: number;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  publicId: string;
  visibility: ProjectVisibility;
  userId: string;
  username: string;
};

/**
 * Shape of user data specifically formatted for the admin table UI.
 */
export type AdminTableUserInfo = {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  avatarUrl: string | null;
  role: UserRole;
};

// ============================================================================
// Constants
// ============================================================================

/**
 * Mapping from sort keys (used in input validation/API) to Drizzle ORM user columns for sorting.
 */
const usersSortOption = {
  username: users.username,
  email: users.email,
  createdAt: users.createdAt,
  role: users.role,
};

/**
 * Mapping from sort keys (used in input validation/API) to Drizzle ORM project/user columns for sorting.
 */
const projectsSortOption = {
  title: projects.title,
  type: projects.type,
  username: users.username,
  views: projects.views,
  likesCount: projects.likesCount,
  commentsCount: projects.commentsCount,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
  visibility: projects.visibility,
};

// ============================================================================
// Statistics Functions
// ============================================================================

/**
 * Retrieves the total number of registered users.
 * Requires admin permission to view statistics.
 * @returns {Promise<ActionResult<number>>} ActionResult containing the total user count or an error.
 */
export const getTotalNumberOfUsers = async (): Promise<
  ActionResult<number>
> => {
  // #1. User Authentication: Ensure a user is logged in.
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  // #2. User Authorization: Check if the user has permission to view statistics.
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "view_statistics",
    resource: "admin_dashboard",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to view statistics.",
    };
  try {
    // #3. Database Query: Count all entries in the users table.
    const result = await db
      .select({
        count: count(),
      })
      .from(users);
    // #4. Success Response: Return the count.
    return { success: true, response: result[0].count };
  } catch (error) {
    // #5. Error Handling: Log the error and return a generic server error message.
    console.log(error);
    return { success: false, error: "Server Error. Failed to get total users" };
  }
};

/**
 * Retrieves the total number of projects.
 * Requires admin permission to view statistics.
 * @returns {Promise<ActionResult<number>>} ActionResult containing the total project count or an error.
 */
export const getTotalNumberOfProjects = async (): Promise<
  ActionResult<number>
> => {
  // #1. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  // #2. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "view_statistics",
    resource: "admin_dashboard",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to view statistics.",
    };
  try {
    const result = await db
      .select({
        count: count(),
      })
      .from(projects);
    return { success: true, response: result[0].count };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Server Error. Failed to get total projects",
    };
  }
};

/**
 * Retrieves the total number of comments across all projects.
 * Requires admin permission to view statistics.
 * @returns {Promise<ActionResult<number>>} ActionResult containing the total comment count or an error.
 */
export const getTotalNumberOfComments = async (): Promise<
  ActionResult<number>
> => {
  // #1. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  // #2. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "view_statistics",
    resource: "admin_dashboard",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to view statistics.",
    };
  try {
    const result = await db
      .select({
        count: count(),
      })
      .from(comments);
    return { success: true, response: result[0].count };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Server Error. Failed to get total comments",
    };
  }
};

/**
 * Retrieves the total sum of views across all projects.
 * Requires admin permission to view statistics.
 * @returns {Promise<ActionResult<number>>} ActionResult containing the total view count or an error.
 */
export const getTotalNumberOfViews = async (): Promise<
  ActionResult<number>
> => {
  // #1. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  // #2. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "view_statistics",
    resource: "admin_dashboard",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to view statistics.",
    };
  try {
    const result = await db
      .select({
        // Use sum() on the 'views' column.
        // Use sql`coalesce(..., 0)` to handle the case where the table might be empty
        // (SUM returns NULL in SQL for empty sets), ensuring we get 0 instead of null.
        // .mapWith(Number) helps ensure the result is typed as a number.
        totalViews: sql<number>`coalesce(sum(${projects.views}), 0)`.mapWith(
          Number,
        ),
      })
      .from(projects);
    return { success: true, response: result[0].totalViews };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Server Error. Failed to get total views",
    };
  }
};

// ============================================================================
// User Data Functions
// ============================================================================

/**
 * Fetches a paginated and filtered list of users for the admin table.
 * Requires admin permission to view users.
 * @param {GetUsersInputForAdmin} input - Object containing filtering, sorting, and pagination parameters.
 * @returns {Promise<ActionResult<AdminTableUserInfo[]>>} ActionResult containing the list of users or an error.
 */
export const getUsers = async (
  input: GetUsersInputForAdmin,
): Promise<ActionResult<AdminTableUserInfo[]>> => {
  // #1. Data Validation
  const validateResult = validateInput(getUsersSchemaForAdmin, input);
  if (!validateResult.success) {
    return validateResult;
  }
  const { order, sortBy, limit, offset, searchText, role } =
    validateResult.response as GetUsersOutputForAdmin;
  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  // #3. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "manage",
    resource: "user",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to manage users.",
    };
  try {
    const conditions: SQL[] = [];
    if (searchText) conditions.push(ilike(users.username, `%${searchText}%`));
    if (role) conditions.push(eq(users.role, role));
    const sortColumn = usersSortOption[sortBy];
    const sortFunction = order === OrderByTypes.Ascending ? asc : desc;

    const queryUsers = await db.query.users.findMany({
      columns: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        avatarUrl: true,
        role: true,
      },
      limit: limit,
      offset: offset,
      where: and(...conditions),
      orderBy: [sortFunction(sortColumn)],
    });

    return { success: true, response: queryUsers as AdminTableUserInfo[] };
  } catch (error) {
    console.log(error);
  }
  return { success: false, error: "Server Error. Failed to get users" };
};

/**
 * Fetches the total count of users based on applied filters (searchText, role).
 * Used for pagination calculation in the admin user table.
 * Requires admin permission to view users.
 * @param {GetTotalUsersInputForAdmin} input - Object containing filtering parameters (searchText, role).
 * @returns {Promise<ActionResult<number>>} ActionResult containing the total filtered user count or an error.
 */
export const getTotalUsers = async (
  input: GetTotalUsersInputForAdmin,
): Promise<ActionResult<number>> => {
  // #1. Data Validation
  const validateResult = validateInput(getTotalUsersSchemaForAdmin, input);
  if (!validateResult.success) {
    return validateResult;
  }
  const { searchText, role } =
    validateResult.response as GetTotalUsersOutputForAdmin;

  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  // #3. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "manage",
    resource: "user",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to manage users.",
    };
  try {
    const conditions: SQL[] = [];
    if (searchText) conditions.push(ilike(users.username, `%${searchText}%`));
    if (role) conditions.push(eq(users.role, role));

    const result = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions));

    return { success: true, response: result[0].count };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Server Error. Failed to get total users" };
  }
};

// ============================================================================
// Project Data Functions
// ============================================================================

/**
 * Fetches a paginated and filtered list of projects for the admin table.
 * Joins with the users table to include the author's username.
 * Requires admin permission to view posts/projects.
 * @param {GetProjectsInputForAdmin} input - Object containing filtering, sorting, and pagination parameters.
 * @returns {Promise<ActionResult<AdminTableProjectsInfo[]>>} ActionResult containing the list of projects or an error.
 */
export const getProjects = async (
  input: GetProjectsInputForAdmin,
): Promise<ActionResult<AdminTableProjectsInfo[]>> => {
  // #1. Data Validation
  const validateResult = validateInput(getProjectsSchemaForAdmin, input);
  if (!validateResult.success) {
    return validateResult;
  }

  const { order, sortBy, offset, searchText, type, limit, visibility } =
    validateResult.response as GetProjectsOutputForAdmin;

  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  // #3. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "manage",
    resource: "post",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to manage projects.",
    };

  try {
    const conditions: SQL[] = [];
    if (searchText) conditions.push(ilike(projects.title, `%${searchText}%`));
    if (visibility) conditions.push(eq(projects.visibility, visibility));
    if (type) conditions.push(eq(projects.type, type));
    const sortColumn = projectsSortOption[sortBy];
    const sortFunction = order === OrderByTypes.Ascending ? asc : desc;

    const queryProjects = await db
      .select({
        id: projects.id,
        username: users.username,
        userId: users.id,
        title: projects.title,
        type: projects.type,
        views: projects.views,
        likesCount: projects.likesCount,
        commentsCount: projects.commentsCount,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        publicId: projects.publicId,
        visibility: projects.visibility,
      })
      .from(projects)
      .leftJoin(users, eq(users.id, projects.userId))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(sortFunction(sortColumn));

    return {
      success: true,
      response: queryProjects as AdminTableProjectsInfo[],
    };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Server Error. Failed to get projects" };
  }
};

/**
 * Fetches the total count of projects based on applied filters (searchText, type, visibility).
 * Used for pagination calculation in the admin project table.
 * Requires admin permission to view posts/projects.
 * @param {GetTotalProjectsInputForAdmin} input - Object containing filtering parameters.
 * @returns {Promise<ActionResult<number>>} ActionResult containing the total filtered project count or an error.
 */
export const getTotalProjects = async (
  input: GetTotalProjectsInputForAdmin,
): Promise<ActionResult<number>> => {
  // #1. Data Validation
  const validateResult = validateInput(getTotalProjectsSchemaForAdmin, input);
  if (!validateResult.success) {
    return validateResult;
  }

  const { searchText, type, visibility } =
    validateResult.response as GetTotalProjectsOutputForAdmin;
  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  // #3. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "manage",
    resource: "post",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to manage posts.",
    };
  try {
    const conditions: SQL[] = [];
    if (searchText) conditions.push(ilike(projects.title, `%${searchText}%`));
    if (visibility) conditions.push(eq(projects.visibility, visibility));
    if (type) conditions.push(eq(projects.type, type));

    const result = await db
      .select({ count: count() })
      .from(projects)
      .where(and(...conditions));
    return { success: true, response: result[0].count };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Server Error. Failed to get total projects",
    };
  }
};

// ============================================================================
// Temporary Function
// ============================================================================
/**
 * Temporary function to change a user's role from User to Admin for presentation purposes
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure with error message
 */
export const makeUserAdmin = async (): Promise<ActionResult> => {
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  try {
    await db
      .update(users)
      .set({ role: UserRole.Admin })
      .where(eq(users.id, checkAuth.response.user.id));
    return { success: true, response: null };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Server Error. Failed to make user admin" };
  }
};
