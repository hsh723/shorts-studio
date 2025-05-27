import { useStore } from '../lib/store';

const fontOptions = [
  { value: 'CookieRun Regular', label: '쿠키런' },
  { value: 'The Jamsil 3 Regular', label: '잠실' },
  { value: 'esanmanru Medium', label: '에스안만루' },
  { value: 'SB 어그로 T', label: 'SB 어그로' }
];

const colorPresets = [
  { value: '#FFFFFF', label: '흰색' },
  { value: '#000000', label: '검정색' },
  { value: '#FF0000', label: '빨간색' },
  { value: '#00FF00', label: '초록색' },
  { value: '#0000FF', label: '파란색' },
  { value: '#FFFF00', label: '노란색' }
];

export function TextStyleTab() {
  const {
    textStyle,
    setTextStyle,
    fontFile,
    setFontFile
  } = useStore();

  const handleStyleChange = (updates: Partial<typeof textStyle>) => {
    setTextStyle({ ...textStyle, ...updates });
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFontFile(file);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* 기본 스타일 설정 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">기본 스타일</h2>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">폰트 선택</label>
            <select
              value={textStyle.fontFamily}
              onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">글자 크기</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="12"
                max="48"
                value={textStyle.fontSize}
                onChange={(e) => handleStyleChange({ fontSize: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{textStyle.fontSize}px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">글자 색상</label>
            <div className="grid grid-cols-3 gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleStyleChange({ color: color.value })}
                  className={`p-2 border rounded-lg ${
                    textStyle.color === color.value ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  <span className="sr-only">{color.label}</span>
                </button>
              ))}
              <div className="col-span-3">
                <input
                  type="color"
                  value={textStyle.color}
                  onChange={(e) => handleStyleChange({ color: e.target.value })}
                  className="w-full h-10 p-1 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 추가 스타일 설정 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">추가 스타일</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">글자 두께</label>
            <select
              value={textStyle.fontWeight}
              onChange={(e) => handleStyleChange({ fontWeight: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="normal">보통</option>
              <option value="bold">굵게</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">글자 간격</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="-2"
                max="10"
                value={textStyle.letterSpacing}
                onChange={(e) => handleStyleChange({ letterSpacing: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{textStyle.letterSpacing}px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">줄 간격</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={textStyle.lineHeight}
                onChange={(e) => handleStyleChange({ lineHeight: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{textStyle.lineHeight}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">그림자 효과</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={textStyle.textShadow}
                  onChange={(e) => handleStyleChange({ textShadow: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>텍스트 그림자 사용</span>
              </div>
              {textStyle.textShadow && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">X 오프셋</label>
                    <input
                      type="number"
                      value={textStyle.shadowOffsetX}
                      onChange={(e) => handleStyleChange({ shadowOffsetX: Number(e.target.value) })}
                      className="w-full p-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Y 오프셋</label>
                    <input
                      type="number"
                      value={textStyle.shadowOffsetY}
                      onChange={(e) => handleStyleChange({ shadowOffsetY: Number(e.target.value) })}
                      className="w-full p-1 border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 커스텀 폰트 업로드 */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-4">커스텀 폰트 업로드</h2>
        <div className="space-y-2">
          <input
            type="file"
            accept=".ttf,.otf"
            onChange={handleFontUpload}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {fontFile && (
            <p className="text-sm text-green-600">
              ✓ {fontFile.name} 업로드 완료
            </p>
          )}
        </div>
      </div>

      {/* 미리보기 */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-4">스타일 미리보기</h2>
        <div className="p-4 bg-gray-100 rounded-lg">
          <p style={textStyle} className="text-center">
            안녕하세요!<br />
            이것은 텍스트 스타일 미리보기입니다.
          </p>
        </div>
      </div>
    </div>
  );
} 