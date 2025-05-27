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
    <div className="flex h-screen w-full bg-gray-100">
      {/* 9:16 미리보기 */}
      <div className="w-1/2 flex justify-center items-center p-4 bg-white shadow-lg">
        <div className="aspect-[9/16] w-[360px] border relative overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt="미리보기 이미지" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-black" />
          )}

          <div className="absolute top-4 w-full text-center" style={{ ...style }}>{script.top}</div>
          <div className="absolute top-1/3 w-full text-center" style={{ ...style }}>{script.middle}</div>
          <div className="absolute bottom-4 w-full text-center" style={{ ...style }}>{script.bottom}</div>
        </div>
      </div>

      {/* 도구 패널 */}
      <div className="w-1/2 p-6 flex flex-col space-y-4 overflow-y-auto">
        <h1 className="text-2xl font-bold">🎬 숏츠 자동 생성기</h1>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="내용 입력 후 스크립트를 생성하세요"
          className="w-full h-32 p-2 border rounded resize-none"
        ></textarea>

        <button onClick={handleGenerate} className="bg-blue-600 text-white py-2 rounded">스크립트 생성</button>

        <hr />

        <h2 className="font-bold text-lg">🖼 배경 이미지 설정</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1">이미지 스타일:</label>
            <select
              className="p-2 border rounded w-full"
              value={imageStyle}
              onChange={(e) => setImageStyle(e.target.value)}
            >
              <option value="극사실주의">극사실주의</option>
              <option value="만화 스타일">만화 스타일</option>
              <option value="픽사 스타일">픽사 스타일</option>
              <option value="수채화">수채화</option>
              <option value="디지털 아트">디지털 아트</option>
            </select>
          </div>

          <button onClick={handleImageGenerate} className="bg-green-600 text-white py-2 rounded w-full">
            AI 이미지 생성
          </button>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="p-2 border rounded w-full"
          />
        </div>

        <hr />

        <h2 className="font-bold text-lg">🗣 음성 선택</h2>

        <select
          className="p-2 border rounded w-full"
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
        >
          {elevenVoiceList.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.label} ({voice.id.slice(0, 6)}...)
            </option>
          ))}
        </select>

        <button 
          onClick={handleVoiceGenerate}
          disabled={isGeneratingVoice || !script.middle}
          className={`bg-purple-600 text-white py-2 px-4 rounded mt-2 ${
            isGeneratingVoice || !script.middle ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isGeneratingVoice ? '음성 생성 중...' : '음성 생성'}
        </button>

        {audioSrc && (
          <>
            <audio controls src={audioSrc} className="mt-2 w-full" />
            {subtitles.length > 0 && (
              <div className="bg-white p-4 border rounded mt-4">
                <h3 className="font-bold">🕒 자막 타이밍 확인</h3>
                <ul className="text-sm max-h-60 overflow-y-auto">
                  {subtitles.map((s, i) => (
                    <li key={i} className="mb-2">
                      <strong>{s.start} → {s.end}초</strong>: {s.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <hr />

        <h2 className="font-bold text-lg">✏️ 자막 스타일 조정</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1">폰트 선택:</label>
            <select
              className="p-2 border rounded w-full"
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
            <label className="block mb-1">글자 크기:</label>
            <input
              type="range"
              min="12"
              max="48"
              value={style.fontSize}
              onChange={(e) => setStyle({ ...style, fontSize: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{style.fontSize}px</span>
          </div>

          <div>
            <label className="block mb-1">글자 색상:</label>
            <input
              type="color"
              value={style.color}
              onChange={(e) => setStyle({ ...style, color: e.target.value })}
              className="w-full h-10"
            />
          </div>
        </div>

        <hr />

        <h2 className="font-bold text-lg">📂 자막 폰트 업로드</h2>
        <input 
          type="file" 
          accept=".ttf" 
          onChange={handleFontUpload} 
          className="p-2 border rounded w-full" 
        />

        <button
          onClick={handleRenderWithSubtitles}
          disabled={isGeneratingVideo || !imageUrl || !audioSrc || !fontFile || subtitles.length === 0}
          className={`bg-red-600 text-white py-2 px-4 mt-2 rounded w-full ${
            isGeneratingVideo || !imageUrl || !audioSrc || !fontFile || subtitles.length === 0 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
        >
          {isGeneratingVideo ? '자막 영상 생성 중...' : '🎬 자막 영상 생성'}
        </button>

        {videoBlob && (
          <a 
            href={URL.createObjectURL(videoBlob)} 
            download="shorts_subtitled.mp4" 
            className="block mt-2 text-blue-600 underline"
          >
            ▶ 자막 포함 영상 다운로드
          </a>
        )}

        <hr />

        <h2 className="font-bold text-lg">📦 템플릿 저장/불러오기</h2>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="템플릿 이름"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="p-2 border rounded flex-1"
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
              className="bg-green-600 text-white py-2 px-4 rounded"
            >
              저장하기
            </button>
          </div>

          {templates.length > 0 && (
            <div>
              <label className="font-semibold block mb-2">📁 템플릿 불러오기</label>
              <select
                className="p-2 border rounded w-full"
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

        <hr />

        <h2 className="font-bold text-lg">🎥 GPT 스토리보드 자동 생성</h2>
        <button
          onClick={handleStoryboardGenerate}
          className="bg-indigo-600 text-white py-2 px-4 rounded"
        >
          스토리보드 생성하기
        </button>

        {storyboard && (
          <>
            <pre className="mt-4 whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded border max-h-80 overflow-y-auto">
              {storyboard}
            </pre>
            <button
              onClick={handleStoryboardToImages}
              className="mt-4 bg-purple-600 text-white py-2 px-4 rounded"
            >
              스토리보드 이미지 자동 생성
            </button>
          </>
        )}

        {speechLines.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold text-lg mb-4">🗣️ 대사 처리</h2>
            {speechLines.map((line, i) => (
              <div key={i} className="p-3 border rounded mb-2 bg-white shadow-sm">
                <p className="font-semibold">{line.speaker || `${line.ageGroup} ${line.gender}`}</p>
                <p className="text-gray-800 mb-1">🗣️ "{line.text}"</p>

                {line.voiceType === "auto" ? (
                  <div>
                    <p className="text-green-600 text-sm">✔️ 자동 음성: {line.voiceId}</p>
                    <button
                      onClick={() => handleGenerateAudio(line, i)}
                      disabled={isGeneratingAudio}
                      className={`mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs ${
                        isGeneratingAudio ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isGeneratingAudio ? "생성 중..." : "음성 생성"}
                    </button>
                    {line.generatedAudioUrl && (
                      <audio
                        controls
                        src={line.generatedAudioUrl}
                        className="mt-2 w-full"
                        onError={(e) => {
                          console.error("Audio playback error:", e);
                          alert("음성 재생 중 오류가 발생했습니다.");
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-2 rounded text-sm">
                    <p className="text-yellow-800 font-bold mb-1">🚨 수동 더빙 필요 (타입캐스트)</p>
                    <p>타입캐스트에서 음성을 생성한 뒤 mp3 파일을 업로드해주세요.</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(line.text)}
                      className="bg-gray-200 px-3 py-1 rounded text-xs mt-2"
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
                      className="mt-2 block"
                    />
                    {line.audioFile && (
                      <>
                        <p className="text-xs mt-1 text-blue-600">
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
        )}

        {generatedImages.length > 0 && speechLines.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h2 className="font-bold text-lg mb-4">🎬 최종 영상 렌더링</h2>
            <button
              onClick={handleRender}
              className="bg-red-600 text-white py-2 px-4 rounded w-full"
            >
              🎬 영상 렌더링 & 다운로드
            </button>

            {finalVideoBlob && (
              <a
                href={URL.createObjectURL(finalVideoBlob)}
                download="shorts_final.mp4"
                className="mt-2 block text-blue-600 underline"
              >
                ▶ 최종 영상 다운로드
              </a>
            )}
          </div>
        )}

        <hr />

        <h2 className="font-bold text-lg">⚙️ 설정</h2>

        <button
          className="text-sm text-red-500 underline mt-2"
          onClick={() => {
            localStorage.removeItem("shorts-config");
            location.reload();
          }}
        >
          🔁 저장 초기화
        </button>
      </div>
    </div>
  );
} 