import { useState } from 'react';
import { useSubtitleStore } from '../../lib/subtitleStore';
import { SubtitleList } from './SubtitleList';
import { SubtitlePreview } from './SubtitlePreview';

export function SubtitleTab() {
  const { addSubtitle } = useSubtitleStore();
  const [videoUrl, setVideoUrl] = useState<string>('');

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handleAddSubtitle = () => {
    addSubtitle({
      text: '',
      startTime: 0,
      endTime: 5000,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">자막 편집</h2>
        <div className="space-x-4">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
          >
            비디오 업로드
          </label>
          <button
            onClick={handleAddSubtitle}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            자막 추가
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">자막 목록</h3>
          <SubtitleList />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">미리보기</h3>
          {videoUrl ? (
            <SubtitlePreview videoUrl={videoUrl} />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <p className="text-gray-500">비디오를 업로드해주세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 