export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  letterSpacing: number;
  lineHeight: number;
  fontWeight: string;
}

export interface ShortsTemplate {
  name: string;
  style: SubtitleStyle;
  voiceId: string;
  imageStyle: string;
  fontName?: string;
} 