import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  children,
  className,
  ...props
}: PageHeaderProps) {
  const actionContent = actions || children;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/60 mb-6",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actionContent && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actionContent}</div>
      )}
    </div>
  );
}
