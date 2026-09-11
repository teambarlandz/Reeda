import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppTheme } from '../../../shared/theme/useTheme';
import { typography, spacing } from '../../../shared/theme/tokens';
import { useReaderStore } from '../store/readerStore';
import { useMenuStore } from '../menu/menuStore';
import { useReaderPosition } from '../hooks/useReaderPosition';
import { useProgress } from '../hooks/useProgress';
import { BookRepository } from '../../../data/repositories/BookRepository';
import { ChapterRepository, Chapter } from '../../../data/repositories/ChapterRepository';
import { ReadingSessionsRepository } from '../../../data/repositories/ReadingSessionsRepository';
import { RectangularMenu } from '../menu/RectangularMenu';
import { ReadingToolbar } from '../toolbar/ReadingToolbar';
import { FullscreenController } from '../modes/FullscreenController';
import { ScrollMode } from '../modes/ScrollMode';
import { PaginateMode } from '../modes/PaginateMode';
import { PdfView } from '../../../parsing/pdf/PdfView';
import { TOCPanel } from '../panels/TOCPanel';
import { PagesGrid } from '../panels/PagesGrid';
import { ProgressStrip } from '../panels/ProgressStrip';
import { ThemePanel } from '../panels/ThemePanel';
import { useQuery } from '@tanstack/react-query';
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

  const { readingMode, theme } = useReaderStore();
  const { activePanel, setActivePanel } = useMenuStore();
  const { savePosition } = useReaderPosition(bookId);
  const { data: progress } = useProgress(bookId);

  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useRef<ScrollView>(null);
  const sessionRef = useRef<string | null>(null);

  const { data: book } = useQuery({ queryKey: ['book', bookId], queryFn: () => BookRepository.get(bookId) });
  const { data: chaptersDB } = useQuery({ queryKey: ['chapters', bookId], queryFn: () => ChapterRepository.list(bookId) });

  // Resolve parsed chapters: prefer sample hard-coded, else DB chapters, else fallback
  const parsedChapters: ParsedChapter[] = getSampleChapters(bookId) ?? (chaptersDB as any as ParsedChapter[]) ?? [];
  const totalPages = Math.max(1, Math.ceil(parsedChapters.reduce((sum, c) => sum + c.rawText.length, 0) / 1200));
  const progressPercent = progress?.progressPercent ?? 0;
  const currentChapterId = progress?.currentChapterId ?? parsedChapters[0]?.id;

  // Restore position on open
  useEffect(() => {
    if (progress?.lastPosition) {
      const pos = JSON.parse(progress.lastPosition);
      if (pos.page) setCurrentPage(pos.page);
      // Scroll offset handled via scrollRef after mount
    }
  }, [progress]);

  // Sessions
  useEffect(() => {
    ReadingSessionsRepository.start(bookId).then(id => (sessionRef.current = id));
    return () => {
      if (sessionRef.current) ReadingSessionsRepository.end(sessionRef.current);
    };
  }, [bookId]);

  // Auto-hide toolbar after 3s
  useEffect(() => {
    if (!toolbarVisible) return;
    const timer = setTimeout(() => setToolbarVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [toolbarVisible]);

  const handleMenuSelect = useCallback(
    (key: string) => {
      const panelMap: Record<string, any> = {
        chapters: 'toc',
        pages: 'pages',
        progress: 'progress',
        font: 'font',
        settings: 'settings',
      };
      const panel = panelMap[key];
      if (panel) setActivePanel(panel as any);
      else if (key === 'share') {
        // Share placeholder
      }
    },
    [setActivePanel],
  );

  const handleTocSelect = useCallback(
    (chapter: Chapter) => {
      setActivePanel(null);
      const idx = parsedChapters.findIndex(c => c.title === chapter.title);
      if (idx >= 0) {
        if (readingMode === 'scroll') {
          // Approx scroll to chapter: each chapter ~ 3000px
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

  // Fullscreen hide menu handling per phase-3-reader.md:3.1
  const isFullscreen = useReaderStore(s => s.isFullscreen);
  const orientation = useReaderStore(s => s.orientation);
  const { width, height } = useWindowDimensions();
  const isLandscapeSystem = width > height;
  // Respect orientation lock per phase-3-reader.md:3.1 — auto respects system, locked overrides
  const isLandscape = orientation === 'landscape' ? true : orientation === 'portrait' ? false : isLandscapeSystem;
  const isPdf = book?.format === 'pdf';

  return (
    <FullscreenController>
      <View style={[styles.root, { backgroundColor: t.bgPrimary, flexDirection: isLandscape ? 'row' : 'row' }]} testID="reader-screen">
        {/* Menu — hidden in fullscreen, also hidden if window <360dp per phase-3-reader.md:3.1 edge case */}
        {!isFullscreen && width >= 360 && <RectangularMenu onSelect={handleMenuSelect} />}

        {/* Content */}
        <View style={styles.contentWrap}>
          {/* Tap center to toggle toolbar/chrome */}
          <Pressable style={styles.content} onPress={() => setToolbarVisible(v => !v)} testID="reader-content-tap">
            {isPdf ? (
              <PdfView source={{ uri: book?.filePath ?? '' }} page={currentPage} onPageChanged={(p, n) => handleScrub(p / n)} hasTextLayer={true} />
            ) : readingMode === 'scroll' ? (
              <ScrollMode chapters={parsedChapters} onScroll={handleScroll} scrollRef={scrollRef} />
            ) : (
              <PaginateMode chapters={parsedChapters} initialPage={currentPage} onPageChange={page => savePosition({ currentPage: page, progressPercent: page / totalPages })} />
            )}
          </Pressable>

          {/* Progress strip always visible 2dp */}
          <ProgressStrip
            progress={progressPercent}
            totalPages={totalPages}
            currentPage={currentPage}
            chapters={parsedChapters.map(c => ({ pageStart: 1, title: c.title }))}
            onScrub={handleScrub}
            onDetailPress={() => setActivePanel('progress')}
          />
        </View>

        {/* Toolbar */}
        <ReadingToolbar
          visible={toolbarVisible && !isFullscreen}
          page={currentPage}
          chapterName={parsedChapters[0]?.title ?? book?.title ?? 'Chapter'}
          isBookmarked={false}
          highlightColor="#FFEB3B"
          onPagePress={() => setActivePanel('pages')}
          onChapterPress={() => setActivePanel('toc')}
          onBookmarkPress={() => {}}
          onColorPress={() => {}}
          onMenuPress={() => useMenuStore.getState().toggle()}
        />

        {/* Panels */}
        <TOCPanel
          visible={activePanel === 'toc'}
          chapters={(chaptersDB ?? parsedChapters.map((c, i) => ({ id: c.id, bookId, ordering: i, title: c.title, level: 0, pageStart: i * 10 + 1 } as Chapter)))}
          currentChapterId={currentChapterId}
          onClose={() => setActivePanel(null)}
          onSelect={handleTocSelect}
        />
        <PagesGrid visible={activePanel === 'pages'} totalPages={totalPages} currentPage={currentPage} onClose={() => setActivePanel(null)} onSelect={handleScrub as any} />
        <ThemePanel visible={activePanel === 'font'} onClose={() => setActivePanel(null)} />

        {/* Back fallback when no chrome */}
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
  backBtn: { position: 'absolute', top: 40, left: 20, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 9999 },
} as any);
