type Metadata = { title: string; author?: string; pageCount?: number; hasTextLayer?: boolean };

export async function extractPdfMetadata(fileNameFallback: string, pageCount = 0): Promise<Metadata> {
  const title = fileNameFallback.replace(/\.[^/.]+$/, '');
  return { title, author: 'Unknown', pageCount, hasTextLayer: pageCount > 0 };
}
