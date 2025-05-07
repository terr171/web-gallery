"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Check, Eye, Heart, UserPlus } from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  followUser,
  unfollowUser,
} from "@/features/user/actions/interactions.actions";
import { toast } from "sonner";
import InfiniteScrollFollowers from "@/features/user/components/InfiniteScrollFollowers";
import { useRouter } from "next/navigation";

interface Props {
  username: string;
  avatarUrl: string | null;
  totalLikes?: number;
  totalFollows?: number;
  totalViews?: number;
  isFollowing: boolean;
  isSelf: boolean;
}

const UserProfile = ({
  username,
  avatarUrl,
  totalLikes = 0,
  totalFollows = 0,
  totalViews = 0,
  isFollowing,
  isSelf,
}: Props) => {
  const [following, setFollowing] = useState<boolean>(isFollowing);
  const [followerCount, setFollowerCount] = useState<number>(totalFollows);
  const router = useRouter();
  const profileImage = getAvatarUrl(avatarUrl);
  const handleFollow = async () => {
    const toggleFollow = following
      ? await unfollowUser({ username })
      : await followUser({ username });
    if (toggleFollow.success) {
      setFollowerCount((prevCount) =>
        following ? prevCount - 1 : prevCount + 1,
      );
      setFollowing(!following);
    } else {
      toast.error(toggleFollow.error);
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg px-6 py-8 flex flex-col items-center text-center">
      <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md mb-4">
        <Image
          src={profileImage}
          alt={username}
          fill
          sizes="auto "
          className="object-cover"
        />
      </div>
      <h1 className="text-2xl font-bold text-blue-600">@{username}</h1>
      <div className="flex space-x-8 mt-3">
        <InfiniteScrollFollowers username={username}>
          <div className="flex items-center cursor-pointer">
            <Heart size={18} className="text-red-500" />
            <span className="ml-2 font-medium">
              {followerCount.toLocaleString()} followers
            </span>
          </div>
        </InfiniteScrollFollowers>

        <div className="flex items-center">
          <Heart size={18} className="text-red-500" />
          <span className="ml-2 font-medium">
            {totalLikes?.toLocaleString()} likes
          </span>
        </div>
        <div className="flex items-center">
          <Eye size={18} className="text-gray-500" />
          <span className="ml-2 font-medium">
            {totalViews?.toLocaleString()} views
          </span>
        </div>
      </div>
      {!isSelf && (
        <Button
          onClick={handleFollow}
          className={`mt-6 flex items-center px-2 py-2 rounded-full font-medium transition-colors ${
            following
              ? "bg-gray-200 text-gray-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {following ? (
            <>
              <Check size={18} className="mr-2" />
              Following
            </>
          ) : (
            <>
              <UserPlus size={18} className="mr-2" />
              Follow
            </>
          )}
        </Button>
      )}
    </div>
  );
};
export default UserProfile;
