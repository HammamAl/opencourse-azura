"use client"
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, X, Plus, Check, ChevronsUpDown, GripVertical, Trash2 } from "lucide-react";
import { SortableAccordion } from '@/components/ui/sortable-accordion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/tiptap-ui-primitive/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AddClassCover } from '@/components/ui/add-class-cover';
import { useCourseInputStore } from '@/store/inputCourse';
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Toaster, toast } from 'sonner';

// ==================== CONSTANTS ====================
const LANGUAGES = [
  { label: "Indonesia", value: "ID" },
  { label: "English", value: "EN" },
];

const VALIDATION_RULES = {
  MIN_DESCRIPTION_LENGTH: 20,
};

// ==================== TYPES ====================
interface Category {
  id: string;
  label: string;
}

interface Lecturer {
  id: string;
  name: string;
  department?: string;
  email: string;
}

interface LearningTarget {
  id: string;
  description: string;
  order_index: number;
}

// ==================== SORTABLE LEARNING TARGET COMPONENT ====================
function SortableLearningTargetItem({
  target,
  onUpdate,
  onRemove
}: {
  target: LearningTarget;
  onUpdate: (id: string, description: string) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: target.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-white"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex-1">
        <Textarea
          value={target.description}
          onChange={(e) => onUpdate(target.id, e.target.value)}
          placeholder="Masukkan target pembelajaran..."
          className="min-h-[60px] resize-none"
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(target.id)}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ==================== LEARNING TARGETS INPUT COMPONENT ====================
function LearningTargetsInput() {
  const {
    course,
    addLearningTarget,
    updateLearningTarget,
    deleteLearningTarget,
    reorderLearningTargets
  } = useCourseInputStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddLearningTarget = () => {
    addLearningTarget({ description: '' });
  };

  const handleUpdateLearningTarget = (id: string, description: string) => {
    updateLearningTarget(id, { description });
  };

  const handleRemoveLearningTarget = (id: string) => {
    deleteLearningTarget(id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = course.learning_targets.findIndex(target => target.id === active.id);
      const newIndex = course.learning_targets.findIndex(target => target.id === over.id);

      const reorderedTargets = arrayMove(course.learning_targets, oldIndex, newIndex);
      reorderLearningTargets(reorderedTargets);
    }
  };

  const EmptyState = () => (
    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
      <p className="text-sm">Belum ada target pembelajaran</p>
      <p className="text-xs mt-1">Klik "Tambah Target" untuk menambahkan target pembelajaran</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Target Pembelajaran</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddLearningTarget}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Tambah Target
        </Button>
      </div>

      {course.learning_targets.length === 0 ? (
        <EmptyState />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={course.learning_targets.map(target => target.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {course.learning_targets.map((target) => (
                <SortableLearningTargetItem
                  key={target.id}
                  target={target}
                  onUpdate={handleUpdateLearningTarget}
                  onRemove={handleRemoveLearningTarget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ==================== LECTURER SEARCH COMPONENT ====================
function LecturerSearch({
  lecturerSearch,
  setLecturerSearch,
  lecturers,
  selectedLecturer,
  showSuggestions,
  setShowSuggestions,
  isFetching,
  onLecturerSelect,
  onRemoveLecturer
}: {
  lecturerSearch: string;
  setLecturerSearch: (value: string) => void;
  lecturers: Lecturer[];
  selectedLecturer: Lecturer | null;
  showSuggestions: boolean;
  setShowSuggestions: (value: boolean) => void;
  isFetching: boolean;
  onLecturerSelect: (lecturer: Lecturer) => void;
  onRemoveLecturer: () => void;
}) {
  const LecturerSuggestions = () => (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
      {isFetching ? (
        <div className="px-4 py-3 text-sm text-gray-500">Mencari...</div>
      ) : lecturers.length > 0 ? (
        lecturers.map((lecturer) => (
          <div
            key={lecturer.id}
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            onMouseDown={() => onLecturerSelect(lecturer)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{lecturer.name}</p>
                <p className="text-xs text-gray-400">{lecturer.email}</p>
              </div>
              <Plus className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))
      ) : (
        <div className="px-4 py-3 text-sm text-gray-500">Dosen tidak ditemukan.</div>
      )}
    </div>
  );

  const SelectedLecturer = () => (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Dosen Terpilih:</p>
      <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg max-w-fit">
        <div className="flex flex-col">
          <span className="font-medium">{selectedLecturer?.name}</span>
        </div>
        <button
          onClick={onRemoveLecturer}
          className="hover:bg-blue-200 rounded-full p-1 ml-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari nama dosen..."
            value={lecturerSearch}
            onChange={(e) => {
              setLecturerSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10"
          />
        </div>

        {showSuggestions && lecturerSearch && !selectedLecturer && (
          <LecturerSuggestions />
        )}
      </div>

      {selectedLecturer && <SelectedLecturer />}
    </div>
  );
}

// ==================== LANGUAGE SELECTOR COMPONENT ====================
function LanguageSelector({
  selectedLanguage,
  onLanguageChange
}: {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLanguage
            ? LANGUAGES.find((language) => language.value === selectedLanguage)?.label
            : "Pilih bahasa..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Cari Bahasa..." />
          <CommandList>
            <CommandEmpty>Bahasa tidak ditemukan</CommandEmpty>
            <CommandGroup>
              {LANGUAGES.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={(currentValue) => {
                    onLanguageChange(currentValue.toUpperCase());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedLanguage === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ==================== CATEGORY SELECTOR COMPONENT ====================
function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
  isLoading
}: {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading categories...</p>;
  }

  return (
    <RadioGroup
      value={selectedCategory}
      onValueChange={onCategoryChange}
      className="space-y-2"
    >
      {categories.map((category) => (
        <div key={category.id} className="flex items-center space-x-2">
          <RadioGroupItem value={category.id} id={category.id} />
          <Label htmlFor={category.id} className="font-normal">
            {category.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

// ==================== FORM VALIDATION UTILITIES ====================
const validateForm = (course: any, selectedLecturer: Lecturer | null) => {
  return !course.title ||
    !course.description ||
    course.description.length < VALIDATION_RULES.MIN_DESCRIPTION_LENGTH ||
    !selectedLecturer ||
    !course.course_duration ||
    !course.estimated_time_per_week ||
    course.price <= 0 ||
    !course.language ||
    !course.category_id;
};

// ==================== FORM SECTIONS (MOVED OUTSIDE) ====================
const BasicInfoSection = ({ course, setCourse }: { course: any, setCourse: (data: any) => void }) => (
  <div className="space-y-3">
    <Input
      placeholder="Nama Kelas"
      id="course-name"
      value={course.title}
      onChange={(e) => setCourse({ title: e.target.value })}
    />
  </div>
);

const DescriptionSection = ({ course, setCourse }: { course: any, setCourse: (data: any) => void }) => (
  <div className="space-y-3">
    <Label htmlFor="course-description">Tentang Kelas Ini</Label>
    <Textarea
      placeholder="Tulis tentang Kelas Ini"
      id="course-description"
      value={course.description}
      onChange={(e) => setCourse({ description: e.target.value })}
      className={cn(
        (course.description && course.description.length < VALIDATION_RULES.MIN_DESCRIPTION_LENGTH) &&
        "border-red-500 focus-visible:ring-red-500"
      )}
    />
    {course.description && course.description.length < VALIDATION_RULES.MIN_DESCRIPTION_LENGTH && (
      <p className="text-sm text-red-600">
        Deskripsi harus memiliki setidaknya {VALIDATION_RULES.MIN_DESCRIPTION_LENGTH} karakter.
        ({course.description.length}/{VALIDATION_RULES.MIN_DESCRIPTION_LENGTH})
      </p>
    )}
  </div>
);

const LecturerSection = (props: any) => (
  <div className="space-y-3">
    <Label htmlFor="lecturer">Dosen Pengajar</Label>
    <LecturerSearch {...props} />
  </div>
);

const LearningTargetsSection = () => (
  <div className="space-y-3">
    <LearningTargetsInput />
  </div>
);

const SectionBabSection = ({ isClient }: { isClient: boolean }) => (
  <div className="space-y-3">
    <Label>Section / BAB</Label>
    {isClient && (
      <SortableAccordion
        placeholder="Masukkan judul Bab baru disini..."
        addButtonText="Tambahkan"
      />
    )}
  </div>
);

const DurationSection = ({ course, setCourse }: { course: any, setCourse: (data: any) => void }) => (
  <div className="space-y-3">
    <h2>Durasi Kelas</h2>
    <Label>Lama Kelas (minggu)</Label>
    <Input
      type="number"
      value={course.course_duration || ''}
      onChange={(e) => {
        const val = e.target.value;
        setCourse({ course_duration: val ? parseInt(val, 10) : '' });
      }}
    />
    <Label>Upaya (Jam per Minggu)</Label>
    <Input
      type="number"
      value={course.estimated_time_per_week || ''}
      onChange={(e) => {
        const val = e.target.value;
        setCourse({ estimated_time_per_week: val ? parseInt(val, 10) : '' });
      }}
    />
  </div>
);

function PriceSection({ course, setCourse }: { course: any, setCourse: (data: any) => void }) {
  const [displayValue, setDisplayValue] = React.useState('');

  React.useEffect(() => {
    if (course.price) {
      setDisplayValue(new Intl.NumberFormat('id-ID').format(course.price));
    } else {
      setDisplayValue('');
    }
  }, [course.price]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseInt(rawValue.replace(/[^0-9]/g, ''), 10) || 0;
    setCourse({ price: numericValue });
    if (numericValue === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(new Intl.NumberFormat('id-ID').format(numericValue));
    }
  };

  return (
    <div className="space-y-3">
      <h2>Harga</h2>
      <Label htmlFor="price">Kelas</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          Rp
        </span>
        <Input
          id="price"
          type="text"
          value={displayValue}
          onChange={handlePriceChange}
          placeholder="Contoh: 150.000"
          className="pl-9"
        />
      </div>
    </div>
  );
}

const LanguageSection = ({ selectedLanguage, onLanguageChange }: { selectedLanguage: string, onLanguageChange: (lang: string) => void }) => (
  <div className="space-y-3">
    <h2>Bahasa</h2>
    <Label>Materi</Label>
    <LanguageSelector
      selectedLanguage={selectedLanguage}
      onLanguageChange={onLanguageChange}
    />
  </div>
);

const CategorySection = (props: any) => (
  <div className="space-y-3">
    <h2>Kategori</h2>
    <CategorySelector {...props} />
  </div>
);

const CoverSection = () => (
  <div className="space-y-3">
    <AddClassCover />
  </div>
);

const HeaderSection = ({ isSubmitting, isFormInvalid, onConfirmReset, onSaveDraft, onPublish }: {
  isSubmitting: boolean;
  isFormInvalid: boolean;
  onConfirmReset: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}) => (
  <div className="flex flex-row items-center justify-between px-6 pb-6 mb-4 border-b">
    <h1 className="text-lg font-bold">Buat Kelas</h1>
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isSubmitting}>
            Reset Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah kamu yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus semua data yang telah Anda masukkan di formulir ini.
              Data yang belum disimpan akan hilang secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmReset}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        variant="outline"
        size="sm"
        onClick={onSaveDraft}
        disabled={isSubmitting || isFormInvalid}
      >
        {isSubmitting ? 'Menyimpan...' : 'Simpan Draf'}
      </Button>
      <Button
        size="sm"
        onClick={onPublish}
        disabled={isSubmitting || isFormInvalid}
      >
        {isSubmitting ? 'Memublikasikan...' : 'Publikasikan'}
      </Button>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
export default function CreateCourse() {
  const router = useRouter();
  const {
    course,
    setCourse,
    resetCourse,
    getCoursePayload
  } = useCourseInputStore();

  // ==================== STATE ====================
  const [lecturerSearch, setLecturerSearch] = useState('');
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const debouncedSearchTerm = useDebounce(lecturerSearch, 300);

  // ==================== EFFECTS ====================
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run if there's a lecturer_id in the store and no lecturer is currently selected in local state
    if (course.lecturer_id && !selectedLecturer) {
      const fetchInitialLecturer = async () => {
        try {
          // You'll need to create this API endpoint to fetch a single user by ID
          const response = await fetch(`/api/user-management/lecturer/${course.lecturer_id}`);
          if (!response.ok) {
            console.error("Failed to fetch initial lecturer");
            return;
          }
          const lecturerData: Lecturer = await response.json();
          setSelectedLecturer(lecturerData);
        } catch (error) {
          console.error("Error fetching initial lecturer:", error);
        }
      };

      fetchInitialLecturer();
    }
  }, [course.lecturer_id, selectedLecturer]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsFetchingCategories(true);
      try {
        const response = await fetch('/api/category');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const rawData = await response.json();
        const formattedData: Category[] = rawData.map((category: { id: string; name: string }) => ({
          id: category.id,
          label: category.name,
        }));
        setCategories(formattedData);
      } catch (error) {
        console.error(error);
        setCategories([]);
      } finally {
        setIsFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLecturers = async () => {
      if (debouncedSearchTerm) {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/user-management/lecturer?q=${encodeURIComponent(debouncedSearchTerm)}`);
          const data = await response.json();
          setLecturers(data);
        } catch (error) {
          console.error("Failed to fetch lecturers:", error);
          setLecturers([]);
        } finally {
          setIsFetching(false);
        }
      } else {
        setLecturers([]);
      }
    };

    fetchLecturers();
  }, [debouncedSearchTerm]);

  // ==================== HANDLERS ====================
  const handleLecturerSelect = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setCourse({ lecturer_id: lecturer.id });
    setLecturerSearch('');
    setShowSuggestions(false);
    setLecturers([]);
  };

  const handleRemoveLecturer = () => {
    setSelectedLecturer(null);
    setCourse({ lecturer_id: '' });
  };

  const handleCategoryChange = (categoryId: string) => {
    setCourse({ category_id: categoryId });
  };

  const handleLanguageChange = (language: string) => {
    setCourse({ language });
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setIsSubmitting(true);

    const payload = getCoursePayload();
    payload.status = status;

    console.log('Sending payload to backend:', payload);

    try {
      const response = await fetch('/api/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(`Error: ${result.message}`);
        throw new Error('Failed to save the course.');
      }

      toast.success(`Sukses!`, {
        description: `Kelas telah ${status === 'draft' ? 'disimpan sebagai draf' : 'dipublikasikan'}.`,
      });

      resetCourse();
      router.push('/a/course');

    } catch (error) {
      console.error('An error occurred while saving the course:', error);
      if (!(error instanceof Error && error.message.startsWith('Failed to save'))) {
        toast.error('An unexpected error occurred.', {
          description: 'Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = () => handleSubmit('published');
  const handleSaveDraft = () => handleSubmit('draft');

  const handleConfirmReset = () => {
    resetCourse();
    setSelectedLecturer(null);
    toast.info('Sukses', {
      description: 'Reset data sukses',
    });
  };

  // ==================== COMPUTED VALUES ====================
  const isFormInvalid = validateForm(course, selectedLecturer);

  // ==================== RENDER ====================
  return (
    <div className="py-0">
      <Toaster richColors />
      <HeaderSection
        isSubmitting={isSubmitting}
        isFormInvalid={isFormInvalid}
        onConfirmReset={handleConfirmReset}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* Left Column */}
        <div className="w-full lg:w-3/4 space-y-6">
          <BasicInfoSection course={course} setCourse={setCourse} />
          <DescriptionSection course={course} setCourse={setCourse} />
          <LecturerSection
            lecturerSearch={lecturerSearch}
            setLecturerSearch={setLecturerSearch}
            lecturers={lecturers}
            selectedLecturer={selectedLecturer}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            isFetching={isFetching}
            onLecturerSelect={handleLecturerSelect}
            onRemoveLecturer={handleRemoveLecturer}
          />
          <LearningTargetsSection />
          <SectionBabSection isClient={isClient} />
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-1/4 space-y-6">
          <DurationSection course={course} setCourse={setCourse} />
          <PriceSection course={course} setCourse={setCourse} />
          <LanguageSection selectedLanguage={course.language} onLanguageChange={handleLanguageChange} />
          <CategorySection
            categories={categories}
            selectedCategory={course.category_id ?? ''}
            onCategoryChange={handleCategoryChange}
            isLoading={isFetchingCategories}
          />
          <CoverSection />
        </div>
      </div>
    </div>
  );
}
