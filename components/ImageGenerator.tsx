import React, { useState } from "react";
import type { ImageStyle } from "../types/shorts";

const IMAGE_STYLES: ImageStyle[] = [
  { id: "realistic", name: "극사실주의", prompt: "ultra realistic, high detail, 8K HDR" },
  { id: "cartoon", name: "만화 스타일", prompt: "cartoon style, vibrant colors, clean lines" },
  { id: "pixar", name: "픽사풍", prompt: "Pixar animation style, 3D rendered, cute" },
  { id: "anime", name: "애니메이션", prompt: "anime style, detailed, studio ghibli" },
  { id: "cyberpunk", name: "사이버펑크", prompt: "cyberpunk style, neon lights, futuristic" },
];

interface ImageGeneratorProps {
  onGenerated: (url: string) => void;
  onError?: (error: string) => void;
}

export default function ImageGenerator({ onGenerated, onError }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(IMAGE_STYLES[0]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onError?.("프롬프트를 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          stylePrompt: selectedStyle.prompt 
        }),
      });

      if (!response.ok) {
        throw new Error("이미지 생성 실패");
      }

      const data = await response.json();
      onGenerated(data.imageUrl);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-gray-900 p-4 rounded-lg">
      <h3 className="font-bold text-lg">🖼 중단 이미지 생성</h3>

      <div className="space-y-3">
        <div>
          <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-300 mb-1">
            이미지 설명
          </label>
          <input
            id="imagePrompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 밤에 몰래 돌아다니는 고양이"
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            스타일 선택
          </label>
          <div className="grid grid-cols-2 gap-2">
            {IMAGE_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={`p-3 rounded-lg transition-all text-left ${
                  selectedStyle.id === style.id
                    ? "bg-gray-700 ring-2 ring-yellow-400"
                    : "bg-gray-800 hover:bg-gray-700/70"
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "🎨 생성 중..." : "✨ 이미지 생성"}
        </button>
      </div>
    </div>
  );
}

export { IMAGE_STYLES }; 