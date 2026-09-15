import { extractPdfText } from './extractText';

export type PdfMetadata = {
  title: string;
  author?: string;
  pageCount: number;
  hasTextLayer: boolean;
  totalTextLength: number;
  pageTexts: string[];
};

/**
 * Real scanned-PDF detection per phase-4.md F5: runs the extraction pipeline and
 * reports hasTextLayer + totalTextLength instead of the old pageCount heuristic.
 * pageTexts is surfaced so callers (ReaderScreen) can build chapters from the
 * same single extraction pass without re-reading the document.
 */
export async function extractPdfMetadata(
  fileNameFallback: string,
  pdfUri: string,
  pageCount = 0,
  onProgress?: (page: number, total: number) => void,
): Promise<PdfMetadata> {
  const title = fileNameFallback.replace(/\.[^/.]+$/, '');
  const { pageTexts, hasTextLayer } = await extractPdfText(pdfUri, onProgress);
  const totalTextLength = pageTexts.join('').length;
  return {
    title,
    author: 'Unknown',
    pageCount: pageTexts.length > 0 ? pageTexts.length : pageCount,
    hasTextLayer,
    totalTextLength,
    pageTexts,
  };
}