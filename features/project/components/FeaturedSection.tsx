import React from "react";
import ProjectCard from "@/features/project/components/ProjectCard";
import { cn } from "@/lib/utils";
import { ProjectData } from "@/features/project/lib/project.types";

const FeaturedSection = ({
  title,
  projects,
  description,
  customClassName,
}: {
  title: string;
  projects: ProjectData[];
  description?: string;
  customClassName?: string;
}) => {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold ">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className={cn("", customClassName)}>
        {projects.map((project: ProjectData) => (
          <ProjectCard key={project.publicId} project={project} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;
