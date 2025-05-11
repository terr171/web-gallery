"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserRole } from "@/database/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

const HeaderUser = () => {
  const { data: session } = useSession();

  return (
    <>
      <div className="hidden lg:flex flex-row justify-between items-center w-full">
        {session?.user?.role === UserRole.Admin && (
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={cn(
                navigationMenuTriggerStyle(),
                "font-medium text-sm hover:underline",
              )}
            >
              <Link href="/admin">Admin</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}

        {session?.user?.name ? (
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href={`/user/${session.user.name}`}>
                {session.user.name}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ) : (
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href="/login">Login</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}

        {session?.user?.name && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => signOut({ redirectTo: "/", redirect: true })}
          >
            Logout
          </Button>
        )}
      </div>
      <div className="flex lg:hidden w-full justify-end items-center">
        {session?.user?.name ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-x-1"
              >
                {session.user.name}
                <ChevronDownIcon className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href={`/user/${session.user.name}`}>My Profile</Link>
              </DropdownMenuItem>
              {session?.user?.role === UserRole.Admin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">Admin</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ redirectTo: "/", redirect: true })}
                className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:text-red-400 dark:focus:bg-red-900/50"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </>
  );
};
export default HeaderUser;
