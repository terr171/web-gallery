import React from "react";
import Link from "next/link";
import { Eye, Heart, MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectData } from "@/features/project/lib/project.types";
import { generateIframeContent } from "@/features/project/lib/utils";

const ProjectCard = ({ project }: { project: ProjectData }) => {
  const {
    user: { username },
    publicId,
    title,
    type,
    views,
    likesCount,
    commentsCount,
    createdAt,
  } = project;

  const iframeContent = generateIframeContent(project.files);

  return (
    <Link href={`/user/${username}/${publicId}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-md">
        <CardContent className="relative h-48 w-full overflow-hidden">
          <iframe
            srcDoc={iframeContent}
            title={`${title} preview`}
            className="h-full w-full bg-white rounded-lg"
            sandbox="allow-scripts"
            style={{ pointerEvents: "none" }}
            scrolling="no"
            loading="lazy"
          />
          <Badge className="absolute right-2 top-0" variant="secondary">
            {type}
          </Badge>
        </CardContent>

        <CardHeader className="flex-1 ">
          <CardTitle className="line-clamp-1 text-lg group-hover:text-blue-600 transition-colors duration-200">
            {title}
          </CardTitle>
          <CardDescription className="text-xs">by {username}</CardDescription>
        </CardHeader>

        <CardFooter className="flex items-center justify-between border-t text-sm text-muted-foreground">
          <div className="flex space-x-4">
            <div className="flex items-center" title={`${likesCount} likes`}>
              <Heart size={14} className="mr-1 text-red-500" />
              <span>{likesCount}</span>
            </div>
            <div
              className="flex items-center"
              title={`${commentsCount} comments`}
            >
              <MessageSquare size={14} className="mr-1" />
              <span>{commentsCount}</span>
            </div>
            <div className="flex items-center" title={`${views} views`}>
              <Eye size={14} className="mr-1" />
              <span>{views}</span>
            </div>
          </div>
          <div className="text-xs">
            {new Date(createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectCard;
