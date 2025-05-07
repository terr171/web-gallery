import { relations } from "drizzle-orm";
import {
  users,
  projects,
  files,
  comments,
  projectLikes,
  userFollows,
} from "./schema";

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  comments: many(comments),
  projectLikes: many(projectLikes),
  followedBy: many(userFollows, {
    relationName: "following",
  }),
  following: many(userFollows, {
    relationName: "follower",
  }),
}));

// Project relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  files: many(files),
  comments: many(comments),
  likes: many(projectLikes),
}));

// File relations
export const filesRelations = relations(files, ({ one }) => ({
  project: one(projects, {
    fields: [files.projectId],
    references: [projects.id],
  }),
}));

// Comment relations
export const commentsRelations = relations(comments, ({ one }) => ({
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// ProjectLikes relations
export const projectLikesRelations = relations(projectLikes, ({ one }) => ({
  project: one(projects, {
    fields: [projectLikes.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectLikes.userId],
    references: [users.id],
  }),
}));

// UserFollows relations
export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));
