"use client";

import { useState } from "react";
import { CreateWizard } from "@/components/create/CreateWizard";
import { HomeScreen } from "@/components/home/HomeScreen";
import { StorybookReader } from "@/components/reader/StorybookReader";
import { useStoryPipeline } from "@/hooks/useStoryPipeline";
import type { StoryInput } from "@/lib/types";

type View = "home" | "create" | "reader";

export function AppShell() {
  const [view, setView] = useState<View>("home");
  const pipeline = useStoryPipeline();

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

  if (view === "home") return <HomeScreen onStart={() => setView("create")} />;
  if (view === "create") return <CreateWizard onSubmit={handleGenerate} onBack={handleHome} />;
  return <StorybookReader pipeline={pipeline} onNewStory={handleNewStory} onHome={handleHome} />;
}
