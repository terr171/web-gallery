"use client";
import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import SearchBarReset from "@/features/search/components/SearchBarReset";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const SearchBar = () => {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const initialQueryFromUrl = currentSearchParams.get("query") || "";
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the input
  const [showReset, setShowReset] = React.useState(!!initialQueryFromUrl);

  useEffect(() => {
    const queryFromUrl = currentSearchParams.get("query") || "";
    if (inputRef.current && inputRef.current.value !== queryFromUrl) {
      inputRef.current.value = queryFromUrl;
    }
    setShowReset(!!queryFromUrl);
  }, [currentSearchParams]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchQuery = inputRef.current?.value || "";
    const params = new URLSearchParams(currentSearchParams.toString());

    if (searchQuery) params.set("query", searchQuery);
    else params.delete("query");

    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowReset(!!event.target.value);
  };

  const handleResetQuery = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setShowReset(false);
    router.push("/explore", { scroll: false });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative w-full">
      <Input
        ref={inputRef}
        name="query"
        defaultValue={initialQueryFromUrl}
        className="w-full px-4 py-2 border border-gray-300"
        placeholder="Search Projects"
        onChange={handleInputChange}
      />

      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
        {showReset && <SearchBarReset onReset={handleResetQuery} />}
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Search"
        >
          <SearchIcon className="size-4 text-gray-400" />
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
