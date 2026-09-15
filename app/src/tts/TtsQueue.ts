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

export function buildQueue(chapters: ParsedChapter[], opts?: { mergeAcrossPages?: boolean }): TtsSentence[] {
  // PDF "chapters" are per-page: ids are 'page-N' (F4) or 'bookId-page-N'.
  const isPdfQueue = chapters.some(ch => /(^|-|_)page-\d+$/.test(ch.id));
  // PDF "chapters" are pages: concatenate adjacent page texts before sentence
  // splitting so a sentence spanning a page boundary is not split mid-way.
  // Default off for EPUBs, on for PDFs per phase-4.md F10.
  const merge = opts?.mergeAcrossPages ?? isPdfQueue;
  const queue: TtsSentence[] = [];
  let sentenceIndex = 0;

  if (!merge) {
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

  // Merged mode: split the joined text once, then map each sentence back to the
  // page (chapter) that contains its starting offset, keeping page metadata.
  const offsets: number[] = [];
  let acc = 0;
  for (const ch of chapters) {
    offsets.push(acc);
    acc += ch.rawText.length + 1;
  }
  const joined = chapters.map(c => c.rawText).join(' ');
  if (!joined.trim()) return queue;

  const sentences = splitIntoSentences(joined);
  if (sentences.length === 0) return queue;

  let searchFrom = 0;
  sentences.forEach(s => {
    const idx = joined.indexOf(s, searchFrom);
    const off = idx >= 0 ? idx : Math.min(searchFrom, Math.max(0, joined.length - s.length));
    searchFrom = off + s.length;

    let pageIdx = chapters.length - 1;
    for (let i = 0; i < chapters.length; i++) {
      if (off >= offsets[i] && (i === chapters.length - 1 || off < offsets[i + 1])) {
        pageIdx = i;
        break;
      }
    }
    const page = chapters[pageIdx];
    queue.push({
      id: `${page.id}-s${sentenceIndex}`,
      text: s,
      chapterIndex: pageIdx,
      chapterId: page.id,
      chapterTitle: page.title,
      sentenceIndex: sentenceIndex++,
      offsetInChapter: Math.max(0, off - offsets[pageIdx]),
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
