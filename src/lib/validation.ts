import { AGE_RANGES, ILLUSTRATION_STYLES, MAX_PHOTO_BYTES, STORY_LENGTHS, THEMES } from "./constants";
import type { AgeRangeId } from "./types";

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

const DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp);base64,([a-zA-Z0-9+/=]+)$/;
const MAX_REFERENCE_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB — server-generated, not user-uploaded

function estimateBase64Bytes(base64: string): number {
  return Math.floor((base64.length * 3) / 4);
}

function validateChildName(b: Record<string, unknown>): ValidationResult<string> {
  const childName = typeof b.childName === "string" ? b.childName.trim() : "";
  if (!childName) return { ok: false, error: "Please enter the child's name." };
  if (childName.length > 40) return { ok: false, error: "Name must be 40 characters or fewer." };
  return { ok: true, value: childName };
}

function validateAge(b: Record<string, unknown>): ValidationResult<AgeRangeId> {
  const age = typeof b.age === "string" ? b.age : "";
  if (!AGE_RANGES.some((a) => a.id === age)) return { ok: false, error: "Please choose a valid age range." };
  return { ok: true, value: age as AgeRangeId };
}

function validateIllustrationStyle(b: Record<string, unknown>): ValidationResult<string> {
  const illustrationStyle = typeof b.illustrationStyle === "string" ? b.illustrationStyle : "";
  if (!ILLUSTRATION_STYLES.some((s) => s.id === illustrationStyle)) {
    return { ok: false, error: "Please choose a valid illustration style." };
  }
  return { ok: true, value: illustrationStyle };
}

function validatePhoto(b: Record<string, unknown>): ValidationResult<string | null> {
  if (typeof b.photoDataUrl !== "string" || b.photoDataUrl.length === 0) return { ok: true, value: null };
  const match = DATA_URL_RE.exec(b.photoDataUrl);
  if (!match) return { ok: false, error: "Photo must be a PNG, JPEG, or WEBP image." };
  if (estimateBase64Bytes(match[2]) > MAX_PHOTO_BYTES) {
    return { ok: false, error: "Photo is too large. Please upload an image under 5MB." };
  }
  return { ok: true, value: b.photoDataUrl };
}

/** The story-text endpoint only needs name/age/theme/length — no photo, no character appearance. */
export function validateStoryInput(body: unknown): ValidationResult<{
  childName: string;
  age: AgeRangeId;
  theme: string;
  length: number;
}> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;

  const childName = validateChildName(b);
  if (!childName.ok) return childName;

  const age = validateAge(b);
  if (!age.ok) return age;

  const theme = typeof b.theme === "string" ? b.theme : "";
  if (!THEMES.some((t) => t.id === theme)) return { ok: false, error: "Please choose a valid story theme." };

  const length = typeof b.length === "number" ? b.length : Number(b.length);
  if (!STORY_LENGTHS.includes(length as (typeof STORY_LENGTHS)[number])) {
    return { ok: false, error: "Please choose a valid story length." };
  }

  return { ok: true, value: { childName: childName.value, age: age.value, theme, length } };
}

/** The character endpoint turns an optional photo + name/age into a reusable cartoon character reference image. */
export function validateCharacterInput(body: unknown): ValidationResult<{
  childName: string;
  age: AgeRangeId;
  illustrationStyle: string;
  photoDataUrl: string | null;
  forceMock: boolean;
}> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;

  const childName = validateChildName(b);
  if (!childName.ok) return childName;

  const age = validateAge(b);
  if (!age.ok) return age;

  const illustrationStyle = validateIllustrationStyle(b);
  if (!illustrationStyle.ok) return illustrationStyle;

  const photoDataUrl = validatePhoto(b);
  if (!photoDataUrl.ok) return photoDataUrl;

  return {
    ok: true,
    value: {
      childName: childName.value,
      age: age.value,
      illustrationStyle: illustrationStyle.value,
      photoDataUrl: photoDataUrl.value,
      forceMock: b.forceMock === true,
    },
  };
}

