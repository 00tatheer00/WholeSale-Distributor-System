"use client";

import * as React from "react";
import { ErrorState } from "@/components/shared/error-state";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <ErrorState
          title="Application Runtime Error"
          description="An unexpected error occurred while rendering this page."
          error={error}
          onRetry={() => reset()}
        />
      </div>
    </div>
  );
}
