import { z } from "zod";
import { PostTypes, ProjectVisibility } from "@/database/schema";
import { publicIdSchema } from "@/lib/validations";
import { OrderByTypes, ProjectSortByTypes } from "@/features/search/lib/types";

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title cannot be empty." })
    .max(100, { message: "Title cannot exceed 100 characters." }),
  type: z.nativeEnum(PostTypes).default(PostTypes.Others),
  visibility: z.nativeEnum(ProjectVisibility).default(ProjectVisibility.Public),
});

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type CreateProjectOutput = z.infer<typeof createProjectSchema>;

export const getProjectDataSchema = publicIdSchema.extend({
  includeFiles: z.boolean().optional().default(true),
  includeComments: z.boolean().optional().default(true),
});

export type GetProjectDataInput = z.input<typeof getProjectDataSchema>;

export const updateProjectFilesSchema = publicIdSchema.extend({
  newTitle: z
    .string()
    .min(1, { message: "Title cannot be empty." })
    .max(100, { message: "Title cannot exceed 100 characters." }),
  newType: z.nativeEnum(PostTypes),
  html: z.string(),
  css: z.string(),
  javascript: z.string(),
  visibility: z.nativeEnum(ProjectVisibility),
});

export type UpdateProjectFilesInput = z.input<typeof updateProjectFilesSchema>;

export const getProjectsSchema = z.object({
  order: z.nativeEnum(OrderByTypes).optional().default(OrderByTypes.Descending),
  sortBy: z
    .nativeEnum(ProjectSortByTypes)
    .optional()
    .default(ProjectSortByTypes.Date),
  username: z.string().optional(),
  searchText: z.string().optional(),
  type: z.nativeEnum(PostTypes).optional(),
  limit: z.coerce.number().int().positive().max(50).optional().default(9),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export type GetProjectsInput = z.input<typeof getProjectsSchema>;
export type GetProjectsOutput = z.infer<typeof getProjectsSchema>;

export const deleteProjectSchema = publicIdSchema;
export type DeleteProjectInput = z.input<typeof deleteProjectSchema>;
