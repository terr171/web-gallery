import React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DynamicPaginationProps {
  totalEntries: number;
  entriesPerPage: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  disabled: boolean;
}

const DynamicPagination = ({
  totalEntries,
  entriesPerPage,
  currentPage,
  onPageChange,
  disabled,
}: DynamicPaginationProps) => {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const handlePreviousPage = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  let startEntry: number;
  let endEntry: number;

  if (totalEntries === 0) {
    startEntry = 0;
    endEntry = 0;
  } else {
    startEntry = (currentPage - 1) * entriesPerPage + 1;
    endEntry = Math.min(currentPage * entriesPerPage, totalEntries);
  }

  return (
    <>
      <div className="flex items-center w-full flex-col">
        <span className="text-muted-foreground text-sm">
          Showing {startEntry}-{endEntry} of {totalEntries} entries
        </span>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className={
                  currentPage <= 1 || disabled
                    ? "pointer-events-none opacity-50 text-muted-foreground"
                    : ""
                }
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                className={
                  currentPage >= Math.ceil(totalEntries / entriesPerPage) ||
                  disabled
                    ? "pointer-events-none opacity-50 text-muted-foreground"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
};

export default DynamicPagination;
