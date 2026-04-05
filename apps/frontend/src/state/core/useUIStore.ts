import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean;
  duration: number;
}

export interface UIState {
  // Toaster state
  toasterQueue: Toast[];
  
  // App update state
  updateAvailable: boolean;
  updateInfo: any | null;
  updateDownloaded: boolean;
  
  // Actions
  addToast: (toast: Omit<Toast, 'id' | 'show'>) => void;
  removeToast: (id: string) => void;
  setUpdateAvailable: (isAvailable: boolean, info?: any) => void;
  setUpdateDownloaded: (isDownloaded: boolean) => void;
  
  // Legacy alias for easier migration
  setToaster: (toast: { type: any, message: string, show: boolean, duration?: number }) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasterQueue: [],
  updateAvailable: false,
  updateInfo: null,
  updateDownloaded: false,

  addToast: (toast) => set((state) => ({
    toasterQueue: [
      ...state.toasterQueue,
      {
        ...toast,
        id: uuidv4(),
        show: true,
        duration: toast.duration || 3000,
      }
    ]
  })),

  setToaster: (toast) => set((state) => ({
    toasterQueue: [
      ...state.toasterQueue,
      {
        id: uuidv4(),
        type: toast.type,
        message: toast.message,
        show: toast.show,
        duration: toast.duration || 3000,
      }
    ]
  })),

  removeToast: (id) => set((state) => ({
    toasterQueue: state.toasterQueue.filter((t) => t.id !== id)
  })),

  setUpdateAvailable: (isAvailable, info = null) => 
    set({ updateAvailable: isAvailable, updateInfo: info }),

  setUpdateDownloaded: (isDownloaded) => 
    set({ updateDownloaded: isDownloaded }),
}));

export default useUIStore;
