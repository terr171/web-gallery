import { ZodSchema } from "zod";
import { Session } from "next-auth";
import { auth } from "@/auth";

/**
 * Validates input data against a Zod schema.
 * @param schema - The Zod schema to validate against.
 * @param data - The data to validate.
 * @returns ActionResult indicating success or validation error.
 */
export function validateInput<T>(
  schema: ZodSchema<T>,
  data: unknown,
): ActionResult<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.log(result.error.errors);
    const formattedErrors = result.error.errors
      .map((e) => `${e.path.join(".")} (${e.code}): ${e.message}`)
      .join("; ");
    return {
      success: false,
      error: `Invalid input: ${formattedErrors}`,
      code: 400,
    };
  }
  return { success: true, response: result.data };
}

/**
 * Retrieves userId from session
 *
 * @returns Promise resolving to an ActionResult indicating success or failure with User on success
 */
export const getUserFromSession = async (): Promise<ActionResult<Session>> => {
  const session = await auth();
  if (!session) {
    return { success: false, error: "You must be logged in", code: 401 };
  }
  return {
    success: true,
    response: session,
  };
};
