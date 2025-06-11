import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  likeProject,
  unlikeProject,
} from "@/features/user/actions/interactions.actions";

export const useProjectLike = ({
  publicId,
  initialLikesCount,
}: {
  publicId: string;
  initialLikesCount: number;
}) => {
  const [liked, setLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/projects/${publicId}/like-status`);
        if (!response.ok) toast.error(await response.json());
        const isLiked = await response.json();
        setLiked(isLiked);
      } catch (error) {
        toast.error("Unexpected error occurred.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLikeStatus();
  }, [publicId]);

  const handleToggleLike = async () => {
    if (isToggling) return;
    setIsToggling(true);
    const action = liked ? unlikeProject : likeProject;
    const result = await action({ publicId: publicId });

    if (result.success) {
      setLiked(!liked);
      setLikedCount((prev) => (liked ? prev - 1 : prev + 1));
    } else {
      toast.error(result.error);
    }
    setIsToggling(false);
  };

  return {
    liked,
    likedCount,
    handleToggleLike,
    isLoadingLike: isLoading,
    isTogglingLike: isToggling,
  };
};
