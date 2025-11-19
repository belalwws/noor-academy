"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface EnhancedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  placeholder?: string;
  className?: string;
}

export default function EnhancedSearchBar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  placeholder = "ابحث عن الدورة التي تناسبك...",
  className = ""
}: EnhancedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-1">
          البحث في الدورات
        </h3>
        <p className="text-sm text-gray-600">
          ابحث عن الدورة التي تناسبك
        </p>
      </div>

      <div className="relative">
        <div className="relative">
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-10 pl-12 pr-10 text-sm border border-gray-300 rounded-md focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          />

          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSearch}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-1 h-6 w-6 hover:bg-gray-100 rounded"
            >
              <X className="w-3 h-3 text-gray-500" />
            </Button>
          )}
        </div>

        {/* Search Actions */}
        <div className="flex gap-2 mt-3 justify-center">
          <Button
            onClick={onSearchSubmit}
            disabled={!searchQuery.trim()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 text-sm rounded-md"
          >
            بحث
          </Button>
          
          {searchQuery && (
            <Button
              variant="outline"
              onClick={onClearSearch}
              className="px-4 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 rounded-md"
            >
              مسح
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
