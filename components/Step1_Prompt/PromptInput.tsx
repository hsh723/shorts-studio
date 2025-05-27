import { useState } from 'react';
import { useScriptStore, Script } from '../../lib/scriptStore';
import { v4 as uuidv4 } from 'uuid';

interface GeneratedScript {
  title: string;
  content: string;
}

export function PromptInput() {
  const { prompt, setPrompt, setGeneratedScripts, setIsGenerating } = useScriptStore();
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('대본 생성에 실패했습니다');
      }

      const data = await response.json();
      const scripts: Script[] = data.scripts.map((script: GeneratedScript) => ({
        id: uuidv4(),
        title: script.title,
        content: script.content,
        prompt,
      }));

      setGeneratedScripts(scripts);
    } catch (err) {
      setError(err instanceof Error ? err.message : '대본 생성에 실패했습니다. 다시 시도해주세요');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="무엇에 대한 숏츠를 만들까요?"
          className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim()}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium
          ${!prompt.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        스크립트 생성하기
      </button>
    </div>
  );
} 