import React, { useState } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "./input";
import { Button } from "./button";

// Type definitions
export interface SortableItem {
  id: string;
  text: string;
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onDelete: (id: string) => void;
  showDelete?: boolean;
}

// Individual sortable item component
function SortableItem({ id, children, onDelete, showDelete = false }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center p-3 border rounded-lg bg-white group
        ${isDragging ? "shadow-lg border-blue-300 bg-blue-50 z-50" : "hover:bg-gray-50 border-gray-200"}
      `}
    >
      <div {...attributes} {...listeners} className="cursor-move mr-3 hover:bg-gray-100 p-1 rounded">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <div className="flex-1 text-gray-700 select-none">{children}</div>

      {showDelete && (
        <button onClick={() => onDelete(id)} className="ml-2 p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <X className="w-4 h-4 text-red-500" />
        </button>
      )}
    </div>
  );
}

interface SortableListProps {
  items: SortableItem[];
  onItemsChange: (items: SortableItem[]) => void;
  onAddItem?: (item: SortableItem) => void;
  onDeleteItem?: (id: string) => void;
  showAddButton?: boolean;
  showDeleteButtons?: boolean;
  addButtonText?: string;
  className?: string;
  itemClassName?: string;
  placeholder?: string;
}

export function SortableList({
  items,
  onItemsChange,
  onAddItem,
  onDeleteItem,
  showAddButton = true,
  showDeleteButtons = true,
  addButtonText = "Add Item",
  className = "",
  itemClassName = "",
  placeholder = "Enter item text...",
}: SortableListProps) {
  const [newItemText, setNewItemText] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newItems = (() => {
        const oldIndex = items.findIndex((item: SortableItem) => item.id === active.id);
        const newIndex = items.findIndex((item: SortableItem) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      })();

      onItemsChange(newItems);
    }
  }

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
      };

      if (onAddItem) {
        onAddItem(newItem);
      } else {
        onItemsChange([...items, newItem]);
      }

      setNewItemText("");
    }
  };

  const handleDeleteItem = (id: string) => {
    if (onDeleteItem) {
      onDeleteItem(id);
    } else {
      onItemsChange(items.filter((item: SortableItem) => item.id !== id));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item: SortableItem) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item: SortableItem) => (
              <SortableItem key={item.id} id={item.id} onDelete={handleDeleteItem} showDelete={showDeleteButtons}>
                <span className={itemClassName}>{item.text}</span>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showAddButton && (
        <div className="mt-4 flex gap-2">
          <Input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button onClick={handleAddItem} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {addButtonText}
          </Button>
        </div>
      )}
    </div>
  );
}
