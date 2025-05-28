import type { NextApiRequest, NextApiResponse } from 'next';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, audioBlob, fontFile, subtitles } = req.body;

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    // 파일 등록
    ffmpeg.FS('writeFile', 'input.jpg', await fetchFile(await (await fetch(imageUrl)).blob()));
    ffmpeg.FS('writeFile', 'audio.mp3', await fetchFile(audioBlob));
    ffmpeg.FS('writeFile', 'font.ttf', await fetchFile(fontFile));

    // 자막 명령 생성
    const drawtextFilters = subtitles.map((s: any) => {
      const textEscaped = s.text.replace(/:/g, '\\:').replace(/'/g, "\\'");
      return `drawtext=fontfile=font.ttf:text='${textEscaped}':fontsize=32:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='between(t,${s.start},${s.end})'`;
    });

    const vf = drawtextFilters.join(',');

    await ffmpeg.run(
      '-loop', '1',
      '-t', `${subtitles[subtitles.length - 1].end}`,
      '-i', 'input.jpg',
      '-i', 'audio.mp3',
      '-vf', vf,
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      'output.mp4'
    );

    const data = ffmpeg.FS('readFile', 'output.mp4');
    
    // 파일 정리
    ffmpeg.FS('unlink', 'input.jpg');
    ffmpeg.FS('unlink', 'audio.mp3');
    ffmpeg.FS('unlink', 'font.ttf');
    ffmpeg.FS('unlink', 'output.mp4');

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename=output.mp4');
    res.send(Buffer.from(data.buffer));
  } catch (error) {
    console.error('FFmpeg processing error:', error);
    res.status(500).json({ error: 'Video processing failed' });
  }
} 