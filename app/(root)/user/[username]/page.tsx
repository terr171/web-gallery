import React from "react";

import { notFound } from "next/navigation";

import UserProfile from "@/features/user/components/UserProfile";
import { auth } from "@/auth";
import InfiniteScrollProjects from "@/features/project/components/InfiniteScrollProjects";
import { getProjects } from "@/features/project/queries/project.queries";
import { checkUserFollow } from "@/features/user/queries/interactions.queries";
import {
  getFollowers,
  getUserData,
} from "@/features/user/queries/user.queries";

const Page = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params;
  const [session, userData, followStatus, projectsData, followersData] =
    await Promise.all([
      auth(),
      getUserData({ username }),
      checkUserFollow({ username }),
      getProjects({ username }),
      getFollowers({ username }),
    ]);

  if (!userData.success) {
    notFound();
  }

  const isFollowing = followStatus.success ? followStatus.response : false;
  const userInfo = userData.response;
  const isSelf = session?.user?.name === username;
  const projects = projectsData.success ? projectsData.response : [];
  const initialFollowers = followersData.success ? followersData.response : [];

  return (
    <div className="container mx-auto px-6 pt-8">
      <div className="flex flex-col items-center mb-10">
        <UserProfile
          {...userInfo}
          isFollowing={isFollowing}
          isSelf={isSelf}
          initialFollowers={initialFollowers}
        />
      </div>

      <InfiniteScrollProjects
        initialProjects={projects}
        options={{ username: username }}
        customClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      />
    </div>
  );
};
export default Page;
