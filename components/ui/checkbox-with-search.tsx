import { IconSearch } from "@tabler/icons-react";
import React, { useState, useMemo } from "react";

// --- TYPE DEFINITIONS ---
interface Item {
  id: string;
  label: string;
}

// Props for the Checkbox component
interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

// Checkbox component for individual items
const Checkbox: React.FC<CheckboxProps> = ({ id, label, checked, onChange }) => (
  <div className="flex items-center">
    <input type="checkbox" id={id} checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
    <label htmlFor={id} className="ml-3 text-sm text-gray-700 select-none cursor-pointer">
      {label}
    </label>
  </div>
);

// --- MAIN REUSABLE COMPONENT ---

/**
 * Props for the MultiSelectCheckbox component.
 */
interface MultiSelectCheckboxProps {
  items: Item[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
  containerClassName?: string;
}

/**
 * A reusable multi-select checkbox component with search functionality.
 */
export const MultiSelectCheckbox: React.FC<MultiSelectCheckboxProps> = ({ items = [], selectedIds = [], onSelectionChange, placeholder = "Search items...", containerClassName = "" }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter items based on the search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return items;
    }
    return items.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm]);

  // Handle checkbox change for an item
  const handleCheckboxChange = (itemId: string) => {
    const newSelectedIds = selectedIds.includes(itemId) ? selectedIds.filter((id) => id !== itemId) : [...selectedIds, itemId];
    onSelectionChange(newSelectedIds);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4 ${containerClassName}`}>
      {/* Search Input */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
        />
      </div>

      {/* Checkbox List */}
      <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => <Checkbox key={item.id} id={`checkbox-${item.id}`} label={item.label} checked={selectedIds.includes(item.id)} onChange={() => handleCheckboxChange(item.id)} />)
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No items found.</p>
        )}
      </div>
    </div>
  );
};
