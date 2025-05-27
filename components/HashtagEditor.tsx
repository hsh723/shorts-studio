import React, { useState } from "react";
import type { HashtagStyle } from "../types/shorts";

const HASHTAG_STYLES: HashtagStyle[] = [
  { id: "default", name: "기본", className: "text-white text-sm" },
  { id: "yellow", name: "노란색", className: "text-yellow-400 text-sm" },
  { id: "cyan", name: "하늘색", className: "text-cyan-300 text-sm" },
  { id: "large", name: "크게", className: "text-white text-lg font-medium" },
  { id: "bold", name: "굵게", className: "text-white text-base font-bold" },
];

interface HashtagEditorProps {
  value: string;
  style: string;
  onChange: (text: string, style: string) => void;
}

export default function HashtagEditor({ value, style, onChange }: HashtagEditorProps) {
  const [localText, setLocalText] = useState(value);
  const [selectedStyle, setSelectedStyle] = useState(style);

  const handleUpdate = () => {
    onChange(localText, selectedStyle);
  };

  return (
    <div className="space-y-4 bg-gray-900 p-4 rounded-lg">
      <h3 className="font-bold text-lg">🏷 하단 해시태그 설정</h3>

      <div className="space-y-3">
        <textarea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleUpdate}
          rows={2}
          placeholder="#해시태그 #입력"
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
        />

        <div className="flex flex-wrap gap-2">
          {HASHTAG_STYLES.map((hashStyle) => (
            <button
              key={hashStyle.id}
              onClick={() => {
                setSelectedStyle(hashStyle.className);
                onChange(localText, hashStyle.className);
              }}
              className={`px-3 py-2 rounded-lg transition-all ${
                selectedStyle === hashStyle.className
                  ? "bg-gray-700 ring-2 ring-yellow-400"
                  : "bg-gray-800 hover:bg-gray-700/70"
              }`}
            >
              <span className={hashStyle.className}>{hashStyle.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { HASHTAG_STYLES }; 