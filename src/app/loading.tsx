import { TableLoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function RootLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-4">
        <TableLoadingSkeleton rows={4} />
      </div>
    </div>
  );
}
