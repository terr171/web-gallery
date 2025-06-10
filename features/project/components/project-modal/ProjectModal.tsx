"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { deleteProject } from "@/features/project/actions/project.actions";
import { Button } from "@/components/ui/button";
import { incrementProjectViews } from "@/features/user/actions/interactions.actions";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ProjectData } from "@/features/project/lib/project.types";
import { useProjectLike } from "../../hooks/useProjectLike";
import { useProjectComments } from "@/features/project/hooks/useProjectComments";
import Header from "@/features/project/components/project-modal/Header";
import CodeViewer from "@/features/project/components/project-modal/CodeViewer";
import Preview from "./Preview";

interface ProjectModalProps {
  project: ProjectData;
  onClose?: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
  const [open, setOpen] = useState(true);
  const [isDeletePending, setIsDeletePending] = useState<boolean>(false);
  const router = useRouter();

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
    isDeletePending: IsCommentDeletePending,
    handleSubmitComment,
    handleDeleteComment,
  } = useProjectComments({
    publicId: project.publicId,
    initialComments: project.comments || [],
  });

  useEffect(() => {
    incrementProjectViews({ publicId: project.publicId });
  }, []);

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
          />
          {/* Code and preview section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CodeViewer files={project.files} />
            <Preview files={project.files} />
          </div>

          {/* Comments section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">
              Comments ({comments.length})
            </h3>

            {/* Add comment form */}
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px]"
              />
              <Button
                onClick={handleSubmitComment}
                className="sm:self-end"
                disabled={isCommentSubmitPending}
              >
                Post
              </Button>
            </div>

            {/* Comments list */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 border rounded-md"
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={getAvatarUrl(comment.user.avatarUrl)}
                      alt={comment.user.username}
                    />
                    <AvatarFallback>
                      {comment.user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between gap-1">
                      <div className="font-medium">{comment.user.username}</div>
                      <div className="flex gap-2 flex-row items-center">
                        <div className="text-xs text-gray-500">
                          {comment.createdAt.toLocaleString()}
                        </div>
                        {comment.isOwner && (
                          <Button
                            onClick={() => handleDeleteComment(comment.id)}
                            variant="ghost"
                            size="sm"
                            disabled={IsCommentDeletePending}
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm mt-1 break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ProjectModal;
