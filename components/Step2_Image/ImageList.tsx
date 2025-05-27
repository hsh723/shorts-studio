import { useEffect } from 'react';
import { useScriptStore } from '../../lib/scriptStore';
import { useImageStore, Scene } from '../../lib/imageStore';
import { SceneCard } from './SceneCard';
import { v4 as uuidv4 } from 'uuid';

export function ImageList() {
  const { selectedScriptId, generatedScripts } = useScriptStore();
  const { scenes, setScenes } = useImageStore();

  useEffect(() => {
    const selectedScript = generatedScripts.find(s => s.id === selectedScriptId);
    if (!selectedScript) return;

    // 대본 내용을 5개의 장면으로 나누기
    const content = selectedScript.content;
    const lines = content.split('\n').filter(Boolean);
    const scenesPerLine = Math.ceil(lines.length / 5);
    
    const newScenes: Scene[] = Array.from({ length: 5 }, (_, i) => {
      const start = i * scenesPerLine;
      const end = Math.min(start + scenesPerLine, lines.length);
      const sceneContent = lines.slice(start, end).join('\n');
      
      return {
        id: uuidv4(),
        number: i + 1,
        prompt: `Create a cinematic image for a short video scene: ${sceneContent}`,
        imageUrl: null,
        isUploaded: false
      };
    });

    setScenes(newScenes);
  }, [selectedScriptId, generatedScripts, setScenes]);

  if (scenes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">장면 이미지</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scenes.map((scene) => (
          <SceneCard key={scene.id} scene={scene} />
        ))}
      </div>
    </div>
  );
} 