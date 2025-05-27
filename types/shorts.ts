export type StyledPart = {
  text: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
};

export interface SubtitleStyle {
  id: string;
  name: string;
  previewImg: string;
  className: string;
}

export interface HashtagStyle {
  id: string;
  name: string;
  className: string;
}

export interface ImageStyle {
  id: string;
  name: string;
  prompt: string;
}

export interface ShortsPreviewProps {
  titleParts: StyledPart[];
  subtitle: string;
  subtitleClass: string;
  bottomText: string;
  bottomStyle: string;
  imageUrl?: string;
}

export interface AutoGenerateResult {
  titleParts: StyledPart[];
  subtitle: string;
  bottomText: string;
  imageUrl: string;
}

export interface AutoGenerateButtonProps {
  prompt: string;
  onResult: (result: AutoGenerateResult) => void;
  onError?: (error: string) => void;
}

export interface TextPosition {
  x: number;
  y: number;
}

export interface TextEditorProps {
  parts: StyledPart[];
  onChange: (parts: StyledPart[]) => void;
  position?: TextPosition;
  onPositionChange?: (position: TextPosition) => void;
}

export interface VideoRendererProps {
  imageUrl: string;
  audioUrl: string;
  subtitleText: string;
  onError?: (error: string) => void;
} 