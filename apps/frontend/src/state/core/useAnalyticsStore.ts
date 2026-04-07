import { create } from 'zustand';

export type FocusNodeType = 'Intervention' | 'Phase' | 'Microcycle' | 'Session' | 'Exercise' | null;

export interface AnalyticsState {
  focusNodeId: string | null;
  focusNodeType: FocusNodeType;
  granularity: 'Auto' | 'Manual';
  selectedMetrics: string[];
  selectedTags: string[];
  setFocus: (id: string | null, type: FocusNodeType) => void;
  setGranularity: (granularity: 'Auto' | 'Manual') => void;
  setSelectedMetrics: (metrics: string[]) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  focusNodeId: null,
  focusNodeType: null,
  granularity: 'Auto',
  selectedMetrics: ['Volume', 'Intensity', 'RPE', 'Workload'],
  selectedTags: [],
  setFocus: (id, type) => set({ focusNodeId: id, focusNodeType: type }),
  setGranularity: (granularity) => set({ granularity }),
  setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  toggleTag: (tag) => set((state) => ({
    selectedTags: state.selectedTags.includes(tag)
      ? state.selectedTags.filter((t) => t !== tag)
      : [...state.selectedTags, tag]
  })),
}));

export default useAnalyticsStore;
