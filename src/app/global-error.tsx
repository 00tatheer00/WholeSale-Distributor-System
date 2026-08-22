"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Critical Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">
            Critical System Failure
          </h1>
          <p className="text-sm text-slate-300">
            A critical error occurred at the root application level. Please reload the application.
          </p>
          <Button onClick={() => reset()} className="mt-4">
            Reload System
          </Button>
        </div>
      </body>
    </html>
  );
}
