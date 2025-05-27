import React from "react";
import type { ShortsPreviewProps } from "../types/shorts";

export default function ShortsPreview({
  titleParts,
  subtitle,
  subtitleClass,
  bottomText,
  bottomStyle,
  imageUrl,
}: ShortsPreviewProps) {
  return (
    <div className="w-[240px] h-[480px] bg-gray-950 relative rounded-2xl overflow-hidden shadow-lg">
      {/* 배경 이미지 */}
      {imageUrl && (
        <div className="absolute inset-0">
          <img 
            src={imageUrl} 
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 상단 영역 */}
      <div className="absolute top-0 w-full h-[20%] bg-gradient-to-b from-black to-transparent text-center text-white text-sm flex flex-col items-center justify-center z-10">
        {titleParts.map((part, i) => (
          <span
            key={i}
            style={{
              color: part.color || "white",
              fontSize: part.fontSize || "16px",
              fontWeight: part.fontWeight || "bold",
              textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
            }}
          >
            {part.text}
          </span>
        ))}
      </div>

      {/* 중단 영역 */}
      <div className="absolute top-[20%] h-[60%] w-full flex items-center justify-center bg-gray-800/80 z-10">
        <div className="text-white/80 text-base p-4 text-center">
          {subtitle ? (
            <div className={`overflow-y-auto h-full ${subtitleClass}`}>
              {subtitle}
            </div>
          ) : (
            "중단 (이미지/자막)"
          )}
        </div>
      </div>

      {/* 하단 영역 */}
      <div className="absolute bottom-0 w-full h-[20%] bg-gradient-to-t from-black to-transparent text-white text-center text-sm flex flex-col items-center justify-center z-10">
        <span className={bottomStyle}>{bottomText}</span>
      </div>
    </div>
  );
} 