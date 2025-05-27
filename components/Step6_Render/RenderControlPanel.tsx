import { useRenderStore } from '../../lib/renderStore';
import { useRouter } from 'next/router';
import { useSubtitleStore } from '../../lib/subtitleStore';
import { useEffect, useRef } from 'react';

export function RenderControlPanel() {
  const router = useRouter();
  const {
    status,
    progress,
    error,
    finalVideoUrl,
    options,
    setStatus,
    setProgress,
    setError,
    setFinalVideoUrl,
    reset,
  } = useRenderStore();

  const { subtitles } = useSubtitleStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleRender = async () => {
    try {
      setStatus('rendering');
      setError(null);

      // 세션 ID 생성
      const sessionId = Date.now().toString();

      // SSE 연결 설정
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      eventSourceRef.current = new EventSource(`/api/render/progress?sessionId=${sessionId}`);
      
      eventSourceRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setProgress(data.progress);
        
        if (data.progress === 100) {
          eventSourceRef.current?.close();
        }
      };

      eventSourceRef.current.onerror = () => {
        eventSourceRef.current?.close();
        setError('진행률 업데이트 연결 실패');
      };

      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          images: [], // 이미지 데이터
          audioPath: '', // 음성 파일 경로
          subtitles,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error('렌더링 중 오류가 발생했습니다');
      }

      const data = await response.json();
      setFinalVideoUrl(data.videoUrl);
      setStatus('completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      setStatus('error');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    }
  };

  const handleDownload = async (type: 'mp4' | 'srt' | 'json') => {
    try {
      let url = '';
      let filename = '';

      switch (type) {
        case 'mp4':
          if (!finalVideoUrl) return;
          url = `/api/download/mp4?filename=${encodeURIComponent(finalVideoUrl.split('/').pop() || '')}`;
          filename = 'video.mp4';
          break;
        case 'srt':
          url = '/api/download/srt';
          filename = 'shorts.srt';
          break;
        case 'json':
          url = '/api/download/json';
          filename = 'project.json';
          break;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('다운로드 실패');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError('다운로드 중 오류가 발생했습니다');
    }
  };

  const handleNewProject = () => {
    reset();
    router.push('/');
  };

  if (status === 'completed') {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={() => handleDownload('mp4')}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            MP4 다운로드
          </button>
          <button
            onClick={() => handleDownload('srt')}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            SRT 다운로드
          </button>
          <button
            onClick={() => handleDownload('json')}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            JSON 다운로드
          </button>
        </div>
        <button
          onClick={handleNewProject}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          새 프로젝트 시작
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {status === 'rendering' && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            {progress}% 완료
          </p>
        </div>
      )}

      <button
        onClick={handleRender}
        disabled={status === 'rendering'}
        className={`w-full px-4 py-2 rounded-lg text-white
          ${status === 'rendering'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
          }`}
      >
        {status === 'rendering' ? '렌더링 중...' : '렌더링 시작'}
      </button>
    </div>
  );
} 