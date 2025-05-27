import React, { useState } from "react";
import TitleEditor from './components/TitleEditor';
import type { StyledPart } from './types/shorts';
import SubtitleStylePicker, { SUBTITLE_STYLES } from './components/SubtitleStylePicker';
import HashtagEditor, { HASHTAG_STYLES } from './components/HashtagEditor';
import ImageGenerator from './components/ImageGenerator';
import ShortsPreview from './components/ShortsPreview';
import AutoGenerateButton from './components/AutoGenerateButton';
import TextEditorWithLivePreview from './components/TextEditorWithLivePreview';

export default function ShortsLayout() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [titleInput, setTitleInput] = useState(title || "첫째 줄\n둘째 줄");
  const [styledParts, setStyledParts] = useState<StyledPart[]>([
    { text: "첫째 줄" },
    { text: "둘째 줄" },
  ]);
  const [subtitleStyleId, setSubtitleStyleId] = useState(SUBTITLE_STYLES[0].id);
  const [subtitleClass, setSubtitleClass] = useState(SUBTITLE_STYLES[0].className);
  const [hashtagText, setHashtagText] = useState("#쇼츠 #유튜브");
  const [hashtagStyle, setHashtagStyle] = useState(HASHTAG_STYLES[0].className);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  const generateScript = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setTitle(data.title);
      setScript(data.script);
    } catch (error) {
      console.error("대본 생성 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-black text-white">
      {/* 좌측 미리보기 (고정) */}
      <div className="w-[360px] min-h-full flex flex-col items-center justify-start sticky top-0 bg-gray-900 border-r border-gray-700">
        <div className="mt-8">
          <ShortsPreview
            titleParts={styledParts}
            subtitle={script}
            subtitleClass={subtitleClass}
            bottomText={hashtagText}
            bottomStyle={hashtagStyle}
            imageUrl={imageUrl}
          />
        </div>
      </div>

      {/* 우측 설정 패널 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">프롬프트 입력</h2>
          <div className="space-y-4">
            <label htmlFor="prompt" className="sr-only">프롬프트 입력창</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="썰, 뉴스 등 흥미로운 소재 입력..."
              className="w-full h-40 p-4 rounded-lg bg-gray-800 text-white resize-none border border-gray-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
            />
            <div className="flex gap-3">
              <button 
                onClick={generateScript}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "생성 중..." : "🪄 대본 생성"}
              </button>
              <AutoGenerateButton
                prompt={prompt}
                onResult={({ titleParts, subtitle, bottomText, imageUrl }) => {
                  setStyledParts(titleParts);
                  setScript(subtitle);
                  setHashtagText(bottomText);
                  setImageUrl(imageUrl);
                }}
                onError={setError}
              />
            </div>
          </div>
        </div>

        {/* 제목 편집기 */}
        <TitleEditor
          value={titleInput}
          onChange={setTitleInput}
          styledParts={styledParts}
          onStyleChange={setStyledParts}
        />

        {/* 자막 스타일 선택기 */}
        <SubtitleStylePicker
          selectedId={subtitleStyleId}
          onSelect={(style) => {
            setSubtitleStyleId(style.id);
            setSubtitleClass(style.className);
          }}
        />

        {/* 생성된 결과 표시 */}
        {(title || script) && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">🎯 생성된 제목</h3>
              <div className="mt-2 p-4 bg-gray-800 rounded-lg">{title}</div>
            </div>
            <div>
              <h3 className="text-lg font-bold">📝 생성된 대본</h3>
              <pre className="mt-2 p-4 bg-gray-800 rounded-lg whitespace-pre-wrap">{script}</pre>
            </div>
          </div>
        )}

        {/* 해시태그 에디터 */}
        <HashtagEditor
          value={hashtagText}
          style={hashtagStyle}
          onChange={(text, style) => {
            setHashtagText(text);
            setHashtagStyle(style);
          }}
        />

        {/* 이미지 생성기 */}
        <ImageGenerator
          onGenerated={setImageUrl}
          onError={setError}
        />

        {/* 텍스트 에디터 */}
        <TextEditorWithLivePreview
          parts={styledParts}
          onChange={setStyledParts}
          position={textPosition}
          onPositionChange={setTextPosition}
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="text-gray-400 text-sm">
          ※ 다음 단계: 텍스트 스타일 설정 UI
        </div>
      </div>
    </div>
  );
} 