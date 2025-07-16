import React, { useState, useEffect } from "react";
import { GripVertical, Plus, X, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { useCourseInputStore } from "@/store/inputCourse";

export interface AccordionItem {
  id: string;
  text: string;
}

export interface AccordionSection {
  id: string;
  title: string;
  items: AccordionItem[];
  isOpen?: boolean;
}

function AccordionItem({ id, children, onDelete, showDelete = false }: { id: string; children: React.ReactNode; onDelete: (id: string) => void; showDelete?: boolean }) {
  return (
    <div className="flex items-center p-2 ml-6 border rounded-md bg-gray-50 group hover:bg-gray-100 border-gray-200">
      <div className="flex-1 text-gray-600 select-none text-sm">{children}</div>

      {showDelete && (
        <button onClick={() => onDelete(id)} className="ml-2 p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <X className="w-3 h-3 text-red-500" />
        </button>
      )}
    </div>
  );
}

function SortableAccordionSection({
  section,
  onToggle,
  onDeleteSection,
  onDeleteItem,
  onAddItem,
  showDelete = false,
  showDeleteButtons = true,
  isDragOverlay = false,
}: {
  section: AccordionSection;
  onToggle: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onAddItem: (sectionId: string, item: AccordionItem) => void;
  showDelete?: boolean;
  showDeleteButtons?: boolean;
  isDragOverlay?: boolean;
}) {
  const [newItemText, setNewItemText] = useState("");
  const router = useRouter();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem = {
        id: `${section.id}-item-${Date.now()}`,
        text: newItemText.trim(),
      };
      onAddItem(section.id, newItem);
      setNewItemText("");
    }
  };

  const handleNavigateToAddMaterial = () => {
    router.push(`/a/course/add/material?section_id=${section.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        border rounded-lg bg-white
        ${isDragging || isDragOverlay ? "shadow-lg border-blue-300 bg-blue-50 z-50" : "border-gray-200"}
      `}
    >
      {/* Section Header */}
      <div className="flex items-center p-4 group">
        <div {...attributes} {...listeners} className="cursor-move mr-3 hover:bg-gray-100 p-1 rounded">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <button onClick={() => onToggle(section.id)} className="flex items-center flex-1 text-left hover:bg-gray-50 p-2 rounded">
          {section.isOpen ? <ChevronDown className="w-4 h-4 text-gray-500 mr-2" /> : <ChevronRight className="w-4 h-4 text-gray-500 mr-2" />}
          <span className="font-medium text-gray-800">{section.title}</span>
          <span className="ml-2 text-sm text-gray-500">({section.items.length})</span>
        </button>

        <button onClick={handleNavigateToAddMaterial} className="ml-2 p-1 hover:bg-green-100 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Tambahkan subbab">
          <Plus className="w-4 h-4 text-green-500" />
        </button>

        {showDelete && (
          <button onClick={() => onDeleteSection(section.id)} className="ml-2 p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <X className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>

      {/* Section Content */}
      {section.isOpen && (
        <div className="pb-4 px-4">
          <div className="space-y-2 mb-4">
            {section.items.map((item) => (
              <AccordionItem key={item.id} id={item.id} onDelete={(itemId) => onDeleteItem(section.id, itemId)} showDelete={showDeleteButtons}>
                {item.text}
              </AccordionItem>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SortableAccordion({
  showAddButton = true,
  showDeleteButtons = true,
  addButtonText = "Tambahkan",
  className = "",
  placeholder = "Masukkan nama Bab baru...",
}: {
  showAddButton?: boolean;
  showDeleteButtons?: boolean;
  addButtonText?: string;
  className?: string;
  placeholder?: string;
} = {}) {
  // Use the external store - ADD reorderSections to the destructured methods
  const {
    course,
    addSection,
    updateSection,
    deleteSection,
    reorderSections, // Add this line
    addMaterial,
    deleteMaterial,
  } = useCourseInputStore();

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [sectionOpenState, setSectionOpenState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const accordionSections = course.sections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.materials.map((material: any, index: number) => ({
      id: `${section.id}-material-${index}`,
      text: material.title,
    })),
    isOpen: sectionOpenState[section.id] ?? true,
  }));

  if (!isMounted) {
    return (
      <div className={`w-full ${className}`}>
        <div className="space-y-3">
          {accordionSections.map((section) => (
            <div key={section.id} className="border rounded-lg bg-white border-gray-200">
              <div className="flex items-center p-4">
                <div className="mr-3 p-1 rounded">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <button className="flex items-center flex-1 text-left p-2 rounded">
                  {section.isOpen ? <ChevronDown className="w-4 h-4 text-gray-500 mr-2" /> : <ChevronRight className="w-4 h-4 text-gray-500 mr-2" />}
                  <span className="font-medium text-gray-800">{section.title}</span>
                  <span className="ml-2 text-sm text-gray-500">({section.items.length})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  // FIXED: Update this function to use the new reorderSections method
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = course.sections.findIndex((section) => section.id === active.id);
      const newIndex = course.sections.findIndex((section) => section.id === over.id);

      // Use arrayMove to reorder the sections array and update the store
      const reorderedSections = arrayMove(course.sections, oldIndex, newIndex);
      reorderSections(reorderedSections);
    }
  }

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      addSection({
        title: newSectionTitle.trim(),
      });
      setNewSectionTitle("");
    }
  };

  const handleToggleSection = (id: string) => {
    setSectionOpenState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddItem = (sectionId: string, item: AccordionItem) => {
    addMaterial(sectionId, {
      title: item.text,
      content: item.text,
    });
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    const section = course.sections.find((s) => s.id === sectionId);
    if (section) {
      const itemIndex = section.materials.findIndex((_, index) => `${sectionId}-material-${index}` === itemId);
      if (itemIndex >= 0) {
        deleteMaterial(sectionId, itemIndex);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddSection();
    }
  };

  const activeSection = activeId ? accordionSections.find((section) => section.id === activeId) : null;

  return (
    <div className={`w-full ${className}`}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={accordionSections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {accordionSections.map((section) => (
              <SortableAccordionSection
                key={section.id}
                section={section}
                onToggle={handleToggleSection}
                onDeleteSection={deleteSection}
                onDeleteItem={handleDeleteItem}
                onAddItem={handleAddItem}
                showDelete={showDeleteButtons}
                showDeleteButtons={showDeleteButtons}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeSection ? (
            <SortableAccordionSection section={activeSection} onToggle={() => {}} onDeleteSection={() => {}} onDeleteItem={() => {}} onAddItem={() => {}} showDelete={false} showDeleteButtons={false} isDragOverlay={true} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {showAddButton && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button onClick={handleAddSection} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {addButtonText}
          </button>
        </div>
      )}
    </div>
  );
}
