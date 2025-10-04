import { useState, useRef, useEffect } from "react";
import { Search, X, Send, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FloatingSearchProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export function FloatingSearch({ onSearch, isSearching = false }: FloatingSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      {/* Inline Search Bar */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
        <div className="flex items-center px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground mr-3 flex-shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for companies, e.g., sustainable energy startups founded after 2020"
            className="flex-1 border-0 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0 px-0 h-auto"
          />
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-1.5 flex items-center gap-2 ml-3 flex-shrink-0"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
    </div>
  );
}