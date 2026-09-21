"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiErrorResponse, CharacterReferenceResponse, IllustrationResponse, Story, StoryInput, StoryTextResponse } from "@/lib/types";

export type PipelinePhase = "idle" | "creating-character" | "writing" | "illustrating" | "ready" | "error";

interface IllustrationTarget {
  kind: "cover" | "page";
  pageNumber?: number;
  sceneDescription?: string;
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

export function useStoryPipeline() {
  const [story, setStory] = useState<Story | null>(null);
  const [phase, setPhase] = useState<PipelinePhase>("idle");
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canFallbackToMock, setCanFallbackToMock] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [preferMock, setPreferMock] = useState(false);

  const storyRef = useRef<Story | null>(null);
  const lastInputRef = useRef<StoryInput | null>(null);
  useEffect(() => {
    storyRef.current = story;
  }, [story]);

  const fetchIllustration = useCallback(async (s: Story, target: IllustrationTarget, seed: number, forceMock: boolean) => {
    return postJson<IllustrationResponse>("/api/illustration", {
      illustrationStyle: s.input.illustrationStyle,
      characterReferenceImageUrl: s.characterReferenceImageUrl,
      settingDescription: s.settingDescription,
      sceneDescription: target.kind === "page" ? target.sceneDescription : undefined,
      title: target.kind === "cover" ? s.title : undefined,
      themeId: s.input.theme,
      childName: s.input.childName,
      isCover: target.kind === "cover",
      forceMock,
      seed,
    });
  }, []);

  const runIllustrations = useCallback(
    async (s: Story, forceMock: boolean) => {
      const total = s.pages.length + 1; // +1 for the cover
      setProgress({ done: 0, total });

      setCurrentTask("Illustrating your cover…");
      const coverSeed = Date.now() + Math.floor(Math.random() * 10_000);
      const coverResult = await fetchIllustration(s, { kind: "cover" }, coverSeed, forceMock);
      setStory((prev) => {
        if (!prev) return prev;
        return coverResult.ok
          ? { ...prev, coverStatus: "ready", coverImageUrl: coverResult.data.imageUrl, coverError: undefined }
          : { ...prev, coverStatus: "error", coverError: coverResult.error };
      });
      setProgress({ done: 1, total });

      for (const page of s.pages) {
        setCurrentTask(`Illustrating page ${page.pageNumber} of ${s.pages.length}…`);
        const seed = Date.now() + Math.floor(Math.random() * 10_000);
        const result = await fetchIllustration(s, { kind: "page", pageNumber: page.pageNumber, sceneDescription: page.illustrationPrompt }, seed, forceMock);
        setStory((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: prev.pages.map((p) =>
              p.pageNumber === page.pageNumber
                ? result.ok
                  ? { ...p, imageStatus: "ready" as const, imageUrl: result.data.imageUrl, imageError: undefined }
                  : { ...p, imageStatus: "error" as const, imageError: result.error }
                : p
            ),
          };
        });
        setProgress((prev) => ({ done: prev.done + 1, total }));
      }
      setCurrentTask(null);
    },
    [fetchIllustration]
  );

  const writeStoryAndIllustrate = useCallback(
    async (input: StoryInput, character: { imageUrl: string; description: string; mode: "ai" | "mock" }, useMock: boolean, variationHint?: string) => {
      setPhase("writing");
      setCurrentTask("Writing your adventure…");

      const storyResult = await postJson<StoryTextResponse>("/api/story", {
        childName: input.childName,
        age: input.age,
        theme: input.theme,
        length: input.length,
        forceMock: useMock,
        variationHint,
      });

      if (!storyResult.ok) {
        setPhase("error");
        setError(storyResult.error);
        setCanFallbackToMock(storyResult.canFallbackToMock);
        setCurrentTask(null);
        return;
      }

      const initialStory: Story = {
        title: storyResult.data.title,
        input,
        characterReferenceImageUrl: character.imageUrl,
        characterReferenceStatus: "ready",
        characterDescription: character.description,
        settingDescription: storyResult.data.settingDescription,
        coverStatus: "loading",
        pages: storyResult.data.pages.map((p) => ({ ...p, imageStatus: "loading" as const })),
        mode: character.mode === "mock" || storyResult.data.mode === "mock" ? "mock" : "ai",
      };
      setStory(initialStory);
      setPhase("illustrating");

      await runIllustrations(initialStory, useMock);
      setPhase("ready");
    },
    [runIllustrations]
  );

  const generate = useCallback(
    async (input: StoryInput, options?: { variationHint?: string; forceMock?: boolean }) => {
      lastInputRef.current = input;
      const useMock = options?.forceMock ?? preferMock;
      setError(null);
      setCanFallbackToMock(false);
      setStory(null);
      setProgress({ done: 0, total: 0 });

      setPhase("creating-character");
      setCurrentTask("Creating your character…");

      const characterResult = await postJson<CharacterReferenceResponse>("/api/character", {
        childName: input.childName,
        age: input.age,
        illustrationStyle: input.illustrationStyle,
        photoDataUrl: input.photoDataUrl,
        themeId: input.theme,
        forceMock: useMock,
      });

      if (!characterResult.ok) {
        setPhase("error");
        setError(characterResult.error);
        setCanFallbackToMock(characterResult.canFallbackToMock);
        setCurrentTask(null);
        return;
      }

      await writeStoryAndIllustrate(input, characterResult.data, useMock, options?.variationHint);
    },
    [preferMock, writeStoryAndIllustrate]
  );

  const retry = useCallback(() => {
    if (lastInputRef.current) void generate(lastInputRef.current);
  }, [generate]);

  const continueInDemoMode = useCallback(() => {
    setPreferMock(true);
    if (lastInputRef.current) void generate(lastInputRef.current, { forceMock: true });
  }, [generate]);

  const regenerateStory = useCallback(() => {
    const s = storyRef.current;
    const input = lastInputRef.current;
    if (!s || !input || !s.characterReferenceImageUrl) return;
    setError(null);
    setCanFallbackToMock(false);
    setStory(null);
    void writeStoryAndIllustrate(
      input,
      { imageUrl: s.characterReferenceImageUrl, description: s.characterDescription, mode: s.mode },
      preferMock,
      "Please write a fresh variation with different specific plot details, discoveries, and dialogue than any previous attempt, while keeping the same theme, tone, age-appropriateness, and character."
    );
  }, [preferMock, writeStoryAndIllustrate]);

  const regenerateCover = useCallback(async () => {
    const s = storyRef.current;
    if (!s) return;
    setStory((prev) => (prev ? { ...prev, coverStatus: "loading", coverError: undefined } : prev));
    const seed = Date.now() + Math.floor(Math.random() * 10_000);
    const result = await fetchIllustration(s, { kind: "cover" }, seed, s.mode === "mock" || preferMock);
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
    setCurrentTask(null);
    setError(null);
    setCanFallbackToMock(false);
    setProgress({ done: 0, total: 0 });
    setPreferMock(false);
    lastInputRef.current = null;
  }, []);

  return {
    story,
    phase,
    currentTask,
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
