import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export async function renderByCuts({
  imageUrls,
  audioBlobs,
  subtitles,
  outputName = "shorts_final.mp4",
}: {
  imageUrls: string[]; // 5~6컷
  audioBlobs: Blob[]; // 자막 순서와 일치
  subtitles: string[]; // 자막 텍스트 (한 줄씩)
  outputName?: string;
}) {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  for (let i = 0; i < imageUrls.length; i++) {
    const imgBlob = await (await fetch(imageUrls[i])).blob();
    const audioBlob = audioBlobs[i];

    ffmpeg.FS("writeFile", `img${i}.jpg`, await fetchFile(imgBlob));
    ffmpeg.FS("writeFile", `audio${i}.mp3`, await fetchFile(audioBlob));
  }

  let concatList = "";

  for (let i = 0; i < imageUrls.length; i++) {
    await ffmpeg.run(
      "-loop", "1",
      "-i", `img${i}.jpg`,
      "-i", `audio${i}.mp3`,
      "-shortest",
      "-vf", `drawtext=text='${subtitles[i]}':fontcolor=white:x=(w-text_w)/2:y=h-100`,
      "-c:v", "libx264",
      "-c:a", "aac",
      "-tune", "stillimage",
      "-t", "6", // 컷당 6초
      `out${i}.mp4`
    );
    concatList += `file 'out${i}.mp4'\n`;
  }

  ffmpeg.FS("writeFile", "list.txt", concatList);

  await ffmpeg.run(
    "-f", "concat",
    "-safe", "0",
    "-i", "list.txt",
    "-c", "copy",
    outputName
  );

  const data = ffmpeg.FS("readFile", outputName);
  return new Blob([data.buffer], { type: "video/mp4" });
} 