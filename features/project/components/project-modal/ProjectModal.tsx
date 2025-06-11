"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteProject } from "@/features/project/actions/project.actions";
import { incrementProjectViews } from "@/features/user/actions/interactions.actions";
import { toast } from "sonner";
import { ProjectData } from "@/features/project/lib/project.types";
import { useProjectLike } from "../../hooks/useProjectLike";
import { useProjectComments } from "@/features/project/hooks/useProjectComments";
import Header from "@/features/project/components/project-modal/Header";
import CodeViewer from "@/features/project/components/project-modal/CodeViewer";
import Preview from "./Preview";
import CommentsSection from "@/features/project/components/project-modal/CommentsSection";

interface ProjectModalProps {
  project: ProjectData;
  onClose?: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
  const [open, setOpen] = useState(true);
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
    console.log("DD");
  }, []);

  const handleFullPageView = () => {
    window.location.replace(pathname);
  };

  const handleOpenChange = (openState: boolean) => {
    setOpen(openState);
    if (!openState) {
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    }
  };

  const handleDeleteProject = async () => {
    setIsDeletePending(true);
    const result = await deleteProject({ publicId: project.publicId });
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Project deleted successfully");
      setOpen(false);
      router.back();
    }
    setIsDeletePending(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogDescription className="sr-only">
          A detailed view of the project, showing its code, a live preview, and
          a section for user comments.
        </DialogDescription>
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
      </DialogContent>
    </Dialog>
  );
};
export default ProjectModal;
