"use server";

import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { UserRole, users } from "@/database/schema";
import { getUserFromSession } from "@/lib/actions-utility";

// ============================================================================
// Constants
// ============================================================================

// ============================================================================
// Statistics Functions
// ============================================================================

// ============================================================================
// User Data Functions
// ============================================================================

// ============================================================================
// Project Data Functions
// ============================================================================

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
