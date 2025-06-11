import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProjectModalSkeleton = () => {
  return (
    <div className="flex flex-col space-y-4">
      {/* Project header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-end">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-8" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Code and preview section skeleton */}
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
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </TabsContent>
            <TabsContent
              value="css"
              className="border rounded-md min-h-[300px] max-h-[300px] overflow-auto"
            >
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </TabsContent>
            <TabsContent
              value="js"
              className="border rounded-md min-h-[300px] max-h-[300px] overflow-auto"
            >
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="border rounded-md p-1 max-h-[320px] h-full overflow-hidden">
          <div className="text-xs text-gray-500 border-b pb-1 px-2">
            Preview
          </div>
          <div className="w-full h-full p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>

      {/* Comments section skeleton */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-8" />
        </div>

        {/* Add comment form skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <Skeleton className="min-h-[60px] flex-1" />
          <Skeleton className="h-10 w-16 sm:self-end" />
        </div>

        {/* Comments list skeleton */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-3 p-3 border rounded-md">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap justify-between gap-1 mb-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-2 items-center">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProjectModalSkeleton;
