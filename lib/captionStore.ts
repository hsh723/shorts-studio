import { create } from 'zustand';
import { StateCreator } from 'zustand';

export type TextPosition = 'top' | 'middle' | 'bottom';

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  letterSpacing: number;
  lineHeight: number;
  backgroundColor: string;
  backgroundOpacity: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface Caption {
  id: string;
  sceneId: string;
  position: TextPosition;
  text: string;
  style: TextStyle;
}

interface CaptionState {
  captions: Caption[];
  setCaptions: (captions: Caption[]) => void;
  updateCaption: (id: string, updates: Partial<Caption>) => void;
  getCaptionsByScene: (sceneId: string) => Caption[];
  isAllConfigured: boolean;
}

const defaultStyle: TextStyle = {
  fontFamily: 'Pretendard',
  fontSize: 24,
  color: '#FFFFFF',
  letterSpacing: 0,
  lineHeight: 1.5,
  backgroundColor: '#000000',
  backgroundOpacity: 0.5,
  shadowColor: '#000000',
  shadowBlur: 4,
  shadowOffsetX: 0,
  shadowOffsetY: 2
};

export const useCaptionStore = create<CaptionState>((set, get) => ({
  captions: [],
  setCaptions: (captions) => set({ captions }),
  updateCaption: (id, updates) => 
    set((state) => ({
      captions: state.captions.map((caption) =>
        caption.id === id ? { ...caption, ...updates } : caption
      ),
    })),
  getCaptionsByScene: (sceneId) => 
    get().captions.filter(caption => caption.sceneId === sceneId),
  get isAllConfigured() {
    const scenes = new Set(get().captions.map(c => c.sceneId));
    return Array.from(scenes).every(sceneId => {
      const sceneCaptions = get().getCaptionsByScene(sceneId);
      return sceneCaptions.length === 3 && // top, middle, bottom
             sceneCaptions.every(c => c.text.trim() !== '');
    });
  }
})); 