import { create } from "zustand";
import { devtools } from "zustand/middleware";

// --- STATE SHAPES ---
// These interfaces define the shape of the data within the Zustand store (the frontend state).

/**
 * Represents a single learning material within a course section.
 */
interface CourseMaterial {
  title: string;
  content: string;
  youtube_link?: string;
  course_section_id: string; // Foreign key linking to CourseSection
}

/**
 * Represents a section of a course, containing multiple learning materials.
 */
interface CourseSection {
  id: string; // Unique identifier for the section
  title: string;
  order_index: number; // For ordering sections
  isOpen?: boolean; // UI state: whether the section is expanded or not
  materials: CourseMaterial[];
}

/**
 * Represents a single learning target or objective for the course.
 */
interface CourseLearningTarget {
  id: string; // Unique identifier for the learning target
  description: string;
  order_index: number; // For ordering targets
}

/**
 * Represents the entire course structure as used in the frontend.
 */
interface Course {
  title: string;
  description: string;
  course_duration: number;
  estimated_time_per_week: number;
  price: number;
  language: string;
  lecturer_id: string;
  cover_image_url: string;
  category_id: string;
  admin_review: string | null;
  status: "draft" | "need-review" | "reviewed" | "published";
  sections: CourseSection[];
  learning_targets: CourseLearningTarget[];
}

// --- BACKEND PAYLOAD TYPES ---
/**
 * Represents a course material for the backend payload.
 */
interface BackendCourseMaterial {
  title: string;
  content: string;
  youtube_link?: string;
}

/**
 * Represents a course section for the backend payload.
 * Note: 'id' is optional as new sections won't have an ID yet.
 */
interface BackendCourseSection {
  id?: string;
  title: string;
  order_index: number;
  course_material: BackendCourseMaterial[];
}

/**
 * Represents a learning target for the backend payload.
 */
interface BackendCourseLearningTarget {
  id: string;
  description: string;
  order_index: number;
}

/**
 * Represents the final course object to be sent to the backend.
 */
interface BackendCourse {
  title: string;
  description: string;
  course_duration: number;
  estimated_time_per_week: number;
  price: number;
  language: string;
  lecturer_id: string;
  cover_image_url: string;
  category_id: string;
  status: "draft" | "need-review" | "reviewed" | "published";
  course_section: BackendCourseSection[];
  course_learning_target: BackendCourseLearningTarget[];
}

// --- ZUSTAND STORE INTERFACE ---

/**
 * Defines the complete shape of the Zustand store, including state and actions.
 */
interface CourseStore {
  course: Course;
  setCourse: (course: Partial<Course>) => void;
  resetCourse: () => void;

  // Section actions
  addSection: (section: Pick<CourseSection, "title">) => void;
  updateSection: (sectionId: string, updates: Partial<CourseSection>) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (sections: CourseSection[]) => void;

  // Material actions
  addMaterial: (sectionId: string, material: Omit<CourseMaterial, "course_section_id">) => void;
  updateMaterial: (sectionId: string, materialIndex: number, updates: Partial<CourseMaterial>) => void;
  deleteMaterial: (sectionId: string, materialIndex: number) => void;

  // Learning Target actions
  addLearningTarget: (target: Omit<CourseLearningTarget, "id" | "order_index">) => void;
  updateLearningTarget: (targetId: string, updates: Partial<CourseLearningTarget>) => void;
  deleteLearningTarget: (targetId: string) => void;
  reorderLearningTargets: (targets: CourseLearningTarget[]) => void;

  // Data transformation
  getCoursePayload: () => BackendCourse;
}

// --- INITIAL STATE ---

/**
 * The initial state for a new course.
 */
const initialCourse: Course = {
  title: "",
  description: "",
  course_duration: 0,
  estimated_time_per_week: 0,
  price: 0,
  language: "",
  lecturer_id: "",
  cover_image_url: "",
  category_id: "",
  admin_review: null,
  status: "draft",
  sections: [],
  learning_targets: [],
};

// --- HELPER FUNCTIONS ---

/**
 * Re-indexes an array of items after a deletion or reordering.
 * @param items - The array to re-index.
 * @returns A new array with updated 'order_index' properties.
 */
const reindex = <T extends { order_index: number }>(items: T[]): T[] => {
  return items.map((item, index) => ({ ...item, order_index: index }));
};

// --- ZUSTAND STORE IMPLEMENTATION ---

