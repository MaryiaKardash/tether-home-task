import { create } from 'zustand';

interface LikesState {
  liked: Record<number, boolean>;
  toggle: (id: number) => void;
}

export const useLikes = create<LikesState>((set) => ({
  liked: {},
  toggle: (id) => set((state) => ({ liked: { ...state.liked, [id]: !state.liked[id] } })),
}));

export const useIsLiked = (id: number) => useLikes((state) => state.liked[id] === true);
