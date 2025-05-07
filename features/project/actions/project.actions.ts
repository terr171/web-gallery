"use server";

import {
  files,
  FileTypes,
  PostTypes,
  projects,
  ProjectVisibility,
  UserRole,
  users,
} from "@/database/schema/schema";
import { and, asc, desc, eq, ilike, or, sql, SQL } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { OrderByTypes } from "@/features/search/lib/types";
import { checkPermission } from "@/features/authz/authz";

import {
  getUserFromSession,
  revalidateOnProjectChange,
  validateInput,
} from "@/lib/actions-utility";
import {
  CreateProjectInput,
  createProjectSchema,
  DeleteProjectInput,
  deleteProjectSchema,
  GetProjectDataInput,
  getProjectDataSchema,
  GetProjectsInput,
  GetProjectsOutput,
  getProjectsSchema,
  UpdateProjectFilesInput,
  updateProjectFilesSchema,
} from "@/features/project/lib/validations";
import { unstable_cache } from "next/cache";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Represents the complete data structure for a project
 * Contains the project metadata and optionally associated files and comments
 */
export type ProjectData = ProjectMetadata & {
  files: FileData[];
  user: UserData;
  comments?: CommentData[];
};

/**
 * Contains metadata information about a project.
 * Includes identifiers, content details, engagement metrics, and creation timestamp.
 * Fields marked as `readonly` are typically immutable after creation or managed internally.
 */
export type ProjectMetadata = {
  publicId: string;
  title: string;
  type: PostTypes;
  views: number;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  visibility: ProjectVisibility;
  isOwner?: boolean;
};

/**
 * Represents a file associated with a project.
 * Contains the file type (HTML, CSS, JS) and its content.
 */
export type FileData = {
  type: FileTypes;
  content: string;
};

/**
 * Represents a comment on a project.
 * Includes the comment ID, author details, content, creation timestamp,
 * and a flag indicating if the current viewer owns the comment.
 */
export type CommentData = {
  id: string;
  isOwner?: boolean;
  user: {
    username: string;
    avatarUrl: string | undefined | null;
  };
  content: string;
  createdAt: Date;
};

/**
 * Represents basic information about the user who authored a project or comment.
 */
export type UserData = {
  username: string;
  avatarUrl: string;
};

/**
 * Collection of projects featured by different metrics
 * Used for displaying highlighted projects on dashboards or landing pages
 */
export type FeaturedProjects = {
  mostViewed: ProjectData[];
  mostLiked: ProjectData[];
};

// ============================================================================
// Constants
// ============================================================================
/**
 * Mapping from sort keys (used in API/validation) to Drizzle ORM project columns for sorting.
 */
const projectsSortOption = {
  title: projects.title,
  type: projects.type,
  views: projects.views,
  likesCount: projects.likesCount,
  createdAt: projects.createdAt,
};

// ============================================================================
// Main Action Functions
// ============================================================================

/**
 * Creates a new project with a title and type for the logged-in user.
 * Initializes associated HTML, CSS, and JS files as empty.
 * Uses a transaction to ensure atomicity.
 * @param {CreateProjectInput} input - Project title and type.
 * @returns {Promise<ActionResult<Record<string, string>>>} ActionResult containing the author's username and the new project's publicId on success, or an error.
 */
