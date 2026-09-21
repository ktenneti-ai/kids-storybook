"use client";

import { useRef, useState } from "react";
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_BYTES } from "@/lib/constants";

interface PhotoUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setError("Please upload a PNG, JPEG, or WEBP photo.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("That photo is too large. Please choose one under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.onerror = () => setError("We couldn't read that photo. Please try another.");
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        className="relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/60 p-6 text-center transition hover:border-violet-400 hover:bg-violet-50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Uploaded child photo preview" className="h-28 w-28 rounded-2xl object-cover shadow-md" />
            <div className="flex gap-3">
              <button type="button" onClick={() => inputRef.current?.click()} className="text-sm font-semibold text-violet-700 underline">
                Change photo
              </button>
              <button type="button" onClick={() => onChange(null)} className="text-sm font-semibold text-rose-600 underline">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-3xl" aria-hidden>
              📷
            </div>
            <p className="text-sm font-medium text-violet-800">Drag a photo here, or</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full border border-violet-200 bg-white px-4 py-1.5 text-sm font-semibold text-violet-700 shadow-sm hover:bg-violet-100"
            >
              Choose a photo
            </button>
            <p className="text-xs text-violet-500">Optional &middot; PNG, JPEG, or WEBP &middot; up to 5MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_PHOTO_TYPES.join(",")}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error ? <p className="mt-2 text-sm font-medium text-rose-600">{error}</p> : null}
      <p className="mt-2 text-xs text-violet-500/80">
        The photo is used only to describe your child&apos;s look to the illustrator &mdash; it isn&apos;t stored.
      </p>
    </div>
  );
}
