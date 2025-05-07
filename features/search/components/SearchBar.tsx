"use client";
import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import SearchBarReset from "@/features/search/components/SearchBarReset";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type SearchBarProps = {
  query?: string;
  type?: string;
  sortBy?: string;
  orderBy?: string;
};

const SearchBar = ({
  query: initialQuery,
  type,
  sortBy,
  orderBy,
}: SearchBarProps) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the input

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentQuery = inputRef.current?.value || "";
    const params = new URLSearchParams();

    if (currentQuery) params.set("query", currentQuery);
    if (type) params.set("type", type);
    if (sortBy) params.set("sortBy", sortBy);
    if (orderBy) params.set("orderBy", orderBy);

    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  const [showReset, setShowReset] = React.useState(!!initialQuery);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowReset(!!event.target.value);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative w-full">
      <Input
        ref={inputRef}
        name="query"
        defaultValue={initialQuery}
        className="w-full px-4 py-2 border border-gray-300"
        placeholder="Search Projects"
        onChange={handleInputChange}
      />
      {type && <input type="hidden" name="type" value={type} />}
      {sortBy && <input type="hidden" name="sortBy" value={sortBy} />}
      {orderBy && <input type="hidden" name="orderBy" value={orderBy} />}

      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
        {showReset && (
          <SearchBarReset
            formRef={formRef}
            inputRef={inputRef}
            onReset={() => setShowReset(false)}
          />
        )}
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
