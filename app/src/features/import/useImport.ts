import { useCallback } from 'react';
import DocumentPicker from 'react-native-document-picker';
import { FileStorage, ImportError } from '../../data/files/FileStorage';
import { BookRepository } from '../../data/repositories/BookRepository';
import { extractMetadata as extractEpubMetadata } from '../../parsing/epub/extractMetadata';
import { useQueryClient } from '@tanstack/react-query';
import { useImportStore, ImportItem } from './importStore';

async function extractMetadata(ext: string, dest: string, name: string) {
  if (ext === 'docx') return { title: name.replace(/\.docx$/i, ''), author: 'Unknown' };
  return extractEpubMetadata(dest, name);
}

export function useImport() {
  const { items, setItems, clear: clearStore } = useImportStore();
  const queryClient = useQueryClient();

  const importFiles = useCallback(
    async (files: Array<{ uri: string; name: string; size?: number; type?: string }>, opts?: { allowDuplicate?: boolean }) => {
      const limited = files.slice(0, 10);
      const newItems: ImportItem[] = limited.map(f => ({
        id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 4)}`,
        fileName: f.name,
        fileSize: f.size,
        status: 'pending' as const,
        uri: f.uri,
      }));
      setItems(prev => [...prev, ...newItems]);

      for (let i = 0; i < limited.length; i++) {
        const file = limited[i];
        const item = newItems[i];
        setItems(prev => prev.map(p => (p.id === item.id ? { ...p, status: 'copying' as const } : p)));

        const preError = await FileStorage.validateFile(file.uri, file.name, file.size);
        if (preError) {
          if (preError.case === 'tooLarge') {
            if (!opts?.allowDuplicate) {
              setItems(prev => prev.map(p => (p.id === item.id ? { ...p, status: 'error' as const, error: preError, uri: file.uri } : p)));
              continue;
            }
          } else {
            setItems(prev => prev.map(p => (p.id === item.id ? { ...p, status: 'error' as const, error: preError } : p)));
            continue;
          }
        }

        try {
          const hash = await FileStorage.computeHash(file.uri);
          if (!opts?.allowDuplicate) {
            const { isDuplicate, existingId } = await FileStorage.checkDuplicate(hash);
            if (isDuplicate) {
              const dupError: ImportError = { case: 'duplicate', title: 'Already in library', body: 'This book is already in your library.' };
              setItems(prev => prev.map(p => (p.id === item.id ? { ...p, status: 'error' as const, error: dupError, existingId } : p)));
              continue;
            }
          }

          setItems(prev => prev.map(p => (p.id === item.id ? { ...p, status: 'parsing' as const } : p)));

          const ext = file.name.split('.').pop()?.toLowerCase() ?? 'epub';
          const bookId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          const dest = await FileStorage.copyToAppPrivate(file.uri, bookId, ext);
          const meta = await extractMetadata(ext, dest, file.name);
          const coverPath = await FileStorage.extractCover(dest, bookId);

          const finalHash = await FileStorage.computeHash(dest).catch(() => hash);

          await BookRepository.upsert({
            id: bookId,
            title: meta.title,
            author: meta.author,
            coverPath: coverPath ?? undefined,
            filePath: dest,
            originalFileName: file.name,
            format: ext,
            fileHash: finalHash,
            fileSize: file.size,
            addedAt: Date.now(),
            status: 'want_to_read',
            isSample: 0,
          });

          setItems(prev => prev.map(p => (p.id === item.id ? { ...p, status: 'done' as const } : p)));
          queryClient.invalidateQueries({ queryKey: ['books'] });
        } catch (e: any) {
          let err: ImportError;
          const msg = String(e?.message ?? '').toLowerCase();
          if (msg.includes('password') || msg.includes('encrypted')) {
            err = { case: 'locked', title: 'Locked PDF', body: 'This PDF is password-protected. Remove the password and try again.' };
          } else if (msg.includes('corrupt') || msg.includes('damaged')) {
            err = { case: 'corrupt', title: 'Could not open', body: 'This file looks damaged. Try downloading it again.' };
          } else {
            err = { case: 'corrupt', title: 'Could not open', body: 'This file looks damaged. Try downloading it again.' };
          }
          setItems(prev => prev.map(p => (p.id === item.id ? { ...p, status: 'error' as const, error: err } : p)));
        }
      }
    },
    [queryClient, setItems],
  );

  const pickAndImport = useCallback(async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });
      const files = res.map((r: any) => ({ uri: r.uri, name: r.name ?? 'unknown', size: r.size ?? undefined, type: r.type ?? undefined }));
      await importFiles(files);
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) return;
      throw err;
    }
  }, [importFiles]);

  const importAnyway = useCallback(
    async (itemId: string) => {
      const item = useImportStore.getState().items.find(i => i.id === itemId);
      if (!item || !item.uri) return;
      setItems(prev => prev.filter(p => p.id !== itemId));
      await importFiles([{ uri: item.uri, name: item.fileName, size: item.fileSize }], { allowDuplicate: true });
    },
    [importFiles, setItems],
  );

  const clear = useCallback(() => clearStore(), [clearStore]);

  return { items, importFiles, pickAndImport, importAnyway, clear };
}
