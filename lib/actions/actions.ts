import { PublicIdInput, publicIdSchema } from "@/lib/validations";
import { validateInput } from "@/lib/actions-utility";
import { db } from "@/database/drizzle";
import { projects } from "@/database/schema";
import { eq } from "drizzle-orm";

/**
 * Internal helper function to retrieve the internal database ID (`projects.id`)
 * for a given public-facing project ID (`projects.publicId`).
 * This avoids exposing internal IDs in the API while allowing actions to reference the correct project.
 * @param {PublicIdInput} input - Object containing the publicId.
 * @returns {Promise<ActionResult<string>>} ActionResult containing the internal project ID or an error.
 */
export async function getProjectIdByPublicId(
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
