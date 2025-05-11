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

import HeaderUser from "@/components/layout/HeaderUser";
import { SessionProvider } from "next-auth/react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 flex z-5 bg-white border-b items-center p-4 h-16">
      <Link href="/" className="shrink-0">
        <h1 className="text-xl font-bold">Web Gallery</h1>
      </Link>
      <div className="flex flex-row w-full justify-end md:justify-between">
        <NavigationMenu className="">
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
          </NavigationMenuList>
        </NavigationMenu>
        <NavigationMenu>
          <NavigationMenuList>
            <SessionProvider>
              <HeaderUser />
            </SessionProvider>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Header;
