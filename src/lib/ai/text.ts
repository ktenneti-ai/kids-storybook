import Anthropic from "@anthropic-ai/sdk";
import { buildCharacterAnalysisPrompt, buildRegeneratePagePrompt, buildStoryPrompt } from "../prompt";
import type { AgeRangeId, StoryPageContent } from "../types";

const TEXT_MODEL = process.env.ANTHROPIC_TEXT_MODEL || "claude-sonnet-5";

let client: Anthropic | null | undefined;

/** Lazily creates the Anthropic client. Returns null when no API key is configured. */
function getClient(): Anthropic | null {
  if (client !== undefined) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  client = apiKey ? new Anthropic({ apiKey }) : null;
  return client;
}

export function hasTextProvider(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const PHOTO_DATA_URL_RE = /^data:image\/(png|jpe?g|webp);base64,(.+)$/;

/** Uses a vision-capable Claude model to turn an uploaded photo into a short, reusable text description. */
export async function analyzeCharacterPhoto(photoDataUrl: string, childName: string, age: AgeRangeId): Promise<string> {
  const anthropic = getClient();
  if (!anthropic) throw new Error("Text provider is not configured.");

  const match = PHOTO_DATA_URL_RE.exec(photoDataUrl);
  if (!match) throw new Error("Unsupported photo format.");
  const rawType = match[1] === "jpg" ? "jpeg" : match[1];
  const mediaType = `image/${rawType}` as "image/png" | "image/jpeg" | "image/webp";
  const base64 = match[2];

  const response = await anthropic.messages.create({
    model: TEXT_MODEL,
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: buildCharacterAnalysisPrompt(childName, age) },
        ],
      },
    ],
  });

  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join(" ")
    .trim();

  if (!text) throw new Error("The photo could not be analyzed.");
  return text;
}

interface RawStoryPayload {
  title?: unknown;
  settingDescription?: unknown;
  pages?: unknown;
}

function extractJsonObject(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("The AI response was not valid JSON.");
  }
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw new Error("The AI response could not be parsed.");
  }
}

function validateStoryPayload(payload: unknown, expectedLength: number): { title: string; settingDescription: string; pages: StoryPageContent[] } {
  const p = payload as RawStoryPayload;
  const title = typeof p.title === "string" ? p.title.trim() : "";
  const settingDescription = typeof p.settingDescription === "string" ? p.settingDescription.trim() : "";
  if (!title || !settingDescription || !Array.isArray(p.pages)) {
    throw new Error("The AI response was missing required story fields.");
  }
  const pages: StoryPageContent[] = p.pages.map((raw, idx) => {
    const page = raw as Record<string, unknown>;
    const text = typeof page.text === "string" ? page.text.trim() : "";
    const illustrationPrompt = typeof page.illustrationPrompt === "string" ? page.illustrationPrompt.trim() : "";
    if (!text || !illustrationPrompt) {
      throw new Error(`Page ${idx + 1} was missing story text or an illustration prompt.`);
    }
    return { pageNumber: idx + 1, text, illustrationPrompt };
  });
  if (pages.length !== expectedLength) {
    throw new Error(`Expected ${expectedLength} pages but received ${pages.length}.`);
  }
  return { title, settingDescription, pages };
}

/** Writes the original story text: title, world/setting description, and page-by-page content. */
export async function generateStory(
  input: { childName: string; age: AgeRangeId; theme: string; length: number },
  variationHint?: string
): Promise<{ title: string; settingDescription: string; pages: StoryPageContent[] }> {
  const anthropic = getClient();
  if (!anthropic) throw new Error("Text provider is not configured.");

  const response = await anthropic.messages.create({
    model: TEXT_MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: buildStoryPrompt(input, variationHint) }],
  });

  const raw = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n")
    .trim();

  const payload = extractJsonObject(raw);
  return validateStoryPayload(payload, input.length);
}

function validateSinglePagePayload(payload: unknown, pageNumber: number): StoryPageContent {
  const p = payload as Record<string, unknown>;
  const text = typeof p.text === "string" ? p.text.trim() : "";
  const illustrationPrompt = typeof p.illustrationPrompt === "string" ? p.illustrationPrompt.trim() : "";
  if (!text || !illustrationPrompt) {
    throw new Error("The AI response was missing page text or an illustration prompt.");
  }
  return { pageNumber, text, illustrationPrompt };
}

/** Rewrites a single page's text (and its matching illustration prompt), keeping the rest of the story unchanged. */
export async function regeneratePageText(input: {
  childName: string;
  age: AgeRangeId;
  theme: string;
  title: string;
  settingDescription: string;
  pages: StoryPageContent[];
  pageNumber: number;
}): Promise<StoryPageContent> {
  const anthropic = getClient();
  if (!anthropic) throw new Error("Text provider is not configured.");

  const response = await anthropic.messages.create({
    model: TEXT_MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: buildRegeneratePagePrompt(input) }],
  });

  const raw = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n")
    .trim();

  const payload = extractJsonObject(raw);
  return validateSinglePagePayload(payload, input.pageNumber);
}
