import type { ParsedChapter } from '../parsing/epub/parse';

export type TtsSentence = {
  id: string;
  text: string;
  chapterIndex: number;
  chapterId: string;
  chapterTitle: string;
  sentenceIndex: number;
  offsetInChapter: number;
};

function splitIntoSentences(text: string): string[] {
  if (!text || !text.trim()) return [];
  // Split on sentence boundaries: . ! ? followed by space + capital or end
  // Fallback to simple split to keep robust across languages
  const cleaned = text.replace(/\s+/g, ' ').trim();
  // Use regex that captures sentences including delimiters
  const matches = cleaned.match(/[^.!?]+[.!?]+[\])'"`’”]*|\s*[^.!?]+$/g);
  if (!matches) return [cleaned].filter(Boolean);
  return matches.map(s => s.trim()).filter(s => s.length > 1);
}

export function buildQueue(chapters: ParsedChapter[]): TtsSentence[] {
  const queue: TtsSentence[] = [];
  let sentenceIndex = 0;
  chapters.forEach((ch, ci) => {
    const sentences = splitIntoSentences(ch.rawText);
    if (sentences.length === 0) return; // skip image-only chapter per spec
    let offset = 0;
    sentences.forEach(s => {
      const idx = ch.rawText.indexOf(s, offset);
      const off = idx >= 0 ? idx : offset;
      queue.push({
        id: `${ch.id}-s${sentenceIndex}`,
        text: s,
        chapterIndex: ci,
        chapterId: ch.id,
        chapterTitle: ch.title,
        sentenceIndex: sentenceIndex++,
        offsetInChapter: off,
      });
      offset = off + s.length;
    });
  });
  return queue;
}

export function findStartIndex(queue: TtsSentence[], chapterIndex: number): number {
  const idx = queue.findIndex(s => s.chapterIndex >= chapterIndex);
  return idx >= 0 ? idx : 0;
}

export function getChapterProgress(queue: TtsSentence[], currentIndex: number): number {
  if (queue.length === 0) return 0;
  const cur = queue[currentIndex];
  if (!cur) return 1;
  const chapterSentences = queue.filter(s => s.chapterIndex === cur.chapterIndex);
  if (chapterSentences.length === 0) return 0;
  const posInChapter = chapterSentences.findIndex(s => s.id === cur.id);
  return (posInChapter + 1) / chapterSentences.length;
}

export function estimateDurationSec(text: string, rate: number): number {
  // ~150 wpm at 1x, approx 5 chars per word
  const words = text.trim().split(/\s+/).length;
  const wpm = 150 * rate;
  return Math.max(1, Math.round((words / wpm) * 60));
}
