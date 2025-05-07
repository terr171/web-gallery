export enum ProjectSortByTypes {
  Date = "createdAt",
  Title = "title",
  Type = "type",
  Views = "views",
  Likes = "likesCount",
}

export type PostSortByTypesWithDefault = ProjectSortByTypes | "Sort By";

export enum OrderByTypes {
  Ascending = "asc",
  Descending = "desc",
}

export type OrderByTypesWithDefault = OrderByTypes | "Order By";

export enum UserSortByTypes {
  Username = "username",
  Email = "email",
  Joined = "createdAt",
  Role = "role",
}

export enum ProjectSortByTypesForAdmin {
  Title = "title",
  Username = "username",
  Visibility = "visibility",
  Type = "type",
  Updated = "updatedAt",
  Created = "createdAt",
  Views = "views",
  Comments = "commentsCount",
  Likes = "likesCount",
}
