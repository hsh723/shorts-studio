
import { useState, useRef, useEffect } from "react";
import useSubtitleStyle from "../hooks/useSubtitleStyle";
import { generateVideo, generateVideoWithSubtitles } from "../lib/ffmpegHelper";
import { elevenVoiceList } from "../lib/voiceList";
import { splitSubtitleByDuration, SubtitleBlock } from "../lib/splitSubtitleByDuration";
import type { ShortsTemplate } from "../lib/types";
import { generateImagePrompt } from "../lib/imagePromptGenerator";
import { extractSpeechLines } from "../lib/extractSpeechLines";
import type { SpeechLine } from "../lib/types/speech";
import { renderByCuts } from "../lib/renderByCuts";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState({ top: "", middle: "", bottom: "" });
  const [imageUrl, setImageUrl] = useState("");
  const [imageStyle, setImageStyle] = useState("극사실주의");
  const [voiceId, setVoiceId] = useState(elevenVoiceList[0].id);
  const [audioSrc, setAudioSrc] = useState("");
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleBlock[]>([]);
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<ShortsTemplate[]>([]);
  const [storyboard, setStoryboard] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [speechLines, setSpeechLines] = useState<SpeechLine[]>([]);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [finalVideoBlob, setFinalVideoBlob] = useState<Blob | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const { style, setStyle } = useSubtitleStyle();

  // 초기 설정 로드
  useEffect(() => {
    const saved = localStorage.getItem("shorts-config");
    if (saved) {
      const config = JSON.parse(saved);
      setPrompt(config.prompt || "");
      setScript(config.script || { top: "", middle: "", bottom: "" });
      setStyle(config.style || style);
      setVoiceId(config.voiceId || voiceId);
      setImageStyle(config.imageStyle || "극사실주의");
    }
  }, []);

  // 설정 변경 시 자동 저장
  useEffect(() => {
    const config = {
      prompt,
      script,
      style,
      voiceId,
      imageStyle,
    };
    localStorage.setItem("shorts-config", JSON.stringify(config));
  }, [prompt, script, style, voiceId, imageStyle]);

  // 템플릿 로드
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("shorts-templates") || "[]");
    setTemplates(saved);
  }, []);

  const saveTemplate = (name: string) => {
    const newTemplate: ShortsTemplate = {
      name,
      style,
      voiceId,
      imageStyle,
      fontName: style.fontFamily,
    };

    const saved = JSON.parse(localStorage.getItem("shorts-templates") || "[]");
    saved.push(newTemplate);
    localStorage.setItem("shorts-templates", JSON.stringify(saved));
    setTemplates(saved);
  };

  const loadTemplate = (template: ShortsTemplate) => {
    setStyle(template.style);
    setVoiceId(template.voiceId);
    setImageStyle(template.imageStyle);
  };

  const imageStyleMap: Record<string, string> = {
    "극사실주의": "in hyper-realistic photography style",
    "만화 스타일": "in comic book style, manga, line art",
    "픽사 스타일": "3D animated, Pixar-like character",
    "수채화": "in watercolor painting style",
    "디지털 아트": "digital illustration, fantasy concept art"
  };

  const handleGenerate = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (!data.result) return;

    const lines = data.result.split("\n").filter(Boolean);
    setScript({
      top: lines[0] || "",
      middle: lines[1] || "",
      bottom: lines[2] || "",
    });
  };

  const handleImageGenerate = async () => {
    const promptText = `${script.middle} ${imageStyleMap[imageStyle]}`;
    
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText }),
    });

    const data = await res.json();
    if (data.imageUrl) setImageUrl(data.imageUrl);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
    }
  };

  const handleVoiceGenerate = async () => {
    if (!script.middle) return;
    
    setIsGeneratingVoice(true);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script.middle,
          voice: voiceId,
        }),
      });

      if (!res.ok) throw new Error("음성 생성 실패");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioSrc(url);

      // 타이밍 계산
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        const duration = audio.duration; // 전체 길이 (초)
        const blocks = splitSubtitleByDuration(script.middle, duration);
        setSubtitles(blocks);
      };
    } catch (error) {
      console.error("음성 생성 실패:", error);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFontFile(e.target.files[0]);
  };

  const handleRenderWithSubtitles = async () => {
    if (!imageUrl || !audioSrc || !fontFile || subtitles.length === 0) {
      alert("필수 요소가 누락되었습니다.");
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const audioRes = await fetch(audioSrc);
      const audioBlob = await audioRes.blob();

      const mp4Blob = await generateVideoWithSubtitles({
        imageUrl,
        audioBlob,
        fontFile,
        subtitles,
      });

      const videoUrl = URL.createObjectURL(mp4Blob);
      setVideoUrl(videoUrl);
      setVideoBlob(mp4Blob);
    } catch (error) {
      console.error("비디오 생성 실패:", error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleStoryboardGenerate = async () => {
    const res = await fetch("/api/storyboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (data.result) {
      setStoryboard(data.result);
      // 대사 추출 및 분석
      const lines = extractSpeechLines(data.result);
      setSpeechLines(lines);
    } else {
      setStoryboard("스토리보드 생성 실패");
    }
  };

  const handleStoryboardToImages = async () => {
    if (!storyboard) return;
    
    try {
      // 스토리보드 텍스트를 씬 단위로 파싱
      const scenes = storyboard.split('\n\n').map(scene => {
        const lines = scene.split('\n');
        return {
          scene: lines.find(l => l.includes('scene:'))?.split('scene:')[1].trim() || '',
          time: lines.find(l => l.includes('time:'))?.split('time:')[1].trim() || '',
          audio: lines.find(l => l.includes('audio:'))?.split('audio:')[1].trim() || '',
          subtitle: lines.find(l => l.includes('subtitle:'))?.split('subtitle:')[1].trim() || '',
        };
      });

      const imageUrls: string[] = [];
      for (const s of scenes) {
        const prompt = generateImagePrompt(s.scene, ["민수", "지수"], imageStyle);
        const res = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        if (data.imageUrl) imageUrls.push(data.imageUrl);
      }

      setGeneratedImages(imageUrls);
    } catch (error) {
      console.error("이미지 생성 실패:", error);
      alert("이미지 생성 중 오류가 발생했습니다.");
    }
  };

  const handleGenerateAudio = async (line: SpeechLine, index: number) => {
    if (line.voiceType !== "auto" || !line.voiceId) return;

    setIsGeneratingAudio(true);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: line.text,
          voice: line.voiceId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Voice generation failed:", errorText);
        throw new Error(`음성 생성 실패: ${res.status} ${res.statusText}`);
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error("생성된 음성이 비어있습니다.");
      }

      const url = URL.createObjectURL(blob);
      
      setSpeechLines(prev => 
        prev.map((s, i) => 
          i === index ? { ...s, generatedAudioUrl: url } : s
        )
      );
    } catch (error) {
      console.error("음성 생성 실패:", error);
      alert(error instanceof Error ? error.message : "음성 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleRender = async () => {
    if (!generatedImages.length || !speechLines.length) {
      alert("이미지와 음성이 모두 준비되어야 합니다.");
      return;
    }

    try {
      const audioBlobs: Blob[] = [];
      const subtitles: string[] = [];

      for (const line of speechLines) {
        if (line.voiceType === "auto" && line.generatedAudioUrl) {
          const res = await fetch(line.generatedAudioUrl);
          audioBlobs.push(await res.blob());
        } else if (line.voiceType === "manual" && line.audioFile) {
          audioBlobs.push(line.audioFile);
        } else {
          throw new Error("모든 대사의 음성이 준비되어야 합니다.");
        }
        subtitles.push(line.text);
      }

      const videoBlob = await renderByCuts({
        imageUrls: generatedImages,
        audioBlobs,
        subtitles,
      });

      setFinalVideoBlob(videoBlob);
    } catch (error) {
      console.error("영상 생성 실패:", error);
      alert("영상 생성 중 오류가 발생했습니다.");
    }
  };

  const tabs = [
    { id: "basic", label: "🎬 기본 생성", icon: "🎬" },
    { id: "advanced", label: "🎭 고급 기능", icon: "🎭" },
    { id: "settings", label: "⚙️ 설정", icon: "⚙️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎬 AI 쇼츠 스튜디오
          </h1>
          <p className="text-gray-300 text-lg">AI로 YouTube 쇼츠를 쉽고 빠르게 만들어보세요</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 미리보기 패널 */}
          <div className="lg:w-1/3">
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📱</span>
                실시간 미리보기
              </h2>
              <div className="flex justify-center">
                <div className="aspect-[9/16] w-[280px] bg-black rounded-2xl relative overflow-hidden shadow-2xl border-4 border-gray-800">
                  {imageUrl ? (
                    <img src={imageUrl} alt="미리보기 이미지" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">📷</div>
                        <p>이미지를 추가해주세요</p>
                      </div>
                    </div>
                  )}

                  {/* 자막 오버레이 */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 text-center">
                    <div style={{ ...style, textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                      {script.top}
                    </div>
                    <div style={{ ...style, textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                      {script.middle}
                    </div>
                    <div style={{ ...style, textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                      {script.bottom}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 컨트롤 패널 */}
          <div className="lg:w-2/3">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
              {/* 탭 네비게이션 */}
              <div className="flex border-b border-white/20">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white border-b-2 border-purple-400"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 탭 콘텐츠 */}
              <div className="p-6">
                {activeTab === "basic" && (
                  <div className="space-y-6">
                    {/* 스크립트 생성 */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <span className="mr-2">✍️</span>
                        1. 스크립트 생성
                      </h3>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="어떤 내용의 쇼츠를 만들고 싶나요? 예: 맛집 소개, 운동 팁, 일상 브이로그 등"
                        className="w-full h-32 p-4 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <button 
                        onClick={handleGenerate} 
                        className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                      >
                        🎯 AI 스크립트 생성
                      </button>
                    </div>

                    {/* 이미지 설정 */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <span className="mr-2">🖼️</span>
                        2. 배경 이미지 설정
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">이미지 스타일</label>
                          <select
                            className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                            value={imageStyle}
                            onChange={(e) => setImageStyle(e.target.value)}
                          >
                            <option value="극사실주의">📸 극사실주의</option>
                            <option value="만화 스타일">🎨 만화 스타일</option>
                            <option value="픽사 스타일">🎭 픽사 스타일</option>
                            <option value="수채화">🖌️ 수채화</option>
                            <option value="디지털 아트">💻 디지털 아트</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">이미지 업로드</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-500 file:text-white"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={handleImageGenerate} 
                        className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                      >
                        🎨 AI 이미지 생성
                      </button>
                    </div>

                    {/* 음성 설정 */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <span className="mr-2">🗣️</span>
                        3. 음성 설정
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">음성 선택</label>
                          <select
                            className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                            value={voiceId}
                            onChange={(e) => setVoiceId(e.target.value)}
                          >
                            {elevenVoiceList.map((voice) => (
                              <option key={voice.id} value={voice.id}>
                                {voice.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button 
                          onClick={handleVoiceGenerate}
                          disabled={isGeneratingVoice || !script.middle}
                          className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                            isGeneratingVoice || !script.middle 
                              ? 'bg-gray-600 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                          } text-white`}
                        >
                          {isGeneratingVoice ? '🎤 음성 생성 중...' : '🎤 AI 음성 생성'}
                        </button>
                        {audioSrc && (
                          <div className="mt-4">
                            <audio controls src={audioSrc} className="w-full rounded-lg" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 영상 생성 */}
                    {audioSrc && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <span className="mr-2">🎬</span>
                          4. 영상 생성
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">자막 폰트 업로드 (.ttf)</label>
                            <input 
                              type="file" 
                              accept=".ttf" 
                              onChange={handleFontUpload} 
                              className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-500 file:text-white"
                            />
                          </div>
                          <button
                            onClick={handleRenderWithSubtitles}
                            disabled={isGeneratingVideo || !imageUrl || !audioSrc || !fontFile || subtitles.length === 0}
                            className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                              isGeneratingVideo || !imageUrl || !audioSrc || !fontFile || subtitles.length === 0 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transform hover:scale-105'
                            } text-white`}
                          >
                            {isGeneratingVideo ? '🎬 영상 생성 중...' : '🎬 최종 영상 생성'}
                          </button>
                          {videoBlob && (
                            <a 
                              href={URL.createObjectURL(videoBlob)} 
                              download="shorts_subtitled.mp4" 
                              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                            >
                              📥 영상 다운로드
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "advanced" && (
                  <div className="space-y-6">
                    {/* 스토리보드 생성 */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <span className="mr-2">🎭</span>
                        고급 스토리보드 생성
                      </h3>
                      <button
                        onClick={handleStoryboardGenerate}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
                      >
                        📝 AI 스토리보드 생성
                      </button>
                      
                      {storyboard && (
                        <div className="mt-4">
                          <div className="bg-black/20 rounded-lg p-4 max-h-60 overflow-y-auto">
                            <pre className="text-gray-300 text-sm whitespace-pre-wrap">{storyboard}</pre>
                          </div>
                          <button
                            onClick={handleStoryboardToImages}
                            className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                          >
                            🖼️ 스토리보드 이미지 자동 생성
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 대사 처리 */}
                    {speechLines.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <span className="mr-2">🗣️</span>
                          대사별 음성 처리
                        </h3>
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                          {speechLines.map((line, i) => (
                            <div key={i} className="bg-black/20 rounded-lg p-4 border border-white/10">
                              <p className="font-semibold text-white">{line.speaker || `${line.ageGroup} ${line.gender}`}</p>
                              <p className="text-gray-300 mb-3">"{line.text}"</p>

                              {line.voiceType === "auto" ? (
                                <div>
                                  <p className="text-green-400 text-sm mb-2">✔️ 자동 음성: {line.voiceId}</p>
                                  <button
                                    onClick={() => handleGenerateAudio(line, i)}
                                    disabled={isGeneratingAudio}
                                    className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors ${
                                      isGeneratingAudio ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    {isGeneratingAudio ? "생성 중..." : "🎤 음성 생성"}
                                  </button>
                                  {line.generatedAudioUrl && (
                                    <audio controls src={line.generatedAudioUrl} className="mt-2 w-full" />
                                  )}
                                </div>
                              ) : (
                                <div className="bg-yellow-900/30 p-3 rounded border-l-4 border-yellow-400">
                                  <p className="text-yellow-300 font-bold mb-2">🚨 수동 더빙 필요</p>
                                  <p className="text-sm text-gray-300 mb-2">타입캐스트에서 음성을 생성한 뒤 mp3 파일을 업로드해주세요.</p>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(line.text)}
                                    className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-xs text-white mb-2"
                                  >
                                    📋 대본 복사
                                  </button>
                                  <input
                                    type="file"
                                    accept="audio/mp3"
                                    onChange={(e) =>
                                      setSpeechLines((prev) =>
                                        prev.map((s, idx) =>
                                          idx === i ? { ...s, audioFile: e.target.files?.[0] || null } : s
                                        )
                                      )
                                    }
                                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white"
                                  />
                                  {line.audioFile && (
                                    <div className="mt-2">
                                      <p className="text-xs text-blue-400 mb-1">✔️ 업로드 완료: {line.audioFile.name}</p>
                                      <audio controls src={URL.createObjectURL(line.audioFile)} className="w-full" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 최종 렌더링 */}
                    {generatedImages.length > 0 && speechLines.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <span className="mr-2">🎬</span>
                          최종 영상 렌더링
                        </h3>
                        <button
                          onClick={handleRender}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105"
                        >
                          🎬 고급 영상 렌더링 & 다운로드
                        </button>

                        {finalVideoBlob && (
                          <a
                            href={URL.createObjectURL(finalVideoBlob)}
                            download="shorts_final.mp4"
                            className="mt-4 block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                          >
                            📥 최종 영상 다운로드
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    {/* 자막 스타일 */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <span className="mr-2">✏️</span>
                        자막 스타일 설정
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">폰트</label>
                          <select
                            className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                            value={style.fontFamily}
                            onChange={(e) => setStyle({ ...style, fontFamily: e.target.value })}
                          >
                            <option value="CookieRun Regular">CookieRun Regular</option>
                            <option value="The Jamsil 3 Regular">The Jamsil 3 Regular</option>
                            <option value="esanmanru Medium">esanmanru Medium</option>
                            <option value="SB 어그로 T">SB 어그로 T</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">글자 크기: {style.fontSize}px</label>
                          <input
                            type="range"
                            min="12"
                            max="48"
                            value={style.fontSize}
                            onChange={(e) => setStyle({ ...style, fontSize: Number(e.target.value) })}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">글자 색상</label>
                          <input
                            type="color"
                            value={style.color}
                            onChange={(e) => setStyle({ ...style, color: e.target.value })}
                            className="w-full h-12 bg-black/20 border border-white/20 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 템플릿 관리 */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <span className="mr-2">📦</span>
                        템플릿 관리
                      </h3>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="템플릿 이름"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="flex-1 p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <button
                            onClick={() => {
                              if (!templateName.trim()) {
                                alert("템플릿 이름을 입력해주세요.");
                                return;
                              }
                              saveTemplate(templateName);
                              setTemplateName("");
                              alert("템플릿 저장 완료");
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                          >
                            💾 저장
                          </button>
                        </div>

                        {templates.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">저장된 템플릿</label>
                            <select
                              className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                              onChange={(e) => {
                                const selected = templates.find((t) => t.name === e.target.value);
                                if (selected) loadTemplate(selected);
                              }}
                            >
                              <option value="">템플릿 선택...</option>
                              {templates.map((t) => (
                                <option key={t.name} value={t.name}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <button
                          className="w-full text-sm text-red-400 hover:text-red-300 py-2 border border-red-400/50 rounded-lg transition-colors"
                          onClick={() => {
                            if (confirm("저장된 설정을 모두 초기화하시겠습니까?")) {
                              localStorage.removeItem("shorts-config");
                              location.reload();
                            }
                          }}
                        >
                          🔄 전체 설정 초기화
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
