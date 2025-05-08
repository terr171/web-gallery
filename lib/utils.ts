import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * Return the given avatarUrl or a default image if empty.
 * @param avatarUrl
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  return avatarUrl || "/images/defaults/defaultprofile.png";
}

/**
 * A function to format date
 * @param dateString String representation of the Date object to be formatted
 */
export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/**
 * Randomly selects an avatar URL from the userAvatarUrls array.
 * @returns {string} A randomly selected avatar URL.
 */
function getRandomAvatar() {
  const randomIndex = Math.floor(Math.random() * userAvatarUrls.length);

  return userAvatarUrls[randomIndex];
}
