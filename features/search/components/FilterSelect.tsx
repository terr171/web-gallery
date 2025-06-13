"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUrlState } from "@/features/search/hooks/useUrlState";

type Option = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  paramName: string;
  placeholder: string;
  options: Option[];
  defaultValue?: string;
};

const FilterSelect = ({
  paramName,
  placeholder,
  options,
  defaultValue = "",
}: FilterSelectProps) => {
  const [value, setValue] = useUrlState(paramName, defaultValue);

  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="w-auto">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {defaultValue && (
          <SelectItem value={defaultValue}>{placeholder}</SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FilterSelect;
