import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  followUser,
  unfollowUser,
} from "@/features/user/actions/interactions.actions";

interface UseFollowProps {
  username: string;
  initialFollowing: boolean;
  initialFollowersCount?: number;
}

export const useFollow = ({
  username,
  initialFollowing,
  initialFollowersCount,
}: UseFollowProps) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(
    initialFollowersCount ?? 0,
  );
  const [isPending, startTransition] = useTransition();

  const handleFollowToggle = () => {
    startTransition(async () => {
      const previousFollowing = isFollowing;
      const previousFollowerCount = followerCount;

      setIsFollowing(!previousFollowing);
      setFollowerCount((prev) => (previousFollowing ? prev - 1 : prev + 1));

      const action = previousFollowing ? unfollowUser : followUser;
      const result = await action({ username });

      if (!result.success) {
        setIsFollowing(previousFollowing);
        setFollowerCount(previousFollowerCount);
        toast.error(result.error);
      }
    });
  };

  return { isFollowing, followerCount, handleFollowToggle, isPending };
};
