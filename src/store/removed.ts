import { create } from 'zustand';

interface RemovedState {
  removed: Record<number, boolean>;
  remove: (id: number) => void;
}

export const useRemoved = create<RemovedState>((set) => ({
  removed: {},
  remove: (id) => set((state) => ({ removed: { ...state.removed, [id]: true } })),
}));
