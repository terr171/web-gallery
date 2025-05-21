"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { getAvatarUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { UserProfile } from "@/features/user/lib/user.types";
import { getFollowers } from "@/features/user/queries/user.queries";

const NUMBER_OF_NEW_USERS = 10;

const InfiniteScrollFollowers = ({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) => {
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadUsers = async () => {
    if (!hasMore || loading || error) return;
    setLoading(true);
    const queryFollowers = await fetch(
      `/api/users/${username}/followers?offset=${offset}&limit=${NUMBER_OF_NEW_USERS}`,
    );
    const queryFollowersResult = await queryFollowers.json();
    if (!queryFollowers.ok) {
      toast.error(queryFollowersResult);
      setError(queryFollowersResult);
    } else {
      const newFollowers: UserProfile[] = queryFollowersResult;
      if (newFollowers.length === 0) {
        setHasMore(false);
      } else {
        setFollowers((prevFollowers) => [...prevFollowers, ...newFollowers]);
        setOffset((prevOffset) => prevOffset + NUMBER_OF_NEW_USERS);
      }
    }
    setLoading(false);
  };

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        loadUsers();
      }
    },
    [offset, hasMore, loading],
  );

  useEffect(() => {
    const queryInitialUsers = async () => {
      const queryFollowers = await fetch(
        `/api/users/${username}/followers?offset=${offset}&limit=${NUMBER_OF_NEW_USERS}`,
      );
      const queryFollowersResult = await queryFollowers.json();
      if (!queryFollowers.ok) {
        toast.error(queryFollowersResult);
        setError(queryFollowersResult);
      } else {
        const newFollowers: UserProfile[] = queryFollowersResult;
        if (newFollowers.length === 0) {
          setHasMore(false);
        } else {
          setFollowers((prevFollowers) => [...prevFollowers, ...newFollowers]);
          setOffset((prevOffset) => prevOffset + NUMBER_OF_NEW_USERS);
        }
      }
    };

    queryInitialUsers();
    return () => {};
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "20px",
    });
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    return () => {
      if (loadMoreRef.current) {
        observerRef.current?.disconnect();
      }
    };
  }, [handleObserver]);

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
          <div ref={loadMoreRef} className="h-1px" />
          {loading && <p>Loading...</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default InfiniteScrollFollowers;
