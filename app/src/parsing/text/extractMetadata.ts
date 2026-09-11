export async function extractTextMetadata(fileNameFallback: string): Promise<{ title: string; author?: string }> {
  return { title: fileNameFallback.replace(/\.[^/.]+$/, ''), author: 'Unknown' };
}
