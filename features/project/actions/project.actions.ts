"use server";

import { files, FileTypes, projects } from "@/database/schema/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
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
  UpdateProjectFilesInput,
  updateProjectFilesSchema,
} from "@/features/project/lib/validations";

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
  if (!permission.success) return permission;

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
    if (!permission.success) return permission;

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
    if (!permission.success) return permission;

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
