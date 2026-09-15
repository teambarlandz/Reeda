import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';
import * as pdfjs from 'pdfjs-dist';

export type PdfExtractResult = { pageTexts: string[]; hasTextLayer: boolean };

// Shared heuristic threshold per phase-4.md F2 (matches ReaderScreen existing check).
const MIN_TEXT_CHARS = 200;
// pdfjs loads the file via base64 into memory; beyond this fall straight to the
// native (mmap-able) path to avoid OOM on very large scanned documents.
const PDFJS_MAX_BYTES = 100 * 1024 * 1024;

// React Native has no Web Worker: pdfjs falls back to its in-bundle "fake
// worker". Point it at the worker bundle as a bare specifier so Metro can
// resolve the dynamic import used by the fake-worker bootstrap.
pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js';

// Hermes on RN 0.73 has no `structuredClone`, which pdfjs's fake-worker message
// bridge relies on. Provide a fallback that is deep enough for the objects pdfjs
// posts (typed arrays + plain objects).
function ensureStructuredClone(): void {
  const g = globalThis as any;
  if (typeof g.structuredClone === 'function') return;
  g.structuredClone = (val: any): any => {
    if (val === null || typeof val !== 'object') return val;
    if (ArrayBuffer.isView(val)) {
      const src = val.buffer.slice(val.byteOffset, val.byteOffset + val.byteLength);
      return new (val.constructor as any)(src);
    }
    if (val instanceof ArrayBuffer) return val.slice(0);
    if (val instanceof Date) return new Date(val.getTime());
    if (Array.isArray(val)) return val.map((v: any) => g.structuredClone(v));
    const out: any = {};
    for (const k of Object.keys(val)) out[k] = g.structuredClone(val[k]);
    return out;
  };
}

function base64ToBytes(b64: string): Uint8Array {
  // Hermes provides atob; fall back to a manual decode for safety.
  const bin = typeof atob === 'function'
    ? atob(b64)
    : b64.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '')
        .replace(/[\s\S]{4}/g, m => String.fromCharCode((m.charCodeAt(0) << 18) | ((m.charCodeAt(1) || 64) << 12) | ((m.charCodeAt(2) || 64) << 6) | (m.charCodeAt(3) || 64)));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function normalize(path: string): string {
  return path.replace(/^file:\/\//, '');
}

export function hasEnoughText(pageTexts: string[]): boolean {
  return pageTexts.join('').length > MIN_TEXT_CHARS;
}

async function extractWithPdfjs(pdfPath: string, onProgress?: (page: number, total: number) => void): Promise<string[] | null> {
  try {
    ensureStructuredClone();
    const stat = await RNFS.stat(pdfPath);
    if (!stat || stat.size > PDFJS_MAX_BYTES) return null;
    const b64 = await RNFS.readFile(pdfPath, 'base64');
    if (!b64) return null;
    const loadingTask = pdfjs.getDocument({ data: base64ToBytes(b64) });
    const doc = await loadingTask.promise;
    try {
      const pageTexts: string[] = [];
      for (let n = 1; n <= doc.numPages; n++) {
        onProgress?.(n, doc.numPages);
        const page = await doc.getPage(n);
        const content = await page.getTextContent();
        const text = (content.items as Array<{ str?: string }>)
          .map(it => it.str ?? '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        pageTexts.push(text);
      }
      return pageTexts;
    } finally {
      void loadingTask.destroy();
    }
  } catch {
    return null;
  }
}

// Native fallback: the same Pdfium engine react-native-pdf already embeds exposes
// per-page text without pdfjs's worker machinery — robust when the JS path is
// unavailable in the RN runtime.
async function extractWithPdfium(pdfPath: string): Promise<string[] | null> {
  const mod = NativeModules.PdfPageRenderer as { getPageTexts?: (path: string) => Promise<Array<string | null | undefined>> } | undefined;
  if (!mod?.getPageTexts) return null;
  try {
    const raw = await mod.getPageTexts(pdfPath);
    if (!Array.isArray(raw)) return null;
    return raw.map(t => String(t ?? '').replace(/\s+/g, ' ').trim());
  } catch {
    return null;
  }
}

export async function extractPdfText(pdfUri: string, onProgress?: (page: number, total: number) => void): Promise<PdfExtractResult> {
  const pdfPath = normalize(pdfUri);
  let pageTexts = await extractWithPdfjs(pdfPath, onProgress);
  if (pageTexts === null || pageTexts.length === 0) {
    pageTexts = await extractWithPdfium(pdfPath);
  }
  const safe = pageTexts ?? [];
  return { pageTexts: safe, hasTextLayer: hasEnoughText(safe) };
}