import {
  CommentData,
  FeaturedProjects,
  ProjectData,
} from "@/features/project/lib/project.types";
import { db } from "@/database/drizzle";
import { and, asc, desc, eq, ilike, or, sql, SQL } from "drizzle-orm";
import {
  projects,
  ProjectVisibility,
  UserRole,
  users,
} from "@/database/schema";
import {
  GetProjectDataInput,
  getProjectDataSchema,
  GetProjectsInput,
  GetProjectsOutput,
  getProjectsSchema,
} from "@/features/project/lib/validations";
import { getUserFromSession, validateInput } from "@/lib/actions-utility";
import { OrderByTypes } from "@/features/search/lib/types";

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
        code: 404,
      };
    }
    // Check for ownership
    const isProjectOwner = project.userId === currentUserId;

    if (project.comments) {
      project.comments.forEach((comment) => {
        (comment as CommentData).isOwner = currentUserId
          ? comment.userId === currentUserId
          : false;
      });
    }
    return {
      success: true,
      response: { ...(project as ProjectData), isOwner: isProjectOwner },
    };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to retrieve project", code: 500 };
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
    return { success: false, error: "Failed to retrieve projects", code: 500 };
  }
}

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
      code: 500,
    };
  }
};
