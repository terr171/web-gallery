import React from "react";
import ProjectModal from "@/features/project/components/project-modal/ProjectModal";
import { ProjectData } from "@/features/project/lib/project.types";
import { getProjectDataByPublicId } from "@/features/project/queries/project.queries";

const Page = async ({ params }: { params: Promise<{ publicId: string }> }) => {
  const { publicId } = await params;
  const queryProject = await getProjectDataByPublicId({
    publicId: publicId,
    includeFiles: true,
    includeComments: true,
  });
  if (!queryProject.success) {
    return;
  }
  const project: ProjectData = queryProject.response;

  return <ProjectModal project={project} />;
};
export default Page;
