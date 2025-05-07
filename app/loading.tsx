import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin " />
        <h2 className="text-xl font-medium">Loading...</h2>
        <p className="text-sm text-muted-foreground">
          Please wait while we prepare your content
        </p>
      </div>
    </div>
  );
}
