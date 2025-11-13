import { create } from 'zustand';
import type { StudioJob } from '@/types';

interface StudioStore {
  jobs: StudioJob[];
  addJob: (job: Omit<StudioJob, 'id' | 'created_at'>) => void;
  updateJob: (id: string, updates: Partial<StudioJob>) => void;
  removeJob: (id: string) => void;
  clearJobs: () => void;
  getJobById: (id: string) => StudioJob | undefined;
  getJobsByDocId: (docId: string) => StudioJob[];
}

/**
 * Studio store for managing content generation jobs with type-safe operations
 */
export const useStudioStore = create<StudioStore>((set, get) => ({
  jobs: [],

  addJob: (job) =>
    set((state) => ({
      jobs: [
        ...state.jobs,
        {
          ...job,
          id: crypto.randomUUID(),
          created_at: new Date(),
        },
      ],
    })),

  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === id ? { ...job, ...updates } : job)),
    })),

  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== id),
    })),

  clearJobs: () => set({ jobs: [] }),

  getJobById: (id) => {
    return get().jobs.find((job) => job.id === id);
  },

  getJobsByDocId: (docId) => {
    return get().jobs.filter((job) => job.doc_id === docId);
  },
}));
