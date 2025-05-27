import { useState } from 'react';
import { Scene, useImageStore } from '../../lib/imageStore';
import { v4 as uuidv4 } from 'uuid';

interface SceneCardProps {
  scene: Scene;
}

export function SceneCard({ scene }: SceneCardProps) {
  const { updateScene, isGenerating, setIsGenerating } = useImageStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: scene.prompt }),
      });

      if (!response.ok) {
        throw new Error('이미지 생성에 실패했습니다');
      }

      const data = await response.json();
      updateScene(scene.id, {
        imageUrl: data.imageUrl,
        isUploaded: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 생성에 실패했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateScene(scene.id, {
        imageUrl: url,
        isUploaded: true
      });
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(scene.prompt);
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-bold mb-4">장면 {scene.number}</h3>
      
      {/* 프롬프트 영역 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">이미지 프롬프트</label>
          <button
            onClick={handleCopyPrompt}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            복사하기
          </button>
        </div>
        <p className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          {scene.prompt}
        </p>
      </div>

      {/* 이미지 영역 */}
      <div className="mb-4">
        {scene.imageUrl ? (
          <div className="relative aspect-[9/16] rounded-lg overflow-hidden">
            <img
              src={scene.imageUrl}
              alt={`장면 ${scene.number}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setIsPreviewOpen(true)}
            />
            {scene.isUploaded && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                업로드됨
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[9/16] bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">이미지 없음</p>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* 버튼 영역 */}
      <div className="flex space-x-2">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`flex-1 py-2 px-4 rounded-lg text-white font-medium
            ${isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isGenerating ? '생성 중...' : '다시 생성하기'}
        </button>
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <div className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-center cursor-pointer hover:bg-gray-200">
            이미지 업로드
          </div>
        </label>
      </div>

      {/* 이미지 미리보기 모달 */}
      {isPreviewOpen && scene.imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setIsPreviewOpen(false)}
        >
          <img
            src={scene.imageUrl}
            alt={`장면 ${scene.number} 미리보기`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
} 