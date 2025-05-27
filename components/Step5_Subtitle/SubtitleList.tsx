import { useSubtitleStore } from '../../lib/subtitleStore';
import { SubtitleBlockEditor } from './SubtitleBlockEditor';

export function SubtitleList() {
  const { subtitles, currentTime, setCurrentTime } = useSubtitleStore();

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="space-y-4">
      {subtitles.map((subtitle) => (
        <SubtitleBlockEditor
          key={subtitle.id}
          subtitle={subtitle}
          isCurrent={currentTime >= subtitle.startTime && currentTime <= subtitle.endTime}
          onTimeChange={handleTimeChange}
        />
      ))}
    </div>
  );
} 