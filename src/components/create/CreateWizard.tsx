"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AGE_RANGES, ILLUSTRATION_STYLES, STORY_LENGTHS, THEMES } from "@/lib/constants";
import type { AgeRangeId, StoryInput } from "@/lib/types";
import { PhotoUpload } from "./PhotoUpload";

interface CreateWizardProps {
  onSubmit: (input: StoryInput) => void;
  onBack: () => void;
}

const STEPS = ["Child", "Story details", "Review"] as const;

export function CreateWizard({ onSubmit, onBack }: CreateWizardProps) {
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [age, setAge] = useState<AgeRangeId>("6-8");
  const [theme, setTheme] = useState(THEMES[0].id);
  const [length, setLength] = useState<number>(10);
  const [illustrationStyle, setIllustrationStyle] = useState(ILLUSTRATION_STYLES[0].id);
  const [nameError, setNameError] = useState<string | null>(null);

  const selectedTheme = THEMES.find((t) => t.id === theme)!;
  const selectedStyle = ILLUSTRATION_STYLES.find((s) => s.id === illustrationStyle)!;
  const selectedAge = AGE_RANGES.find((a) => a.id === age)!;

  const goNext = () => {
    if (step === 0) {
      const trimmed = childName.trim();
      if (!trimmed) {
        setNameError("Please enter the child's name.");
        return;
      }
      if (trimmed.length > 40) {
        setNameError("Name must be 40 characters or fewer.");
        return;
      }
      setNameError(null);
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => (step === 0 ? onBack() : setStep((s) => s - 1));

  const handleSubmit = () => {
    onSubmit({ childName: childName.trim(), photoDataUrl, age, theme, length, illustrationStyle });
  };

  return (
    <main className="flex-1 bg-linear-to-b from-violet-50 via-fuchsia-50 to-orange-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          {STEPS.map((label, idx) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-bold transition ${
                  idx === step
                    ? "bg-linear-to-r from-fuchsia-500 to-orange-400 text-white shadow-md"
                    : idx < step
                      ? "bg-violet-200 text-violet-700"
                      : "bg-white text-violet-400 border border-violet-200"
                }`}
              >
                {idx < step ? "✓" : idx + 1}
              </div>
              {idx < STEPS.length - 1 ? <div className={`h-0.5 w-8 sm:w-16 ${idx < step ? "bg-violet-300" : "bg-violet-100"}`} /> : null}
            </div>
          ))}
        </div>

        <div className="animate-pop-in rounded-3xl bg-white p-6 shadow-xl shadow-violet-200/50 sm:p-9">
          {step === 0 ? (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-violet-900">Who&apos;s the star of this story?</h2>
                <p className="mt-1 text-sm text-violet-600">Tell us the child&apos;s name, and add a photo if you&apos;d like.</p>
              </div>
              <div>
                <label htmlFor="childName" className="mb-1.5 block text-sm font-semibold text-violet-800">
                  Child&apos;s name
                </label>
                <input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Emma"
                  maxLength={40}
                  className="w-full rounded-2xl border-2 border-violet-200 px-4 py-3 text-base outline-none transition focus:border-fuchsia-400"
                />
                {nameError ? <p className="mt-1.5 text-sm font-medium text-rose-600">{nameError}</p> : null}
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-semibold text-violet-800">Photo (optional)</span>
                <PhotoUpload value={photoDataUrl} onChange={setPhotoDataUrl} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="flex flex-col gap-7">
              <div>
                <h2 className="font-display text-2xl font-bold text-violet-900">Set the scene</h2>
                <p className="mt-1 text-sm text-violet-600">Pick an age range, a theme, a length, and an art style.</p>
              </div>

              <div>
                <span className="mb-2 block text-sm font-semibold text-violet-800">Age range</span>
                <div className="grid grid-cols-3 gap-2">
                  {AGE_RANGES.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAge(a.id)}
                      className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                        age === a.id ? "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-700" : "border-violet-100 text-violet-700 hover:border-violet-200"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-semibold text-violet-800">Story theme</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition ${
                        theme === t.id ? "border-fuchsia-400 bg-fuchsia-50" : "border-violet-100 hover:border-violet-200"
                      }`}
                    >
                      <span className="text-2xl">{t.emoji}</span>
                      <span className="text-xs font-semibold text-violet-800">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-semibold text-violet-800">Story length</span>
                <div className="grid grid-cols-3 gap-2">
                  {STORY_LENGTHS.map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setLength(len)}
                      className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                        length === len ? "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-700" : "border-violet-100 text-violet-700 hover:border-violet-200"
                      }`}
                    >
                      {len} pages
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-semibold text-violet-800">Illustration style</span>
                <div className="grid grid-cols-2 gap-2">
                  {ILLUSTRATION_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setIllustrationStyle(s.id)}
                      className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition ${
                        illustrationStyle === s.id
                          ? "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-700"
                          : "border-violet-100 text-violet-700 hover:border-violet-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-violet-900">Ready to make some magic?</h2>
                <p className="mt-1 text-sm text-violet-600">Here&apos;s what we&apos;ll create.</p>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-violet-50 p-4">
                {photoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoDataUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-violet-200 text-2xl">🧒</div>
                )}
                <div>
                  <div className="font-display text-lg font-bold text-violet-900">{childName || "Your child"}</div>
                  <div className="text-sm text-violet-600">{selectedAge.label}</div>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-violet-50 p-3">
                  <dt className="text-violet-500">Theme</dt>
                  <dd className="font-semibold text-violet-900">
                    {selectedTheme.emoji} {selectedTheme.label}
                  </dd>
                </div>
                <div className="rounded-xl bg-violet-50 p-3">
                  <dt className="text-violet-500">Length</dt>
                  <dd className="font-semibold text-violet-900">{length} pages</dd>
                </div>
                <div className="col-span-2 rounded-xl bg-violet-50 p-3">
                  <dt className="text-violet-500">Illustration style</dt>
                  <dd className="font-semibold text-violet-900">{selectedStyle.label}</dd>
                </div>
              </dl>
              <p className="text-xs text-violet-500">
                Generating a full storybook can take a little while &mdash; we&apos;ll show progress for the story text and
                every illustration.
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={goBack}>
              ← Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={goNext}>Continue →</Button>
            ) : (
              <Button onClick={handleSubmit} icon={<span aria-hidden>✨</span>}>
                Generate Story
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
