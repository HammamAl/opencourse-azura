"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchForm({ keyword }: { keyword: string | null }) {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <form
      method="GET"
      className="flex gap-2 max-w-md"
      onSubmit={() => setIsSearching(true)}
    >
      <div className="relative flex-1">
        <Input
          type="text"
          name="keyword"
          placeholder="Cari nama, atau NIDN dosen..."
          defaultValue={keyword || ""}
          className="pr-10"
        />
      </div>
      <Button type="submit" className="flex items-center gap-2" disabled={isSearching}>
        <Search size={16} />
        {isSearching ? 'Mencari...' : 'Cari'}
      </Button>
      {keyword && (
        <Button type="button" variant="outline" asChild>
          <a href="?page=1">Reset</a>
        </Button>
      )}
      <input type="hidden" name="page" value="1" />
    </form>
  );
}
