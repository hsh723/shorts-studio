import { useState } from "react";

interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  letterSpacing: number;
  lineHeight: number;
  fontWeight: string;
}

export default function useSubtitleStyle() {
  const [style, setStyle] = useState<SubtitleStyle>({
    fontFamily: 'CookieRun Regular',
    fontSize: 18,
    color: "#ffffff",
    letterSpacing: 0,
    lineHeight: 1.4,
    fontWeight: "normal",
  });

  return { style, setStyle };
} 