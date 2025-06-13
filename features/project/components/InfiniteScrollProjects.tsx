"use client";
import React, { useCallback } from "react";
import ProjectCard from "@/features/project/components/ProjectCard";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { GetProjectsInput } from "@/features/project/lib/validations";
import { ProjectData } from "@/features/project/lib/project.types";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const NUMBER_OF_NEW_PROJECTS = 9;

const InfiniteScrollProjects = ({
  initialProjects,
  options,
  customClassName,
}: {
  initialProjects: ProjectData[];
  options?: GetProjectsInput;
  customClassName?: string;
}) => {
  const { username, type, order, sortBy, searchText } = options || {};

  const fetchProjects = useCallback(
    async (offset: number, limit: number): Promise<ProjectData[]> => {
      const queryParams = {
        offset,
        limit,
        order,
        sortBy,
        username,
        searchText,
        type,
      };

      const definedParams = Object.entries(queryParams).filter(
        ([_, value]) => value != null && value !== "",
      );
      const params = new URLSearchParams(definedParams as string[][]);
      const response = await fetch(`/api/projects?${params.toString()}`);
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData);
      }

      return responseData;
    },
    [username, type, order, sortBy, searchText],
  );

  const {
    data: projects,
    loading,
    hasMore,
    error,
    loadMoreRef,
  } = useInfiniteScroll({
    initialData: initialProjects,
    pageSize: NUMBER_OF_NEW_PROJECTS,
    fetchData: fetchProjects,
  });

  return (
    <>
      {/* Show Projects */}
      {projects.length > 0 && (
        <div className={cn("pb-6", customClassName)}>
          {projects.map((project: ProjectData) => (
            <ProjectCard key={project.publicId} project={project} />
          ))}
        </div>
      )}
      {/* Loading Indicator */}
      {loading && (
        <p className="text-center flex items-center justify-center gap-2 py-5">
          <Loader2 className="animate-spin" /> Loading...
        </p>
      )}
      {/* Empty Projects Message */}
      {!loading && projects.length === 0 && !error && (
        <div className="text-center py-10 text-gray-500 px-4 ">
          {searchText && searchText.trim() !== "" ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p>
                Your search for &#34;
                <span className="font-medium italic">{searchText}</span>
                &#34; did not match any projects.
              </p>
              <p className="text-sm mt-1">
                Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-2">No Projects Here</h3>
              <p>There are currently no projects to display in this view.</p>
            </div>
          )}
        </div>
      )}

      <div
        ref={loadMoreRef}
        className={cn("h-5 bg-transparent", !hasMore && "hidden")}
      />
    </>
  );
};
export default InfiniteScrollProjects;
