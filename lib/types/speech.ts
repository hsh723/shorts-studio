export interface SpeechLine {
  text: string;
  speaker?: string;
  gender: "male" | "female";
  ageGroup: "청년" | "중년" | "장년";
  voiceType: "auto" | "manual";
  voiceId?: string;
  audioFile?: File | null;
  generatedAudioUrl?: string;
} 