import { useState } from 'react';
import { Subtitle, useSubtitleStore } from '../../lib/subtitleStore';

interface SubtitleBlockEditorProps {
  subtitle: Subtitle;
  isCurrent: boolean;
  onTimeChange: (time: number) => void;
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

const parseTime = (timeStr: string): number => {
  const [time, ms] = timeStr.split('.');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + Number(ms);
};

export function SubtitleBlockEditor({ subtitle, isCurrent, onTimeChange }: SubtitleBlockEditorProps) {
  const { updateSubtitle, removeSubtitle } = useSubtitleStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleTextChange = (text: string) => {
    updateSubtitle(subtitle.id, { text });
  };

  const handleStartTimeChange = (timeStr: string) => {
    const startTime = parseTime(timeStr);
    if (startTime < subtitle.endTime) {
      updateSubtitle(subtitle.id, { startTime });
    }
  };

  const handleEndTimeChange = (timeStr: string) => {
    const endTime = parseTime(timeStr);
    if (endTime > subtitle.startTime) {
      updateSubtitle(subtitle.id, { endTime });
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', subtitle.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-colors
        ${isCurrent ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}
        ${isDragging ? 'opacity-50' : ''}
      `}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={formatTime(subtitle.startTime)}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="w-32 px-2 py-1 text-sm border rounded"
            onClick={() => onTimeChange(subtitle.startTime)}
          />
          <span className="text-gray-500">→</span>
          <input
            type="text"
            value={formatTime(subtitle.endTime)}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            className="w-32 px-2 py-1 text-sm border rounded"
            onClick={() => onTimeChange(subtitle.endTime)}
          />
        </div>
        <button
          onClick={() => removeSubtitle(subtitle.id)}
          className="text-red-500 hover:text-red-700"
        >
          삭제
        </button>
      </div>

      <textarea
        value={subtitle.text}
        onChange={(e) => handleTextChange(e.target.value)}
        className="w-full p-2 border rounded-lg resize-none"
        rows={2}
        placeholder="자막 텍스트를 입력하세요"
      />
    </div>
  );
} 