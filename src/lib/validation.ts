import { AGE_RANGES, ILLUSTRATION_STYLES, MAX_PHOTO_BYTES, STORY_LENGTHS, THEMES } from "./constants";
import type { StoryInput } from "./types";

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

const DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp);base64,([a-zA-Z0-9+/=]+)$/;

function estimateBase64Bytes(base64: string): number {
  return Math.floor((base64.length * 3) / 4);
}

export function validateStoryInput(body: unknown): ValidationResult<StoryInput> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;

  const childName = typeof b.childName === "string" ? b.childName.trim() : "";
  if (!childName) return { ok: false, error: "Please enter the child's name." };
  if (childName.length > 40) return { ok: false, error: "Name must be 40 characters or fewer." };

  const age = typeof b.age === "string" ? b.age : "";
  if (!AGE_RANGES.some((a) => a.id === age)) return { ok: false, error: "Please choose a valid age range." };

  const theme = typeof b.theme === "string" ? b.theme : "";
  if (!THEMES.some((t) => t.id === theme)) return { ok: false, error: "Please choose a valid story theme." };

  const length = typeof b.length === "number" ? b.length : Number(b.length);
  if (!STORY_LENGTHS.includes(length as (typeof STORY_LENGTHS)[number])) {
    return { ok: false, error: "Please choose a valid story length." };
  }

  const illustrationStyle = typeof b.illustrationStyle === "string" ? b.illustrationStyle : "";
  if (!ILLUSTRATION_STYLES.some((s) => s.id === illustrationStyle)) {
    return { ok: false, error: "Please choose a valid illustration style." };
  }

  let photoDataUrl: string | null = null;
  if (typeof b.photoDataUrl === "string" && b.photoDataUrl.length > 0) {
    const match = DATA_URL_RE.exec(b.photoDataUrl);
    if (!match) {
      return { ok: false, error: "Photo must be a PNG, JPEG, or WEBP image." };
    }
    if (estimateBase64Bytes(match[2]) > MAX_PHOTO_BYTES) {
      return { ok: false, error: "Photo is too large. Please upload an image under 5MB." };
    }
    photoDataUrl = b.photoDataUrl;
  }

  return {
    ok: true,
    value: { childName, age: age as StoryInput["age"], theme, length, illustrationStyle, photoDataUrl },
  };
}

export function validateIllustrationRequest(body: unknown): ValidationResult<{
  illustrationStyle: string;
  characterDescription: string;
  settingDescription: string;
  sceneDescription: string;
  themeId: string;
  isCover: boolean;
  forceMock: boolean;
  seed: number;
}> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;

  const illustrationStyle = typeof b.illustrationStyle === "string" ? b.illustrationStyle : "";
  if (!ILLUSTRATION_STYLES.some((s) => s.id === illustrationStyle)) {
    return { ok: false, error: "Please choose a valid illustration style." };
  }
  const characterDescription = typeof b.characterDescription === "string" ? b.characterDescription.trim() : "";
  if (!characterDescription) return { ok: false, error: "Missing character description." };

  const settingDescription = typeof b.settingDescription === "string" ? b.settingDescription.trim() : "";
  if (!settingDescription) return { ok: false, error: "Missing setting description." };

  const sceneDescription = typeof b.sceneDescription === "string" ? b.sceneDescription.trim() : "";
  if (!sceneDescription) return { ok: false, error: "Missing scene description." };

  const themeId = typeof b.themeId === "string" ? b.themeId : "";
  const isCover = Boolean(b.isCover);
  const forceMock = Boolean(b.forceMock);
  const seed = typeof b.seed === "number" && Number.isFinite(b.seed) ? b.seed : 0;

  return {
    ok: true,
    value: { illustrationStyle, characterDescription, settingDescription, sceneDescription, themeId, isCover, forceMock, seed },
  };
}
