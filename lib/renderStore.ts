import { create } from 'zustand';

export type Resolution = '720p' | '1080p';

interface RenderOptions {
  resolution: Resolution;
  includeSubtitles: boolean;
  removeWatermark: boolean;
}

interface RenderState {
  options: RenderOptions;
  status: 'idle' | 'rendering' | 'completed' | 'error';
  progress: number;
  error: string | null;
  finalVideoUrl: string | null;
  setOptions: (options: Partial<RenderOptions>) => void;
  setStatus: (status: RenderState['status']) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setFinalVideoUrl: (url: string | null) => void;
  reset: () => void;
}

const initialState = {
  options: {
    resolution: '1080p' as Resolution,
    includeSubtitles: true,
    removeWatermark: false,
  },
  status: 'idle' as const,
  progress: 0,
  error: null,
  finalVideoUrl: null,
};

export const useRenderStore = create<RenderState>((set) => ({
  ...initialState,
  setOptions: (options) =>
    set((state) => ({
      options: { ...state.options, ...options },
    })),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  setFinalVideoUrl: (url) => set({ finalVideoUrl: url }),
  reset: () => set(initialState),
})); 