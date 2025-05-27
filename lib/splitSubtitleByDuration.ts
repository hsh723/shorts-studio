export interface SubtitleBlock {
  text: string;
  start: number;
  end: number;
}

export function splitSubtitleByDuration(text: string, duration: number): SubtitleBlock[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 3);

  const blockCount = sentences.length;
  const blockDuration = duration / blockCount;

  return sentences.map((line, index) => ({
    text: line.trim(),
    start: +(index * blockDuration).toFixed(2),
    end: +((index + 1) * blockDuration).toFixed(2),
  }));
} 