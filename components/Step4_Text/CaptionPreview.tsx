import { useImageStore } from '../../lib/imageStore';
import { useCaptionStore, Caption } from '../../lib/captionStore';

interface CaptionPreviewProps {
  sceneId: string;
}

export function CaptionPreview({ sceneId }: CaptionPreviewProps) {
  const { scenes } = useImageStore();
  const { getCaptionsByScene } = useCaptionStore();

  const scene = scenes.find(s => s.id === sceneId);
  const captions = getCaptionsByScene(sceneId);

  if (!scene) return null;

  const renderCaption = (caption: Caption) => {
    const { style, text } = caption;
    const position = caption.position;

    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      textAlign: 'center',
      padding: '8px',
      backgroundColor: `${style.backgroundColor}${Math.round(style.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
      borderRadius: '4px',
      ...(position === 'top' && { top: '10%' }),
      ...(position === 'middle' && { top: '50%', transform: 'translate(-50%, -50%)' }),
      ...(position === 'bottom' && { bottom: '10%' })
    };

    const textStyle: React.CSSProperties = {
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize}px`,
      color: style.color,
      letterSpacing: `${style.letterSpacing}px`,
      lineHeight: style.lineHeight,
      textShadow: `${style.shadowOffsetX}px ${style.shadowOffsetY}px ${style.shadowBlur}px ${style.shadowColor}`
    };

    return (
      <div key={caption.id} style={containerStyle}>
        <div style={textStyle}>{text}</div>
      </div>
    );
  };

  return (
    <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-100">
      {scene.imageUrl ? (
        <>
          <img
            src={scene.imageUrl}
            alt={`장면 ${scene.number}`}
            className="w-full h-full object-cover"
          />
          {captions.map(renderCaption)}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500">이미지 없음</p>
        </div>
      )}
    </div>
  );
} 