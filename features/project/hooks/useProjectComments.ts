import React, { useState } from "react";
import {
  createComment,
  deleteComment,
} from "@/features/user/actions/interactions.actions";
import { toast } from "sonner";
import { CommentData } from "../lib/project.types";

export const useProjectComments = ({
  publicId,
  initialComments,
}: {
  publicId: string;
  initialComments: CommentData[];
}) => {
  const [comments, setComments] = useState<CommentData[]>(
    initialComments || [],
  );
  const [newComment, setNewComment] = useState("");
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitPending) return;

    setIsSubmitPending(true);
    const result = await createComment({
      publicId: publicId,
      newComment,
    });

    if (result.success) {
      setComments((prev) => [...prev, result.response]);
      setNewComment("");
    } else {
      toast.error(result.error);
    }
    setIsSubmitPending(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    setIsDeletePending(true);

    const result = await deleteComment({ commentId: commentId });

    if (result.success) {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } else {
      toast.error(result.error);
    }

    setIsDeletePending(false);
  };

  return {
    comments,
    newComment,
    setNewComment,
    isSubmitPending,
    isDeletePending,
    handleSubmitComment,
    handleDeleteComment,
  };
};
