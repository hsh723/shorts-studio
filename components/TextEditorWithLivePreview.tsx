import React, { useState } from "react";
import Draggable from "react-draggable";
import type { TextEditorProps, StyledPart } from "../types/shorts";

const TEXT_COLORS = [
  { value: "#ffffff", name: "흰색" },
  { value: "#facc15", name: "노랑" },
  { value: "#f87171", name: "빨강" },
  { value: "#4ade80", name: "초록" },
  { value: "#60a5fa", name: "파랑" },
];

const FONT_SIZES = [
  { value: "20px", name: "작게" },
  { value: "28px", name: "보통" },
  { value: "36px", name: "크게" },
];

const FONT_WEIGHTS = [
  { value: "normal", name: "보통" },
  { value: "bold", name: "굵게" },
  { value: "900", name: "아주 굵게" },
];

export default function TextEditorWithLivePreview({
  parts,
  onChange,
  position = { x: 0, y: 0 },
  onPositionChange,
}: TextEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const updateStyle = (style: Partial<StyledPart>) => {
    if (selectedIndex === null) return;
    onChange(
      parts.map((part, i) => (i === selectedIndex ? { ...part, ...style } : part))
    );
  };

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    onPositionChange?.(data);
  };

  return (
    <div className="space-y-4 bg-gray-900 p-4 rounded-lg">
      <h3 className="font-bold text-lg">✏️ 텍스트 스타일 편집</h3>

      <div className="flex flex-col gap-2 p-3 bg-gray-800 rounded-lg">
        {parts.map((part, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={`text-left p-2 rounded transition-all ${
              selectedIndex === i ? "bg-gray-700 ring-2 ring-yellow-400" : "hover:bg-gray-700/50"
            }`}
          >
            <span
              style={{
                color: part.color,
                fontSize: part.fontSize,
                fontWeight: part.fontWeight,
              }}
            >
              {part.text || "(빈 텍스트)"}
            </span>
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="grid grid-cols-3 gap-2">
          <select
            value={parts[selectedIndex]?.color || "#ffffff"}
            onChange={(e) => updateStyle({ color: e.target.value })}
            className="p-2 bg-gray-800 rounded border border-gray-700"
          >
            {TEXT_COLORS.map(({ value, name }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={parts[selectedIndex]?.fontSize || "28px"}
            onChange={(e) => updateStyle({ fontSize: e.target.value })}
            className="p-2 bg-gray-800 rounded border border-gray-700"
          >
            {FONT_SIZES.map(({ value, name }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={parts[selectedIndex]?.fontWeight || "normal"}
            onChange={(e) => updateStyle({ fontWeight: e.target.value })}
            className="p-2 bg-gray-800 rounded border border-gray-700"
          >
            {FONT_WEIGHTS.map(({ value, name }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h4 className="font-medium text-sm text-gray-400 mb-2">
          🖱️ 드래그하여 위치 조정
        </h4>
        <div className="w-[240px] h-[480px] relative bg-gray-950 rounded-xl overflow-hidden mx-auto">
          <Draggable
            position={position}
            onDrag={handleDrag}
            bounds="parent"
          >
            <div className="absolute cursor-move flex flex-col gap-1 p-2">
              {parts.map((part, i) => (
                <span
                  key={i}
                  style={{
                    color: part.color,
                    fontSize: part.fontSize,
                    fontWeight: part.fontWeight,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {part.text}
                </span>
              ))}
            </div>
          </Draggable>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 to-transparent" />
        </div>
      </div>
    </div>
  );
} 