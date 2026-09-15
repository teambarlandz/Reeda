import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, ToastAndroid, Platform, AccessibilityInfo, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { useReducedMotion } from '../../../shared/hooks/useReducedMotion';
import { typography, spacing } from '../../../shared/theme/tokens';
import { useReaderStore } from '../store/readerStore';
import { useMenuStore } from '../menu/menuStore';
import { useReaderPosition } from '../hooks/useReaderPosition';
import { useProgress } from '../hooks/useProgress';
import { BookRepository } from '../../../data/repositories/BookRepository';
import { ChapterRepository, Chapter } from '../../../data/repositories/ChapterRepository';
import { ReadingSessionsRepository } from '../../../data/repositories/ReadingSessionsRepository';
import { HighlightRepository, HIGHLIGHT_COLORS } from '../../../data/repositories/HighlightRepository';
import { NoteRepository } from '../../../data/repositories/NoteRepository';
import { BookmarkRepository } from '../../../data/repositories/BookmarkRepository';
import { DictionaryHistoryRepository } from '../../../data/repositories/DictionaryHistoryRepository';
import { RectangularMenu } from '../menu/RectangularMenu';
import { ReadingToolbar } from '../toolbar/ReadingToolbar';
import { TTSMiniPlayer } from '../toolbar/TTSMiniPlayer';
import { TTSExpandedPlayer } from '../panels/TTSExpandedPlayer';
import { TTSSettings } from '../panels/TTSSettings';
import { useTtsStore } from '../../../tts/ttsStore';
import { useTts } from '../../../tts/useTts';
import { TtsEngine } from '../../../tts/TtsEngine';
import { FullscreenController } from '../modes/FullscreenController';
import { ScrollMode } from '../modes/ScrollMode';
import { PaginateMode } from '../modes/PaginateMode';
import { PdfView } from '../../../parsing/pdf/PdfView';
import { extractPdfMetadata } from '../../../parsing/pdf/extractMetadata';
import { ocrPdf, getPdfPageCount } from '../../../parsing/pdf/ocrText';
import { pdfToChapters } from '../../../parsing/pdf/pdfToChapters';
import { FileStorage } from '../../../data/files/FileStorage';
import { TOCPanel } from '../panels/TOCPanel';
import { PagesGrid } from '../panels/PagesGrid';
import { ProgressStrip } from '../panels/ProgressStrip';
import { ProgressSheet } from '../panels/ProgressSheet';
import { ThemePanel } from '../panels/ThemePanel';
import { HighlightsPanel } from '../panels/HighlightsPanel';
import { NotesPanel } from '../panels/NotesPanel';
import { BookmarksPanel } from '../panels/BookmarksPanel';
import { DictionaryCard } from '../panels/DictionaryCard';
import { SearchSheet } from '../panels/SearchSheet';
import { SelectionToolbar } from '../annotations/SelectionToolbar';
import { HighlightPicker } from '../annotations/HighlightPicker';
import { NoteSheet } from '../annotations/NoteSheet';
import { BookmarkButton } from '../annotations/BookmarkButton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ParsedChapter } from '../../../parsing/epub/parse';

