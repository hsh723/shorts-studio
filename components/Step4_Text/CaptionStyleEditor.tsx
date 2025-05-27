import { useState } from 'react';
import { Caption, TextStyle, TextPosition } from '../../lib/captionStore';
import { v4 as uuidv4 } from 'uuid';

interface CaptionStyleEditorProps {
  sceneId: string;
  position: TextPosition;
  caption?: Caption;
  onUpdate: (caption: Caption) => void;
}

const fontOptions = [
  { value: 'Pretendard', label: '프리텐다드' },
  { value: 'Noto Sans KR', label: 'Noto Sans KR' },
  { value: 'Nanum Gothic', label: '나눔고딕' },
  { value: 'Nanum Myeongjo', label: '나눔명조' },
  { value: 'Nanum Pen Script', label: '나눔펜스크립트' }
];

const colorPresets = [
  { value: '#FFFFFF', label: '흰색' },
  { value: '#000000', label: '검정' },
  { value: '#FF0000', label: '빨강' },
  { value: '#00FF00', label: '초록' },
  { value: '#0000FF', label: '파랑' },
  { value: '#FFFF00', label: '노랑' }
];

export function CaptionStyleEditor({ sceneId, position, caption, onUpdate }: CaptionStyleEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const defaultCaption: Caption = {
    id: caption?.id || uuidv4(),
    sceneId,
    position,
    text: caption?.text || '',
    style: caption?.style || {
      fontFamily: 'Pretendard',
      fontSize: 24,
      color: '#FFFFFF',
      letterSpacing: 0,
      lineHeight: 1.5,
      backgroundColor: '#000000',
      backgroundOpacity: 0.5,
      shadowColor: '#000000',
      shadowBlur: 4,
      shadowOffsetX: 0,
      shadowOffsetY: 2
    }
  };

  const handleTextChange = (text: string) => {
    onUpdate({ ...defaultCaption, text });
  };

  const handleStyleChange = (style: Partial<TextStyle>) => {
    onUpdate({
      ...defaultCaption,
      style: { ...defaultCaption.style, ...style }
    });
  };

  const handleReset = () => {
    onUpdate({
      ...defaultCaption,
      style: {
        fontFamily: 'Pretendard',
        fontSize: 24,
        color: '#FFFFFF',
        letterSpacing: 0,
        lineHeight: 1.5,
        backgroundColor: '#000000',
        backgroundOpacity: 0.5,
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 0,
        shadowOffsetY: 2
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {position === 'top' ? '상단 텍스트' :
           position === 'middle' ? '중단 텍스트' : '하단 텍스트'}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? '접기' : '펼치기'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* 텍스트 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              텍스트 내용
            </label>
            <textarea
              value={defaultCaption.text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          {/* 폰트 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              글꼴
            </label>
            <select
              value={defaultCaption.style.fontFamily}
              onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              {fontOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 폰트 크기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              크기: {defaultCaption.style.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="72"
              value={defaultCaption.style.fontSize}
              onChange={(e) => handleStyleChange({ fontSize: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* 색상 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              색상
            </label>
            <div className="flex space-x-2">
              {colorPresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => handleStyleChange({ color: preset.value })}
                  className={`w-8 h-8 rounded-full border-2
                    ${defaultCaption.style.color === preset.value
                      ? 'border-blue-500'
                      : 'border-transparent'
                    }`}
                  style={{ backgroundColor: preset.value }}
                  title={preset.label}
                />
              ))}
              <input
                type="color"
                value={defaultCaption.style.color}
                onChange={(e) => handleStyleChange({ color: e.target.value })}
                className="w-8 h-8 p-0 border-0"
              />
            </div>
          </div>

          {/* 자간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자간: {defaultCaption.style.letterSpacing}px
            </label>
            <input
              type="range"
              min="-2"
              max="10"
              step="0.5"
              value={defaultCaption.style.letterSpacing}
              onChange={(e) => handleStyleChange({ letterSpacing: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* 행간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              행간: {defaultCaption.style.lineHeight}
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={defaultCaption.style.lineHeight}
              onChange={(e) => handleStyleChange({ lineHeight: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* 배경색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              배경색
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={defaultCaption.style.backgroundColor}
                onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                className="w-8 h-8 p-0 border-0"
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={defaultCaption.style.backgroundOpacity}
                onChange={(e) => handleStyleChange({ backgroundOpacity: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">
                {Math.round(defaultCaption.style.backgroundOpacity * 100)}%
              </span>
            </div>
          </div>

          {/* 그림자 효과 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              그림자 효과
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">색상</span>
                <input
                  type="color"
                  value={defaultCaption.style.shadowColor}
                  onChange={(e) => handleStyleChange({ shadowColor: e.target.value })}
                  className="w-8 h-8 p-0 border-0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">흐림</span>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={defaultCaption.style.shadowBlur}
                  onChange={(e) => handleStyleChange({ shadowBlur: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">X</span>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={defaultCaption.style.shadowOffsetX}
                  onChange={(e) => handleStyleChange({ shadowOffsetX: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Y</span>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={defaultCaption.style.shadowOffsetY}
                  onChange={(e) => handleStyleChange({ shadowOffsetY: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* 초기화 버튼 */}
          <button
            onClick={handleReset}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            스타일 초기화
          </button>
        </div>
      )}
    </div>
  );
} 