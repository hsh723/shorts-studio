import { useState } from 'react';
import { useStore } from '../lib/store';
import { generateImagePrompt } from '../lib/imagePromptGenerator';

const imageStyleMap: Record<string, string> = {
  '극사실주의': 'in hyper-realistic photography style',
  '만화 스타일': 'in comic book style, manga, line art',
  '픽사 스타일': '3D animated, Pixar-like character',
  '수채화': 'in watercolor painting style',
  '디지털 아트': 'digital illustration, fantasy concept art'
};

export function ImageGenerationTab() {
  const {
    selectedScriptId,
    generatedScripts,
    imageStyle,
    setImageStyle,
    generatedImages,
    setGeneratedImages,
    uploadedImages,
    setUploadedImages
  } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');

  const selectedScript = generatedScripts.find(s => s.id === selectedScriptId);
  if (!selectedScript) return null;

  const handleGenerate = async () => {
    if (!imagePrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImages([...generatedImages, data.imageUrl]);
      }
    } catch (error) {
      console.error('이미지 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImages([...uploadedImages, url]);
    }
  };

  const handlePromptGenerate = () => {
    const prompt = generateImagePrompt(selectedScript.content.middle, [], imageStyle);
    setImagePrompt(prompt);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">이미지 스타일 설정</h2>
        <select
          value={imageStyle}
          onChange={(e) => setImageStyle(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Object.keys(imageStyleMap).map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">이미지 프롬프트</h2>
        <div className="flex space-x-2">
          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="이미지 생성을 위한 프롬프트를 입력하세요"
            className="flex-1 h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handlePromptGenerate}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            프롬프트 생성
          </button>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !imagePrompt.trim()}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium
            ${isGenerating || !imagePrompt.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isGenerating ? '생성 중...' : '이미지 생성하기'}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">이미지 업로드</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {(generatedImages.length > 0 || uploadedImages.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">생성된 이미지</h2>
          <div className="grid grid-cols-2 gap-4">
            {generatedImages.map((url, index) => (
              <div key={`generated-${index}`} className="relative aspect-[9/16]">
                <img
                  src={url}
                  alt={`Generated ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
            {uploadedImages.map((url, index) => (
              <div key={`uploaded-${index}`} className="relative aspect-[9/16]">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 