function getSampleChapters(bookId: string): ParsedChapter[] | null {
  if (bookId === 'sample-alice') {
    return [
      { id: 'c1', title: 'Chapter I — Down the Rabbit-Hole', level: 0, href: 'c1', html: '', rawText: 'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do. '.repeat(30) },
      { id: 'c2', title: 'Chapter II — The Pool of Tears', level: 0, href: 'c2', html: '', rawText: 'Curiouser and curiouser! cried Alice. '.repeat(30) },
      { id: 'c3', title: 'Chapter III — A Caucus-Race', level: 0, href: 'c3', html: '', rawText: 'They were indeed a queer-looking party that assembled on the bank. '.repeat(30) },
    ];
  }
  if (bookId === 'sample-devotion') {
    return [
      { id: 'c1', title: 'Morning Reflection', level: 0, href: 'c1', html: '', rawText: 'Blessed are the peacemakers, for they shall be called children of God. Take a moment to breathe and reflect. '.repeat(20) },
      { id: 'c2', title: 'Evening Prayer', level: 0, href: 'c2', html: '', rawText: 'Consider the day that has passed. What moments brought you closer to understanding? '.repeat(20) },
    ];
  }
  if (bookId === 'sample-pride') {
    return [
      { id: 'c1', title: 'Chapter 1', level: 0, href: 'c1', html: '', rawText: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. '.repeat(50) },
      { id: 'c2', title: 'Chapter 2', level: 0, href: 'c2', html: '', rawText: 'Mr. Bennet was among the earliest of those who waited upon Mr. Bingley. '.repeat(50) },
      { id: 'c3', title: 'Chapter 3', level: 0, href: 'c3', html: '', rawText: 'Not all that Mrs. Bennet, however, with the assistance of her five daughters, could ask on the subject. '.repeat(50) },
      { id: 'c4', title: 'Chapter 4', level: 0, href: 'c4', html: '', rawText: 'Long sample to demonstrate pagination: this excerpt spans multiple virtual pages. '.repeat(60) },
    ];
  }
  return null;
}

export function ReaderScreen() {
  const t = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookId = route.params?.bookId ?? 'sample-alice';

  const { readingMode } = useReaderStore();
  const { activePanel, setActivePanel } = useMenuStore();
  const { savePosition } = useReaderPosition(bookId);
  const { data: progress } = useProgress(bookId);
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();

  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useRef<ScrollView>(null);
  const sessionRef = useRef<string | null>(null);
  const prevPageRef = useRef(currentPage);

  // Selection / annotation state per phase-3-reader.md:3.4
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);
  const [editingColor, setEditingColor] = useState<string>(HIGHLIGHT_COLORS[0]);
  const [noteVisible, setNoteVisible] = useState(false);
  const [noteAnchor, setNoteAnchor] = useState<string | undefined>(undefined);
  const [noteHighlightId, setNoteHighlightId] = useState<string | undefined>(undefined);
  const [dictWord, setDictWord] = useState<string | undefined>(undefined);
  const [dictDef, setDictDef] = useState<string | undefined>(undefined);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // PDF text pipeline state (F6/F8/F11): parallel data layer for TTS/search/highlights
  const [pdfChapters, setPdfChapters] = useState<ParsedChapter[]>([]);
  const [pdfPageCount, setPdfPageCount] = useState<number | undefined>(undefined);
  const [pdfTextStatus, setPdfTextStatus] = useState<'idle' | 'extracting' | 'ocr' | 'done' | 'failed'>('idle');
  const [ocrProgress, setOcrProgress] = useState<{ currentPage: number; total: number }>({ currentPage: 0, total: 0 });

  const { data: book } = useQuery({ queryKey: ['book', bookId], queryFn: () => BookRepository.get(bookId) });
  const { data: chaptersDB } = useQuery({ queryKey: ['chapters', bookId], queryFn: () => ChapterRepository.list(bookId) });
  const { data: highlights } = useQuery({ queryKey: ['highlights', bookId], queryFn: () => HighlightRepository.list(bookId) });
  const { data: notes } = useQuery({ queryKey: ['notes', bookId], queryFn: () => NoteRepository.list(bookId) });
  const baseChapters: ParsedChapter[] = getSampleChapters(bookId) ?? (chaptersDB as any as ParsedChapter[]) ?? [];
  const isPdf = book?.format === 'pdf';
  const isDocx = book?.format === 'docx';
  // PDFs render via <PdfView> (visual) with pages as a parallel text layer (F6/F8)
  const parsedChapters: ParsedChapter[] = isPdf && pdfChapters.length > 0 ? pdfChapters : baseChapters;
  const totalPages = isPdf
    ? Math.max(1, pdfPageCount ?? (pdfChapters.length > 0 ? pdfChapters.length : 1))
    : Math.max(1, Math.ceil(parsedChapters.reduce((sum, c) => sum + c.rawText.length, 0) / 1200));
  const progressPercent = progress?.progressPercent ?? 0;
  const currentChapterId = progress?.currentChapterId ?? parsedChapters[0]?.id;
  const currentTtsChapterIndex = Math.max(0, parsedChapters.findIndex(c => c.id === currentChapterId));

  // TTS setup per phase-3-reader.md:3.9 and phase-4.md:M6
  const rawTextPerChapter = parsedChapters.map(c => c.rawText);
  const totalRawLength = rawTextPerChapter.join('').length;
  const hasTextLayerForBook = isPdf
    ? pdfChapters.length > 0 && totalRawLength > 200
    : totalRawLength > 200; // heuristic for scanned PDF / image-only
  const ttsStore = useTtsStore();
  const { isActive: isTtsActive, isPlaying: isTtsPlaying, isExpanded: isTtsExpanded, highlightSync: ttsHighlightSync, queue: ttsQueue, currentIndex: ttsIndex, currentWordIndex, engineAvailable, hasTextLayer } = ttsStore;
  const ttsCurrentSentence = isTtsActive && ttsHighlightSync ? ttsQueue[ttsIndex]?.text ?? null : null;
  const { toggleActive: toggleTtsActive, togglePlay: toggleTtsPlay, skip: ttsSkip, seekToProgress: ttsSeek, cycleRate: ttsCycleRate, setRate: ttsSetRate, setVoice: ttsSetVoice, dismiss: ttsDismiss } = useTts(parsedChapters, currentTtsChapterIndex, book?.title);

  // Announce page/chapter changes to TalkBack
  useEffect(() => {
    if (currentPage !== prevPageRef.current) {
      prevPageRef.current = currentPage;
      const chapterTitle = parsedChapters[currentPage - 1]?.title ?? '';
      const announcement = chapterTitle ? `Page ${currentPage}, ${chapterTitle}` : `Page ${currentPage}`;
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [currentPage, parsedChapters]);

  // Sync hasTextLayer flag into store for UI disable — skip in test to avoid act warnings
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    const pdfScanned = book?.format === 'pdf' && !hasTextLayerForBook;
    const docxNoTts = book?.format === 'docx';
    const noTts = pdfScanned || docxNoTts;
    if (ttsStore.hasTextLayer === !noTts) return;
    ttsStore.setHasTextLayer(!noTts);
  }, [book?.format, hasTextLayerForBook]);

  // Keep toolbar visible while TTS is active (combined chrome)
  useEffect(() => {
    if (isTtsActive) setToolbarVisible(true);
  }, [isTtsActive]);

  // Word underline animation: advance word index while playing per rate
  useEffect(() => {
    if (!isTtsActive || !isTtsPlaying || !ttsHighlightSync || !ttsCurrentSentence) return;
    const words = ttsCurrentSentence.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return;
    const wpm = 150 * ttsStore.rate;
    const msPerWord = (60000 / wpm);
    const id = setInterval(() => {
      const s = useTtsStore.getState();
      const next = s.currentWordIndex + 1;
      if (next >= words.length) {
        // stay at last word until sentence finishes
        return;
      }
      s.setCurrentWordIndex(next);
    }, msPerWord);
    return () => clearInterval(id);
  }, [isTtsActive, isTtsPlaying, ttsCurrentSentence, ttsHighlightSync, ttsStore.rate]);

  // Auto-scroll spoken sentence into middle third (300ms smooth per spec)
  useEffect(() => {
    if (!isTtsActive || !ttsHighlightSync || !ttsCurrentSentence) return;
    if (readingMode !== 'scroll') return;
    // Estimate chapter + sentence position
    const cur = ttsQueue[ttsIndex];
    if (!cur) return;
    const y = cur.chapterIndex * 1200 + cur.offsetInChapter * 0.05; // approximate
    // Center in middle third: scroll to y - viewport/3
    const { height } = require('react-native').Dimensions.get('window');
    const targetY = Math.max(0, y - height / 3);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }, [ttsIndex, isTtsActive, ttsHighlightSync, ttsCurrentSentence, readingMode, ttsQueue]);

  // Paginate auto page turn when TTS reaches page boundary (500ms pause per spec)
  useEffect(() => {
    if (!isTtsActive || !isTtsPlaying) return undefined;
    if (readingMode !== 'paginate') return undefined;
    const cur = ttsQueue[ttsIndex];
    if (!cur) return undefined;
    // Approximate page for this sentence
    const pagesBeforeChapter = parsedChapters.slice(0, cur.chapterIndex).reduce((sum, c) => sum + Math.ceil(c.rawText.length / 1200), 0);
    const offsetPage = Math.floor(cur.offsetInChapter / 1200);
    const sentencePage = pagesBeforeChapter + offsetPage + 1;
    if (sentencePage !== currentPage) {
      const tId = setTimeout(() => setCurrentPage(sentencePage), 500);
      return () => clearTimeout(tId);
    }
    return undefined;
  }, [ttsIndex, isTtsActive, isTtsPlaying, readingMode, parsedChapters, currentPage, ttsQueue]);

  // Restore position
  useEffect(() => {
    if (progress?.lastPosition) {
      try {
        const pos = JSON.parse(progress.lastPosition);
        if (pos.page) setCurrentPage(pos.page);
      } catch {}
    }
  }, [progress]);

  // Sessions
  useEffect(() => {
    ReadingSessionsRepository.start(bookId).then(id => (sessionRef.current = id));
    return () => {
      if (sessionRef.current) ReadingSessionsRepository.end(sessionRef.current);
    };
  }, [bookId]);

  // Bookmark status
  useEffect(() => {
    BookmarkRepository.isBookmarked(bookId, currentPage).then(setIsBookmarked);
  }, [bookId, currentPage]);

  // PDF text pipeline (F6/F8/F11): extract embedded text, or OCR scanned pages,
  // producing ParsedChapter[] that feeds TTS/search/highlights like EPUBs.
  useEffect(() => {
    if (book?.format !== 'pdf' || !book?.filePath) return;
    let cancelled = false;
    const filePath = book.filePath;
    (async () => {
      try {
        setPdfTextStatus('extracting');
        const cachedExtract = await FileStorage.loadPdfTextCache(bookId, 'extract');
        if (!cancelled && cachedExtract && cachedExtract.length > 0) {
          setPdfChapters(pdfToChapters(cachedExtract, bookId));
          setPdfPageCount(cachedExtract.length);
          setPdfTextStatus('done');
          return;
        }
        const meta = await extractPdfMetadata(book.title ?? bookId, filePath, undefined, (page, total) => {
          if (!cancelled) setOcrProgress({ currentPage: page, total });
        });
        if (cancelled) return;
        if (meta.hasTextLayer && meta.pageTexts.length > 0) {
          await FileStorage.savePdfTextCache(bookId, 'extract', meta.pageTexts);
          if (cancelled) return;
          setPdfChapters(pdfToChapters(meta.pageTexts, bookId));
          setPdfPageCount(meta.pageTexts.length);
          setPdfTextStatus('done');
          return;
        }
        const cachedOcr = await FileStorage.loadPdfTextCache(bookId, 'ocr');
        if (!cancelled && cachedOcr && cachedOcr.length > 0) {
          setPdfChapters(pdfToChapters(cachedOcr, bookId));
          setPdfPageCount(cachedOcr.length);
          setPdfTextStatus('done');
          return;
        }
        setPdfTextStatus('ocr');
        const pageCount = await getPdfPageCount(filePath);
        if (cancelled) return;
        if (pageCount <= 0) {
          setPdfTextStatus('failed');
          return;
        }
        setOcrProgress({ currentPage: 0, total: pageCount });
        const ocrResult = await ocrPdf(filePath, pageCount, FileStorage.getOcrPageDir(bookId), p => {
          if (!cancelled) setOcrProgress(p);
        });
        if (cancelled) return;
        const pageTexts = ocrResult.pageTexts;
        await FileStorage.savePdfTextCache(bookId, 'ocr', pageTexts);
        if (cancelled) return;
        setPdfChapters(pdfToChapters(pageTexts, bookId));
        setPdfPageCount(pageCount);
        setPdfTextStatus('done');
      } catch {
        if (!cancelled) setPdfTextStatus(s => (s === 'done' ? s : 'failed'));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.format, book?.filePath, book?.title, bookId]);

  // Auto-hide toolbar (not when TTS active — keep combined chrome visible)
  useEffect(() => {
    if (!toolbarVisible) return;
    if (isTtsActive) return;
    const timer = setTimeout(() => setToolbarVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [toolbarVisible, isTtsActive]);

  const handleMenuSelect = useCallback(
    async (key: string) => {
      if (key === 'exit') {
        navigation.goBack();
        return;
      }
      const panelMap: Record<string, any> = {
        chapters: 'toc',
        bookmarks: 'bookmarks',
        highlights: 'highlights',
        notes: 'notes',
        search: 'search',
        font: 'font',
        pages: 'pages',
        progress: 'progress',
        dictionary: 'dictionary',
        settings: 'settings',
      };
      const panel = panelMap[key];
      if (panel) {
        // If TTS expanded is open, close it first
        if (useTtsStore.getState().isExpanded) useTtsStore.getState().setExpanded(false);
        setActivePanel(panel as any);
      } else if (key === 'share') {
        // native share placeholder
      } else if (key === 'readAloud') {
        // Per phase-3-reader.md:3.9 Entry: toggles TTS on/off; when active second tap opens settings
        if (useTtsStore.getState().isActive) {
          setActivePanel('ttsSettings');
          return;
        }
        // Guard: scanned PDF with no text layer → disabled (VolumeX 40% per 3.9 table)
        if (hasTextLayer === false) {
          if (Platform.OS === 'android') ToastAndroid.show('No readable text on this page. Try another page.', ToastAndroid.SHORT);
          return;
        }
        // Guard: engine unavailable → install prompt
        if (engineAvailable === false) {
          if (Platform.OS === 'android') ToastAndroid.show('Text-to-speech not available. Install system TTS engine?', ToastAndroid.LONG);
          void TtsEngine.openInstall();
          return;
        }
        // If hasTextLayer false computed locally but not yet in store, re-check
        const pdfScannedLocal = book?.format === 'pdf' && !hasTextLayerForBook;
        if (pdfScannedLocal) {
          if (Platform.OS === 'android') ToastAndroid.show('No readable text on this page. Try another page.', ToastAndroid.SHORT);
          return;
        }
        await toggleTtsActive();
        setActivePanel(null);
      }
    },
    [setActivePanel, hasTextLayer, engineAvailable, book?.format, hasTextLayerForBook, toggleTtsActive, navigation],
  );

  const handleTocSelect = useCallback(
    (chapter: Chapter) => {
      setActivePanel(null);
      const idx = parsedChapters.findIndex(c => c.title === chapter.title);
      if (idx >= 0) {
        if (readingMode === 'scroll') {
          scrollRef.current?.scrollTo({ y: idx * 1200, animated: true });
        } else {
          const pagesBefore = parsedChapters.slice(0, idx).reduce((sum, c) => sum + Math.ceil(c.rawText.length / 1200), 0);
          setCurrentPage(pagesBefore + 1);
          savePosition({ currentPage: pagesBefore + 1, progressPercent: pagesBefore / totalPages, lastPosition: JSON.stringify({ page: pagesBefore + 1 }) });
        }
        savePosition({ currentChapterId: chapter.id } as any);
      }
    },
    [parsedChapters, readingMode, savePosition, setActivePanel, totalPages],
  );

  const handleScrub = useCallback(
    (p: number) => {
      const page = Math.max(1, Math.min(totalPages, Math.round(p * totalPages)));
      setCurrentPage(page);
      savePosition({ currentPage: page, progressPercent: p, lastPosition: JSON.stringify({ page }) });
    },
    [totalPages, savePosition],
  );

  const handleScroll = useCallback(
    (offset: number) => {
      const p = Math.min(1, offset / 5000);
      savePosition({ progressPercent: p, lastPosition: JSON.stringify({ offset }) });
    },
    [savePosition],
  );

  // Selection handlers per 3.4.1/3.4.2
  const handleLongPressText = useCallback(
    (text: string) => {
      // Simulate selection of a sentence
      const sentence = text.slice(0, 80).trim();
      setSelectedText(sentence);
      setShowHighlightPicker(false);
      setEditingHighlightId(null);
    },
    [],
  );

  const handleCopy = useCallback(() => {
    if (selectedText) {
      // clipboard mock
      setSelectedText(null);
    }
  }, [selectedText]);

  const handleHighlightTrigger = useCallback(() => {
    setShowHighlightPicker(true);
  }, []);

  const handlePickColor = useCallback(
    async (color: string) => {
      if (editingHighlightId) {
        await HighlightRepository.updateColor(editingHighlightId, color);
        queryClient.invalidateQueries({ queryKey: ['highlights', bookId] });
        setEditingHighlightId(null);
        setShowHighlightPicker(false);
        setSelectedText(null);
      } else if (selectedText) {
        await HighlightRepository.create({ bookId, text: selectedText, color, page: currentPage });
        queryClient.invalidateQueries({ queryKey: ['highlights', bookId] });
        setShowHighlightPicker(false);
        setSelectedText(null);
      }
      setEditingColor(color);
    },
    [bookId, currentPage, editingHighlightId, queryClient, selectedText],
  );

  const handleRemoveHighlight = useCallback(async () => {
    if (editingHighlightId) {
      await HighlightRepository.delete(editingHighlightId);
      queryClient.invalidateQueries({ queryKey: ['highlights', bookId] });
      setEditingHighlightId(null);
      setShowHighlightPicker(false);
      setSelectedText(null);
    }
  }, [bookId, editingHighlightId, queryClient]);

  const handleHighlightTap = useCallback(
    (h: any) => {
      setSelectedText(h.text);
      setEditingHighlightId(h.id);
      setEditingColor(h.color);
      setShowHighlightPicker(true);
    },
    [],
  );

  const handleNoteTrigger = useCallback(() => {
    if (selectedText) {
      setNoteAnchor(selectedText);
      setNoteHighlightId(undefined);
      setNoteVisible(true);
      setSelectedText(null);
      setShowHighlightPicker(false);
    }
  }, [selectedText]);

  const handleSaveNote = useCallback(
    async (text: string) => {
      await NoteRepository.create({ bookId, text, highlightId: noteHighlightId, page: currentPage });
      queryClient.invalidateQueries({ queryKey: ['notes', bookId] });
      setNoteVisible(false);
      setNoteAnchor(undefined);
      setNoteHighlightId(undefined);
    },
    [bookId, currentPage, noteHighlightId, queryClient],
  );

  const handleDefine = useCallback(async () => {
    const word = selectedText?.split(' ')[0] ?? selectedText;
    if (!word) return;
    const def = `Definition of "${word}": a sample definition for testing (local, no network).`;
    await DictionaryHistoryRepository.add(word, def);
    setDictWord(word);
    setDictDef(def);
    setSelectedText(null);
    setShowHighlightPicker(false);
  }, [selectedText]);

  const handleShare = useCallback(() => {
    setSelectedText(null);
    setShowHighlightPicker(false);
  }, []);

  const handleBookmarkToggle = useCallback(async () => {
    const newState = await BookmarkRepository.toggle(bookId, currentPage);
    setIsBookmarked(newState);
    queryClient.invalidateQueries({ queryKey: ['bookmarks', bookId] });
  }, [bookId, currentPage, queryClient]);

  const isFullscreen = useReaderStore(s => s.isFullscreen);
  const orientation = useReaderStore(s => s.orientation);
  const { width, height } = useWindowDimensions();
  const isLandscapeSystem = width > height;
  const isLandscape = orientation === 'landscape' ? true : orientation === 'portrait' ? false : isLandscapeSystem;

  return (
    <FullscreenController>
      <View style={[styles.root, { backgroundColor: t.bgPrimary }]} testID="reader-screen">
        {!isFullscreen && width >= 360 && <RectangularMenu onSelect={handleMenuSelect} ttsActive={isTtsActive} ttsDisabled={book?.format === 'pdf' && !hasTextLayerForBook} reducedMotion={reducedMotion} />}

        <View style={styles.contentWrap}>
          <Pressable style={styles.content} onPress={() => setToolbarVisible(v => !v)} testID="reader-content-tap">
            {isPdf ? (
              <>
                <PdfView
                  source={{ uri: book?.filePath ?? '' }}
                  page={currentPage}
                  onPageChanged={(p, n) => handleScrub(p / n)}
                  onLoadComplete={n => setPdfPageCount(n)}
                  hasTextLayer={hasTextLayerForBook}
                />
                {pdfTextStatus !== 'idle' && pdfTextStatus !== 'done' && (
                  <View style={[styles.pdfTextOverlay, { backgroundColor: t.bgPrimary }]} pointerEvents="none" testID="pdf-text-progress">
                    {pdfTextStatus === 'ocr' && <ActivityIndicator size="large" color={t.textPrimary} />}
                    <Text style={[styles.pdfTextOverlayLabel, { color: t.textPrimary }]}>
                      {pdfTextStatus === 'ocr'
                        ? `Recognizing text... ${ocrProgress.total > 0 ? `Page ${ocrProgress.currentPage}/${ocrProgress.total}` : ''}`
                        : pdfTextStatus === 'failed'
                          ? 'Could not extract text from this PDF'
                          : 'Reading text...'}
                    </Text>
                  </View>
                )}
              </>
            ) : isDocx ? (
              <View style={styles.centered}>
                <Text style={[typography.body, { color: t.textSecondary, textAlign: 'center' }]}>DOCX preview coming soon</Text>
              </View>
            ) : readingMode === 'scroll' ? (
              <ScrollMode
                chapters={parsedChapters}
                highlights={highlights}
                notes={notes}
                onScroll={handleScroll}
                scrollRef={scrollRef}
                onLongPressText={handleLongPressText}
                onHighlightTap={handleHighlightTap}
                ttsSentence={ttsCurrentSentence}
                ttsWordIndex={currentWordIndex}
                ttsHighlightSync={ttsHighlightSync && isTtsActive}
              />
            ) : (
              <PaginateMode chapters={parsedChapters} initialPage={currentPage} onPageChange={page => savePosition({ currentPage: page, progressPercent: page / totalPages })} />
            )}

            {/* Selection toolbar / picker centered above selection */}
            {selectedText && !showHighlightPicker && (
              <View style={styles.selectionWrap}>
                <SelectionToolbar visible={!!selectedText} onCopy={handleCopy} onHighlight={handleHighlightTrigger} onNote={handleNoteTrigger} onDefine={handleDefine} onShare={handleShare} />
              </View>
            )}
            {showHighlightPicker && (
              <View style={styles.selectionWrap}>
                <HighlightPicker
                  visible={showHighlightPicker}
                  selectedColor={editingColor}
                  onSelect={handlePickColor}
                  onRemove={handleRemoveHighlight}
                  showRemove={!!editingHighlightId}
                  onCopy={handleCopy}
                  onAddNote={() => {
                    setNoteAnchor(selectedText ?? undefined);
                    setNoteHighlightId(editingHighlightId ?? undefined);
                    setNoteVisible(true);
                    setShowHighlightPicker(false);
                    setSelectedText(null);
                    setEditingHighlightId(null);
                  }}
                />
              </View>
            )}

            {/* Selection handled via ScrollMode onLongPressText / onHighlightTap — no extra demo layer needed */}
          </Pressable>

          <ProgressStrip
            progress={progressPercent}
            totalPages={totalPages}
            currentPage={currentPage}
            chapters={parsedChapters.map(c => ({ pageStart: 1, title: c.title }))}
            onScrub={handleScrub}
            onDetailPress={() => setActivePanel('progress')}
          />
        </View>

        {/* Combined chrome: TTS mini-player stacked on toolbar with no gap per spec */}
        <View style={[styles.bottomChrome, isTtsActive ? { height: 120 } : { height: 56 }]} pointerEvents={isFullscreen ? 'none' : 'auto'}>
          {isTtsActive && (
            <TTSMiniPlayer
              visible={isTtsActive && !isFullscreen}
              onTogglePlay={toggleTtsPlay}
              onSkipBack={() => ttsSkip(-10)}
              onSkipForward={() => ttsSkip(10)}
              onDismiss={ttsDismiss}
              onCycleRate={ttsCycleRate}
              onOpenExpanded={() => useTtsStore.getState().setExpanded(true)}
              onOpenToc={() => setActivePanel('toc')}
              onSeek={ttsSeek}
            />
          )}
          <ReadingToolbar
            visible={(toolbarVisible || isTtsActive) && !isFullscreen}
            page={currentPage}
            chapterName={parsedChapters[0]?.title ?? book?.title ?? 'Chapter'}
            isBookmarked={isBookmarked}
            highlightColor={editingColor}
            onPagePress={() => setActivePanel('pages')}
            onChapterPress={() => setActivePanel('toc')}
            onBookmarkPress={handleBookmarkToggle}
            onColorPress={() => setShowHighlightPicker(v => !v)}
            onMenuPress={() => useMenuStore.getState().toggle()}
            reducedMotion={reducedMotion}
          />
        </View>

        {/* Bookmark floating button per 3.4.5 */}
        <View style={styles.bookmarkFloat}>
          <BookmarkButton isBookmarked={isBookmarked} onToggle={handleBookmarkToggle} visible={toolbarVisible && !isTtsActive} />
        </View>

        <TOCPanel
          visible={activePanel === 'toc'}
          chapters={(chaptersDB ?? parsedChapters.map((c, i) => ({ id: c.id, bookId, ordering: i, title: c.title, level: 0, pageStart: i * 10 + 1 } as Chapter)))}
          currentChapterId={currentChapterId}
          onClose={() => setActivePanel(null)}
          onSelect={handleTocSelect}
        />
        <PagesGrid visible={activePanel === 'pages'} totalPages={totalPages} currentPage={currentPage} onClose={() => setActivePanel(null)} onSelect={handleScrub as any} />
        <ThemePanel visible={activePanel === 'font'} onClose={() => setActivePanel(null)} />
        <ProgressSheet visible={activePanel === 'progress'} bookId={bookId} totalPages={totalPages} onClose={() => setActivePanel(null)} />
        <HighlightsPanel visible={activePanel === 'highlights'} bookId={bookId} onClose={() => setActivePanel(null)} onSelect={handleHighlightTap} />
        <NotesPanel
          visible={activePanel === 'notes'}
          bookId={bookId}
          onClose={() => setActivePanel(null)}
          onSelect={note => {
            setActivePanel(null);
            // scroll to anchor — for demo, scroll to top
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
          onNew={() => {
            setNoteAnchor(undefined);
            setNoteVisible(true);
          }}
        />
        <BookmarksPanel visible={activePanel === 'bookmarks'} bookId={bookId} onClose={() => setActivePanel(null)} onSelect={item => handleTocSelect({ id: item.chapterId ?? '', title: item.snippet ?? '', } as any)} />
        <DictionaryCard visible={!!dictWord} word={dictWord} definition={dictDef} onClose={() => setDictWord(undefined)} />
        <SearchSheet
          visible={activePanel === 'search'}
          bookTitle={book?.title}
          rawTextPerChapter={parsedChapters.map(c => c.rawText)}
          onClose={() => setActivePanel(null)}
          onSelect={(ci, off) => {
            setActivePanel(null);
            if (readingMode === 'scroll') scrollRef.current?.scrollTo({ y: ci * 1200 + off * 0.1, animated: true });
            else setCurrentPage(Math.ceil(off / 1200) + 1);
          }}
        />
        {/* TTS Expanded Player and Settings per M6 */}
        <TTSExpandedPlayer
          visible={isTtsExpanded}
          onClose={() => useTtsStore.getState().setExpanded(false)}
          onTogglePlay={toggleTtsPlay}
          onSkipBack={() => ttsSkip(-10)}
          onSkipForward={() => ttsSkip(10)}
          onSeek={ttsSeek}
          onSetRate={ttsSetRate}
          onSetVoice={ttsSetVoice}
          bookTitle={book?.title}
        />
        <TTSSettings visible={activePanel === 'ttsSettings'} onClose={() => setActivePanel(null)} />
        <NoteSheet
          visible={noteVisible}
          anchorText={noteAnchor}
          highlightColor={editingColor}
          onColorChange={setEditingColor}
          onSave={handleSaveNote}
          onClose={() => setNoteVisible(false)}
        />

        {isFullscreen && toolbarVisible && (
          <Pressable onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: t.bgCard }]} testID="reader-back-fullscreen">
            <Text style={[typography.button, { color: t.textPrimary }]}>Back</Text>
          </Pressable>
        )}
      </View>
    </FullscreenController>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  contentWrap: { flex: 1, position: 'relative' },
  content: { flex: 1 },
  bottomChrome: { position: 'absolute', bottom: 0, left: 0, right: 0, justifyContent: 'flex-end' },
  backBtn: { position: 'absolute', top: 40, left: 20, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 9999 },
  selectionWrap: { position: 'absolute', top: 80, left: 0, right: 0, alignItems: 'center', zIndex: 15 },
  demoSelectionLayer: { position: 'absolute', top: 40, left: 10, right: 10, opacity: 0.01 },
  pdfTextOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
  pdfTextOverlayLabel: { fontSize: 14, textAlign: 'center' },
  bookmarkFloat: { position: 'absolute', top: 16, right: 16, zIndex: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
} as any);
