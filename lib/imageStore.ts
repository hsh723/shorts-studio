import { create } from 'zustand';
import { StateCreator } from 'zustand';

export interface Scene {
  id: string;
  number: number;
  prompt: string;
  imageUrl: string | null;
  isUploaded: boolean;
}

interface ImageState {
  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const useImageStore = create<ImageState>((set: StateCreator<ImageState>['setState']) => ({
  scenes: [],
  setScenes: (scenes: Scene[]) => set({ scenes }),
  updateScene: (id: string, updates: Partial<Scene>) => 
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === id ? { ...scene, ...updates } : scene
      ),
    })),
  isGenerating: false,
  setIsGenerating: (isGenerating: boolean) => set({ isGenerating })
})); 