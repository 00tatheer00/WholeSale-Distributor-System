import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="flex flex-col items-center text-center max-w-md space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <FileQuestion className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight">404 - Not Found</h1>
          <p className="text-sm text-muted-foreground">
            The requested resource, invoice, batch, or page could not be located in the system.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
