import { useState } from 'react';
import { useStore } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';

interface Subtitle {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  position: 'top' | 'middle' | 'bottom';
}

export function SubtitleTab() {
  const {
    selectedScriptId,
    generatedScripts,
    subtitles,
    setSubtitles,
    textStyle
  } = useStore();
  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>(null);

  const selectedScript = generatedScripts.find(s => s.id === selectedScriptId);
  if (!selectedScript) return null;

  const handleAddSubtitle = (position: Subtitle['position']) => {
    const newSubtitle: Subtitle = {
      id: uuidv4(),
      text: '',
      startTime: 0,
      endTime: 3,
      position
    };
    setSubtitles([...subtitles, newSubtitle]);
    setSelectedSubtitleId(newSubtitle.id);
  };

  const handleUpdateSubtitle = (id: string, updates: Partial<Subtitle>) => {
    setSubtitles(subtitles.map(subtitle =>
      subtitle.id === id ? { ...subtitle, ...updates } : subtitle
    ));
  };

  const handleRemoveSubtitle = (id: string) => {
    setSubtitles(subtitles.filter(subtitle => subtitle.id !== id));
    if (selectedSubtitleId === id) {
      setSelectedSubtitleId(null);
    }
  };

  const handleMoveSubtitle = (id: string, direction: 'up' | 'down') => {
    const index = subtitles.findIndex(subtitle => subtitle.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === subtitles.length - 1)
    ) return;

    const newSubtitles = [...subtitles];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSubtitles[index], newSubtitles[newIndex]] = [newSubtitles[newIndex], newSubtitles[index]];
    setSubtitles(newSubtitles);
  };

  const renderPreview = () => {
    const topSubtitles = subtitles.filter(s => s.position === 'top');
    const middleSubtitles = subtitles.filter(s => s.position === 'middle');
    const bottomSubtitles = subtitles.filter(s => s.position === 'bottom');

    return (
      <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
        <div className="absolute top-4 w-full text-center" style={textStyle}>
          {topSubtitles.map(s => s.text).join('\n')}
        </div>
        <div className="absolute top-1/3 w-full text-center" style={textStyle}>
          {middleSubtitles.map(s => s.text).join('\n')}
        </div>
        <div className="absolute bottom-4 w-full text-center" style={textStyle}>
          {bottomSubtitles.map(s => s.text).join('\n')}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* 자막 편집 영역 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">자막 편집</h2>
          
          <div className="space-y-2">
            <button
              onClick={() => handleAddSubtitle('top')}
              className="w-full p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              상단 자막 추가
            </button>
            <button
              onClick={() => handleAddSubtitle('middle')}
              className="w-full p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              중앙 자막 추가
            </button>
            <button
              onClick={() => handleAddSubtitle('bottom')}
              className="w-full p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              하단 자막 추가
            </button>
          </div>

          {subtitles.length > 0 && (
            <div className="space-y-4">
              {subtitles.map((subtitle, index) => (
                <div
                  key={subtitle.id}
                  className={`p-4 border rounded-lg ${
                    selectedSubtitleId === subtitle.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedSubtitleId(subtitle.id)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSubtitle(subtitle.id, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSubtitle(subtitle.id, 'down');
                      }}
                      disabled={index === subtitles.length - 1}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSubtitle(subtitle.id);
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                    <span className="text-sm text-gray-500">
                      {subtitle.position === 'top' ? '상단' :
                       subtitle.position === 'middle' ? '중앙' : '하단'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={subtitle.text}
                      onChange={(e) => handleUpdateSubtitle(subtitle.id, { text: e.target.value })}
                      placeholder="자막 텍스트를 입력하세요"
                      className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm text-gray-600">시작 시간 (초)</label>
                        <input
                          type="number"
                          min="0"
                          value={subtitle.startTime}
                          onChange={(e) => handleUpdateSubtitle(subtitle.id, { startTime: Number(e.target.value) })}
                          className="w-full p-1 border rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">종료 시간 (초)</label>
                        <input
                          type="number"
                          min="0"
                          value={subtitle.endTime}
                          onChange={(e) => handleUpdateSubtitle(subtitle.id, { endTime: Number(e.target.value) })}
                          className="w-full p-1 border rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 미리보기 영역 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">미리보기</h2>
          {renderPreview()}
        </div>
      </div>
    </div>
  );
} 