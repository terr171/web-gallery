import { FileTypes, PostTypes, ProjectVisibility } from "@/database/schema";

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