export const useCourseInputStore = create<CourseStore>()(
  devtools(
    (set, get) => ({
      course: initialCourse,

      /**
       * Updates top-level fields of the course.
       */
      setCourse: (courseUpdate) =>
        set((state) => ({
          course: { ...state.course, ...courseUpdate },
        })),

      // --- SECTION IMPLEMENTATIONS ---

      /**
       * Adds a new, empty section to the course.
       */
      addSection: (section) => {
        set((state) => {
          const newSection: CourseSection = {
            ...section,
            id: crypto.randomUUID(),
            order_index: state.course.sections.length,
            materials: [],
            isOpen: true, // Default to open for better UX
          };
          return {
            course: {
              ...state.course,
              sections: [...state.course.sections, newSection],
            },
          };
        });
      },

      /**
       * Updates a specific section by its ID.
       */
      updateSection: (sectionId, updates) =>
        set((state) => ({
          course: {
            ...state.course,
            sections: state.course.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)),
          },
        })),

      /**
       * Deletes a section and re-indexes the remaining ones.
       */
      deleteSection: (sectionId) =>
        set((state) => {
          const remainingSections = state.course.sections.filter((s) => s.id !== sectionId);
          return {
            course: {
              ...state.course,
              sections: reindex(remainingSections),
            },
          };
        }),

      /**
       * Replaces the sections array, typically after a drag-and-drop operation.
       */
      reorderSections: (sections) =>
        set((state) => ({
          course: {
            ...state.course,
            sections: reindex(sections),
          },
        })),

      // --- MATERIAL IMPLEMENTATIONS ---

      /**
       * Adds a new material to a specific section.
       */
      addMaterial: (sectionId, material) =>
        set((state) => ({
          course: {
            ...state.course,
            sections: state.course.sections.map((section) => {
              if (section.id !== sectionId) return section;
              const newMaterial = { ...material, course_section_id: sectionId };
              return {
                ...section,
                materials: [...section.materials, newMaterial],
              };
            }),
          },
        })),

      /**
       * Updates a material within a section.
       */
      updateMaterial: (sectionId, materialIndex, updates) =>
        set((state) => ({
          course: {
            ...state.course,
            sections: state.course.sections.map((section) => {
              if (section.id !== sectionId) return section;
              return {
                ...section,
                materials: section.materials.map((material, index) => (index === materialIndex ? { ...material, ...updates } : material)),
              };
            }),
          },
        })),

      /**
       * Deletes a material from a section.
       */
      deleteMaterial: (sectionId, materialIndex) =>
        set((state) => ({
          course: {
            ...state.course,
            sections: state.course.sections.map((section) => {
              if (section.id !== sectionId) return section;
              return {
                ...section,
                materials: section.materials.filter((_, index) => index !== materialIndex),
              };
            }),
          },
        })),

      // --- LEARNING TARGET IMPLEMENTATIONS ---

      /**
       * Adds a new learning target to the course.
       */
      addLearningTarget: (target) => {
        set((state) => {
          const newTarget: CourseLearningTarget = {
            ...target,
            id: crypto.randomUUID(),
            order_index: state.course.learning_targets.length,
          };
          return {
            course: {
              ...state.course,
              learning_targets: [...state.course.learning_targets, newTarget],
            },
          };
        });
      },

      /**
       * Updates a specific learning target by its ID.
       */
      updateLearningTarget: (targetId, updates) => {
        set((state) => ({
          course: {
            ...state.course,
            learning_targets: state.course.learning_targets.map((t) => (t.id === targetId ? { ...t, ...updates } : t)),
          },
        }));
      },

      /**
       * Deletes a learning target and re-indexes the remaining ones.
       */
      deleteLearningTarget: (targetId) => {
        set((state) => {
          const remainingTargets = state.course.learning_targets.filter((t) => t.id !== targetId);
          return {
            course: {
              ...state.course,
              learning_targets: reindex(remainingTargets),
            },
          };
        });
      },

      /**
       * Replaces the learning targets array, typically after drag-and-drop.
       */
      reorderLearningTargets: (targets) => {
        set((state) => ({
          course: {
            ...state.course,
            learning_targets: reindex(targets),
          },
        }));
      },

      // --- STORE MANAGEMENT ---

      /**
       * Resets the course state to its initial empty value.
       */
      resetCourse: () => set({ course: initialCourse }),

      /**
       * Transforms the frontend store state into the format required by the backend.
       * This is a selector that computes the derived state on demand.
       */
      getCoursePayload: (): BackendCourse => {
        const { course } = get();

        const backendSections: BackendCourseSection[] = course.sections.map((section) => ({
          id: section.id,
          title: section.title,
          order_index: section.order_index,
          course_material: section.materials.map((material) => ({
            title: material.title,
            content: material.content,
            youtube_link: material.youtube_link,
          })),
        }));

        const backendLearningTargets: BackendCourseLearningTarget[] = course.learning_targets;

        return {
          title: course.title,
          description: course.description,
          course_duration: parseInt(course.course_duration as any, 10) || 0,
          estimated_time_per_week: parseInt(course.estimated_time_per_week as any, 10) || 0,
          price: parseFloat(course.price as any) || 0,
          language: course.language,
          lecturer_id: course.lecturer_id,
          cover_image_url: course.cover_image_url,
          category_id: course.category_id,
          status: course.status,
          course_section: backendSections,
          course_learning_target: backendLearningTargets,
        };
      },
    }),
    // Devtools configuration
    { name: "course-input-store", enabled: true }
  )
);
