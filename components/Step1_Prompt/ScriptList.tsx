import { useScriptStore, Script } from '../../lib/scriptStore';
import { ScriptCard } from './ScriptCard';

export function ScriptList() {
  const { generatedScripts, selectedScriptId } = useScriptStore();

  if (generatedScripts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">생성된 대본</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {generatedScripts.map((script: Script) => (
          <ScriptCard
            key={script.id}
            script={script}
            isSelected={script.id === selectedScriptId}
          />
        ))}
      </div>
    </div>
  );
} 