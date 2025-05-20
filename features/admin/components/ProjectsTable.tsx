"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

import { Button } from "@/components/ui/button";
import { ArrowUpDown, LoaderCircle, RotateCcw, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  OrderByTypes,
  ProjectSortByTypesForAdmin,
} from "@/features/search/lib/types";
import { toast } from "sonner";
import DynamicPagination from "@/features/admin/components/DynamicPagination";
import SelectEntries from "@/features/admin/components/SelectEntries";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { deleteProject } from "@/features/project/actions/project.actions";
import { Input } from "@/components/ui/input";
import { PostTypes, ProjectVisibility } from "@/database/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import ProjectModal from "@/features/project/components/ProjectModal";
import { ProjectData } from "@/features/project/lib/project.types";
import { AdminTableProjectsInfo } from "@/features/admin/lib/admin.types";
import { getProjectDataByPublicId } from "@/features/project/queries/project.queries";
import {
  getProjects,
  getTotalProjects,
} from "@/features/admin/queries/admin.queries";

const sortableColumnHeaders = Object.entries(ProjectSortByTypesForAdmin);
const DEBOUNCE_DELAY = 300;

const DEFAULT_SORT_KEY = ProjectSortByTypesForAdmin.Title;
const DEFAULT_ORDER = OrderByTypes.Ascending;
const DEFAULT_CURRENT_PAGE = 1;
const DEFAULT_ENTRIES_PER_PAGE = 10;
const DEFAULT_SEARCH_TEXT = "";
const DEFAULT_VISIBILITY_FILTER = undefined;
const DEFAULT_TYPE_FILTER = undefined;
const ProjectsTable = () => {
  const [sortKey, setSortKey] =
    useState<ProjectSortByTypesForAdmin>(DEFAULT_SORT_KEY);
  const [searchText, setSearchText] = useState(DEFAULT_SEARCH_TEXT);
  const [visibilityFilter, setVisibilityFilter] = useState<
    ProjectVisibility | undefined
  >(DEFAULT_VISIBILITY_FILTER);
  const [typeFilter, setTypeFilter] = useState<PostTypes | undefined>(
    DEFAULT_TYPE_FILTER,
  );
  const [order, setOrder] = useState<OrderByTypes>(DEFAULT_ORDER);
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [projects, setProjects] = useState<AdminTableProjectsInfo[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(
    DEFAULT_ENTRIES_PER_PAGE,
  );
  const [debouncedSearchText, setDebouncedSearchText] =
    useState(DEFAULT_SEARCH_TEXT);
  const [isPending, startTransition] = useTransition();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [selectedProjectForModal, setSelectedProjectForModal] =
    useState<ProjectData | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

  const handleDeleteProject = async (publicId: string) => {
    const result = await deleteProject({ publicId: publicId });
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Project deleted successfully");
    }
  };

  const changeSort = (key: ProjectSortByTypesForAdmin) => {
    if (sortKey === key) {
      setOrder(
        order === OrderByTypes.Ascending
          ? OrderByTypes.Descending
          : OrderByTypes.Ascending,
      );
    } else {
      setSortKey(key);
      setOrder(OrderByTypes.Ascending);
      setCurrentPage(1);
    }
  };

  const handleTypeBadgeClick = (type: PostTypes) => {
    startTransition(() => {
      setTypeFilter((currentFilter) =>
        currentFilter === type ? undefined : type,
      );
      setCurrentPage(DEFAULT_CURRENT_PAGE);
    });
  };

  const handleVisibilityBadgeClick = (visibility: ProjectVisibility) => {
    startTransition(() => {
      setVisibilityFilter((currentFilter) =>
        currentFilter === visibility ? undefined : visibility,
      );
      setCurrentPage(DEFAULT_CURRENT_PAGE);
    });
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchText(searchText);
      if (debouncedSearchText !== searchText) {
        setCurrentPage(1);
      }
    }, DEBOUNCE_DELAY);
    return () => {
      clearTimeout(timerId);
    };
  }, [searchText, debouncedSearchText]);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    const fetchProjects = async () => {
      try {
        startTransition(async () => {
          const [getProjectsResult, getTotalProjectsResult] = await Promise.all(
            [
              getProjects({
                sortBy: sortKey,
                order: order,
                offset: (currentPage - 1) * entriesPerPage,
                limit: entriesPerPage,
                searchText: debouncedSearchText,
                visibility: visibilityFilter,
                type: typeFilter,
              }),
              getTotalProjects({
                searchText: debouncedSearchText,
                visibility: visibilityFilter,
                type: typeFilter,
              }),
            ],
          );

          if (signal.aborted) {
            return;
          }

          if (getProjectsResult.success) {
            setProjects(getProjectsResult.response);
          } else {
            toast.error(getProjectsResult.error);
            setProjects([]);
          }

          if (getTotalProjectsResult.success) {
            setTotalProjects(getTotalProjectsResult.response);

            const maxPage = Math.max(
              1,
              Math.ceil(getTotalProjectsResult.response / entriesPerPage),
            );
            if (currentPage > maxPage) {
              setCurrentPage(maxPage);
            }
          } else {
            toast.error(getTotalProjectsResult.error);
            setTotalProjects(0);
          }
        });
      } catch {
        toast.error("An unexpected error occurred while fetching data.");
        setProjects([]);
        setTotalProjects(0);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    };

    fetchProjects();
    return () => {
      controller.abort();
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    };
  }, [
    sortKey,
    order,
    currentPage,
    entriesPerPage,
    debouncedSearchText,
    startTransition,
    visibilityFilter,
    typeFilter,
  ]);
  const handleEntriesChange = (newEntries: number) => {
    startTransition(() => {
      setEntriesPerPage(newEntries);
      setCurrentPage(DEFAULT_CURRENT_PAGE);
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleReset = () => {
    startTransition(() => {
      setSearchText(DEFAULT_SEARCH_TEXT);
      setDebouncedSearchText(DEFAULT_SEARCH_TEXT);
      setSortKey(DEFAULT_SORT_KEY);
      setOrder(DEFAULT_ORDER);
      setEntriesPerPage(DEFAULT_ENTRIES_PER_PAGE);
      setCurrentPage(DEFAULT_CURRENT_PAGE);
      setVisibilityFilter(undefined);
      setTypeFilter(undefined);
    });
  };

  const handleProjectView = async (publicId: string) => {
    setLoadingProjectId(publicId);
    setSelectedProjectForModal(null);
    try {
      const url = `/api/project/${publicId}?includeFiles=true&includeComments=true`;
      const response = await fetch(url);
      if (!response.ok) {
        toast.error("Unknown Error Occurred");
        setSelectedProjectForModal(null);
      } else {
        const projectData: ProjectData = await response.json();
        setSelectedProjectForModal(projectData);
      }
    } catch (error) {
      console.error("Failed to fetch project data:", error);
      toast.error(
        "An unexpected error occurred while fetching project details.",
      );
      setSelectedProjectForModal(null);
    } finally {
      setLoadingProjectId(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedProjectForModal(null);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-md:py-4 max-md:px-2">
        <div className="flex flex-row space-x-2 items-center pb-4 py-2 pl-2">
          <span className="text-muted-foreground text-sm">Show</span>
          <SelectEntries
            entries={entriesPerPage}
            onEntriesChange={handleEntriesChange}
          />
          <span className="text-muted-foreground text-sm">entries</span>
        </div>
        <div className="flex items-center gap-2 flex-col">
          <div className="flex flex-row gap-2">
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search projects..."
              className="md:w-64"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    aria-label="Reset filters"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset Search Filters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            {(visibilityFilter || typeFilter) && (
              <div className="flex items-center gap-2 px-2 pb-2">
                <span className="text-sm text-muted-foreground">
                  Active Filter:
                </span>
                {visibilityFilter && (
                  <Badge
                    variant={
                      visibilityFilter === ProjectVisibility.Public
                        ? "default"
                        : "secondary"
                    }
                  >
                    {visibilityFilter}
                    <button
                      onClick={() =>
                        handleVisibilityBadgeClick(visibilityFilter)
                      }
                      className="ml-1.5 p-0.5 rounded-full hover:bg-background/50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {typeFilter && (
                  <Badge variant="outline">
                    {typeFilter}
                    <button
                      onClick={() => handleTypeBadgeClick(typeFilter)}
                      className="ml-1.5 p-0.5 rounded-full hover:bg-background/50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border shadow-sm rounded-lg w-full overflow-x-auto mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              {sortableColumnHeaders.map(([key, value]) => (
                <TableHead key={value} className="">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      changeSort(value);
                      setCurrentPage(1);
                    }}
                  >
                    {key}
                    <ArrowUpDown className="text-muted-foreground/70" />
                  </Button>
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  <HoverCard>
                    <HoverCardTrigger>{project.title}</HoverCardTrigger>
                    <HoverCardContent className="text-sm text-muted-foreground">
                      {project.id}
                    </HoverCardContent>
                  </HoverCard>
                </TableCell>
                <TableCell>
                  <HoverCard>
                    <HoverCardTrigger>{project.username}</HoverCardTrigger>
                    <HoverCardContent className="text-sm text-muted-foreground">
                      {project.userId}
                    </HoverCardContent>
                  </HoverCard>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      project.visibility === ProjectVisibility.Public
                        ? "default"
                        : "secondary"
                    }
                    className="cursor-pointer hover:opacity-80"
                    onClick={() =>
                      handleVisibilityBadgeClick(project.visibility)
                    }
                  >
                    {project.visibility}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className="cursor-pointer hover:opacity-80"
                    variant="outline"
                    onClick={() => handleTypeBadgeClick(project.type)}
                  >
                    {project.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDate(project.updatedAt.toString())}
                </TableCell>
                <TableCell>
                  {formatDate(project.createdAt.toString())}
                </TableCell>
                <TableCell>{project.views}</TableCell>
                <TableCell>{project.commentsCount}</TableCell>
                <TableCell>{project.likesCount}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      disabled={loadingProjectId === project.publicId}
                      onClick={() => handleProjectView(project.publicId)}
                      className="min-w-[70px] flex justify-center items-center"
                    >
                      {loadingProjectId === project.publicId ? (
                        <>
                          <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
                          Loading
                        </>
                      ) : (
                        "View"
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this project and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteProject(project.publicId)
                            }
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalProjects === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            No projects found.
          </div>
        )}
      </div>
      <DynamicPagination
        totalEntries={totalProjects}
        entriesPerPage={entriesPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        disabled={isPending}
      />
      {selectedProjectForModal && (
        <ProjectModal
          project={selectedProjectForModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
export default ProjectsTable;
