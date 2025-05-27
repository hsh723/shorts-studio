
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex h-screen w-full">
        {/* 9:16 미리보기 - 왼쪽 */}
        <div className="w-1/2 flex justify-center items-center p-8">
          <div className="relative">
            {/* 폰 프레임 효과 */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl blur opacity-30"></div>
            <div className="relative aspect-[9/16] w-[360px] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800">
              {imageUrl ? (
                <img src={imageUrl} alt="미리보기 이미지" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <p>미리보기</p>
                  </div>
                </div>
              )}

              {/* 텍스트 오버레이 */}
              <div className="absolute top-6 w-full text-center px-4" style={{ ...style }}>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
                  {script.top}
                </div>
              </div>
              <div className="absolute top-1/3 w-full text-center px-4" style={{ ...style }}>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
                  {script.middle}
                </div>
              </div>
              <div className="absolute bottom-6 w-full text-center px-4" style={{ ...style }}>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
                  {script.bottom}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 도구 패널 - 오른쪽 */}
        <div className="w-1/2 p-6 overflow-y-auto bg-white/5 backdrop-blur-sm">
          <div className="space-y-6">
            {/* 헤더 */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">🎬 숏츠 스튜디오</h1>
              <p className="text-gray-300">AI로 만드는 전문적인 쇼츠 영상</p>
            </div>

            {/* 프롬프트 입력 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                ✨ 아이디어 입력
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="어떤 내용의 쇼츠를 만들고 싶나요? 예: 건강한 아침 루틴, 요리 레시피, 여행 팁 등..."
                className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button 
                onClick={handleGenerate}
                className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
              >
                🚀 스크립트 생성
              </button>
            </div>

            {/* 이미지 설정 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                🖼️ 배경 이미지
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">이미지 스타일</label>
                  <select
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={imageStyle}
                    onChange={(e) => setImageStyle(e.target.value)}
                  >
                    <option value="극사실주의">🌟 극사실주의</option>
                    <option value="만화 스타일">🎨 만화 스타일</option>
                    <option value="픽사 스타일">🎬 픽사 스타일</option>
                    <option value="수채화">🖌️ 수채화</option>
                    <option value="디지털 아트">💫 디지털 아트</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={handleImageGenerate} 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
                  >
                    ✨ AI 이미지 생성
                  </button>
                  
                  <label className="block">
                    <span className="sr-only">이미지 업로드</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 file:cursor-pointer cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 음성 설정 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                🎤 음성 설정
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">보이스 선택</label>
                  <select
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    isGeneratingVoice || !script.middle 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  } text-white`}
                >
                  {isGeneratingVoice ? '🎵 생성 중...' : '🎵 음성 생성'}
                </button>

                {audioSrc && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl">
                    <audio controls src={audioSrc} className="w-full" />
                    {subtitles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-white mb-2">🕒 자막 타이밍</h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {subtitles.map((s, i) => (
                            <div key={i} className="text-sm text-gray-300 bg-white/5 p-2 rounded">
                              <span className="text-purple-300 font-medium">{s.start}→{s.end}초</span>: {s.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 자막 스타일 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                ✏️ 자막 스타일
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">폰트</label>
                  <select
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    크기: {style.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={style.fontSize}
                    onChange={(e) => setStyle({ ...style, fontSize: Number(e.target.value) })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">색상</label>
                  <input
                    type="color"
                    value={style.color}
                    onChange={(e) => setStyle({ ...style, color: e.target.value })}
                    className="w-full h-12 rounded-xl cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 폰트 업로드 & 렌더링 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                🎬 영상 제작
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">폰트 파일 (.ttf)</label>
                  <input 
                    type="file" 
                    accept=".ttf" 
                    onChange={handleFontUpload} 
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 file:cursor-pointer cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleRenderWithSubtitles}
                  disabled={isGeneratingVideo || !imageUrl || !audioSrc || !fontFile || subtitles.length === 0}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    isGeneratingVideo || !imageUrl || !audioSrc || !fontFile || subtitles.length === 0 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                  } text-white`}
                >
                  {isGeneratingVideo ? '🎬 제작 중...' : '🎬 영상 제작'}
                </button>

                {videoBlob && (
                  <a 
                    href={URL.createObjectURL(videoBlob)} 
                    download="shorts_video.mp4" 
                    className="block w-full text-center bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
                  >
                    ⬇️ 영상 다운로드
                  </a>
                )}
              </div>
            </div>

            {/* 템플릿 관리 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                📦 템플릿 관리
              </h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="템플릿 이름"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                  >
                    💾 저장
                  </button>
                </div>

                {templates.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">저장된 템플릿</label>
                    <select
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onChange={(e) => {
                        const selected = templates.find((t) => t.name === e.target.value);
                        if (selected) loadTemplate(selected);
                      }}
                    >
                      <option value="">선택하세요</option>
                      {templates.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 고급 기능 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                🎥 고급 기능
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleStoryboardGenerate}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
                >
                  📝 스토리보드 생성
                </button>

                {storyboard && (
                  <>
                    <div className="mt-4 p-4 bg-white/5 rounded-xl max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-300">{storyboard}</pre>
                    </div>
                    <button
                      onClick={handleStoryboardToImages}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                    >
                      🖼️ 이미지 자동 생성
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 대사 처리 */}
            {speechLines.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  🗣️ 대사 처리
                </h2>
                <div className="space-y-4">
                  {speechLines.map((line, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="font-semibold text-purple-300">{line.speaker || `${line.ageGroup} ${line.gender}`}</p>
                      <p className="text-gray-200 mb-3">"{line.text}"</p>

                      {line.voiceType === "auto" ? (
                        <div>
                          <p className="text-green-400 text-sm mb-2">✔️ 자동 음성: {line.voiceId}</p>
                          <button
                            onClick={() => handleGenerateAudio(line, i)}
                            disabled={isGeneratingAudio}
                            className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                              isGeneratingAudio ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-600 transform hover:scale-105'
                            }`}
                          >
                            {isGeneratingAudio ? "생성 중..." : "🎵 음성 생성"}
                          </button>
                          {line.generatedAudioUrl && (
                            <audio
                              controls
                              src={line.generatedAudioUrl}
                              className="mt-3 w-full"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
                          <p className="text-yellow-300 font-bold mb-2">🚨 수동 더빙 필요</p>
                          <p className="text-gray-300 text-sm mb-3">타입캐스트에서 음성을 생성한 뒤 mp3 파일을 업로드해주세요.</p>
                          <button
                            onClick={() => navigator.clipboard.writeText(line.text)}
                            className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 mb-3"
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
                            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 file:cursor-pointer cursor-pointer"
                          />
                          {line.audioFile && (
                            <>
                              <p className="text-xs mt-2 text-blue-400">
                                ✔️ 업로드 완료: {line.audioFile.name}
                              </p>
                              <audio
                                controls
                                src={URL.createObjectURL(line.audioFile)}
                                className="mt-2 w-full"
                              />
                            </>
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
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  🎬 최종 영상 제작
                </h2>
                <button
                  onClick={handleRender}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  🚀 최종 영상 렌더링
                </button>

                {finalVideoBlob && (
                  <a
                    href={URL.createObjectURL(finalVideoBlob)}
                    download="shorts_final.mp4"
                    className="mt-4 block w-full text-center bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
                  >
                    ⬇️ 최종 영상 다운로드
                  </a>
                )}
              </div>
            )}

            {/* 설정 초기화 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                ⚙️ 설정
              </h2>
              <button
                className="text-red-400 hover:text-red-300 underline transition-colors"
                onClick={() => {
                  localStorage.removeItem("shorts-config");
                  location.reload();
                }}
              >
                🔄 모든 설정 초기화
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
