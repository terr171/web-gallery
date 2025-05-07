"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getAvatarUrl } from "@/lib/utils";
import { ArrowUpDown, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderByTypes, UserSortByTypes } from "@/features/search/lib/types";
import DynamicPagination from "@/features/admin/components/DynamicPagination";
import {
  AdminTableUserInfo,
  getTotalUsers,
  getUsers,
} from "@/features/admin/actions/admin.actions";
import { toast } from "sonner";
import SelectEntries from "@/features/admin/components/SelectEntries";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/database/schema";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const sortableColumnHeaders = Object.entries(UserSortByTypes);
const DEBOUNCE_DELAY = 500;

const DEFAULT_SORT_KEY = UserSortByTypes.Username;
const DEFAULT_ORDER = OrderByTypes.Ascending;
const DEFAULT_CURRENT_PAGE = 1;
const DEFAULT_ENTRIES_PER_PAGE = 10;
const DEFAULT_SEARCH_TEXT = "";

const UsersTable = () => {
  const [sortKey, setSortKey] = useState<UserSortByTypes>(DEFAULT_SORT_KEY);
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined);
  const [searchText, setSearchText] = useState(DEFAULT_SEARCH_TEXT);
  const [order, setOrder] = useState<OrderByTypes>(DEFAULT_ORDER);
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [users, setUsers] = useState<AdminTableUserInfo[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(
    DEFAULT_ENTRIES_PER_PAGE,
  );
  const [debouncedSearchText, setDebouncedSearchText] =
    useState(DEFAULT_SEARCH_TEXT);
  const [isPending, startTransition] = useTransition();
  const abortControllerRef = useRef<AbortController | null>(null);

  const changeSort = (key: UserSortByTypes) => {
    if (sortKey === key) {
      setOrder(
        order === OrderByTypes.Ascending
          ? OrderByTypes.Descending
          : OrderByTypes.Ascending,
      );
    } else {
      setSortKey(key);
      setOrder(OrderByTypes.Ascending);
      setCurrentPage(1);
    }
  };

  const handleRoleBadgeClick = (role: UserRole) => {
    startTransition(() => {
      setRoleFilter((currentFilter) =>
        currentFilter === role ? undefined : role,
      );
      setCurrentPage(DEFAULT_CURRENT_PAGE);
    });
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchText(searchText);
      if (debouncedSearchText !== searchText) {
        setCurrentPage(1);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchText]);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    const fetchUsers = async () => {
      try {
        startTransition(async () => {
          const [getUsersResult, getTotalUsersResult] = await Promise.all([
            getUsers({
              sortBy: sortKey,
              order: order,
              offset: (currentPage - 1) * entriesPerPage,
              limit: entriesPerPage,
              searchText: debouncedSearchText,
              role: roleFilter,
            }),
            getTotalUsers({
              searchText: debouncedSearchText,
              role: roleFilter,
            }),
          ]);
          if (signal.aborted) {
            return;
          }
          if (getUsersResult.success) {
            setUsers(getUsersResult.response);
          } else {
            toast.error(getUsersResult.error);
            setUsers([]);
          }

          if (getTotalUsersResult.success) {
            setTotalUsers(getTotalUsersResult.response);

            const maxPage = Math.max(
              1,
              Math.ceil(getTotalUsersResult.response / entriesPerPage),
            );
            if (currentPage > maxPage) {
              setCurrentPage(maxPage);
            }
          } else {
            toast.error(getTotalUsersResult.error);
            setTotalUsers(0);
          }
        });
      } catch {
        toast.error("An unexpected error occurred while fetching data.");
        setUsers([]);
        setTotalUsers(0);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    };

    fetchUsers();

    return () => {
      controller.abort();
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    };
  }, [
    sortKey,
    order,
    currentPage,
    entriesPerPage,
    debouncedSearchText,
    startTransition,
    roleFilter,
  ]);

  const handleEntriesChange = (newEntries: number) => {
    startTransition(() => {
      setEntriesPerPage(newEntries);
      setCurrentPage(DEFAULT_CURRENT_PAGE);
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleReset = () => {
    startTransition(() => {
      setSearchText(DEFAULT_SEARCH_TEXT);
      setDebouncedSearchText(DEFAULT_SEARCH_TEXT);
      setSortKey(DEFAULT_SORT_KEY);
      setOrder(DEFAULT_ORDER);
      setEntriesPerPage(DEFAULT_ENTRIES_PER_PAGE);
      setCurrentPage(DEFAULT_CURRENT_PAGE);
      setRoleFilter(undefined);
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-md:py-4 max-md:px-2">
        <div className="flex flex-row space-x-2 items-center pb-4 py-2 pl-2">
          <span className="text-muted-foreground text-sm">Show</span>
          <SelectEntries
            entries={entriesPerPage}
            onEntriesChange={handleEntriesChange}
          />
          <span className="text-muted-foreground text-sm">entries</span>
        </div>
        <div className="flex items-center gap-2 flex-col">
          <div className="flex flex-row gap-2">
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search users..."
              className="md:w-64"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    aria-label="Reset filters"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset Search Filters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {roleFilter && (
            <div className="flex items-center gap-2 px-2 pb-2">
              <span className="text-sm text-muted-foreground">
                Active Filter:
              </span>
              <Badge
                variant={
                  roleFilter === UserRole.Admin ? "destructive" : "secondary"
                }
              >
                {roleFilter}
                <button
                  onClick={() => handleRoleBadgeClick(roleFilter)}
                  className="ml-1.5 p-0.5 rounded-full hover:bg-background/50"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className=" border shadow-sm rounded-lg w-full overflow-x-auto mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[80px] sm:w-[100px]">
                Avatar
              </TableHead>
              {sortableColumnHeaders.map(([key, value]) => (
                <TableHead key={value} className="min-w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      changeSort(value);
                    }}
                    disabled={isPending}
                  >
                    {key}
                    <ArrowUpDown className="text-muted-foreground/70" />
                  </Button>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={getAvatarUrl(user.avatarUrl)}
                      alt={`${user.username}'s avatar`}
                    />
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <HoverCard>
                    <HoverCardTrigger>{user.username}</HoverCardTrigger>
                    <HoverCardContent className="text-sm text-muted-foreground">
                      {user.id}
                    </HoverCardContent>
                  </HoverCard>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{formatDate(user.createdAt.toString())}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.role === UserRole.Admin ? "destructive" : "secondary"
                    }
                    className="cursor-pointer hover:opacity-80"
                    onClick={() => handleRoleBadgeClick(user.role)}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" asChild>
                    <Link href={`/user/${user.username}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {isPending && (
              <TableRow>
                <TableCell
                  colSpan={sortableColumnHeaders.length + 2}
                  className="h-24 text-center"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            )}
            {!isPending && users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={sortableColumnHeaders.length + 2}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DynamicPagination
        totalEntries={totalUsers}
        entriesPerPage={entriesPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        disabled={isPending}
      />
    </>
  );
};
export default UsersTable;
