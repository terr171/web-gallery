import ProjectModal from "@/features/project/components/ProjectModal";
import {
  getProjectDataByPublicId,
  ProjectData,
} from "@/features/project/actions/project.actions";
import ErrorMessage from "@/components/shared/ErrorMessage";

const Page = async ({ params }: { params: Promise<{ publicId: string }> }) => {
  const { publicId } = await params;
  const queryProject = await getProjectDataByPublicId({
    publicId: publicId,
    includeFiles: true,
    includeComments: true,
  });
  if (!queryProject.success) {
    return <ErrorMessage message={queryProject.error} />;
  }
  const project: ProjectData = queryProject.response;

  return <ProjectModal project={project} />;
};
export default Page;
