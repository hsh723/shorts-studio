import type { NextApiRequest, NextApiResponse } from 'next';

// 진행률 상태를 저장할 Map
const progressMap = new Map<string, { progress: number; message: string }>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 클라이언트 연결 시 초기 상태 전송
  const sendProgress = () => {
    const state = progressMap.get(sessionId);
    if (state) {
      res.write(`data: ${JSON.stringify(state)}\n\n`);
    }
  };

  // 1초마다 진행률 전송
  const interval = setInterval(sendProgress, 1000);

  // 클라이언트 연결 종료 시 정리
  req.on('close', () => {
    clearInterval(interval);
    progressMap.delete(sessionId);
  });
}

// 진행률 업데이트 함수 (외부에서 호출)
export function updateProgress(sessionId: string, progress: number, message: string) {
  progressMap.set(sessionId, { progress, message });
}

// 진행률 초기화 함수
export function resetProgress(sessionId: string) {
  progressMap.delete(sessionId);
} 