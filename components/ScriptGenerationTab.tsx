import { useState } from 'react';
import { useStore } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';

export function ScriptGenerationTab() {
  const { prompt, setPrompt, generatedScripts, setGeneratedScripts, selectedScriptId, setSelectedScriptId } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!data.result) return;

      const lines = data.result.split('\n').filter(Boolean);
      const newScript = {
        id: uuidv4(),
        content: {
          top: lines[0] || '',
          middle: lines[1] || '',
          bottom: lines[2] || '',
        },
        prompt,
      };

      setGeneratedScripts([...generatedScripts, newScript]);
    } catch (error) {
      console.error('대본 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (scriptId: string) => {
    const script = generatedScripts.find(s => s.id === scriptId);
    if (!script) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: script.prompt }),
      });

      const data = await res.json();
      if (!data.result) return;

      const lines = data.result.split('\n').filter(Boolean);
      const updatedScript = {
        ...script,
        content: {
          top: lines[0] || '',
          middle: lines[1] || '',
          bottom: lines[2] || '',
        },
      };

      setGeneratedScripts(generatedScripts.map(s => 
        s.id === scriptId ? updatedScript : s
      ));
    } catch (error) {
      console.error('대본 재생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">프롬프트 입력</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="숏츠 영상의 주제나 내용을 입력하세요"
          className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium
            ${isGenerating || !prompt.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isGenerating ? '생성 중...' : '대본 생성하기'}
        </button>
      </div>

      {generatedScripts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">생성된 대본</h2>
          <div className="grid gap-4">
            {generatedScripts.map((script) => (
              <div
                key={script.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors
                  ${selectedScriptId === script.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                  }`}
                onClick={() => setSelectedScriptId(script.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">프롬프트: {script.prompt}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerate(script.id);
                    }}
                    disabled={isGenerating}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    재생성
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">상단: {script.content.top}</p>
                  <p className="font-medium">중단: {script.content.middle}</p>
                  <p className="font-medium">하단: {script.content.bottom}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 