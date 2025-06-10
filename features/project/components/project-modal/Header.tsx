import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { Calendar, Eye, Heart, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ProjectData } from "../../lib/project.types";

interface ProjectModalHeaderProps {
  project: ProjectData;
  liked: boolean;
  likedCount: number;
  commentsCount: number;
  isDeletePending: boolean;
  isLoadingLike: boolean;
  isTogglingLike: boolean;
  onToggleLike: () => void;
  onDeleteProject: () => void;
}

const Header = ({
  project,
  liked,
  likedCount,
  commentsCount,
  isDeletePending,
  isLoadingLike,
  isTogglingLike,
  onToggleLike,
  onDeleteProject,
}: ProjectModalHeaderProps) => {
  return (
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
          <span>{commentsCount}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant={liked ? "default" : "outline"}
            size="sm"
            onClick={onToggleLike}
            className="flex items-center gap-1"
            disabled={isLoadingLike || isTogglingLike}
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
                  disabled={isDeletePending}
                >
                  <Trash2 size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="z-200">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this project? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteProject}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;
