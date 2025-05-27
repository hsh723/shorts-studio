import { useState } from 'react';
import { useStore } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';

interface Scene {
  id: string;
  imageUrl: string;
  duration: number;
  transition: 'fade' | 'slide' | 'zoom';
}

export function SceneLayoutTab() {
  const {
    generatedImages,
    uploadedImages,
    scenes,
    setScenes
  } = useStore();
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const allImages = [...generatedImages, ...uploadedImages];

  const handleAddScene = (imageUrl: string) => {
    const newScene: Scene = {
      id: uuidv4(),
      imageUrl,
      duration: 3,
      transition: 'fade'
    };
    setScenes([...scenes, newScene]);
  };

  const handleUpdateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(scenes.map(scene => 
      scene.id === id ? { ...scene, ...updates } : scene
    ));
  };

  const handleRemoveScene = (id: string) => {
    setScenes(scenes.filter(scene => scene.id !== id));
    if (selectedSceneId === id) {
      setSelectedSceneId(null);
    }
  };

  const handleMoveScene = (id: string, direction: 'up' | 'down') => {
    const index = scenes.findIndex(scene => scene.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === scenes.length - 1)
    ) return;

    const newScenes = [...scenes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newScenes[index], newScenes[newIndex]] = [newScenes[newIndex], newScenes[index]];
    setScenes(newScenes);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* 이미지 선택 영역 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">이미지 선택</h2>
          <div className="grid grid-cols-2 gap-4">
            {allImages.map((url, index) => (
              <div
                key={`image-${index}`}
                className="relative aspect-[9/16] cursor-pointer group"
                onClick={() => handleAddScene(url)}
              >
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100">추가하기</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 장면 편집 영역 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">장면 편집</h2>
          {scenes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              왼쪽에서 이미지를 선택하여 장면을 추가하세요
            </div>
          ) : (
            <div className="space-y-4">
              {scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className={`p-4 border rounded-lg ${
                    selectedSceneId === scene.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedSceneId(scene.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-24 aspect-[9/16]">
                      <img
                        src={scene.imageUrl}
                        alt={`Scene ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveScene(scene.id, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveScene(scene.id, 'down');
                          }}
                          disabled={index === scenes.length - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveScene(scene.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm text-gray-600">지속 시간 (초)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={scene.duration}
                            onChange={(e) => handleUpdateScene(scene.id, { duration: Number(e.target.value) })}
                            className="w-20 p-1 border rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600">전환 효과</label>
                          <select
                            value={scene.transition}
                            onChange={(e) => handleUpdateScene(scene.id, { transition: e.target.value as Scene['transition'] })}
                            className="w-full p-1 border rounded"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="fade">페이드</option>
                            <option value="slide">슬라이드</option>
                            <option value="zoom">줌</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 