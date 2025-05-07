import React from "react";
import FeaturedSection from "@/features/featured/components/FeaturedSection";
import { getCachedFeaturedProjects } from "@/features/project/actions/project.actions";

const Page = async () => {
  const queryProjects = await getCachedFeaturedProjects();

  const { mostViewed, mostLiked } = queryProjects.success
    ? queryProjects.response
    : { mostViewed: [], mostLiked: [] };

  return (
    <main className="container mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold mx-auto">Featured Projects</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover the most popular and useful code snippets from our community
          and curated by our editors.
        </p>
      </div>
      {/* Featured Section Container */}
      <div className="space-y-10">
        {/* Most Viewed Section */}
        <FeaturedSection
          title="Most Viewed"
          projects={mostViewed}
          description={"Most frequently viewed projects by our community."}
          customClassName="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        />
        {/* Most Liked Section */}
        <FeaturedSection
          title="Most Liked"
          projects={mostLiked}
          customClassName="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        />
      </div>
    </main>
  );
};

export default Page;
