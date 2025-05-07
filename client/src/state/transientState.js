// transientState.js content with fixes
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

const useTransientStore = create((set) => ({
  // Store state
  patientID: "",
  interventions: [],
  phases: [],
  micros: [],
  wods: [],
  toaster_queue: [],
  data: [],
  columns: [],
  
  // Toaster setter
  setToaster: ({ type, message, show, duration }) => set((state) => {
    const id = uuidv4();
    const newToast = {
      id: id,
      type: type,
      message: message,
      show: show,
      duration: duration || 3000,
    };
    return { toaster_queue: [...state.toaster_queue, newToast] };
  }),
  
  removeToast: (id) => {
    set((state) => ({
      toaster_queue: state.toaster_queue.filter((toast) => toast.id !== id),
    }));
  },
}), { name: "transient-store" });

export default useTransientStore;
