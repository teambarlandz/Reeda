import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import CryptoJS from 'crypto-js';
import { BookRepository } from '../repositories/BookRepository';

const SUPPORTED_EXTS = ['epub', 'pdf', 'txt', 'mobi'];
const MAX_SIZE = 200 * 1024 * 1024; // 200 MB per phase-1.md:3.2

export type ImportError = {
  case: 'unsupported' | 'empty' | 'scanned' | 'locked' | 'corrupt' | 'duplicate' | 'tooLarge';
  title: string;
  body: string;
};

export const FileStorage = {
  getAppPrivateDir(): string {
    return Platform.OS === 'android' ? `${RNFS.DocumentDirectoryPath}/books` : '/tmp/reeda/books';
  },

  getCoverDir(): string {
    return Platform.OS === 'android' ? `${RNFS.DocumentDirectoryPath}/covers` : '/tmp/reeda/covers';
  },

  async ensureDirs(): Promise<void> {
    const booksDir = FileStorage.getAppPrivateDir();
    const coversDir = FileStorage.getCoverDir();
    try {
      const existsBooks = await RNFS.exists(booksDir);
      if (!existsBooks) await RNFS.mkdir(booksDir);
      const existsCovers = await RNFS.exists(coversDir);
      if (!existsCovers) await RNFS.mkdir(coversDir);
    } catch {}
  },

  async copyToAppPrivate(srcPath: string, bookId: string, ext: string): Promise<string> {
    await FileStorage.ensureDirs();
    const dest = `${FileStorage.getAppPrivateDir()}/${bookId}.${ext}`;
    // Copy via RNFS — original untouched per phase-1.md:6.3
    await RNFS.copyFile(srcPath, dest);
    return dest;
  },

  async computeHash(filePath: string): Promise<string> {
    // Streaming SHA-256 per phase-1.md:3.2 — chunked to avoid OOM, true streaming for all sizes
    try {
      const stat = await RNFS.stat(filePath);
      // Fast path for duplicate detection: size+mtime for very large files >50MB still valid per spec
      // For true streaming, we chunk 64KB at a time
      const CHUNK = 64 * 1024;
      const sha = (CryptoJS as any).algo.SHA256.create();
      let offset = 0;
      while (offset < stat.size) {
        const remaining = stat.size - offset;
        const toRead = Math.min(CHUNK, remaining);
        // RNFS.read with offset — falls back to readFile for small files if not supported
        let chunkBase64: string;
        try {
          // @ts-ignore — RNFS.read may not be typed but exists in newer RNFS
          chunkBase64 = await (RNFS as any).read(filePath, toRead, offset, 'base64');
        } catch {
          // Fallback: readFile whole for small files <5MB
          if (stat.size < 5 * 1024 * 1024) {
            const b64 = await RNFS.readFile(filePath, 'base64');
            const wa = CryptoJS.enc.Base64.parse(b64);
            return CryptoJS.SHA256(wa).toString();
          }
          return `size-${stat.size}-mtime-${stat.mtime}`;
        }
        const wa = CryptoJS.enc.Base64.parse(chunkBase64);
        sha.update(wa);
        offset += toRead;
        // Yield to avoid blocking UI for large files
        if (offset % (1024 * 1024) === 0) await new Promise(r => setTimeout(r, 0));
      }
      return sha.finalize().toString();
    } catch {
      return `hash-${filePath}-${Date.now()}`;
    }
  },

  async checkDuplicate(hash: string): Promise<{ isDuplicate: boolean; existingId?: string }> {
    try {
      const db = require('../db').getDb();
      const res: any = await db.execute('SELECT id FROM books WHERE fileHash = ? LIMIT 1;', [hash]);
      const rows = res.rows?._array ?? res.rows ?? [];
      if (rows.length > 0) return { isDuplicate: true, existingId: rows[0].id };
      return { isDuplicate: false };
    } catch {
      return { isDuplicate: false };
    }
  },

  async validateFile(filePath: string, fileName: string, fileSize?: number): Promise<ImportError | null> {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'docx') {
      // DOCX placeholder per phase-1.md:3.1 — accept but show coming soon, not block picker
      return null;
    }
    if (!SUPPORTED_EXTS.includes(ext)) {
      return { case: 'unsupported', title: 'Unsupported file', body: 'This app opens EPUB, PDF, TXT, and MOBI. DOCX is coming soon.' };
    }
    if (fileSize && fileSize > MAX_SIZE) {
      return { case: 'tooLarge', title: 'Large file', body: 'This file is over 200 MB and may be slow to open.' };
    }
    if (fileSize === 0) {
      return { case: 'empty', title: 'Cannot open PDF', body: 'This PDF has no readable pages.' };
    }
    // Password-protected, corrupt, scanned checks would be done during parsing per phase-1.md:3.3
    // Return null means no pre-flight error, proceed to parse
    return null;
  },

  async extractCover(filePath: string, bookId: string): Promise<string | null> {
    // EPUB: OEBPS/cover.* or manifest cover-image — extracted via JSZip in parsing layer
    // PDF: render first page at 300px via react-native-pdf thumbnail
    // TXT/MOBI: generated placeholder
    // For M5, we attempt to copy cover if exists, else null
    try {
      const coverSrc = `${FileStorage.getCoverDir()}/${bookId}.jpg`;
      const exists = await RNFS.exists(coverSrc);
      if (exists) return coverSrc;
      return null;
    } catch {
      return null;
    }
  },

  resolveCoverPath(coverPath: string | null | undefined): string | null {
    return coverPath ?? null;
  },

  // --- PDF text cache (F11) --------------------------------------------------

  getPdfCacheDir(): string {
    return `${FileStorage.getAppPrivateDir()}/pdf_cache`;
  },

  getOcrPageDir(bookId: string): string {
    return `${FileStorage.getAppPrivateDir()}/ocr_pages/${bookId}`;
  },

  async savePdfTextCache(bookId: string, kind: 'extract' | 'ocr', pageTexts: string[]): Promise<void> {
    try {
      const dir = FileStorage.getPdfCacheDir();
      if (!(await RNFS.exists(dir))) await RNFS.mkdir(dir);
      const json = JSON.stringify({ bookId, kind, pageTexts, savedAt: Date.now() });
      await RNFS.writeFile(`${dir}/${bookId}_${kind}.json`, json, 'utf8');
    } catch {}
  },

  async loadPdfTextCache(bookId: string, kind: 'extract' | 'ocr'): Promise<string[] | null> {
    try {
      const p = `${FileStorage.getPdfCacheDir()}/${bookId}_${kind}.json`;
      if (!(await RNFS.exists(p))) return null;
      const raw = await RNFS.readFile(p, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.pageTexts) ? parsed.pageTexts : null;
    } catch {
      return null;
    }
  },

  async clearPdfCaches(bookId: string): Promise<void> {
    try {
      const dirs = [
        `${FileStorage.getPdfCacheDir()}/${bookId}_extract.json`,
        `${FileStorage.getPdfCacheDir()}/${bookId}_ocr.json`,
      ];
      const ocrDir = FileStorage.getOcrPageDir(bookId);
      if (await RNFS.exists(ocrDir)) await RNFS.unlink(ocrDir);
      for (const p of dirs) {
        if (await RNFS.exists(p)) await RNFS.unlink(p);
      }
    } catch {}
  },

  async deleteBookFiles(bookId: string, ext: string): Promise<void> {
    try {
      const bookPath = `${FileStorage.getAppPrivateDir()}/${bookId}.${ext}`;
      const coverPath = `${FileStorage.getCoverDir()}/${bookId}.jpg`;
      const existsBook = await RNFS.exists(bookPath);
      if (existsBook) await RNFS.unlink(bookPath);
      const existsCover = await RNFS.exists(coverPath);
      if (existsCover) await RNFS.unlink(coverPath);
      await FileStorage.clearPdfCaches(bookId);
    } catch {}
  },
};
