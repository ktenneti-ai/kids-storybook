"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { useReadAloud } from "@/hooks/useReadAloud";
import type { useStoryPipeline } from "@/hooks/useStoryPipeline";
import { findTheme } from "@/lib/constants";
import { IllustrationFrame } from "./IllustrationFrame";

interface StorybookReaderProps {
  pipeline: ReturnType<typeof useStoryPipeline>;
  onNewStory: () => void;
  onHome: () => void;
}

export function StorybookReader({ pipeline, onNewStory, onHome }: StorybookReaderProps) {
  const {
    story,
    phase,
    currentTask,
    error,
    canFallbackToMock,
    progress,
    regeneratingPageNumber,
    retry,
    continueInDemoMode,
    regenerateStory,
    regenerateCover,
    regeneratePageImage,
    regeneratePageText,
  } = pipeline;
  const [pageIndex, setPageIndex] = useState(0);
  const readAloud = useReadAloud();

  useEffect(() => {
    readAloud.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  useEffect(() => () => readAloud.stop(), [readAloud]);

  if (phase === "creating-character" || phase === "writing" || (!story && phase !== "error")) {
    const isCharacterPhase = phase === "creating-character";
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-linear-to-b from-violet-100 to-orange-50 px-6 py-20 text-center">
        <span className="text-4xl" aria-hidden>
          {isCharacterPhase ? "🎨" : "✍️"}
        </span>
        <Spinner className="h-10 w-10" />
        <h2 className="font-display text-2xl font-bold text-violet-900">{currentTask ?? "Getting started…"}</h2>
        <p className="max-w-sm text-sm text-violet-600">
          {isCharacterPhase
            ? "Turning the photo into a storybook character who'll star in every page."
            : "Our storyteller is dreaming up an original adventure just for this book."}
        </p>
      </main>
    );
  }

  if (phase === "error" && !story) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-linear-to-b from-violet-100 to-orange-50 px-6 py-20">
        <div className="w-full max-w-lg">
          <ErrorBanner message={error || "Something went wrong."} />
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button onClick={retry}>Try Again</Button>
            {canFallbackToMock ? (
              <Button variant="secondary" onClick={continueInDemoMode}>
                Continue in Demo Mode
              </Button>
            ) : null}
            <Button variant="ghost" onClick={onHome}>
              Back Home
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!story) return null;

  const theme = findTheme(story.input.theme);
  const total = story.pages.length;
  const isCoverView = pageIndex === 0;
  const currentPage = isCoverView ? null : story.pages[pageIndex - 1];
  const isLastPage = pageIndex === total;
  const isIllustrating = phase === "illustrating";
  const isImageBusy = isCoverView ? story.coverStatus === "loading" : currentPage!.imageStatus === "loading";
  const isPageTextBusy = !isCoverView && regeneratingPageNumber === currentPage!.pageNumber;

  const handleReadAloudToggle = () => {
    if (!readAloud.isSpeaking) {
      const text = isCoverView ? `${story.title}. A story about ${story.input.childName}.` : currentPage!.text;
      readAloud.speak(text);
    } else if (readAloud.isPaused) {
      readAloud.resume();
    } else {
      readAloud.pause();
    }
  };

  const readAloudLabel = !readAloud.isSpeaking ? "🔊 Read Aloud" : readAloud.isPaused ? "▶ Resume" : "⏸ Pause";

  return (
    <main className="flex-1 bg-linear-to-b from-violet-50 via-fuchsia-50 to-orange-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {story.characterReferenceImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.characterReferenceImageUrl}
                alt={`${story.input.childName}'s storybook character`}
                title={`${story.input.childName}'s storybook character`}
                className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
              />
            ) : null}
            <Badge>
              {theme.emoji} {theme.label}
            </Badge>
            {story.mode === "mock" ? <Badge tone="amber">Demo mode &mdash; sample content</Badge> : <Badge tone="green">AI generated</Badge>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onHome}>
              🏠 Home
            </Button>
            <Button variant="secondary" size="sm" onClick={onNewStory}>
              + New Story
            </Button>
          </div>
        </div>

        {isIllustrating ? (
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
            <ProgressBar done={progress.done} total={progress.total} label={currentTask ?? "Illustrating your storybook"} />
          </div>
        ) : null}

        {error && story ? (
          <div className="mb-4">
            <ErrorBanner message={error}>
              <Button size="sm" onClick={retry}>
                Retry
              </Button>
            </ErrorBanner>
          </div>
        ) : null}

        {/* Edge-to-edge illustration card — the artwork is the dominant element, text is laid directly onto it. */}
        <div className="animate-pop-in relative overflow-hidden rounded-3xl shadow-2xl shadow-violet-300/40">
          {isCoverView ? (
            <IllustrationFrame
              status={story.coverStatus}
              imageUrl={story.coverImageUrl}
              error={story.coverError}
              alt={`Cover illustration for ${story.title}`}
              aspect="cover"
              onRetry={regenerateCover}
              overlay={
                <div className="text-center">
                  <h1 className="font-display text-3xl font-extrabold text-white drop-shadow-sm sm:text-5xl">{story.title}</h1>
                  <p className="mt-3 text-sm font-medium text-white/80 sm:text-base">A StoryStars original &middot; starring {story.input.childName}</p>
                </div>
              }
            />
          ) : (
            <IllustrationFrame
              status={currentPage!.imageStatus}
              imageUrl={currentPage!.imageUrl}
              error={currentPage!.imageError}
              alt={`Illustration for page ${currentPage!.pageNumber}`}
              aspect="page"
              onRetry={() => regeneratePageImage(currentPage!.pageNumber)}
              overlay={
                <div className="text-center">
                  <p className="font-display text-xl leading-relaxed text-white drop-shadow-sm sm:text-2xl">{currentPage!.text}</p>
                  {isLastPage ? <p className="mt-3 text-sm font-bold uppercase tracking-widest text-white/90">🎉 The End 🎉</p> : null}
                </div>
              }
            />
          )}

          <button
            type="button"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
            aria-label="Previous page"
            className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-violet-700 shadow-lg backdrop-blur-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:h-14 sm:w-14"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setPageIndex((p) => Math.min(total, p + 1))}
            disabled={pageIndex === total}
            aria-label="Next page"
            className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-violet-700 shadow-lg backdrop-blur-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:h-14 sm:w-14"
          >
            ›
          </button>
        </div>

        {/* Page progress dots */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {Array.from({ length: total + 1 }, (_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPageIndex(idx)}
                aria-label={idx === 0 ? "Go to cover" : `Go to page ${idx}`}
                aria-current={idx === pageIndex}
                className={`h-2 rounded-full transition-all ${idx === pageIndex ? "w-6 bg-fuchsia-500" : "w-2 bg-violet-200 hover:bg-violet-300"}`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-violet-500">{isCoverView ? "Cover" : `Page ${pageIndex} of ${total}`}</span>
        </div>

        {/* Read aloud + regenerate controls */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleReadAloudToggle}
            disabled={!readAloud.isSupported}
            title={readAloud.isSupported ? "Read this page aloud" : "Read aloud isn't supported in this browser"}
            className="flex items-center gap-1.5 rounded-full border-2 border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:border-violet-300 disabled:opacity-40"
          >
            {readAloudLabel}
          </button>
          <Button
            variant="secondary"
            size="sm"
            onClick={isCoverView ? regenerateCover : () => regeneratePageImage(currentPage!.pageNumber)}
            disabled={isImageBusy || isIllustrating}
            icon={<span aria-hidden>🖼️</span>}
          >
            {isCoverView ? "Regenerate Cover Art" : "Regenerate Image"}
          </Button>
          {!isCoverView ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => regeneratePageText(currentPage!.pageNumber)}
              disabled={isPageTextBusy || isIllustrating}
              loading={isPageTextBusy}
              icon={<span aria-hidden>📝</span>}
            >
              Regenerate Page
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPageIndex(0);
              regenerateStory();
            }}
            disabled={isIllustrating}
            icon={<span aria-hidden>🪄</span>}
          >
            Regenerate Whole Story
          </Button>
        </div>
      </div>
    </main>
  );
}
