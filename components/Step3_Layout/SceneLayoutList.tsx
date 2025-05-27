import { useEffect } from 'react';
import { useImageStore } from '../../lib/imageStore';
import { useSceneConfigStore } from '../../lib/sceneConfigStore';
import { SceneLayoutCard } from './SceneLayoutCard';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function SceneLayoutList() {
  const { scenes, setScenes } = useImageStore();
  const { configs, setConfigs } = useSceneConfigStore();

  useEffect(() => {
    // 이미지 스토어의 장면이 변경되면 설정도 초기화
    const initialConfigs = scenes.map(scene => ({
      id: scene.id,
      viewMode: 'full' as const,
      effectType: 'none' as const,
      cropConfig: { x: 0, y: 0, width: 100, height: 100 },
      isConfigured: false
    }));
    setConfigs(initialConfigs);
  }, [scenes, setConfigs]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(scenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setScenes(items);
  };

  if (scenes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">장면 배치</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="scenes">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {scenes.map((scene, index) => (
                <Draggable
                  key={scene.id}
                  draggableId={scene.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <SceneLayoutCard
                        scene={scene}
                        index={index}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 