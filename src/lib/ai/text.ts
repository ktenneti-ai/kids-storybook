import Anthropic from "@anthropic-ai/sdk";
import { buildRegeneratePagePrompt, buildStoryPrompt } from "../prompt";
import type { AgeRangeId, CharacterGender, StoryPageContent } from "../types";

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
  input: { childName: string; gender: CharacterGender; age: AgeRangeId; theme: string; length: number },
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
