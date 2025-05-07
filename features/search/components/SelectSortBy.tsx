"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ProjectSortByTypes,
  PostSortByTypesWithDefault,
} from "@/features/search/lib/types";

const SelectSortBy = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sortByFromUrl = searchParams.get("sortBy") as ProjectSortByTypes | null;
  const [sortBy, setSortBy] = useState<PostSortByTypesWithDefault>(
    sortByFromUrl || "Sort By",
  );

  useEffect(() => {
    const sortParam = searchParams.get("sortBy") as PostSortByTypesWithDefault;
    setSortBy(sortParam || "Sort By");
  }, [searchParams]);

  const handleSortBySelect = (value: PostSortByTypesWithDefault) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "Sort By") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Select
      value={sortBy}
      onValueChange={(value) =>
        handleSortBySelect(value as PostSortByTypesWithDefault)
      }
    >
      <SelectTrigger className="w-auto">
        <SelectValue placeholder="Sort By" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Sort By">Sort By</SelectItem>
        {Object.entries(ProjectSortByTypes).map(([key, value]) => (
          <SelectItem key={value} value={value}>
            {key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectSortBy;
