import React, { useState } from "react";
import TitleEditor from './components/TitleEditor';
import { StyledPart } from './types/shorts';
import SubtitleStylePicker, { SUBTITLE_STYLES } from './components/SubtitleStylePicker';
import HashtagEditor, { HASHTAG_STYLES } from './components/HashtagEditor';
import ImageGenerator from './components/ImageGenerator';
import ShortsPreview from './components/ShortsPreview';
import AutoGenerateButton from './components/AutoGenerateButton';
import TextEditorWithLivePreview from './components/TextEditorWithLivePreview';

export default function ShortsLayout() {
  // ... existing states with proper type annotations ...
  const [styledParts, setStyledParts] = useState<StyledPart[]>([
    { text: "첫째 줄" },
    { text: "둘째 줄" },
  ]);

  // ... rest of the component remains the same ...
} 