import { pdfToChapters } from '../src/parsing/pdf/pdfToChapters';
import { hasEnoughText } from '../src/parsing/pdf/extractText';
import { buildQueue } from '../src/tts/TtsQueue';

describe('pdfToChapters', () => {
  it('maps per-page texts to ParsedChapter[] with correct ids and titles', () => {
    const chapters = pdfToChapters(['First page text', 'Second page'], 'book-abc');
    expect(chapters).toHaveLength(2);
    expect(chapters[0]).toEqual({
      id: 'page-1',
      title: 'Page 1',
      level: 0,
      html: '',
      rawText: 'First page text',
      href: '',
    });
    expect(chapters[1]).toEqual({
      id: 'page-2',
      title: 'Page 2',
      level: 0,
      html: '',
      rawText: 'Second page',
      href: '',
    });
  });

  it('supports startPage offset', () => {
    const chapters = pdfToChapters(['Hello'], 'id', 100);
    expect(chapters[0].id).toBe('page-100');
    expect(chapters[0].title).toBe('Page 100');
  });

  it('returns empty array for empty input', () => {
    expect(pdfToChapters([], 'id')).toEqual([]);
  });
});

describe('hasEnoughText', () => {
  it('returns false for short or empty texts', () => {
    expect(hasEnoughText([])).toBe(false);
    expect(hasEnoughText([''])).toBe(false);
    expect(hasEnoughText(['Hi'])).toBe(false);
  });

  it('returns true when combined text exceeds 200 chars', () => {
    expect(hasEnoughText(['A'.repeat(201)])).toBe(true);
    expect(hasEnoughText(['x'.repeat(100), 'y'.repeat(101)])).toBe(true);
  });
});

describe('TtsQueue.buildQueue with mergeAcrossPages', () => {
  const pdfChapters = [
    { id: 'page-1', title: 'Page 1', level: 0, html: '', href: '', rawText: 'The quick brown' },
    { id: 'page-2', title: 'Page 2', level: 0, html: '', href: '', rawText: 'fox jumped over the lazy dog.' },
  ];
  const epubChapters = [
    { id: 'test-book-c0', title: 'Chapter 1', level: 0, html: '', href: '', rawText: 'The quick brown' },
    { id: 'test-book-c1', title: 'Chapter 2', level: 0, html: '', href: '', rawText: 'fox jumped over the lazy dog.' },
  ];

  it('auto-detects PDF chapters and merges text before sentence splitting', () => {
    const queue = buildQueue(pdfChapters);
    const texts = queue.map(s => s.text);
    // The full text "The quick brown fox jumped over the lazy dog." has a sentence
    // boundary at the period — expect at most 2 sentences, not split at page boundary.
    const joined = texts.join(' ');
    expect(joined).toContain('fox jumped');
    // A single-sentence or two-sentence split is expected — NOT 4 separate fragments.
    expect(texts.length).toBeLessThanOrEqual(2);
  });

  it('does not merge for EPUB chapter ids', () => {
    const queue = buildQueue(epubChapters);
    const texts = queue.map(s => s.text);
    // Without merge, pages are split independently, so "The quick brown" is its
    // own sentence fragment (no period) — we still get at least 2 queue items.
    expect(texts.length).toBeGreaterThanOrEqual(2);
    expect(texts.some(t => t.includes('The quick brown'))).toBe(true);
  });

  it('respects explicit mergeAcrossPages option', () => {
    const explicitMerge = buildQueue(epubChapters, { mergeAcrossPages: true });
    const explicitNo = buildQueue(pdfChapters, { mergeAcrossPages: false });
    // explicit merge on epub → merged (single/joint sentences)
    expect(explicitMerge.map(s => s.text).join(' ')).toContain('fox jumped');
    // explicit no-merge on pdf → separate per page
    expect(explicitNo.length).toBeGreaterThanOrEqual(2);
  });

  it('maps merged sentences back to the page where the sentence starts', () => {
    const queue = buildQueue(pdfChapters);
    const foxSentence = queue.find(s => s.text.includes('fox'));
    expect(foxSentence).toBeDefined();
    // The merged sentence "The quick brown fox jumped over the lazy dog."
    // starts at offset 0 (page 1), so chapterIndex = 0 even though "fox" appears on page 2.
    expect(foxSentence!.chapterIndex).toBe(0);
    expect(foxSentence!.chapterTitle).toBe('Page 1');
    expect(foxSentence!.chapterId).toBe('page-1');
  });
});