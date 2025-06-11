"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { deleteProject } from "@/features/project/actions/project.actions";
import { incrementProjectViews } from "@/features/user/actions/interactions.actions";
import { toast } from "sonner";
import { ProjectData } from "@/features/project/lib/project.types";
import { useProjectLike } from "./useProjectLike";
import { useProjectComments } from "@/features/project/components/project-modal/useProjectComments";
import Header from "@/features/project/components/project-modal/Header";
import CodeViewer from "@/features/project/components/project-modal/CodeViewer";
import Preview from "./Preview";
import CommentsSection from "@/features/project/components/project-modal/CommentsSection";

interface ProjectModalBodyProps {
  project: ProjectData;
}

const ProjectModalBody = ({ project }: ProjectModalBodyProps) => {
  const [isDeletePending, setIsDeletePending] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const { liked, likedCount, handleToggleLike, isLoadingLike, isTogglingLike } =
    useProjectLike({
      publicId: project.publicId,
      initialLikesCount: project.likesCount,
    });

  const {
    comments,
    newComment,
    setNewComment,
    isSubmitPending: isCommentSubmitPending,
    isDeletePending: isCommentDeletePending,
    handleSubmitComment,
    handleDeleteComment,
  } = useProjectComments({
    publicId: project.publicId,
    initialComments: project.comments || [],
  });

  useEffect(() => {
    incrementProjectViews({ publicId: project.publicId });
  }, []);

  const handleFullPageView = () => {
    window.location.replace(pathname);
  };

  const handleDeleteProject = async () => {
    setIsDeletePending(true);
    const result = await deleteProject({ publicId: project.publicId });
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Project deleted successfully");
      router.back();
    }
    setIsDeletePending(false);
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        {/* Project header with user info and stats */}
        <Header
          project={project}
          liked={liked}
          likedCount={likedCount}
          commentsCount={comments.length}
          isDeletePending={isDeletePending}
          isLoadingLike={isLoadingLike}
          isTogglingLike={isTogglingLike}
          onToggleLike={handleToggleLike}
          onDeleteProject={handleDeleteProject}
          onFullView={handleFullPageView}
        />

        {/* Code and preview section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CodeViewer files={project.files} />
          <Preview files={project.files} />
        </div>

        {/* Comments section */}
        <CommentsSection
          comments={comments}
          newComment={newComment}
          isCommentSubmitPending={isCommentSubmitPending}
          isCommentDeletePending={isCommentDeletePending}
          onNewCommentChange={setNewComment}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteComment}
        />
      </div>
    </>
  );
};
export default ProjectModalBody;