/** One illustration (cover or a page), generated via image-to-image from the character reference image. */
export function validateIllustrationRequest(body: unknown): ValidationResult<{
  illustrationStyle: string;
  characterReferenceImageUrl: string;
  characterDescription: string;
  settingDescription: string;
  sceneDescription: string;
  storyPageText: string;
  title: string;
  themeId: string;
  isCover: boolean;
  forceMock: boolean;
  seed: number;
}> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;

  const illustrationStyle = validateIllustrationStyle(b);
  if (!illustrationStyle.ok) return illustrationStyle;

  // Accepts either a base64 raster image (the real AI path) or a utf8 SVG data URL
  // (the offline demo-mode character portrait) — the raster/base64 shape is only
  // strictly required downstream, when the real image provider actually reads it.
  const characterReferenceImageUrl = typeof b.characterReferenceImageUrl === "string" ? b.characterReferenceImageUrl : "";
  if (!/^data:image\/[a-zA-Z0-9.+-]+;(?:base64|utf8),/.test(characterReferenceImageUrl)) {
    return { ok: false, error: "Missing or invalid character reference image." };
  }
  if (characterReferenceImageUrl.length > MAX_REFERENCE_IMAGE_BYTES) {
    return { ok: false, error: "Character reference image is too large." };
  }

  const characterDescription = typeof b.characterDescription === "string" ? b.characterDescription.trim() : "";
  if (!characterDescription) return { ok: false, error: "Missing character description." };

  const settingDescription = typeof b.settingDescription === "string" ? b.settingDescription.trim() : "";
  if (!settingDescription) return { ok: false, error: "Missing setting description." };

  const isCover = Boolean(b.isCover);
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const sceneDescription = typeof b.sceneDescription === "string" ? b.sceneDescription.trim() : "";
  const storyPageText = typeof b.storyPageText === "string" ? b.storyPageText.trim() : "";
  if (isCover && !title) return { ok: false, error: "Missing book title for the cover illustration." };
  if (!isCover && !sceneDescription) return { ok: false, error: "Missing scene description." };

  const themeId = typeof b.themeId === "string" ? b.themeId : "";
  const forceMock = Boolean(b.forceMock);
  const seed = typeof b.seed === "number" && Number.isFinite(b.seed) ? b.seed : 0;

  return {
    ok: true,
    value: {
      illustrationStyle: illustrationStyle.value,
      characterReferenceImageUrl,
      characterDescription,
      settingDescription,
      sceneDescription,
      storyPageText,
      title,
      themeId,
      isCover,
      forceMock,
      seed,
    },
  };
}

/** Rewrites a single page's text while keeping the rest of the book (and its position/role in the story) unchanged. */
export function validateRegeneratePageInput(body: unknown): ValidationResult<{
  childName: string;
  age: AgeRangeId;
  theme: string;
  length: number;
  title: string;
  settingDescription: string;
  pages: { pageNumber: number; text: string; illustrationPrompt: string }[];
  pageNumber: number;
  forceMock: boolean;
}> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;

  const childName = validateChildName(b);
  if (!childName.ok) return childName;

  const age = validateAge(b);
  if (!age.ok) return age;

  const theme = typeof b.theme === "string" ? b.theme : "";
  if (!THEMES.some((t) => t.id === theme)) return { ok: false, error: "Please choose a valid story theme." };

  const length = typeof b.length === "number" ? b.length : Number(b.length);
  if (!STORY_LENGTHS.includes(length as (typeof STORY_LENGTHS)[number])) {
    return { ok: false, error: "Please choose a valid story length." };
  }

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return { ok: false, error: "Missing book title." };

  const settingDescription = typeof b.settingDescription === "string" ? b.settingDescription.trim() : "";
  if (!settingDescription) return { ok: false, error: "Missing setting description." };

  if (!Array.isArray(b.pages)) return { ok: false, error: "Missing story pages." };
  const pages = b.pages.map((raw) => {
    const p = raw as Record<string, unknown>;
    return {
      pageNumber: typeof p.pageNumber === "number" ? p.pageNumber : NaN,
      text: typeof p.text === "string" ? p.text : "",
      illustrationPrompt: typeof p.illustrationPrompt === "string" ? p.illustrationPrompt : "",
    };
  });
  if (pages.length !== length || pages.some((p) => !p.text || !p.illustrationPrompt || Number.isNaN(p.pageNumber))) {
    return { ok: false, error: "Story pages are malformed." };
  }

  const pageNumber = typeof b.pageNumber === "number" ? b.pageNumber : Number(b.pageNumber);
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > length) {
    return { ok: false, error: "Please choose a valid page to regenerate." };
  }

  return {
    ok: true,
    value: { childName: childName.value, age: age.value, theme, length, title, settingDescription, pages, pageNumber, forceMock: b.forceMock === true },
  };
}
