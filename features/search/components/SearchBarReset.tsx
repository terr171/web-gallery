"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const SearchBarReset = ({ onReset }: { onReset: () => void }) => {
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <Button
      type="button"
      onClick={handleReset}
      variant="ghost"
      size="icon"
      className="rounded-full"
      aria-label="Clear search"
    >
      <X className="text-gray-400" />
    </Button>
  );
};
export default SearchBarReset;
