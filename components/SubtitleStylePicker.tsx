import React from "react";
import type { SubtitleStyle } from "../types/shorts";

const SUBTITLE_STYLES: SubtitleStyle[] = [
  {
    id: "yellow-outline",
    name: "노란 외곽선",
    previewImg: "/styles/yellow-outline.png",
    className: "text-white font-bold text-xl bg-black bg-opacity-60 px-2 py-1 border-2 border-yellow-400 rounded",
  },
  {
    id: "green-box",
    name: "초록 배경 상자",
    previewImg: "/styles/green-box.png",
    className: "text-black font-semibold text-lg bg-green-300 px-3 py-1 rounded",
  },
  {
    id: "white-shadow",
    name: "흰색 그림자",
    previewImg: "/styles/white-shadow.png",
    className: "text-white text-xl shadow-md shadow-white",
  },
];

interface SubtitleStylePickerProps {
  selectedId: string;
  onSelect: (style: SubtitleStyle) => void;
}

export default function SubtitleStylePicker({ selectedId, onSelect }: SubtitleStylePickerProps) {
  return (
    <div className="space-y-4 bg-gray-900 p-4 rounded-lg">
      <h3 className="font-bold text-lg">🎨 중단 자막 스타일 선택</h3>
      <div className="grid grid-cols-3 gap-3">
        {SUBTITLE_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style)}
            className={`group flex flex-col items-center p-2 rounded-lg transition-all ${
              selectedId === style.id 
                ? "bg-gray-700 ring-2 ring-yellow-400" 
                : "bg-gray-800 hover:bg-gray-700/70"
            }`}
          >
            <div className="relative w-full aspect-video rounded overflow-hidden bg-black">
              <img 
                src={style.previewImg} 
                alt="" 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-300 group-hover:text-white">
              {style.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export { SUBTITLE_STYLES }; 