import { useEffect, useRef } from 'react';
import { useSubtitleStore } from '../../lib/subtitleStore';

interface SubtitlePreviewProps {
  videoUrl: string;
}

export function SubtitlePreview({ videoUrl }: SubtitlePreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentTime, setCurrentTime, subtitles } = useSubtitleStore();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime * 1000);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [setCurrentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = currentTime / 1000;
  }, [currentTime]);

  const currentSubtitle = subtitles.find(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full rounded-lg"
        controls
      />
      {currentSubtitle && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <div className="inline-block px-4 py-2 bg-black bg-opacity-75 text-white rounded-lg">
            {currentSubtitle.text}
          </div>
        </div>
      )}
    </div>
  );
} 