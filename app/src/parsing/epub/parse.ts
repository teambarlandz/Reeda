import JSZip from 'jszip';

export type ParsedChapter = {
  id: string;
  title: string;
  level: number;
  html: string;
  rawText: string;
  href: string;
};

export type ParsedEpub = {
  title: string;
  author?: string;
  chapters: ParsedChapter[];
  rawTextPerChapter: string[];
};

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function parseEpub(buffer: Uint8Array, bookId: string): Promise<ParsedEpub> {
  const zip = await JSZip.loadAsync(buffer);
  // Find OPF
  let opfPath = 'OEBPS/content.opf';
  if (zip.files['META-INF/container.xml']) {
    const containerXml = await zip.files['META-INF/container.xml'].async('text');
    const match = containerXml.match(/full-path="([^"]+)"/);
    if (match) opfPath = match[1];
  }
  const opfText = zip.files[opfPath] ? await zip.files[opfPath].async('text') : '';
  const titleMatch = opfText.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
  const authorMatch = opfText.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
  const title = titleMatch?.[1]?.trim() ?? 'Untitled';
  const author = authorMatch?.[1]?.trim();

  // TOC via NCX
  let tocTitles: Record<string, string> = {};
  const ncxFile = Object.keys(zip.files).find(k => k.endsWith('.ncx'));
  if (ncxFile) {
    const ncxText = await zip.files[ncxFile].async('text');
    const navMatches = [...ncxText.matchAll(/<navLabel><text>([^<]+)<\/text><\/navLabel>\s*<content src="([^"]+)"/g)];
    for (const m of navMatches) {
      const text = m[1].trim();
      const src = m[2].split('#')[0];
      tocTitles[src] = text;
    }
  }

  // Spine
  const spineMatches = [...opfText.matchAll(/<itemref idref="([^"]+)"/g)].map(m => m[1]);
  const manifestMap: Record<string, { href: string }> = {};
  const manifestMatches = [...opfText.matchAll(/<item id="([^"]+)" href="([^"]+)" media-type="[^"]*"/g)];
  for (const m of manifestMatches) {
    manifestMap[m[1]] = { href: m[2] };
  }

  const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
  const chapters: ParsedChapter[] = [];

  if (spineMatches.length > 0) {
    for (let i = 0; i < spineMatches.length; i++) {
      const idref = spineMatches[i];
      const entry = manifestMap[idref];
      if (!entry) continue;
      const href = opfDir + entry.href;
      const file = zip.files[href];
      if (!file) continue;
      const html = await file.async('text');
      // Extract title from h1 or fallback to TOC
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const tocTitle = tocTitles[entry.href] ?? tocTitles[href];
      const chapTitle = tocTitle ?? h1Match?.[1]?.trim() ?? `Chapter ${i + 1}`;
      const rawText = stripTags(html);
      chapters.push({ id: `${bookId}-c${i}`, title: chapTitle, level: 0, html, rawText, href });
    }
  } else {
    // Fallback: all xhtml files sorted
    const xhtmlFiles = Object.keys(zip.files).filter(k => k.endsWith('.xhtml') || k.endsWith('.html')).sort();
    for (let i = 0; i < xhtmlFiles.length; i++) {
      const href = xhtmlFiles[i];
      const html = await zip.files[href].async('text');
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const chapTitle = h1Match?.[1]?.trim() ?? `Chapter ${i + 1}`;
      chapters.push({ id: `${bookId}-c${i}`, title: chapTitle, level: 0, html, rawText: stripTags(html), href });
    }
  }

  return { title, author, chapters, rawTextPerChapter: chapters.map(c => c.rawText) };
}

export function paginateChapters(chapters: ParsedChapter[], viewportHeight: number, charsPerPage = 1500): { page: number; chapterIndex: number; offset: number }[] {
  // Virtual pagination: each chapter split by charsPerPage estimate
  const pages: { page: number; chapterIndex: number; offset: number }[] = [];
  let pageNum = 1;
  for (let ci = 0; ci < chapters.length; ci++) {
    const text = chapters[ci].rawText;
    const pagesInChap = Math.max(1, Math.ceil(text.length / charsPerPage));
    for (let p = 0; p < pagesInChap; p++) {
      pages.push({ page: pageNum++, chapterIndex: ci, offset: p * charsPerPage });
    }
  }
  return pages;
}
