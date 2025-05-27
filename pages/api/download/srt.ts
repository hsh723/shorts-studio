import type { NextApiRequest, NextApiResponse } from 'next';

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 자막 데이터를 가져오는 로직 (예: DB 또는 파일에서)
    const subtitles = [
      {
        startTime: 0,
        endTime: 4000,
        text: '첫 번째 자막입니다.'
      },
      {
        startTime: 4000,
        endTime: 8000,
        text: '두 번째 자막입니다.'
      }
    ];

    // SRT 형식으로 변환
    const srtContent = subtitles
      .map((subtitle, index) => {
        const startTime = formatTime(subtitle.startTime);
        const endTime = formatTime(subtitle.endTime);
        return `${index + 1}\n${startTime} --> ${endTime}\n${subtitle.text}\n\n`;
      })
      .join('');

    // 응답 헤더 설정
    res.setHeader('Content-Type', 'text/srt');
    res.setHeader('Content-Disposition', 'attachment; filename="shorts.srt"');
    
    // SRT 파일 전송
    res.status(200).send(srtContent);

  } catch (error) {
    console.error('SRT 생성 에러:', error);
    return res.status(500).json({
      error: 'SRT 파일 생성 실패',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    });
  }
} 