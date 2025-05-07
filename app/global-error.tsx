"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <head>
        <title>Something went wrong</title>
      </head>
      <body>
        <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
          <div className="rounded-full bg-red-100 p-4 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            We&#39;ve encountered an unexpected error.
          </p>
          {error.digest && (
            <p className="text-sm text-muted-foreground mb-6">
              Error ID: {error.digest}
            </p>
          )}
          <Button asChild>
            <Link href={`/`}>Go Back to Home</Link>
          </Button>
        </div>
      </body>
    </html>
  );
}
