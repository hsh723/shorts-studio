import { useStore } from '../lib/store';

const tabs = [
  { id: 'script', label: '1. 대본 생성' },
  { id: 'image', label: '2. 이미지 생성' },
  { id: 'layout', label: '3. 장면 배치' },
  { id: 'style', label: '4. 텍스트 스타일' },
  { id: 'subtitle', label: '5. 자막 편집' },
  { id: 'render', label: '6. 최종 렌더링' }
] as const;

type TabId = typeof tabs[number]['id'];

interface TabNavigationProps {
  currentTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function TabNavigation({ currentTab, onTabChange }: TabNavigationProps) {
  const { selectedScriptId, generatedImages, scenes, subtitles } = useStore();

  const isTabEnabled = (tabId: TabId): boolean => {
    switch (tabId) {
      case 'script':
        return true;
      case 'image':
        return !!selectedScriptId;
      case 'layout':
        return generatedImages.length > 0;
      case 'style':
        return scenes.length > 0;
      case 'subtitle':
        return subtitles.length > 0;
      case 'render':
        return subtitles.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="flex space-x-2 p-4 bg-white shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => isTabEnabled(tab.id) && onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${currentTab === tab.id
              ? 'bg-blue-600 text-white'
              : isTabEnabled(tab.id)
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          disabled={!isTabEnabled(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
} 