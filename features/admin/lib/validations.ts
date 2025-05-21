import {
  OrderByTypes,
  ProjectSortByTypesForAdmin,
  UserSortByTypes,
} from "@/features/search/lib/types";
import { PostTypes, ProjectVisibility, UserRole } from "@/database/schema";
import { z } from "zod";

export const getUsersSchemaForAdmin = z.object({
  order: z.nativeEnum(OrderByTypes).optional().default(OrderByTypes.Ascending),
  sortBy: z
    .nativeEnum(UserSortByTypes)
    .optional()
    .default(UserSortByTypes.Username),
  searchText: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export type GetUsersInputForAdmin = z.input<typeof getUsersSchemaForAdmin>;
export type GetUsersOutputForAdmin = z.infer<typeof getUsersSchemaForAdmin>;

export const getProjectsSchemaForAdmin = z.object({
  order: z.nativeEnum(OrderByTypes).optional().default(OrderByTypes.Ascending),
  sortBy: z
    .nativeEnum(ProjectSortByTypesForAdmin)
    .optional()
    .default(ProjectSortByTypesForAdmin.Title),
  username: z.string().optional(),
  searchText: z.string().optional(),
  type: z.nativeEnum(PostTypes).optional(),
  visibility: z.nativeEnum(ProjectVisibility).optional(),
  limit: z.number().int().positive().max(50).optional().default(10),
  offset: z.number().int().nonnegative().optional().default(0),
});
export type GetProjectsInputForAdmin = z.input<
  typeof getProjectsSchemaForAdmin
>;
export type GetProjectsOutputForAdmin = z.infer<
  typeof getProjectsSchemaForAdmin
>;

export const getTotalProjectsSchemaForAdmin = z.object({
  searchText: z.string().optional(),
  visibility: z.nativeEnum(ProjectVisibility).optional(),
  type: z.nativeEnum(PostTypes).optional(),
});

export type GetTotalProjectsInputForAdmin = z.input<
  typeof getTotalProjectsSchemaForAdmin
>;
export type GetTotalProjectsOutputForAdmin = z.infer<
  typeof getTotalProjectsSchemaForAdmin
>;
