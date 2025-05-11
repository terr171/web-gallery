import React from "react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/database/schema";

const Header = async () => {
  const session = await auth();
  return (
    <header className="fixed top-0 left-0 right-0 flex z-5 bg-white border-b items-center justify-between p-4 h-16">
      <div className="flex items-center gap-6">
        <Link href="/" className="">
          <h1 className="text-xl font-bold">Web Gallery</h1>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "font-medium text-sm hover:underline",
                )}
              >
                <Link href="/explore">Explore</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "font-medium text-sm hover:underline",
                )}
              >
                <Link href="/featured">Featured</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

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
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <NavigationMenu>
          <NavigationMenuList>
            {session?.user?.name ? (
              <>
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
              </>
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
          </NavigationMenuList>
        </NavigationMenu>
        {session?.user?.name && (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/", redirect: true });
            }}
          >
            <Button type="submit" size="sm" variant="outline">
              Logout
            </Button>
          </form>
        )}
      </div>
    </header>
  );
};

export default Header;
