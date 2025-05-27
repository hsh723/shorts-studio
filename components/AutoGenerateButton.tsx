import React, { useState } from "react";
import type { AutoGenerateButtonProps } from "../types/shorts";

export default function AutoGenerateButton({ prompt, onResult, onError }: AutoGenerateButtonProps) {
  const [loading, setLoading] = useState(false);

  const generateAll = async () => {
    if (!prompt.trim()) {
      onError?.("프롬프트를 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      // 1. GPT로 대본 생성
      const scriptRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!scriptRes.ok) {
        throw new Error("대본 생성 실패");
      }

      const { title, script, hashtags } = await scriptRes.json();

      // 2. 제목 분리 및 기본 스타일 적용
      const titleLines = title.split("\n").map(text => ({
        text,
        fontSize: "20px",
        fontWeight: "bold",
      }));

      // 3. 자막 (첫 문장만)
      const subtitle = script.split(/[.!?]|\n/)[0] + ".";

      // 4. 이미지 생성
      const imageRes = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: subtitle,
          stylePrompt: "ultra realistic, cinematic lighting" 
        }),
      });

      if (!imageRes.ok) {
        throw new Error("이미지 생성 실패");
      }

      const { imageUrl } = await imageRes.json();

      // 5. 결과 전달
      onResult({
        titleParts: titleLines,
        subtitle,
        bottomText: hashtags || "#쇼츠 #유튜브",
        imageUrl,
      });

    } catch (error) {
      onError?.(error instanceof Error ? error.message : "자동 생성 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generateAll}
      disabled={loading || !prompt.trim()}
      className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          생성 중...
        </span>
      ) : (
        "🚀 원클릭 자동 생성"
      )}
    </button>
  );
} 