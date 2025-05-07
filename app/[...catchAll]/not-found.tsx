import React from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex min-h-screen h-full flex-col items-center justify-center bg-gray-100">
      <div className="container flex w-full flex-col items-center text-center">
        <h1 className="text-9xl font-extrabold tracking-tight text-primary">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          Page not found
        </h2>
        <p className="mt-2 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
          <Button asChild variant="outline" className="mx-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default NotFound;
