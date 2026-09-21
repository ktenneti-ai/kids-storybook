"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildCoverSceneDescription } from "@/lib/prompt";
import type { ApiErrorResponse, IllustrationResponse, Story, StoryInput, StoryTextResponse } from "@/lib/types";

export type PipelinePhase = "idle" | "writing" | "illustrating" | "ready" | "error";

interface IllustrationTarget {
  kind: "cover" | "page";
  pageNumber?: number;
  sceneDescription: string;
}

async function postJson<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string; canFallbackToMock: boolean }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as T | ApiErrorResponse;
    if (!res.ok) {
      const err = data as ApiErrorResponse;
      return { ok: false, error: err.error || "Something went wrong.", canFallbackToMock: Boolean(err.canFallbackToMock) };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: "Network error. Please check your connection and try again.", canFallbackToMock: false };
  }
}

async function runPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<void> {
  let index = 0;
  async function next(): Promise<void> {
    const current = index++;
    if (current >= items.length) return;
    await worker(items[current]);
    return next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()));
}

export function useStoryPipeline() {
  const [story, setStory] = useState<Story | null>(null);
  const [phase, setPhase] = useState<PipelinePhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [canFallbackToMock, setCanFallbackToMock] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [preferMock, setPreferMock] = useState(false);

  const storyRef = useRef<Story | null>(null);
  const lastInputRef = useRef<StoryInput | null>(null);
  useEffect(() => {
    storyRef.current = story;
  }, [story]);

  const fetchIllustration = useCallback(
    async (s: Story, target: IllustrationTarget, seed: number, forceMock: boolean) => {
      return postJson<IllustrationResponse>("/api/illustration", {
        illustrationStyle: s.input.illustrationStyle,
        characterDescription: s.characterDescription,
        settingDescription: s.settingDescription,
        sceneDescription: target.sceneDescription,
        themeId: s.input.theme,
        isCover: target.kind === "cover",
        forceMock,
        seed,
      });
    },
    []
  );

  const runIllustrations = useCallback(
    async (s: Story, forceMock: boolean) => {
      const targets: IllustrationTarget[] = [
        { kind: "cover", sceneDescription: buildCoverSceneDescription(s.input.theme, s.title) },
        ...s.pages.map((p) => ({ kind: "page" as const, pageNumber: p.pageNumber, sceneDescription: p.illustrationPrompt })),
      ];
      let done = 0;
      setProgress({ done: 0, total: targets.length });

      await runPool(targets, 3, async (target) => {
        const seed = Date.now() + Math.floor(Math.random() * 10_000);
        const result = await fetchIllustration(s, target, seed, forceMock);
        done += 1;
        setProgress({ done, total: targets.length });

        setStory((prev) => {
          if (!prev) return prev;
          if (target.kind === "cover") {
            return result.ok
              ? { ...prev, coverStatus: "ready", coverImageUrl: result.data.imageUrl, coverError: undefined }
              : { ...prev, coverStatus: "error", coverError: result.error };
          }
          return {
            ...prev,
            pages: prev.pages.map((p) =>
              p.pageNumber === target.pageNumber
                ? result.ok
                  ? { ...p, imageStatus: "ready" as const, imageUrl: result.data.imageUrl, imageError: undefined }
                  : { ...p, imageStatus: "error" as const, imageError: result.error }
                : p
            ),
          };
        });
      });
    },
    [fetchIllustration]
  );

  const generate = useCallback(
    async (input: StoryInput, options?: { variationHint?: string; forceMock?: boolean }) => {
      lastInputRef.current = input;
      const useMock = options?.forceMock ?? preferMock;
      setError(null);
      setCanFallbackToMock(false);
      setPhase("writing");
      setStory(null);
      setProgress({ done: 0, total: 0 });

      const result = await postJson<StoryTextResponse>("/api/story", {
        ...input,
        forceMock: useMock,
        variationHint: options?.variationHint,
      });

      if (!result.ok) {
        setPhase("error");
        setError(result.error);
        setCanFallbackToMock(result.canFallbackToMock);
        return;
      }

      const initialStory: Story = {
        title: result.data.title,
        input,
        characterDescription: result.data.characterDescription,
        settingDescription: result.data.settingDescription,
        coverStatus: "loading",
        pages: result.data.pages.map((p) => ({ ...p, imageStatus: "loading" as const })),
        mode: result.data.mode,
      };
      setStory(initialStory);
      setPhase("illustrating");

      await runIllustrations(initialStory, result.data.mode === "mock" || useMock);
      setPhase("ready");
    },
    [preferMock, runIllustrations]
  );

  const retry = useCallback(() => {
    if (lastInputRef.current) void generate(lastInputRef.current);
  }, [generate]);

  const continueInDemoMode = useCallback(() => {
    setPreferMock(true);
    if (lastInputRef.current) void generate(lastInputRef.current, { forceMock: true });
  }, [generate]);

  const regenerateStory = useCallback(() => {
    if (!lastInputRef.current) return;
    void generate(lastInputRef.current, {
      variationHint:
        "Please write a fresh variation with different specific plot details, discoveries, and dialogue than any previous attempt, while keeping the same theme, tone, age-appropriateness, and character.",
    });
  }, [generate]);

  const regenerateCover = useCallback(async () => {
    const s = storyRef.current;
    if (!s) return;
    setStory((prev) => (prev ? { ...prev, coverStatus: "loading", coverError: undefined } : prev));
    const seed = Date.now() + Math.floor(Math.random() * 10_000);
    const result = await fetchIllustration(
      s,
      { kind: "cover", sceneDescription: buildCoverSceneDescription(s.input.theme, s.title) },
      seed,
      s.mode === "mock" || preferMock
    );
    setStory((prev) => {
      if (!prev) return prev;
      return result.ok
        ? { ...prev, coverStatus: "ready", coverImageUrl: result.data.imageUrl, coverError: undefined }
        : { ...prev, coverStatus: "error", coverError: result.error };
    });
  }, [fetchIllustration, preferMock]);

  const regeneratePageImage = useCallback(
    async (pageNumber: number) => {
      const s = storyRef.current;
      if (!s) return;
      const page = s.pages.find((p) => p.pageNumber === pageNumber);
      if (!page) return;
      setStory((prev) =>
        prev
          ? { ...prev, pages: prev.pages.map((p) => (p.pageNumber === pageNumber ? { ...p, imageStatus: "loading", imageError: undefined } : p)) }
          : prev
      );
      const seed = Date.now() + Math.floor(Math.random() * 10_000);
      const result = await fetchIllustration(s, { kind: "page", pageNumber, sceneDescription: page.illustrationPrompt }, seed, s.mode === "mock" || preferMock);
      setStory((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pages: prev.pages.map((p) =>
            p.pageNumber === pageNumber
              ? result.ok
                ? { ...p, imageStatus: "ready" as const, imageUrl: result.data.imageUrl, imageError: undefined }
                : { ...p, imageStatus: "error" as const, imageError: result.error }
              : p
          ),
        };
      });
    },
    [fetchIllustration, preferMock]
  );

  const reset = useCallback(() => {
    setStory(null);
    setPhase("idle");
    setError(null);
    setCanFallbackToMock(false);
    setProgress({ done: 0, total: 0 });
    setPreferMock(false);
    lastInputRef.current = null;
  }, []);

  return {
    story,
    phase,
    error,
    canFallbackToMock,
    progress,
    preferMock,
    generate,
    retry,
    continueInDemoMode,
    regenerateStory,
    regenerateCover,
    regeneratePageImage,
    reset,
  };
}
