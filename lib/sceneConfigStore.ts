import { create } from 'zustand';
import { StateCreator } from 'zustand';

export type ViewMode = 'full' | 'crop';
export type EffectType = 'none' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down';

export interface CropConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SceneConfig {
  id: string;
  viewMode: ViewMode;
  effectType: EffectType;
  cropConfig: CropConfig;
  isConfigured: boolean;
}

interface SceneConfigState {
  configs: SceneConfig[];
  setConfigs: (configs: SceneConfig[]) => void;
  updateConfig: (id: string, updates: Partial<SceneConfig>) => void;
  isAllConfigured: boolean;
}

export const useSceneConfigStore = create<SceneConfigState>((set, get) => ({
  configs: [],
  setConfigs: (configs) => set({ configs }),
  updateConfig: (id, updates) => 
    set((state) => ({
      configs: state.configs.map((config) =>
        config.id === id ? { ...config, ...updates } : config
      ),
    })),
  get isAllConfigured() {
    return get().configs.every(config => config.isConfigured);
  }
})); 