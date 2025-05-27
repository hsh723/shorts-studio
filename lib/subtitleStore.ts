import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface SubtitleState {
  subtitles: Subtitle[];
  currentTime: number;
  addSubtitle: (subtitle: Omit<Subtitle, 'id'>) => void;
  updateSubtitle: (id: string, update: Partial<Subtitle>) => void;
  removeSubtitle: (id: string) => void;
  setCurrentTime: (time: number) => void;
}

export const useSubtitleStore = create<SubtitleState>((set) => ({
  subtitles: [],
  currentTime: 0,
  addSubtitle: (subtitle) =>
    set((state) => ({
      subtitles: [...state.subtitles, { ...subtitle, id: uuidv4() }],
    })),
  updateSubtitle: (id, update) =>
    set((state) => ({
      subtitles: state.subtitles.map((s) =>
        s.id === id ? { ...s, ...update } : s
      ),
    })),
  removeSubtitle: (id) =>
    set((state) => ({
      subtitles: state.subtitles.filter((s) => s.id !== id),
    })),
  setCurrentTime: (time) => set({ currentTime: time }),
})); 