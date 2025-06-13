"use client";
import React from "react";

import { OrderByTypes } from "@/features/search/lib/types";
import FilterSelect from "@/features/search/components/FilterSelect";

const orderByOptions = Object.values(OrderByTypes).map((type) => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}));

const SelectOrderBy = () => {
  return (
    <FilterSelect
      paramName="orderBy"
      placeholder="Order By"
      options={orderByOptions}
      defaultValue="Order By"
    />
  );
};
export default SelectOrderBy;
