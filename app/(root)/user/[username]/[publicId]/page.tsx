import React from "react";

import CreateProject from "@/features/project/components/CreateProject";
import { getProjectDataByPublicId } from "@/features/project/actions/project.actions";
import { incrementProjectViews } from "@/features/user/actions/interactions.actions";
import ErrorMessage from "@/components/shared/ErrorMessage";

const Page = async ({
  params,
}: {
  params: Promise<{ username: string; publicId: string }>;
}) => {
  const { publicId } = await params;
  incrementProjectViews({ publicId: publicId });
  const result = await getProjectDataByPublicId({
    publicId: publicId,
    includeFiles: true,
    includeComments: false,
  });
  if (!result.success) {
    return <ErrorMessage message={result.error} />;
  }
  const project = result.response;
  return <CreateProject project={project} isOwner={project.isOwner} />;
};

export default Page;
