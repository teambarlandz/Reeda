import type { ParsedChapter } from '../epub/parse';

/**
 * Converts per-page PDF text into ParsedChapter[] — one chapter per page, in the
 * exact shape EPUB parsing produces, so TTS / highlights / search / pagination
 * consume PDFs unchanged. See phase-4.md F4: id = 'page-${n}', title = 'Page ${n}'.
 */
export function pdfToChapters(pageTexts: string[], _bookId: string, startPage = 1): ParsedChapter[] {
  return pageTexts.map((text, i) => {
    const page = i + startPage;
    return {
      id: `page-${page}`,
      title: `Page ${page}`,
      level: 0,
      html: '',
      rawText: text,
      href: '',
    };
  });
}