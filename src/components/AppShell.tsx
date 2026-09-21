"use client";

import { useCallback, useEffect, useState } from "react";
import { CreateWizard } from "@/components/create/CreateWizard";
import { HomeScreen } from "@/components/home/HomeScreen";
import { StorybookReader } from "@/components/reader/StorybookReader";
import { useStoryPipeline } from "@/hooks/useStoryPipeline";
import { deleteStory, listStories } from "@/lib/storage";
import type { Story, StoryInput } from "@/lib/types";

type View = "home" | "create" | "reader";

export function AppShell() {
  const [view, setView] = useState<View>("home");
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const pipeline = useStoryPipeline();

  const refreshSavedStories = useCallback(() => {
    listStories()
      .then(setSavedStories)
      .catch((err) => console.error("Failed to load saved stories:", err));
  }, []);

  // Load on mount, and again whenever we land back on Home — picks up a
  // story that was just auto-saved on finishing generation/regeneration.
  useEffect(() => {
    if (view === "home") refreshSavedStories();
  }, [view, refreshSavedStories]);

  const handleGenerate = (input: StoryInput) => {
    setView("reader");
    void pipeline.generate(input);
  };

  const handleNewStory = () => {
    pipeline.reset();
    setView("create");
  };

  const handleHome = () => {
    pipeline.reset();
    setView("home");
  };

  const handleOpenStory = (story: Story) => {
    pipeline.loadStory(story);
    setView("reader");
  };

  const handleDeleteStory = async (id: string) => {
    await deleteStory(id);
    setSavedStories((prev) => prev.filter((s) => s.id !== id));
  };

  if (view === "home") {
    return (
      <HomeScreen
        onStart={() => setView("create")}
        savedStories={savedStories}
        onOpenStory={handleOpenStory}
        onDeleteStory={handleDeleteStory}
      />
    );
  }
  if (view === "create") return <CreateWizard onSubmit={handleGenerate} onBack={handleHome} />;
  return <StorybookReader pipeline={pipeline} onNewStory={handleNewStory} onHome={handleHome} />;
}
