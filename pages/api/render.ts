import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { images, audioPath, subtitles, options } = req.body;

    // outputs 디렉토리 확인 및 생성
    const outputDir = path.join(process.cwd(), 'public', 'outputs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 타임스탬프를 포함한 고유한 출력 파일명 생성
    const timestamp = new Date().getTime();
    const outputPath = path.join(outputDir, `shorts_${timestamp}.mp4`);

    // 이미지 입력 문자열 생성
    const imageInputs = images
      .map((image: string, index: number) => `-loop 1 -t 6 -i ${image}`)
      .join(' ');

    // 자막 필터 생성
    const subtitleFilters = subtitles
      .map((subtitle: any, index: number) => {
        const startTime = subtitle.startTime / 1000; // ms to seconds
        const endTime = subtitle.endTime / 1000;
        return `drawtext=text='${subtitle.text}':fontsize=36:x=(w-text_w)/2:y=h-100:enable='between(t,${startTime},${endTime})'`;
      })
      .join(',');

    // 해상도 설정
    const resolution = options.resolution === '1080p' ? '1920:1080' : '1280:720';

    // ffmpeg 명령어 구성
    const command = `
      ffmpeg ${imageInputs} \
        -i ${audioPath} \
        -vf "${subtitleFilters}" \
        -c:v libx264 -c:a aac \
        -pix_fmt yuv420p \
        -s ${resolution} \
        -shortest \
        ${outputPath}
    `;

    // ffmpeg 실행
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.error('ffmpeg stderr:', stderr);
    }

    // 상대 경로로 변환
    const relativePath = `/outputs/shorts_${timestamp}.mp4`;

    res.status(200).json({
      message: '렌더링 완료',
      path: relativePath
    });

  } catch (error) {
    console.error('렌더링 에러:', error);
    res.status(500).json({
      error: '렌더링 실패',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
} 