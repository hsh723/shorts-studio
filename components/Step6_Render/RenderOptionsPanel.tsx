import { useRenderStore, Resolution } from '../../lib/renderStore';

export function RenderOptionsPanel() {
  const { options, setOptions } = useRenderStore();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          해상도
        </label>
        <select
          value={options.resolution}
          onChange={(e) => setOptions({ resolution: e.target.value as Resolution })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="includeSubtitles"
          checked={options.includeSubtitles}
          onChange={(e) => setOptions({ includeSubtitles: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="includeSubtitles" className="ml-2 block text-sm text-gray-700">
          자막 포함
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="removeWatermark"
          checked={options.removeWatermark}
          onChange={(e) => setOptions({ removeWatermark: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="removeWatermark" className="ml-2 block text-sm text-gray-700">
          워터마크 제거
        </label>
      </div>
    </div>
  );
} 