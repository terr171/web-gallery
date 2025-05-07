"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

type SearchBarResetProps = {
  formRef: React.RefObject<HTMLFormElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onReset?: () => void;
};

const SearchBarReset = ({
  formRef,
  inputRef,
  onReset,
}: SearchBarResetProps) => {
  const router = useRouter();

  const handleReset = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (onReset) onReset();
    router.push("/explore", { scroll: false });
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
