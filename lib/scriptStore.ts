import { create } from 'zustand';
import { StateCreator } from 'zustand';

export interface Script {
  id: string;
  title: string;
  content: string;
  prompt: string;
}

interface ScriptState {
  prompt: string;
  setPrompt: (prompt: string) => void;
  generatedScripts: Script[];
  setGeneratedScripts: (scripts: Script[]) => void;
  selectedScriptId: string | null;
  setSelectedScriptId: (id: string | null) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const useScriptStore = create<ScriptState>((set: StateCreator<ScriptState>['setState']) => ({
  prompt: '',
  setPrompt: (prompt: string) => set({ prompt }),
  generatedScripts: [],
  setGeneratedScripts: (scripts: Script[]) => set({ generatedScripts: scripts }),
  selectedScriptId: null,
  setSelectedScriptId: (id: string | null) => set({ selectedScriptId: id }),
  isGenerating: false,
  setIsGenerating: (isGenerating: boolean) => set({ isGenerating })
})); 