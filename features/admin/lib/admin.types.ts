import { PostTypes, ProjectVisibility, UserRole } from "@/database/schema";

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
