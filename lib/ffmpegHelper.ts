/**
 * FFmpeg WebAssembly 클라이언트 사이드 비디오 처리 유틸리티
 * 
 * 주의사항:
 * 1. 현재 클라이언트 사이드에서 FFmpeg.wasm을 사용하여 처리하고 있습니다.
 * 2. Replit 환경에서는 리소스 제한으로 인해 대용량 파일 처리에 제한이 있을 수 있습니다.
 * 3. 향후 서버 사이드 렌더링으로 전환을 고려해야 합니다:
 *    - Node.js + FFmpeg 서버 구현
 *    - AWS Lambda + FFmpeg 레이어
 *    - Cloudflare Workers + FFmpeg
 */

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import type { SubtitleBlock } from "./splitSubtitleByDuration";

const ffmpeg = createFFmpeg({ log: true });

export async function generateVideoWithSubtitles({
  imageUrl,
  audioBlob,
  fontFile,
  subtitles,
  outputName = "shorts_subtitled.mp4",
}: {
  imageUrl: string;
  audioBlob: Blob;
  fontFile: File;
  subtitles: SubtitleBlock[];
  outputName?: string;
}) {
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  // 파일 등록
  ffmpeg.FS("writeFile", "input.jpg", await fetchFile(await (await fetch(imageUrl)).blob()));
  ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(audioBlob));
  ffmpeg.FS("writeFile", "font.ttf", await fetchFile(fontFile));

  // 자막 명령 생성
  const drawtextFilters = subtitles.map((s, i) => {
    const textEscaped = s.text.replace(/:/g, "\\:").replace(/'/g, "\\'");
    return `drawtext=fontfile=font.ttf:text='${textEscaped}':fontsize=32:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='between(t,${s.start},${s.end})'`;
  });

  const vf = drawtextFilters.join(",");

  await ffmpeg.run(
    "-loop", "1",
    "-t", `${subtitles[subtitles.length - 1].end}`,
    "-i", "input.jpg",
    "-i", "audio.mp3",
    "-vf", vf,
    "-c:v", "libx264",
    "-tune", "stillimage",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    outputName
  );

  const data = ffmpeg.FS("readFile", outputName);
  return new Blob([data.buffer], { type: "video/mp4" });
} 