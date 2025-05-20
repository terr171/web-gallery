"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ProjectCard from "@/features/project/components/ProjectCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { GetProjectsInput } from "@/features/project/lib/validations";
import { ProjectData } from "@/features/project/lib/project.types";
import { getProjects } from "@/features/project/queries/project.queries";

const InfiniteScrollProjects = ({
  initialProjects,
  options,
  customClassName,
}: {
  initialProjects: ProjectData[];
  options?: GetProjectsInput;
  customClassName?: string;
}) => {
  const NUMBER_OF_NEW_PROJECTS = 9;
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [offset, setOffset] = useState(initialProjects.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialProjects.length === NUMBER_OF_NEW_PROJECTS,
  );
  const [error, setError] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const optionsString = JSON.stringify(options);

  useEffect(() => {
    setProjects(initialProjects);
    setOffset(offset + NUMBER_OF_NEW_PROJECTS);
    setHasMore(true);
  }, [initialProjects, optionsString]);

  const loadProjects = useCallback(async () => {
    if (error) {
      toast.error(error);
      return;
    }
    if (!hasMore || loading) return;

    setLoading(true);
    const queryProjects = await getProjects({ offset: offset, ...options });
    if (!queryProjects.success) {
      toast.error(queryProjects.error);
      setError(queryProjects.error);
      setHasMore(false);
    } else {
      const newProjects: ProjectData[] = queryProjects.response;
      if (newProjects.length === 0) {
        setHasMore(false);
      } else {
        setProjects((prevProjects) => [...prevProjects, ...newProjects]);
        setOffset((prevOffset) => prevOffset + newProjects.length);
        setHasMore(newProjects.length === NUMBER_OF_NEW_PROJECTS);
      }
    }
    setLoading(false);
  }, [hasMore, loading, error, offset, optionsString, NUMBER_OF_NEW_PROJECTS]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        loadProjects();
      }
    },
    [loadProjects, hasMore, loading],
  );

  useEffect(() => {
    setProjects(initialProjects);
    setOffset(initialProjects.length);
    setHasMore(initialProjects.length === NUMBER_OF_NEW_PROJECTS);
    setError("");
    setLoading(false);
  }, [optionsString, initialProjects, NUMBER_OF_NEW_PROJECTS]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "20px",
    });
    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }
    return () => {
      if (currentLoadMoreRef) {
        observerRef.current?.unobserve(currentLoadMoreRef);
      }
      observerRef.current?.disconnect();
    };
  }, [handleObserver]);

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
          {options?.searchText && options.searchText.trim() !== "" ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p>
                Your search for &#34;
                <span className="font-medium italic">{options.searchText}</span>
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
