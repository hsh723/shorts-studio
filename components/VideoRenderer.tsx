import React, { useState, useEffect } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import type { VideoRendererProps } from "../types/shorts";

const ffmpeg = createFFmpeg({ 
  log: true,
  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js"
});

export default function VideoRenderer({
  imageUrl,
  audioUrl,
  subtitleText,
  onError
}: VideoRendererProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // FFmpeg 초기 로드
    const loadFFmpeg = async () => {
      try {
        if (!ffmpeg.isLoaded()) {
          await ffmpeg.load();
        }
      } catch (error) {
        onError?.("FFmpeg 로드 실패");
        console.error("FFmpeg 로드 오류:", error);
      }
    };

    loadFFmpeg();
  }, []);

  const generateVideo = async () => {
    if (!imageUrl || !audioUrl) {
      onError?.("이미지와 오디오가 필요합니다");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // 파일 준비
      ffmpeg.FS("writeFile", "image.jpg", await fetchFile(imageUrl));
      ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(audioUrl));

      // 자막 생성
      const subtitle = `1
00:00:00,000 --> 00:00:04,000
${subtitleText}`;

      ffmpeg.FS("writeFile", "subs.srt", new TextEncoder().encode(subtitle));

      // 진행률 모니터링
      ffmpeg.setProgress(({ ratio }) => {
        setProgress(Math.round(ratio * 100));
      });

      // 비디오 생성
      await ffmpeg.run(
        "-loop", "1",
        "-i", "image.jpg",
        "-i", "audio.mp3",
        "-vf", "subtitles=subs.srt:force_style='FontSize=24,PrimaryColour=&HFFFFFF&'",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-t", "4",
        "-pix_fmt", "yuv420p",
        "-y", "output.mp4"
      );

      // 결과 처리
      const data = ffmpeg.FS("readFile", "output.mp4");
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      setVideoUrl(url);

      // 메모리 정리
      ffmpeg.FS("unlink", "image.jpg");
      ffmpeg.FS("unlink", "audio.mp3");
      ffmpeg.FS("unlink", "subs.srt");
      ffmpeg.FS("unlink", "output.mp4");

    } catch (error) {
      onError?.(error instanceof Error ? error.message : "비디오 생성 중 오류가 발생했습니다");
      console.error("비디오 생성 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-gray-900 p-4 rounded-lg">
      <h3 className="font-bold text-lg">🎬 영상 렌더링</h3>

      <div className="space-y-3">
        <button
          onClick={generateVideo}
          disabled={loading || !imageUrl || !audioUrl}
          className="w-full px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              렌더링 중... {progress}%
            </span>
          ) : (
            "🎞 영상 만들기"
          )}
        </button>

        {videoUrl && (
          <div className="space-y-2">
            <video 
              src={videoUrl} 
              controls 
              className="w-full rounded-lg shadow-lg bg-black"
            />
            <a
              href={videoUrl}
              download="shorts.mp4"
              className="block w-full text-center py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
            >
              📥 다운로드
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 