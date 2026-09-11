// FileStorage stub for M1 — real copy/hash in M5 per phase-4.md:1
// M2 adds extractCover helper.

import { Platform } from 'react-native';

export const FileStorage = {
  getAppPrivateDir(): string {
    return Platform.OS === 'android' ? '/data/data/com.reeda.app/files/books' : '/tmp/reeda/books';
  },

  async copyToAppPrivate(srcPath: string, bookId: string, ext: string): Promise<string> {
    // TODO M5 — copy file to app-private and return new path
    return `${FileStorage.getAppPrivateDir()}/${bookId}.${ext}`;
  },

  async computeHash(filePath: string): Promise<string> {
    // TODO M5 — streaming SHA-256
    return `hash-${filePath}`;
  },

  async checkDuplicate(hash: string): Promise<boolean> {
    // TODO M5 — query books.fileHash
    return false;
  },

  async extractCover(filePath: string, bookId: string): Promise<string | null> {
    // M2: for EPUB parse cover entry, for PDF render first page thumbnail, for TXT generate placeholder
    // For now return null to show placeholder bg-search card per Library BookCard
    return null;
  },

  // Helper used by BookCard to resolve cover uri (file:// already handled)
  resolveCoverPath(coverPath: string | null | undefined): string | null {
    return coverPath ?? null;
  },
};
