import JSZip from 'jszip';

type Metadata = {
  title: string;
  author?: string;
  coverBlob?: Uint8Array | null;
  pageCount?: number;
};

export async function extractMetadata(filePath: string, fileNameFallback: string): Promise<Metadata> {
  try {
    // In RN, reading file is via react-native-fs; for M2 we parse if available, else fallback
    // This stub attempts to read via fetch if filePath is local uri, but fallback to fileName
    const fallbackTitle = fileNameFallback.replace(/\.[^/.]+$/, '');
    return { title: fallbackTitle, author: 'Unknown', coverBlob: null, pageCount: undefined };
  } catch {
    return { title: fileNameFallback.replace(/\.[^/.]+$/, ''), author: 'Unknown' };
  }
}

// Minimal EPUB parse for Library card: extract title/author from OPF if zip provided as buffer
export async function parseEpubBuffer(buffer: Uint8Array, fileNameFallback: string): Promise<Metadata> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const opfFile = Object.keys(zip.files).find(k => k.endsWith('.opf'));
    if (!opfFile) throw new Error('no opf');
    const opfText = await zip.files[opfFile].async('text');
    const titleMatch = opfText.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
    const authorMatch = opfText.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
    const title = titleMatch?.[1]?.trim() || fileNameFallback.replace(/\.[^/.]+$/, '');
    const author = authorMatch?.[1]?.trim() || 'Unknown';
    // Cover: look for manifest cover-image or OEBPS/cover.*
    let coverBlob: Uint8Array | null = null;
    const coverEntry = Object.keys(zip.files).find(k => k.toLowerCase().includes('cover') && /\.(jpg|jpeg|png)$/i.test(k));
    if (coverEntry) {
      coverBlob = await zip.files[coverEntry].async('uint8array');
    }
    return { title, author, coverBlob };
  } catch {
    return { title: fileNameFallback.replace(/\.[^/.]+$/, ''), author: 'Unknown' };
  }
}
