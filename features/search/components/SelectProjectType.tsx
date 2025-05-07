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
import { PostTypes } from "@/database/schema";

type PostTypesWithAll = PostTypes | "all";

const SelectProjectType = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeFromUrl = searchParams.get("type") as PostTypesWithAll | null;
  const [projectType, setProjectType] = useState<PostTypesWithAll>(
    typeFromUrl || "all",
  );

  useEffect(() => {
    const typeParam = searchParams.get("type") as PostTypesWithAll | null;
    setProjectType(typeParam || "all");
  }, [searchParams]);

  const handleTypeSelect = (value: PostTypesWithAll) => {
    setProjectType(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Select
      value={projectType}
      onValueChange={(value) => handleTypeSelect(value as PostTypesWithAll)}
    >
      <SelectTrigger className="w-auto">
        <SelectValue placeholder="Select Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {Object.values(PostTypes).map((type: PostTypes) => (
          <SelectItem key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
export default SelectProjectType;
