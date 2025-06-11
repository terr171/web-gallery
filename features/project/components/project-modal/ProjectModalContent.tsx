import React from "react";
import { getProjectDataByPublicId } from "@/features/project/queries/project.queries";
import { ProjectData } from "../../lib/project.types";
import ErrorMessage from "@/components/shared/ErrorMessage";
import ProjectModalBody from "@/features/project/components/project-modal/ProjectModalBody";

interface ProjectModalContentProps {
  publicId: string;
}

const ProjectModalContent = async ({ publicId }: ProjectModalContentProps) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const queryProject = await getProjectDataByPublicId({
    publicId: publicId,
    includeFiles: true,
    includeComments: true,
  });

  if (!queryProject.success) {
    return <ErrorMessage message={queryProject.error} />;
  }

  const project: ProjectData = queryProject.response;

  return <ProjectModalBody project={project} />;
};

export default ProjectModalContent;
