import type { SpeechLine } from './types/speech';

const voiceMap: Record<string, string> = {
  "청년 male": "21m00Tcm4TlvDq8ikWAM", // ElevenLabs voice ID
  "청년 female": "EXAVITQu4vr4xnSDxMaL",
  "중년 male": "pNInz6obpgDQGcFmaJgB",
  "장년 male": "AZnzlk1XvdvUeBnXmlld",
};

const isManualRequired = (ageGroup: string, gender: string) => {
  return (
    (ageGroup === "중년" || ageGroup === "장년") &&
    gender === "female"
  );
};

export function extractSpeechLines(text: string): SpeechLine[] {
  // 대사 추출 로직 (예시)
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    // 기본값 설정
    const ageGroup = "청년";
    const gender = "male";
    
    const voiceType = isManualRequired(ageGroup, gender) ? "manual" : "auto";
    const voiceId = voiceType === "auto" ? voiceMap[`${ageGroup} ${gender}`] : undefined;

    return {
      text: line,
      gender,
      ageGroup,
      voiceType,
      voiceId,
      audioFile: null,
    };
  });
} 