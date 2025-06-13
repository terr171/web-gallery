"use client";

import React from "react";

import { ProjectSortByTypes } from "@/features/search/lib/types";
import FilterSelect from "@/features/search/components/FilterSelect";

const sortByOptions = Object.entries(ProjectSortByTypes).map(
  ([key, value]) => ({
    label: key,
    value: value,
  }),
);

const SelectSortBy = () => {
  return (
    <FilterSelect
      paramName="sortBy"
      placeholder="Sort By"
      options={sortByOptions}
      defaultValue="Sort By"
    />
  );
};

export default SelectSortBy;
