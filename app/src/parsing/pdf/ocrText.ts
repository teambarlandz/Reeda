import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';
import TextRecognition from '@react-native-ml-kit/text-recognition';

export type OcrProgress = { currentPage: number; total: number };

const LINKING_ERROR =
  "The native module 'PdfPageRenderer' doesn't seem to be linked. " +
  'Make sure you rebuilt the app after installing packages.';

const pdfBridge: any = NativeModules.PdfPageRenderer
  ? NativeModules.PdfPageRenderer
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

function normalize(path: string): string {
  return path.replace(/^file:\/\//, '');
}

async function ensureDir(path: string): Promise<void> {
  if (!(await RNFS.exists(path))) await RNFS.mkdir(path);
}

export function getPdfPageCount(pdfPath: string): Promise<number> {
  return Promise.resolve(pdfBridge.getPageCount(normalize(pdfPath))).then((n: unknown) => Math.max(0, Math.floor(Number(n))));
}

/**
 * Renders one PDF page to a JPEG file via the Pdfium engine (same engine
 * react-native-pdf embeds) — feeds ML Kit OCR with an image per page.
 */
export async function renderPdfPageImage(pdfPath: string, pageIndex: number, outputPath: string, scale = 2.0): Promise<string> {
  const uri = await Promise.resolve(pdfBridge.renderPageToFile(normalize(pdfPath), pageIndex, outputPath, scale));
  return String(uri ?? `file://${outputPath}`);
}

/**
 * Renders all pages of a scanned PDF into image files (used for OCR).
 * Returns the image URIs in page order.
 */
export async function renderPdfPages(
  pdfPath: string,
  outputDir: string,
  pageCount: number,
  scale = 2.0,
  onProgress?: (p: OcrProgress) => void,
): Promise<string[]> {
  await ensureDir(outputDir);
  const uris: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    onProgress?.({ currentPage: i + 1, total: pageCount });
    const out = `${outputDir}/page_${i + 1}.jpg`;
    try {
      uris.push(await renderPdfPageImage(pdfPath, i, out, scale));
    } catch {
      // skip unrenderable pages
    }
  }
  return uris;
}

/**
 * Runs Google ML Kit OCR over page image URIs. Emits progress per page.
 * Returns { pageTexts } per phase-4.md F3.
 */
export async function ocrPages(pageImageUris: string[], onProgress?: (p: OcrProgress) => void): Promise<{ pageTexts: string[] }> {
  const pageTexts: string[] = [];
  for (let i = 0; i < pageImageUris.length; i++) {
    onProgress?.({ currentPage: i + 1, total: pageImageUris.length });
    try {
      const result = await TextRecognition.recognize(pageImageUris[i]);
      pageTexts.push((result?.text ?? '').replace(/\s+/g, ' ').trim());
    } catch {
      pageTexts.push('');
    }
  }
  return { pageTexts };
}

/**
 * Full scanned-PDF pipeline: render pages to images, then OCR them, reporting
 * progress at each step. Returns { pageTexts } in page order.
 */
export async function ocrPdf(
  pdfPath: string,
  pageCount: number,
  outputDir: string,
  onProgress?: (p: OcrProgress) => void,
): Promise<{ pageTexts: string[] }> {
  const uris = await renderPdfPages(pdfPath, outputDir, pageCount, 2.0, onProgress);
  return ocrPages(uris, onProgress);
}