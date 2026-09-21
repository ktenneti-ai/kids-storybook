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
    retry,
    continueInDemoMode,
    regenerateStory,
    regenerateCover,
    regeneratePageImage,
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

  const handleReadAloud = () => {
    if (readAloud.isSpeaking) {
      readAloud.stop();
      return;
    }
    const text = isCoverView ? `${story.title}. A story about ${story.input.childName}.` : currentPage!.text;
    readAloud.speak(text);
  };

  return (
    <main className="flex-1 bg-linear-to-b from-violet-50 via-fuchsia-50 to-orange-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
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

        <div className="animate-pop-in rounded-3xl bg-white p-5 shadow-xl shadow-violet-200/50 sm:p-8">
          {isCoverView ? (
            <div className="flex flex-col items-center gap-5">
              <IllustrationFrame
                status={story.coverStatus}
                imageUrl={story.coverImageUrl}
                error={story.coverError}
                alt={`Cover illustration for ${story.title}`}
                aspect="portrait"
                onRegenerate={regenerateCover}
                regenerateLabel="Regenerate cover"
              />
              <div className="text-center">
                <h1 className="font-display text-3xl font-extrabold text-violet-900 sm:text-4xl">{story.title}</h1>
                <p className="mt-2 text-sm font-medium text-violet-500">A StoryStars original &middot; starring {story.input.childName}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <IllustrationFrame
                status={currentPage!.imageStatus}
                imageUrl={currentPage!.imageUrl}
                error={currentPage!.imageError}
                alt={`Illustration for page ${currentPage!.pageNumber}`}
                onRegenerate={() => regeneratePageImage(currentPage!.pageNumber)}
                regenerateLabel="Regenerate illustration"
              />
              <p className="text-center font-display text-lg leading-relaxed text-violet-900 sm:text-xl">{currentPage!.text}</p>
              {isLastPage ? <p className="text-center text-sm font-bold uppercase tracking-widest text-fuchsia-500">🎉 The End 🎉</p> : null}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}>
              ← Previous
            </Button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReadAloud}
                disabled={!readAloud.isSupported}
                title={readAloud.isSupported ? "Read this page aloud" : "Read aloud isn't supported in this browser"}
                className="flex items-center gap-1.5 rounded-full border-2 border-violet-200 px-3 py-1.5 text-sm font-semibold text-violet-700 transition hover:border-violet-300 disabled:opacity-40"
              >
                {readAloud.isSpeaking ? "⏹ Stop" : "🔊 Read Aloud"}
              </button>
              <span className="text-xs font-medium text-violet-400">
                {isCoverView ? "Cover" : `Page ${pageIndex} / ${total}`}
              </span>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setPageIndex((p) => Math.min(total, p + 1))} disabled={pageIndex === total}>
              Next →
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-2">
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
          <p className="max-w-md text-center text-xs text-violet-400">
            Not quite right? Regenerating the story writes a brand-new version and re-illustrates every page.
          </p>
        </div>
      </div>
    </main>
  );
}
