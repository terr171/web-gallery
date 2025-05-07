import { Session } from "next-auth";
import { UserRole } from "@/database/schema";

type Role = UserRole | "viewer";
export type Action =
  | "like"
  | "follow"
  | "view"
  | "create"
  | "update"
  | "delete"
  | "view_statistics"
  | "manage";
export type ResourceType = "post" | "comment" | "user" | "admin_dashboard";

const PERMISSIONS: Record<Role, `${Action}:${ResourceType}`[]> = {
  [UserRole.Admin]: [
    // post
    "view:post",
    "create:post",
    "update:post",
    "delete:post",
    "like:post",
    "manage:post",

    // comment
    "view:comment",
    "create:comment",
    "update:comment",
    "delete:comment",
    // user
    "follow:user",
    "view:user",
    "manage:user",
    // dashboard
    "view_statistics:admin_dashboard",
  ],
  [UserRole.User]: [
    // post
    "view:post",
    "create:post",
    "delete:post",
    "update:post",
    "like:post",

    // comment
    "create:comment",
    "update:comment",
    "delete:comment",
    // user
    "follow:user",
  ],
  viewer: ["view:post", "view:comment"],
};

const OWNERSHIP_REQUIRED_ACTIONS: Partial<Record<ResourceType, Action[]>> = {
  post: ["update", "delete"],
  comment: ["update", "delete"],
};

/**
 * Checks if a user has permission to perform an action on a resource.
 * Handles role-based permissions and ownership checks for relevant actions.
 *
 * @param user - The user object from session (or null for anonymous). Must include 'id' and 'role'.
 * @param action - The action being performed.
 * @param resource - The type of resource being acted upon.
 * @param resourceOwnerId - Optional. The ID of the user who owns the resource. Required for ownership checks (update/delete).
 * @returns boolean - True if permission is granted, false otherwise.
 */
export const checkPermission = ({
  user,
  action,
  resource,
  resourceOwnerId,
}: {
  user: Session["user"] | null;
  action: Action;
  resource: ResourceType;
  resourceOwnerId?: string;
}) => {
  const role = user ? user.role : "viewer";
  const permissions = PERMISSIONS[role];

  if (!permissions || !permissions.includes(`${action}:${resource}`))
    return false;

  const needsOwnershipCheck =
    OWNERSHIP_REQUIRED_ACTIONS[resource]?.includes(action) ?? false;

  if (needsOwnershipCheck && role !== UserRole.Admin) {
    if (!user?.id || !resourceOwnerId) {
      return false;
    }

    return user.id === resourceOwnerId;
  }

  return true;
};
