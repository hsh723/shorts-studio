import { FinalPreviewPlayer } from './FinalPreviewPlayer';
import { RenderOptionsPanel } from './RenderOptionsPanel';
import { RenderControlPanel } from './RenderControlPanel';

export function RenderTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">최종 렌더링</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">미리보기</h3>
          <FinalPreviewPlayer />
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">렌더링 옵션</h3>
            <RenderOptionsPanel />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">컨트롤</h3>
            <RenderControlPanel />
          </div>
        </div>
      </div>
    </div>
  );
} 