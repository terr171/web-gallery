import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export enum FileTypes {
  HTML = "html",
  JS = "js",
  CSS = "css",
}

export enum PostTypes {
  Button = "button",
  Header = "header",
  Footer = "footer",
  Sidebar = "sidebar",
  Form = "form",
  Modal = "modal",
  Animation = "animation",
  Others = "others",
}

export enum UserRole {
  Admin = "admin",
  User = "user",
}

export enum ProjectVisibility {
  Public = "public",
  Private = "private",
}

export const FILE_TYPE_ENUM = pgEnum(
  "file_type",
  Object.values(FileTypes) as [string, ...string[]],
);
export const POST_TYPE_ENUM = pgEnum(
  "post_type",
  Object.values(PostTypes) as [string, ...string[]],
);
export const USER_ROLE_ENUM = pgEnum(
  "user_role",
  Object.values(UserRole) as [string, ...string[]],
);
export const PROJECT_VISIBILITY_ENUM = pgEnum(
  "project_visibility",
  Object.values(ProjectVisibility) as [string, ...string[]],
);

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  role: USER_ROLE_ENUM("role").notNull().default(UserRole.User),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    publicId: varchar("public_id", { length: 12 })
      .notNull()
      .unique()
      .$defaultFn(() => nanoid(12)),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 100 }).notNull().default("My Project"),
    type: POST_TYPE_ENUM().notNull().default("others"),
    views: integer("views").notNull().default(0),
    likesCount: integer("likes_count").notNull().default(0),
    commentsCount: integer("comments_count").notNull().default(0),
    visibility: PROJECT_VISIBILITY_ENUM("visibility")
      .notNull()
      .default(ProjectVisibility.Public),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("project_user_id_idx").on(table.userId),
    index("project_type_idx").on(table.type),
    check("projects_likes_count_non_negative", sql`${table.likesCount} >= 0`),
    check(
      "projects_comments_count_non_negative",
      sql`${table.commentsCount} >= 0`,
    ),
    check("projects_views_non_negative", sql`${table.views} >= 0`),
  ],
);

export const files = pgTable(
  "files",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    type: FILE_TYPE_ENUM().notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("file_project_idx").on(table.projectId)],
);

export const projectLikes = pgTable(
  "project_likes",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.projectId] })],
);

export const userFollows = pgTable(
  "user_follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
    check(
      "check_follower_not_following",
      sql`${table.followerId} <> ${table.followingId}`,
    ),
    index("user_follows_following_id_idx").on(table.followingId),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("comment_project_id_idx").on(table.projectId),
    index("comment_user_id_idx").on(table.userId),
  ],
);
