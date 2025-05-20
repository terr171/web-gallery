/**
 * Represents the data displayed on a user's public profile page.
 * Includes basic info and aggregated statistics.
 */
export type UserProfile = {
  username: string;
  avatarUrl: string | null;
  totalLikes?: number;
  totalFollows?: number;
  totalViews?: number;
};
