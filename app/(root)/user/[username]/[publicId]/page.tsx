import React from "react";

import ProjectEditor from "@/features/project/components/project-editor/ProjectEditor";
import { incrementProjectViews } from "@/features/user/actions/interactions.actions";
import ErrorMessage from "@/components/shared/ErrorMessage";
import { getProjectDataByPublicId } from "@/features/project/queries/project.queries";

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
  return <ProjectEditor project={project} isOwner={project.isOwner} />;
};

export default Page;
