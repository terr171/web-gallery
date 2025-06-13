"use client";
import React from "react";
import Image from "next/image";
import { Check, Eye, Heart, UserPlus } from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import InfiniteScrollFollowers from "@/features/user/components/InfiniteScrollFollowers";
import { UserProfile as UserProfileType } from "@/features/user/lib/user.types";
import { useFollow } from "@/features/user/hooks/useFollow";

interface UserProfileProps {
  user: {
    username: string;
    avatarUrl: string | null;
    totalLikes?: number;
    totalViews?: number;
    isFollowing: boolean;
    isSelf: boolean;
  };
  followers: {
    total?: number;
    initialList: UserProfileType[];
  };
}

const UserProfile = ({ user, followers }: UserProfileProps) => {
  const { isFollowing, followerCount, handleFollowToggle, isPending } =
    useFollow({
      username: user.username,
      initialFollowing: user.isFollowing,
      initialFollowersCount: followers.total,
    });
  return (
    <div className="bg-white rounded-2xl shadow-lg px-6 py-8 flex flex-col items-center text-center">
      <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md mb-4">
        <Image
          src={getAvatarUrl(user.avatarUrl)}
          alt={user.username}
          fill
          sizes="auto "
          className="object-cover"
        />
      </div>
      <h1 className="text-2xl font-bold text-blue-600">@{user.username}</h1>
      <div className="flex space-x-8 mt-3">
        <InfiniteScrollFollowers
          username={user.username}
          initialFollowers={followers.initialList}
        >
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
            {user.totalLikes?.toLocaleString()} likes
          </span>
        </div>
        <div className="flex items-center">
          <Eye size={18} className="text-gray-500" />
          <span className="ml-2 font-medium">
            {user.totalViews?.toLocaleString()} views
          </span>
        </div>
      </div>
      {!user.isSelf && (
        <Button
          onClick={handleFollowToggle}
          className={`mt-6 flex items-center px-2 py-2 rounded-full font-medium transition-colors ${
            isFollowing
              ? "bg-gray-200 text-gray-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={isPending}
        >
          {isFollowing ? (
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
