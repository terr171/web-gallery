import { Suspense } from "react";
import ProjectModalSkeleton from "@/features/project/components/project-modal/ProjectModalSkeleton";
import ProjectModalContainer from "@/features/project/components/project-modal/ProjectModalContainer";
import ProjectModalContent from "@/features/project/components/project-modal/ProjectModalContent";

const Page = async ({ params }: { params: Promise<{ publicId: string }> }) => {
  const { publicId } = await params;
  return (
    <ProjectModalContainer>
      <Suspense fallback={<ProjectModalSkeleton />}>
        <ProjectModalContent publicId={publicId} />
      </Suspense>
    </ProjectModalContainer>
  );
};
export default Page;
