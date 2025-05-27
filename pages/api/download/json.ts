import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 프로젝트 데이터를 가져오는 로직 (예: DB 또는 파일에서)
    const projectData = {
      images: [
        {
          url: '/images/scene1.jpg',
          duration: 6000,
          transition: 'fade'
        },
        {
          url: '/images/scene2.jpg',
          duration: 6000,
          transition: 'slide'
        }
      ],
      subtitles: [
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
      ],
      style: {
        resolution: '1080p',
        includeSubtitles: true,
        removeWatermark: false
      }
    };

    // 응답 헤더 설정
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="project.json"');
    
    // JSON 파일 전송
    res.status(200).json(projectData);

  } catch (error) {
    console.error('JSON 생성 에러:', error);
    return res.status(500).json({
      error: 'JSON 파일 생성 실패',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    });
  }
} 