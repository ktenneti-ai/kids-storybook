import { findAge, findStyle, findTheme } from "./constants";
import type { AgeRangeId, StoryInput } from "./types";

/**
 * Builds the user prompt sent to the text-generation model to produce the
 * story's title, world/setting description, and page-by-page content.
 * The model is instructed to return strict JSON so the API route can parse
 * it without relying on brittle text scraping.
 */
export function buildStoryPrompt(input: StoryInput, characterDescription: string, variationHint?: string): string {
  const theme = findTheme(input.theme);
  const age = findAge(input.age);

  return `You are a celebrated children's book author. Write an ORIGINAL story — never reuse or reference existing copyrighted characters, franchises, songs, or published stories.

STORY BRIEF
- Main character: ${input.childName}, who is brave, kind, and curious.
- Reader age range: ${age.label} (${age.description})
- Theme: ${theme.label} — the story takes place in ${theme.promptFragment}.
- Length: exactly ${input.length} pages (this does not include the cover).
- Fixed character appearance (for the illustrator, do not contradict, do not restate verbatim in page text): ${characterDescription}
${variationHint ? `- Variation note: ${variationHint}\n` : ""}
WRITING RULES
- Clear arc: a beginning that introduces ${input.childName} and the world, a middle with a gentle discovery or small challenge, and a warm, satisfying ending with a light positive message (friendship, courage, curiosity, kindness, or perseverance).
- Tone and vocabulary must fit a ${age.label} reader, read aloud by a caregiver.
- No violence, scary threats, weapons, danger of real harm, or anything inappropriate for young children. Conflicts must be gentle — e.g. solving a puzzle, helping a friend, overcoming a small fear, finding something lost.
- Each page's "text" is 1-3 short sentences of the actual story, written in third person, present in a storybook voice.
- Each page's "illustrationPrompt" is one vivid sentence describing exactly what should be drawn on that page (setting, action, character pose or expression). Do NOT restate the character's fixed appearance in it — that will be added separately by the illustrator.
- "settingDescription" is 1-2 sentences describing the consistent visual world (location style, recurring props, color palette/mood) that should stay visually consistent across every illustration in the book.
- "title" is a fun, whimsical book title (may include ${input.childName}'s name).

Respond with ONLY valid JSON and nothing else — no markdown code fences, no commentary. Match this exact shape:
{
  "title": string,
  "settingDescription": string,
  "pages": [
    { "pageNumber": number, "text": string, "illustrationPrompt": string }
  ]
}
The "pages" array must contain exactly ${input.length} items, with "pageNumber" running from 1 to ${input.length} in order.`;
}

/** Prompt used to derive a text-only visual description from an uploaded photo. */
export function buildCharacterAnalysisPrompt(childName: string, age: AgeRangeId): string {
  return `Look at this photo of a child named ${childName} (age range ${age}). Write ONE short, warm, respectful sentence (max 40 words) describing their visual appearance for a children's book illustrator: approximate hair color/style, skin tone, and any notable clothing or accessory visible in the photo. Use tasteful, generic, kid-friendly language. Do not mention the photo, do not guess personal details beyond appearance, and do not include any text formatting — respond with the sentence only.`;
}

/** Generic character description used when no photo is provided. */
export function buildDefaultCharacterDescription(input: StoryInput): string {
  const age = findAge(input.age);
  return `${input.childName}, a cheerful ${age.label.replace(" years", "-year-old")} child with a bright smile and warm, expressive eyes, drawn in a friendly, inclusive style with simple everyday play clothes`;
}

/** Scene description for the book cover, built from the theme and generated title. */
export function buildCoverSceneDescription(themeId: string, title: string): string {
  const theme = findTheme(themeId);
  return `A joyful, inviting cover portrait for a book titled "${title}", set in ${theme.promptFragment}, radiating warmth and a sense of adventure, with the main character front and center in a hero composition.`;
}

/** Combines style, character, setting, and the per-page scene into one illustration prompt. */
export function buildIllustrationPrompt(options: {
  illustrationStyle: string;
  characterDescription: string;
  settingDescription: string;
  sceneDescription: string;
  isCover?: boolean;
}): string {
  const style = findStyle(options.illustrationStyle);
  const parts = [
    `${style.promptFragment}.`,
    `Main character: ${options.characterDescription}.`,
    `Consistent world: ${options.settingDescription}.`,
    options.isCover
      ? `This is the BOOK COVER illustration — a striking, inviting hero image. Scene: ${options.sceneDescription}.`
      : `Scene: ${options.sceneDescription}.`,
    "Keep the character's face, outfit, and art style fully consistent with the rest of this book.",
    "No text, letters, words, numbers, speech bubbles, or logos anywhere in the image. No watermarks or borders. Bright, warm, wholesome, and appropriate for young children. Single cohesive illustration.",
  ];
  return parts.join(" ");
}
