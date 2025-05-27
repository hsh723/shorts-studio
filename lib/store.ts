import { create } from 'zustand';
import type { SubtitleBlock } from './splitSubtitleByDuration';
import type { SpeechLine } from './types/speech';

interface Script {
  top: string;
  middle: string;
  bottom: string;
}

interface GeneratedScript {
  id: string;
  content: Script;
  prompt: string;
}

interface ImageStyle {
  name: string;
  prompt: string;
}

interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  position: 'top' | 'middle' | 'bottom';
}

interface AppState {
  // Step 1: Script Generation
  prompt: string;
  setPrompt: (prompt: string) => void;
  generatedScripts: GeneratedScript[];
  setGeneratedScripts: (scripts: GeneratedScript[]) => void;
  selectedScriptId: string | null;
  setSelectedScriptId: (id: string | null) => void;
  
  // Step 2: Image Generation
  imageStyle: string;
  setImageStyle: (style: string) => void;
  generatedImages: string[];
  setGeneratedImages: (images: string[]) => void;
  uploadedImages: string[];
  setUploadedImages: (images: string[]) => void;
  
  // Step 3: Scene Layout
  scenes: {
    id: string;
    imageUrl: string;
    position: { x: number; y: number };
    scale: number;
  }[];
  setScenes: (scenes: any[]) => void;
  
  // Step 4: Text Styling
  subtitleStyles: {
    top: SubtitleStyle;
    middle: SubtitleStyle;
    bottom: SubtitleStyle;
  };
  setSubtitleStyle: (position: 'top' | 'middle' | 'bottom', style: Partial<SubtitleStyle>) => void;
  
  // Step 5: Subtitle Editing
  subtitles: SubtitleBlock[];
  setSubtitles: (subtitles: SubtitleBlock[]) => void;
  speechLines: SpeechLine[];
  setSpeechLines: (lines: SpeechLine[]) => void;
  
  // Step 6: Final Rendering
  isRendering: boolean;
  setIsRendering: (isRendering: boolean) => void;
  finalVideoUrl: string | null;
  setFinalVideoUrl: (url: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // Step 1: Script Generation
  prompt: '',
  setPrompt: (prompt) => set({ prompt }),
  generatedScripts: [],
  setGeneratedScripts: (scripts) => set({ generatedScripts: scripts }),
  selectedScriptId: null,
  setSelectedScriptId: (id) => set({ selectedScriptId: id }),
  
  // Step 2: Image Generation
  imageStyle: '극사실주의',
  setImageStyle: (style) => set({ imageStyle: style }),
  generatedImages: [],
  setGeneratedImages: (images) => set({ generatedImages: images }),
  uploadedImages: [],
  setUploadedImages: (images) => set({ uploadedImages: images }),
  
  // Step 3: Scene Layout
  scenes: [],
  setScenes: (scenes) => set({ scenes }),
  
  // Step 4: Text Styling
  subtitleStyles: {
    top: {
      fontFamily: 'CookieRun Regular',
      fontSize: 24,
      color: '#ffffff',
      position: 'top'
    },
    middle: {
      fontFamily: 'CookieRun Regular',
      fontSize: 24,
      color: '#ffffff',
      position: 'middle'
    },
    bottom: {
      fontFamily: 'CookieRun Regular',
      fontSize: 24,
      color: '#ffffff',
      position: 'bottom'
    }
  },
  setSubtitleStyle: (position, style) => 
    set((state) => ({
      subtitleStyles: {
        ...state.subtitleStyles,
        [position]: { ...state.subtitleStyles[position], ...style }
      }
    })),
  
  // Step 5: Subtitle Editing
  subtitles: [],
  setSubtitles: (subtitles) => set({ subtitles }),
  speechLines: [],
  setSpeechLines: (lines) => set({ speechLines: lines }),
  
  // Step 6: Final Rendering
  isRendering: false,
  setIsRendering: (isRendering) => set({ isRendering }),
  finalVideoUrl: null,
  setFinalVideoUrl: (url) => set({ finalVideoUrl: url })
})); 