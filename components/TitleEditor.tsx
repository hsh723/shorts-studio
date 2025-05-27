import React from "react";
import type { StyledPart } from "../types/shorts";

interface TitleEditorProps {
  value: string;
  onChange: (value: string) => void;
  styledParts: StyledPart[];
  onStyleChange: (parts: StyledPart[]) => void;
}

export default function TitleEditor({ value, onChange, styledParts, onStyleChange }: TitleEditorProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const updateStyle = (style: Partial<StyledPart>) => {
    if (selectedIndex === null) return;
    onStyleChange(
      styledParts.map((part, i) => 
        i === selectedIndex ? { ...part, ...style } : part
      )
    );
  };

  return (
    <div className="space-y-4 bg-gray-900 p-4 rounded-lg">
      <h2 className="font-bold text-lg">📝 상단 제목 편집</h2>

      <textarea
        value={value}
        onChange={(e) => {
          const lines = e.target.value.split("\n");
          onChange(e.target.value);
          onStyleChange(lines.map((line) => ({ text: line })));
        }}
        rows={2}
        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
        placeholder="첫째 줄&#13;&#10;둘째 줄"
      />

      <div className="flex flex-col gap-2 p-3 bg-gray-800 rounded-lg">
        {styledParts.map((part, i) => (
          <span
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={`cursor-pointer p-2 rounded transition-all ${
              selectedIndex === i ? "bg-gray-700" : "hover:bg-gray-700/50"
            }`}
            style={{
              color: part.color || "white",
              fontSize: part.fontSize || "24px",
              fontWeight: part.fontWeight || "bold",
            }}
          >
            {part.text || "(빈 줄)"}
          </span>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="flex gap-2 flex-wrap">
          <select
            onChange={(e) => updateStyle({ color: e.target.value })}
            className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
            value={styledParts[selectedIndex]?.color || ""}
          >
            <option value="">기본 색상</option>
            <option value="#FF6B6B">빨강</option>
            <option value="#FFD93D">노랑</option>
            <option value="#FF9F43">오렌지</option>
            <option value="#4ECDC4">하늘</option>
            <option value="#A8E6CF">민트</option>
          </select>

          <select
            onChange={(e) => updateStyle({ fontSize: e.target.value })}
            className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
            value={styledParts[selectedIndex]?.fontSize || ""}
          >
            <option value="20px">작게</option>
            <option value="28px">기본</option>
            <option value="36px">크게</option>
          </select>

          <select
            onChange={(e) => updateStyle({ fontWeight: e.target.value })}
            className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
            value={styledParts[selectedIndex]?.fontWeight || ""}
          >
            <option value="normal">보통</option>
            <option value="bold">굵게</option>
            <option value="900">아주 굵게</option>
          </select>
        </div>
      )}
    </div>
  );
} 