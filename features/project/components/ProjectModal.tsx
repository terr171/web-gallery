"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Eye, Heart, MessageSquare, Trash2, X } from "lucide-react";
import { deleteProject } from "@/features/project/actions/project.actions";
import { Button } from "@/components/ui/button";
import {
  createComment,
  deleteComment,
  incrementProjectViews,
  likeProject,
  unlikeProject,
} from "@/features/user/actions/interactions.actions";
import { toast } from "sonner";
import { FileTypes } from "@/database/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { CommentData, ProjectData } from "@/features/project/lib/project.types";

interface ProjectModalProps {
  project: ProjectData;
  onClose?: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
  const [open, setOpen] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(project.likesCount);
  const [isPending, setIsPending] = useState(false);
  const [projectComments, setProjectComments] = useState<CommentData[]>(
    project.comments || [],
  );
  const [newComment, setNewComment] = useState("");

  const router = useRouter();

  useEffect(() => {
    const checkLikeStatus = async () => {
      const [queryLiked] = await Promise.all([
        fetch(`/api/projects/${project.publicId}/like-status`),
        incrementProjectViews({ publicId: project.publicId }),
      ]);
      const likedResult = await queryLiked.json();
      setLiked(likedResult);
    };

    checkLikeStatus();
    return () => {};
  }, []);

  const getFileContent = (type: FileTypes) => {
    return project.files.find((file) => file.type === type)?.content || "";
  };
  const getIframeContent = () => {
    const htmlContent = getFileContent(FileTypes.HTML);
    const cssContent = getFileContent(FileTypes.CSS);
    const jsContent = getFileContent(FileTypes.JS);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>
          ${htmlContent}
          <script>${jsContent}</script>
        </body>
      </html>
    `;
  };
  const handleToggleLike = async () => {
    if (!liked) {
      const query = await likeProject({ publicId: project.publicId });
      if (!query.success) toast(query.error);
      else {
        setLiked(true);
        setLikedCount((prev) => prev + 1);
      }
    } else {
      const query = await unlikeProject({ publicId: project.publicId });
      if (!query.success) toast(query.error);
      else {
        setLiked(false);
        setLikedCount((prev) => prev - 1);
      }
    }
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;
    const query = await createComment({
      publicId: project.publicId,
      newComment,
    });

    if (query.success) {
      setProjectComments((prev) => [...prev, query.response]);
      setNewComment("");
    } else {
      toast.error(query.error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const query = await deleteComment({ commentId: commentId });
    setIsPending(true);
    if (query.success) {
      setProjectComments((prev) =>
        prev.filter((comment) => comment.id !== commentId),
      );
    } else {
      toast.error(query.error);
    }
    setIsPending(false);
  };

  const handleDeleteProject = async () => {
    const result = await deleteProject({ publicId: project.publicId });
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Project deleted successfully");
      setOpen(false);
      router.back();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {/* Project header with user info and stats */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={getAvatarUrl(project.user.avatarUrl)}
                  alt={project.user.username}
                />
                <AvatarFallback>
                  {project.user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{project.title}</DialogTitle>
                <div className="text-sm text-gray-500">
                  <Link href={`/user/${project.user.username}`}>
                    by {project.user.username}
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-end ">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar size={16} />
                <span>{project.createdAt.toLocaleString().split(",")[0]}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye size={16} />
                <span>{project.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MessageSquare size={16} />
                <span>{projectComments.length}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleLike}
                  className="flex items-center gap-1"
                >
                  <Heart size={16} className={liked ? "fill-white" : ""} />
                  <span>{likedCount}</span>
                </Button>

                {project.isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isPending}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="z-200">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this project? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProject}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>

          {/* Code and preview section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-2">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="js">JavaScript</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="html"
                  className="border rounded-md min-h-[300px] max-h-[300px] overflow-auto"
                >
                  <pre className="p-4 rounded-md bg-gray-900 text-gray-100 overflow-auto h-full text-sm ">
                    <code>{getFileContent(FileTypes.HTML)}</code>
                  </pre>
                </TabsContent>
                <TabsContent
                  value="css"
                  className="border rounded-md min-h-[300px] max-h-[300px] overflow-auto"
                >
                  <pre className="p-4 rounded-md bg-gray-900 text-gray-100 overflow-auto h-full text-sm">
                    <code>{getFileContent(FileTypes.CSS)}</code>
                  </pre>
                </TabsContent>
                <TabsContent
                  value="js"
                  className="border rounded-md min-h-[300px] max-h-[300px] overflow-auto"
                >
                  <pre className="p-4 rounded-md bg-gray-900 text-gray-100 overflow-auto h-full text-sm">
                    <code>{getFileContent(FileTypes.JS)}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
            <div className="border rounded-md p-1 max-h-[320px] h-full overflow-hidden">
              <div className="text-xs text-gray-500 border-b pb-1 px-2">
                Preview
              </div>
              <iframe
                srcDoc={getIframeContent()}
                title="Code Preview"
                className="w-full h-full "
                sandbox="allow-scripts"
              />
            </div>
          </div>

          {/* Comments section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">
              Comments ({projectComments.length})
            </h3>

            {/* Add comment form */}
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px]"
              />
              <Button onClick={handleSubmitComment} className="sm:self-end">
                Post
              </Button>
            </div>

            {/* Comments list */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {projectComments.map((comment) => (
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
