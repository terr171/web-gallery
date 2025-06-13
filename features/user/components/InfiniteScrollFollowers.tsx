"use client";
import React, { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn, getAvatarUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { UserProfile } from "@/features/user/lib/user.types";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const NUMBER_OF_NEW_USERS = 10;

const InfiniteScrollFollowers = ({
  initialFollowers,
  username,
  children,
}: {
  initialFollowers: UserProfile[];
  username: string;
  children: React.ReactNode;
}) => {
  const fetchFollowers = useCallback(
    async (offset: number, limit: number): Promise<UserProfile[]> => {
      const response = await fetch(
        `/api/users/${username}/followers?offset=${offset}&limit=${limit}`,
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData);
      }

      return responseData;
    },
    [username],
  );

  const {
    data: followers,
    loading,
    hasMore,
    loadMoreRef,
  } = useInfiniteScroll({
    initialData: initialFollowers,
    pageSize: NUMBER_OF_NEW_USERS,
    fetchData: fetchFollowers,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Followers</DialogTitle>
          <DialogDescription hidden={true}>Followers</DialogDescription>
        </DialogHeader>
        <Separator />
        {followers.map((follower: UserProfile) => (
          <div key={follower.username} className="flex align-left">
            <Image
              alt="User Avatar"
              src={getAvatarUrl(follower.avatarUrl)}
              width={32}
              height={32}
              className="mr-2"
            />
            <Link href={`/user/${follower.username}`}>{follower.username}</Link>
          </div>
        ))}
        <div className="flex justify-center">
          <div
            ref={loadMoreRef}
            className={cn("h-5 bg-transparent", !hasMore && "hidden")}
          />
          {loading && <p>Loading...</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default InfiniteScrollFollowers;
