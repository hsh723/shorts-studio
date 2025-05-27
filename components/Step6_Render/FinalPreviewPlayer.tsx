import { useRenderStore } from '../../lib/renderStore';

export function FinalPreviewPlayer() {
  const { finalVideoUrl, status } = useRenderStore();

  if (status === 'rendering') {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">영상을 생성하는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!finalVideoUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">렌더링이 완료되면 영상이 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        src={finalVideoUrl}
        className="w-full h-full"
        controls
        autoPlay
      />
    </div>
  );
} 