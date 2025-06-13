"use client";
import React from "react";

import { PostTypes } from "@/database/schema";
import FilterSelect from "@/features/search/components/FilterSelect";

const projectTypeOptions = Object.values(PostTypes).map((type) => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}));

const SelectProjectType = () => {
  return (
    <FilterSelect
      paramName="type"
      placeholder="All"
      options={projectTypeOptions}
      defaultValue="all"
    />
  );
};
export default SelectProjectType;
