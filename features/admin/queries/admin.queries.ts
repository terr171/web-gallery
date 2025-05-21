import {
  GetProjectsInputForAdmin,
  GetProjectsOutputForAdmin,
  getProjectsSchemaForAdmin,
  GetUsersInputForAdmin,
  GetUsersOutputForAdmin,
  getUsersSchemaForAdmin,
} from "@/features/admin/lib/validations";
import {
  AdminTableProjectsInfo,
  AdminTableUserInfo,
} from "@/features/admin/lib/admin.types";
import { getUserFromSession, validateInput } from "@/lib/actions-utility";
import { checkPermission } from "@/features/authz/authz";
import { and, asc, count, desc, eq, ilike, sql, SQL } from "drizzle-orm";
import { comments, projects, users } from "@/database/schema";
import { OrderByTypes } from "@/features/search/lib/types";
import { db } from "@/database/drizzle";

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
  if (!checkAuth.success) return checkAuth;

  // #2. User Authorization: Check if the user has permission to view statistics.
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "view_statistics",
    resource: "admin_dashboard",
  });
  if (!permission.success) return permission;
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
    return {
      success: false,
      error: "Server Error. Failed to get total users",
      code: 500,
    };
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
  if (!checkAuth.success) return checkAuth;

  // #2. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "view_statistics",
    resource: "admin_dashboard",
  });
  if (!permission.success) return permission;

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
      code: 500,
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
  if (!checkAuth.success) return checkAuth;

  // #2. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "view_statistics",
    resource: "admin_dashboard",
  });
  if (!permission.success) return permission;

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
      code: 500,
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
  if (!checkAuth.success) return checkAuth;

  // #2. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "view_statistics",
    resource: "admin_dashboard",
  });
  if (!permission.success) return permission;

  try {
    const result = await db
      .select({
        totalViews: sql<number>`coalesce(sum(
        ${projects.views}
        ),
        0
        )`.mapWith(Number),
      })
      .from(projects);
    return { success: true, response: result[0].totalViews };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Server Error. Failed to get total views",
      code: 500,
    };
  }
};
/**
 * Fetches a paginated and filtered list of users for the admin table.
 * Requires admin permission to view users.
 * @param {GetUsersInputForAdmin} input - Object containing filtering, sorting, and pagination parameters.
 * @returns {Promise<ActionResult<{ users: AdminTableUserInfo[]; totalCount: number }>>} ActionResult containing the list of users with count or an error.
 */
export const getUsers = async (
  input: GetUsersInputForAdmin,
): Promise<
  ActionResult<{ users: AdminTableUserInfo[]; totalCount: number }>
> => {
  // #1. Data Validation
  const validateResult = validateInput(getUsersSchemaForAdmin, input);
  if (!validateResult.success) {
    return validateResult;
  }
  const { order, sortBy, limit, offset, searchText, role } =
    validateResult.response as GetUsersOutputForAdmin;
  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return checkAuth;

  // #3. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "manage",
    resource: "user",
  });
  if (!permission.success) return permission;

  try {
    const conditions: SQL[] = [];
    if (searchText) conditions.push(ilike(users.username, `%${searchText}%`));
    if (role) conditions.push(eq(users.role, role));
    const sortColumn = usersSortOption[sortBy];
    const sortFunction = order === OrderByTypes.Ascending ? asc : desc;

    const [queryUsers, queryCount] = await Promise.all([
      db.query.users.findMany({
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
      }),
      db
        .select({ count: count() })
        .from(users)
        .where(and(...conditions)),
    ]);
    return {
      success: true,
      response: {
        users: queryUsers as AdminTableUserInfo[],
        totalCount: queryCount[0].count,
      },
    };
  } catch (error) {
    console.log(error);
  }
  return {
    success: false,
    error: "Server Error. Failed to get users",
    code: 500,
  };
};

/**
 * Fetches a paginated and filtered list of projects for the admin table.
 * Joins with the users table to include the author's username.
 * Requires admin permission to view posts/projects.
 * @param {GetProjectsInputForAdmin} input - Object containing filtering, sorting, and pagination parameters.
 * @returns {Promise<ActionResult<AdminTableProjectsInfo[]>>} ActionResult containing the list of projects or an error.
 */
export const getProjects = async (
  input: GetProjectsInputForAdmin,
): Promise<
  ActionResult<{ projects: AdminTableProjectsInfo[]; totalCount: number }>
> => {
  // #1. Data Validation
  const validateResult = validateInput(getProjectsSchemaForAdmin, input);
  if (!validateResult.success) {
    return validateResult;
  }

  const { order, sortBy, offset, searchText, type, limit, visibility } =
    validateResult.response as GetProjectsOutputForAdmin;

  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return checkAuth;

  // #3. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "manage",
    resource: "post",
  });
  if (!permission.success) return permission;

  try {
    const conditions: SQL[] = [];
    if (searchText) conditions.push(ilike(projects.title, `%${searchText}%`));
    if (visibility) conditions.push(eq(projects.visibility, visibility));
    if (type) conditions.push(eq(projects.type, type));
    const sortColumn = projectsSortOption[sortBy];
    const sortFunction = order === OrderByTypes.Ascending ? asc : desc;

    const [queryProjects, queryTotalCount] = await Promise.all([
      db
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
        .orderBy(sortFunction(sortColumn)),
      db
        .select({ count: count() })
        .from(projects)
        .where(and(...conditions)),
    ]);
    return {
      success: true,
      response: {
        projects: queryProjects as AdminTableProjectsInfo[],
        totalCount: queryTotalCount[0].count,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Server Error. Failed to get projects",
      code: 500,
    };
  }
};
