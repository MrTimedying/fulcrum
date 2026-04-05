import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NavigationState {
  patientId: string;
  trailingPatientId: string;
  activeTab: string;
  trailingActiveTab: string;
  setPatientId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  setTrailingActiveTab: (tab: string) => void;
  tabStateLogic: (trailingActiveTab: string, patientId: string) => void;
  patientStateLogic: (trailingPatientId: string, activeTab: string) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      patientId: '',
      trailingPatientId: '',
      activeTab: 'Profile',
      trailingActiveTab: '',

      setPatientId: (id) => {
        const { patientId } = get();
        set({ 
          patientId: id, 
          trailingPatientId: patientId 
        });
      },

      setActiveTab: (tab) => {
        const { activeTab } = get();
        set({ 
          activeTab: tab, 
          trailingActiveTab: activeTab 
        });
      },

      setTrailingActiveTab: (tab) => {
        set({ trailingActiveTab: tab });
      },

      tabStateLogic: (trailingActiveTab, patientId) => {
        console.log('Tab logic triggered - trailing tab:', trailingActiveTab, 'for patient:', patientId);
        // This method serves as a hook for navigation-related state transitions.
        // Complex state saving/loading logic will be coordinated by the refactored flow store.
      },

      patientStateLogic: (trailingPatientId, activeTab) => {
        if (trailingPatientId === '') return;
        console.log('Patient state logic triggered - trailing patient:', trailingPatientId, 'on tab:', activeTab);
        // This method serves as a hook for navigation-related state transitions.
        // Complex state saving/loading logic will be coordinated by the refactored flow store.
      },
    }),
    {
      name: 'navigation-store',
    }
  )
);
