import { useState, useRef } from 'react';
import { Scene } from '../../lib/imageStore';
import { useSceneConfigStore, ViewMode, EffectType, CropConfig } from '../../lib/sceneConfigStore';
import { DragHandle } from './DragHandle';

interface SceneLayoutCardProps {
  scene: Scene;
  index: number;
}

export function SceneLayoutCard({ scene, index }: SceneLayoutCardProps) {
  const { configs, updateConfig } = useSceneConfigStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const config = configs.find(c => c.id === scene.id) || {
    id: scene.id,
    viewMode: 'full' as ViewMode,
    effectType: 'none' as EffectType,
    cropConfig: { x: 0, y: 0, width: 100, height: 100 },
    isConfigured: false
  };

  const handleViewModeChange = (mode: ViewMode) => {
    updateConfig(scene.id, {
      viewMode: mode,
      isConfigured: true
    });
  };

  const handleEffectChange = (effect: EffectType) => {
    updateConfig(scene.id, {
      effectType: effect,
      isConfigured: true
    });
  };

  const handleCropChange = (crop: CropConfig) => {
    updateConfig(scene.id, {
      cropConfig: crop,
      isConfigured: true
    });
  };

  const getEffectPreview = () => {
    if (!scene.imageUrl) return null;

    const style: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    };

    switch (config.effectType) {
      case 'zoom-in':
        return <div className="absolute inset-0 border-2 border-blue-500 rounded-lg" style={style}>
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-500 text-sm">확대</span>
          </div>
        </div>;
      case 'zoom-out':
        return <div className="absolute inset-0 border-2 border-blue-500 rounded-lg" style={style}>
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-500 text-sm">축소</span>
          </div>
        </div>;
      case 'pan-left':
      case 'pan-right':
      case 'pan-up':
      case 'pan-down':
        return <div className="absolute inset-0 border-2 border-blue-500 rounded-lg" style={style}>
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-500 text-sm">
              {config.effectType === 'pan-left' ? '←' :
               config.effectType === 'pan-right' ? '→' :
               config.effectType === 'pan-up' ? '↑' : '↓'}
            </span>
          </div>
        </div>;
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">장면 {index + 1}</h3>
        <DragHandle />
      </div>

      {/* 썸네일 이미지 */}
      <div className="relative aspect-[9/16] mb-4 rounded-lg overflow-hidden">
        {scene.imageUrl ? (
          <>
            <img
              ref={imageRef}
              src={scene.imageUrl}
              alt={`장면 ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {getEffectPreview()}
            {config.viewMode === 'crop' && (
              <div
                className="absolute border-2 border-yellow-500"
                style={{
                  left: `${config.cropConfig.x}%`,
                  top: `${config.cropConfig.y}%`,
                  width: `${config.cropConfig.width}%`,
                  height: `${config.cropConfig.height}%`
                }}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">이미지 없음</p>
          </div>
        )}
      </div>

      {/* 설정 컨트롤 */}
      <div className="space-y-4">
        {/* 보기 모드 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">보기 모드</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={config.viewMode === 'full'}
                onChange={() => handleViewModeChange('full')}
                className="mr-2"
              />
              전체 보기
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={config.viewMode === 'crop'}
                onChange={() => handleViewModeChange('crop')}
                className="mr-2"
              />
              일부 보기
            </label>
          </div>
        </div>

        {/* 효과 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이동 효과</label>
          <select
            value={config.effectType}
            onChange={(e) => handleEffectChange(e.target.value as EffectType)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="none">효과 없음</option>
            <option value="zoom-in">확대</option>
            <option value="zoom-out">축소</option>
            <option value="pan-left">좌→우 이동</option>
            <option value="pan-right">우→좌 이동</option>
            <option value="pan-up">하→상 이동</option>
            <option value="pan-down">상→하 이동</option>
          </select>
        </div>

        {/* 미리보기 버튼 */}
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          미리보기
        </button>
      </div>

      {/* 미리보기 모달 */}
      {isPreviewOpen && scene.imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative w-[90vw] max-w-md aspect-[9/16]">
            <img
              src={scene.imageUrl}
              alt={`장면 ${index + 1} 미리보기`}
              className="w-full h-full object-cover rounded-lg"
            />
            {/* 여기에 애니메이션 효과 추가 */}
          </div>
        </div>
      )}
    </div>
  );
} 