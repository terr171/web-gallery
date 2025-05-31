import React from "react";
import SearchBar from "@/features/search/components/SearchBar";
import SelectProjectType from "@/features/search/components/SelectProjectType";
import InfiniteScrollProjects from "@/features/explore/components/InfiniteScrollProjects";
import SelectSortBy from "@/features/search/components/SelectSortBy";
import { PostTypes } from "@/database/schema";

import SelectOrderBy from "@/features/search/components/SelectOrderBy";
import { OrderByTypes, ProjectSortByTypes } from "@/features/search/lib/types";
import { getProjects } from "@/features/project/queries/project.queries";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    type?: string;
    sortBy?: ProjectSortByTypes;
    orderBy?: OrderByTypes;
  }>;
}) => {
  const params = await searchParams;
  const { query, type, sortBy, orderBy } = params;
  const queryProjects = await getProjects({
    searchText: query,
    type: type as PostTypes,
    sortBy: sortBy,
    order: orderBy,
  });
  const renderContent = () => {
    if (!queryProjects.success) {
      return (
        <div className="max-w-lg p-6 mx-auto bg-red-50 border border-red-200 rounded-md text-red-600 text-center">
          <h2 className="font-semibold text-lg mb-2">
            Error loading projects. Failed to fetch project from servers
          </h2>
          <p>{queryProjects.error}</p>
          <p className="mt-4 text-sm">
            Try refreshing the page or adjusting your search options.
          </p>
        </div>
      );
    }

    return (
      <InfiniteScrollProjects
        initialProjects={queryProjects.response}
        options={{
          searchText: query,
          type: type as PostTypes,
          sortBy: sortBy,
          order: orderBy,
        }}
        customClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      />
    );
  };

  return (
    <div className="container mx-auto px-6 pt-8">
      <h1 className="text-3xl font-bold mb-6">
        {query && `Search result for "${query}"`}
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow min-w-0">
          <SearchBar />
        </div>
        <div className="w-full flex gap-x-4 sm:w-auto">
          <SelectProjectType />
          <SelectSortBy />
          <SelectOrderBy />
        </div>
      </div>

      {renderContent()}
    </div>
  );
};
export default Page;
