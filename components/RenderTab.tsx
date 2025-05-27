import { useState } from 'react';
import { useStore } from '../lib/store';

export function RenderTab() {
  const {
    scenes,
    subtitles,
    textStyle,
    fontFile,
    setFinalVideoUrl
  } = useStore();
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleRender = async () => {
    if (scenes.length === 0) {
      setError('장면이 없습니다. 장면 배치 탭에서 장면을 추가해주세요.');
      return;
    }

    if (!fontFile) {
      setError('폰트 파일이 없습니다. 텍스트 스타일 탭에서 폰트를 업로드해주세요.');
      return;
    }

    setIsRendering(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('scenes', JSON.stringify(scenes));
      formData.append('subtitles', JSON.stringify(subtitles));
      formData.append('textStyle', JSON.stringify(textStyle));
      formData.append('font', fontFile);

      const response = await fetch('/api/render', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('렌더링 실패');
      }

      const data = await response.json();
      setFinalVideoUrl(data.videoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '렌더링 중 오류가 발생했습니다.');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">최종 렌더링</h2>

        {/* 상태 표시 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>장면 수</span>
              <span className="font-medium">{scenes.length}개</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>자막 수</span>
              <span className="font-medium">{subtitles.length}개</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>폰트</span>
              <span className="font-medium">{fontFile ? fontFile.name : '없음'}</span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {isRendering && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                렌더링 중... {progress}%
              </p>
            </div>
          )}

          <button
            onClick={handleRender}
            disabled={isRendering || scenes.length === 0 || !fontFile}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium
              ${isRendering || scenes.length === 0 || !fontFile
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isRendering ? '렌더링 중...' : '영상 렌더링하기'}
          </button>
        </div>

        {/* 렌더링 가이드 */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">렌더링 가이드</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>모든 장면과 자막이 준비되었는지 확인해주세요.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>폰트 파일이 업로드되어 있는지 확인해주세요.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>렌더링 버튼을 클릭하면 영상이 생성됩니다.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>렌더링이 완료되면 자동으로 다운로드 링크가 생성됩니다.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 