import { Script, useScriptStore } from '../../lib/scriptStore';

interface ScriptCardProps {
  script: Script;
  isSelected: boolean;
}

interface GeneratedScript {
  title: string;
  content: string;
}

export function ScriptCard({ script, isSelected }: ScriptCardProps) {
  const { setSelectedScriptId, setGeneratedScripts, generatedScripts } = useScriptStore();

  const handleRegenerate = async () => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: script.prompt }),
      });

      if (!response.ok) {
        throw new Error('대본 재생성에 실패했습니다');
      }

      const data = await response.json();
      const newScript: Script = {
        ...script,
        title: data.scripts[0].title,
        content: data.scripts[0].content,
      };

      setGeneratedScripts(generatedScripts.map((s: Script) => 
        s.id === script.id ? newScript : s
      ));
    } catch (err) {
      console.error('대본 재생성 실패:', err);
    }
  };

  return (
    <div
      className={`p-6 border rounded-lg transition-colors cursor-pointer
        ${isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300'
        }`}
      onClick={() => setSelectedScriptId(script.id)}
    >
      <h3 className="text-xl font-bold mb-4 text-blue-600">{script.title}</h3>
      <p className="text-gray-700 whitespace-pre-line mb-6">{script.content}</p>
      <div className="flex justify-between items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRegenerate();
          }}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          재생성
        </button>
        {isSelected && (
          <span className="text-sm text-blue-600 font-medium">
            선택됨
          </span>
        )}
      </div>
    </div>
  );
} 