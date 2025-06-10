import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { X } from "lucide-react";
import { CommentData } from "../../lib/project.types";

interface CommentsSectionProps {
  comments: CommentData[];
  newComment: string;
  isCommentSubmitPending: boolean;
  isCommentDeletePending: boolean;
  onNewCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  onDeleteComment: (commentId: string) => void;
}

const CommentsSection = ({
  comments,
  newComment,
  isCommentSubmitPending,
  isCommentDeletePending,
  onNewCommentChange,
  onSubmitComment,
  onDeleteComment,
}: CommentsSectionProps) => {
  return (
    <div className="pt-4">
      <h3 className="text-lg font-medium mb-4">Comments ({comments.length})</h3>

      {/* Add comment form */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => onNewCommentChange(e.target.value)}
          className="min-h-[60px]"
        />
        <Button
          onClick={onSubmitComment}
          className="sm:self-end"
          disabled={isCommentSubmitPending}
        >
          Post
        </Button>
      </div>

      {/* Comments list */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 p-3 border rounded-md">
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
                      onClick={() => onDeleteComment(comment.id)}
                      variant="ghost"
                      size="sm"
                      disabled={isCommentDeletePending}
                    >
                      <X />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm mt-1 break-words">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CommentsSection;
