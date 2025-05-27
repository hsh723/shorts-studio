import { useImageStore } from '../../lib/imageStore';

interface CaptionSceneSelectorProps {
  selectedSceneId: string;
  onSceneSelect: (sceneId: string) => void;
}

export function CaptionSceneSelector({ selectedSceneId, onSceneSelect }: CaptionSceneSelectorProps) {
  const { scenes } = useImageStore();

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {scenes.map((scene, index) => (
        <button
          key={scene.id}
          onClick={() => onSceneSelect(scene.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors
            ${selectedSceneId === scene.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          장면 {index + 1}
        </button>
      ))}
    </div>
  );
} 