export const createProject = async (
  input: CreateProjectInput,
): Promise<ActionResult<Record<string, string>>> => {
  // #1. Input Validation
  const validationResult = validateInput(createProjectSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { title, type, visibility } = validationResult.response;

  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };
  const { id: userId, name: username } = checkAuth.response.user;

  // #3. User Authorization
  const permission = checkPermission({
    user: checkAuth.response.user,
    action: "create",
    resource: "post",
  });
  if (!permission)
    return {
      success: false,
      error: "You do not have permission to create a project",
    };

  // #4. Query Database and insert new entries
  try {
    const result = await db.transaction(async (tx) => {
      const [newProject] = await tx
        .insert(projects)
        .values({
          userId: userId,
          title: title,
          type: type,
          visibility: visibility,
        })
        .returning();

      const newEmptyFiles = [
        {
          projectId: newProject.id,
          type: FileTypes.HTML,
          content: "",
        },
        {
          projectId: newProject.id,
          type: FileTypes.CSS,
          content: "",
        },
        {
          projectId: newProject.id,
          type: FileTypes.JS,
          content: "",
        },
      ];

      await tx.insert(files).values(newEmptyFiles);

      return newProject.publicId;
    });

    revalidateOnProjectChange(checkAuth.response.user.name);

    return {
      success: true,
      response: {
        username: username,
        publicId: result,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Server Error. Failed to create the project",
    };
  }
};

/**
 * Retrieves detailed data for a single project by its public ID.
 * Includes project metadata, author info, and optionally files and comments.
 * Respects project visibility rules based on the current user's session.
 * Calculates `isOwner` flags for the project and its comments.
 * @param {GetProjectDataInput} input - The public ID of the project and options for including files/comments.
 * @returns {Promise<ActionResult<ProjectData>>} ActionResult containing the detailed project data or an error.
 */
export const getProjectDataByPublicId = async (
  input: GetProjectDataInput,
): Promise<ActionResult<ProjectData>> => {
  // #1. Input Validation
  const validationResult = validateInput(getProjectDataSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { publicId, includeFiles, includeComments } = validationResult.response;

  // Check for user session for project visibility
  const checkAuth = await getUserFromSession();
  const currentUserId = checkAuth.success ? checkAuth.response.user.id : null;
  const currentUserRole = checkAuth.success
    ? checkAuth.response.user.role
    : null;

  const visibilityCondition: SQL =
    checkAuth.success && currentUserId
      ? or(
          eq(projects.visibility, ProjectVisibility.Public),
          and(
            eq(projects.visibility, ProjectVisibility.Private),
            or(
              eq(projects.userId, currentUserId),
              currentUserRole === UserRole.Admin ? sql`true` : sql`false`,
            ),
          ),
        )!
      : eq(projects.visibility, ProjectVisibility.Public);

  // #2. Query Database
  try {
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.publicId, publicId), visibilityCondition),
      with: {
        user: true,
        ...(includeFiles && {
          files: {
            columns: {
              type: true,
              content: true,
            },
          },
        }),
        ...(includeComments && {
          comments: {
            columns: {
              id: true,
              userId: true,
              content: true,
              createdAt: true,
            },
            with: {
              user: {
                columns: {
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        }),
      },
    });
    if (!project) {
      return {
        success: false,
        error: "Project not found",
      };
    }
    // Check for ownership
    const checkAuth = await getUserFromSession();
    const loggedInUserId = checkAuth.success
      ? checkAuth.response.user.id
      : null;
    const isProjectOwner = project.userId === loggedInUserId;

    if (project.comments) {
      project.comments.forEach((comment) => {
        (comment as CommentData).isOwner = loggedInUserId
          ? comment.userId === loggedInUserId
          : false;
      });
    }
    return {
      success: true,
      response: { ...(project as ProjectData), isOwner: isProjectOwner },
    };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to retrieve project" };
  }
};

/**
 * Updates the files (HTML, CSS, JS content) and optionally the title and type of a project.
 * Requires the user to be authenticated and authorized (owner or admin).
 * Uses a transaction to update the project metadata and file contents atomically.
 * @param {UpdateProjectFilesInput} input - Project's public ID and new file contents/metadata.
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure.
 */
export const updateProjectFiles = async (
  input: UpdateProjectFilesInput,
): Promise<ActionResult> => {
  // #1. Input Validation
  const validationResult = validateInput(updateProjectFilesSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { publicId, newTitle, newType, html, css, javascript, visibility } =
    validationResult.response;

  // #2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  try {
    const [projectData] = await db
      .select({ ownerId: projects.userId })
      .from(projects)
      .where(eq(projects.publicId, publicId))
      .limit(1);

    if (!projectData) {
      return { success: false, error: "Project not found" };
    }

    const { ownerId } = projectData;

    // #3. User Authorization
    const permission = checkPermission({
      user: checkAuth.response.user,
      action: "update",
      resource: "post",
      resourceOwnerId: ownerId,
    });
    if (!permission)
      return {
        success: false,
        error: "You do not have permission to update this project",
      };

    // #4. Insert new files and properties to the database
    const newFilesMap = {
      [FileTypes.HTML]: html,
      [FileTypes.CSS]: css,
      [FileTypes.JS]: javascript,
    };
    await db.transaction(async (tx) => {
      const [{ projectId }] = await tx
        .update(projects)
        .set({ title: newTitle, type: newType, visibility: visibility })
        .where(eq(projects.publicId, publicId))
        .returning({ projectId: projects.id });

      await Promise.all(
        Object.entries(newFilesMap).map(([type, value]) =>
          tx
            .update(files)
            .set({ content: value })
            .where(
              and(
                eq(files.projectId, projectId),
                eq(files.type, type as FileTypes),
              ),
            ),
        ),
      );
    });
    revalidateOnProjectChange(checkAuth.response.user.name);

    return { success: true, response: null };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to update the project" };
  }
};

/**
 * Fetches a list of projects based on various filter criteria, sorting, and pagination.
 * Respects project visibility rules. Includes author and file data for each project.
 * @param {GetProjectsInput} input - Filtering, sorting, and pagination parameters.
 * @returns {Promise<ActionResult<ProjectData[]>>} ActionResult containing the list of projects or an error.
 */
export async function getProjects(
  input: GetProjectsInput,
): Promise<ActionResult<ProjectData[]>> {
  // #1. Input Validation
  const validationResult = validateInput(getProjectsSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { order, sortBy, username, searchText, type, limit, offset } =
    validationResult.response as GetProjectsOutput;

  // #3. Query Database
  try {
    const userId =
      (username
        ? await db.query.users.findFirst({
            columns: { id: true },
            where: eq(users.username, username),
          })
        : null
      )?.id ?? null;

    const conditions: SQL[] = [];
    if (searchText) conditions.push(ilike(projects.title, `%${searchText}%`));
    if (userId) conditions.push(eq(projects.userId, userId));
    if (type) conditions.push(eq(projects.type, type));

    // #2. User Authentication for checking visibility
    const checkAuth = await getUserFromSession();
    if (checkAuth.success) {
      const { id: currentUserId, role: currentUserRole } =
        checkAuth.response.user;

      // Check for Visibility
      const visibilityCondition = or(
        eq(projects.visibility, ProjectVisibility.Public),
        and(
          eq(projects.visibility, ProjectVisibility.Private),
          or(
            currentUserId ? eq(projects.userId, currentUserId) : sql`false`,
            currentUserRole === UserRole.Admin ? sql`true` : sql`false`,
          ),
        ),
      );
      if (visibilityCondition) {
        conditions.push(visibilityCondition);
      }
    } else {
      conditions.push(eq(projects.visibility, ProjectVisibility.Public));
    }

    const sortColumn = projectsSortOption[sortBy];
    const sortFunction = order === OrderByTypes.Ascending ? asc : desc;
    const queryProject = await db.query.projects.findMany({
      columns: {
        id: true,
        publicId: true,
        title: true,
        type: true,
        views: true,
        likesCount: true,
        commentsCount: true,
        createdAt: true,
        visibility: true,
      },
      limit: limit,
      offset: offset,
      where: and(...conditions),
      orderBy: [sortFunction(sortColumn)],
      with: {
        files: {
          columns: {
            type: true,
            content: true,
          },
        },
        user: {
          columns: {
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const typedProjects = queryProject as ProjectData[];

    return {
      success: true,
      response: typedProjects,
    };
  } catch (error) {
    console.error("Failed to retrieve projects:", error);
    return { success: false, error: "Failed to retrieve projects" };
  }
}

/**
 * Deletes a project by its public ID.
 * Requires the user to be authenticated and authorized (owner or admin).
 * Note: This currently only deletes the main project record. Associated data (files, comments, likes)
 * might need explicit deletion or rely on database cascade rules.
 * @param {DeleteProjectInput} input - The public ID of the project to delete.
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure.
 */
export const deleteProject = async (
  input: DeleteProjectInput,
): Promise<ActionResult> => {
  // #1. Input Validation
  const validationResult = validateInput(deleteProjectSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { publicId } = validationResult.response;

  //#2. User Authentication
  const checkAuth = await getUserFromSession();
  if (!checkAuth.success) return { success: false, error: checkAuth.error };

  try {
    const [projectData] = await db
      .select({ ownerId: projects.userId })
      .from(projects)
      .where(eq(projects.publicId, publicId))
      .limit(1);

    if (!projectData) {
      return { success: false, error: "Project not found" };
    }
    const { ownerId } = projectData;

    //#3. User Authorization
    const permission = checkPermission({
      user: checkAuth.response.user,
      action: "delete",
      resource: "post",
      resourceOwnerId: ownerId,
    });
    if (!permission)
      return {
        success: false,
        error: "You do not have permission to delete this project",
      };

    await db.delete(projects).where(eq(projects.publicId, publicId));
    revalidateOnProjectChange(checkAuth.response.user.name);
    return { success: true, response: null };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Server Error. Failed to delete this project. ",
    };
  }
};

/**
 * Retrieves featured projects (e.g., most viewed, most liked)
 *
 * @returns {Promise<ActionResult<FeaturedProjects>>} ActionResult containing lists of featured projects or an error.
 */
export const getFeaturedProjects = async (): Promise<
  ActionResult<FeaturedProjects>
> => {
  try {
    const [mostViewedResult, mostLikedResult] = await Promise.all([
      db.query.projects.findMany({
        columns: {
          id: true,
          publicId: true,
          title: true,
          type: true,
          views: true,
          likesCount: true,
          commentsCount: true,
          createdAt: true,
          visibility: true,
        },
        limit: 4,
        where: eq(projects.visibility, ProjectVisibility.Public),
        orderBy: [desc(projects.views)],
        with: {
          files: {
            columns: {
              type: true,
              content: true,
            },
          },
          user: {
            columns: {
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),

      db.query.projects.findMany({
        columns: {
          id: true,
          publicId: true,
          title: true,
          type: true,
          views: true,
          likesCount: true,
          commentsCount: true,
          createdAt: true,
          visibility: true,
        },
        limit: 4,
        where: eq(projects.visibility, ProjectVisibility.Public),
        orderBy: [desc(projects.likesCount)],
        with: {
          files: {
            columns: {
              type: true,
              content: true,
            },
          },
          user: {
            columns: {
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      response: {
        mostViewed: mostViewedResult as ProjectData[],
        mostLiked: mostLikedResult as ProjectData[],
      },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Server Error. Failed to get featured projects",
    };
  }
};

/**
 * Returns a cached result of getFeaturedProjects.
 * Revalidates every hour.
 */
export const getCachedFeaturedProjects: () => Promise<
  ActionResult<FeaturedProjects>
> = unstable_cache(
  async (): Promise<ActionResult<FeaturedProjects>> => {
    return await getFeaturedProjects();
  },
  ["featuredProjects"],
  {
    revalidate: 3600,
  },
);
