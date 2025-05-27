import { characterProfiles } from './characterProfiles';

export function generateImagePrompt(sceneDescription: string, characterNames: string[], style: string) {
  const characterText = characterNames
    .map((name) => {
      const char = characterProfiles.find((c) => c.name === name);
      return char ? char.description : name;
    })
    .join(", ");

  return `${sceneDescription}. 등장인물: ${characterText}. 스타일: ${style}. 16:9 애니메이션 구도, 고해상도, 조명 명확함.`;
} 