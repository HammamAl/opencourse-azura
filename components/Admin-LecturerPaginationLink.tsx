"use client";

import { useState } from "react";
import { PaginationLink } from "@/components/ui/pagination";

export function EnhancedPaginationLink({
  href,
  children,
  isActive = false,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}) {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <PaginationLink
      href={href}
      isActive={isActive}
      onClick={() => {
        if (!isActive) {
          setIsNavigating(true);
        }
      }}
      className={isNavigating ? "opacity-50" : ""}
      {...props}
    >
      {isNavigating ? '...' : children}
    </PaginationLink>
  );
}
