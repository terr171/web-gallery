"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OrderByTypes,
  OrderByTypesWithDefault,
} from "@/features/search/lib/types";

const SelectOrderBy = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderByFromUrl = searchParams.get("orderBy") as OrderByTypes | null;
  const [orderBy, setOrderBy] = useState<OrderByTypesWithDefault>(
    orderByFromUrl || "Order By",
  );
  useEffect(() => {
    const orderParam = searchParams.get("orderBy") as OrderByTypesWithDefault;
    setOrderBy(orderParam || "Order By");
  }, [searchParams]);

  const handleOrderBySelect = (value: OrderByTypesWithDefault) => {
    setOrderBy(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "Order By") {
      params.delete("orderBy");
    } else {
      params.set("orderBy", value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Select
      value={orderBy}
      onValueChange={(value) =>
        handleOrderBySelect(value as OrderByTypesWithDefault)
      }
    >
      <SelectTrigger className="w-auto">
        <SelectValue placeholder="Order By" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Order By">Order By</SelectItem>
        {Object.values(OrderByTypes).map((type: OrderByTypes) => (
          <SelectItem key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
export default SelectOrderBy;
