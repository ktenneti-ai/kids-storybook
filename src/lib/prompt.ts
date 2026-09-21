import { findAge, findStyle, findTheme } from "./constants";
import type { AgeRangeId, StoryPageContent } from "./types";

/**
 * Builds the user prompt sent to the text-generation model to produce the
 * story's title, world/setting description, and page-by-page content. Pure
 * text generation only — character appearance is carried by the reference
 * image at illustration time, not described here.
 */
export function buildStoryPrompt(
  input: { childName: string; age: AgeRangeId; theme: string; length: number },
  variationHint?: string
): string {
  const theme = findTheme(input.theme);
  const age = findAge(input.age);

  return `You are a celebrated children's book author. Write an ORIGINAL story — never reuse or reference existing copyrighted characters, franchises, songs, or published stories.

STORY BRIEF
- Main character: ${input.childName}, who is brave, kind, and curious.
- Reader age range: ${age.label} (${age.description})
- Theme: ${theme.label} — the story takes place in ${theme.promptFragment}.
- Length: exactly ${input.length} pages (this does not include the cover).
${variationHint ? `- Variation note: ${variationHint}\n` : ""}
WRITING RULES
- Clear arc: a beginning that introduces ${input.childName} and the world, a middle with a gentle discovery or small challenge, and a warm, satisfying ending with a light positive message (friendship, courage, curiosity, kindness, or perseverance).
- Tone and vocabulary must fit a ${age.label} reader, read aloud by a caregiver.
- No violence, scary threats, weapons, danger of real harm, or anything inappropriate for young children. Conflicts must be gentle — e.g. solving a puzzle, helping a friend, overcoming a small fear, finding something lost.
- Each page's "text" is 2-4 short sentences of the actual story, written in third person, in a storybook voice.
- Each page's "illustrationPrompt" is one vivid, detailed sentence describing exactly what ${input.childName} is doing on that page — the action, pose, expression, and immediate surroundings — so an illustrator could draw it without seeing the story text. Do NOT describe ${input.childName}'s physical appearance in it (hair, face, clothing) — that is fixed separately by a character reference image.
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

/** Prompt used to derive a text-only visual description from an uploaded photo (kept as reinforcement alongside the reference image). */
export function buildCharacterAnalysisPrompt(childName: string, age: AgeRangeId): string {
  return `Look at this photo of a child named ${childName} (age range ${age}). Write ONE short, warm, respectful sentence (max 40 words) describing their visual appearance for a children's book illustrator: approximate hair color/style, skin tone, and any notable clothing or accessory visible in the photo. Use tasteful, generic, kid-friendly language. Do not mention the photo, do not guess personal details beyond appearance, and do not include any text formatting — respond with the sentence only.`;
}

/** Generic character description used when no photo is provided. */
export function buildDefaultCharacterDescription(input: { childName: string; age: AgeRangeId }): string {
  const age = findAge(input.age);
  return `${input.childName}, a cheerful ${age.label.replace(" years", "-year-old")} child with a bright smile and warm, expressive eyes, drawn in a friendly, inclusive style with simple everyday play clothes`;
}

/**
 * Prompt for turning an uploaded photo (or, with no photo, a text description)
 * into a single reusable cartoon character reference image — a clean
 * "character sheet" style portrait that every later illustration is
 * generated from via image-to-image editing.
 */
export function buildCharacterReferencePrompt(params: {
  childName: string;
  age: AgeRangeId;
  illustrationStyle: string;
  description: string;
  hasPhoto: boolean;
}): string {
  const style = findStyle(params.illustrationStyle);
  const age = findAge(params.age);
  const base = [
    params.hasPhoto
      ? `Turn the child shown in this reference photo into a single children's-book cartoon character named ${params.childName}, appropriate for a ${age.label} reader.`
      : `Create a single children's-book cartoon character named ${params.childName}, a ${age.label} child.`,
    `${style.promptFragment}.`,
    params.hasPhoto
      ? `Preserve their recognizable features from the photo — face shape, hairstyle and hair color, skin tone, and general appearance — but rendered as a warm, friendly illustrated cartoon, never a photo-realistic image.`
      : `Appearance: ${params.description}.`,
    "Show the character from head to at least the waist, facing slightly toward the viewer with a warm, friendly expression, standing on a plain, softly lit neutral background — this image will be reused as a character reference sheet for every later illustration, so keep the pose simple and clear.",
    "No text, letters, words, logos, or watermarks anywhere in the image. Wholesome and appropriate for young children.",
  ];
  return base.join(" ");
}

/**
 * Reusable clause enforcing visual identity + style consistency with the
 * character reference image. Threaded into every cover/page prompt so the
 * "consistency" instruction is defined once and never drifts between call
 * sites.
 */
export function buildConsistencyPrompt(illustrationStyle: string): string {
  const style = findStyle(illustrationStyle);
  return `Consistency requirement: the character's face shape, hairstyle, hair color, skin tone, eye color, outfit, and body proportions must look EXACTLY like the attached reference image — this is the same character appearing in a new scene, not a different-looking child. Render in a consistent ${style.label.toLowerCase()} style (${style.promptFragment}) matching the reference image's rendering style across every illustration in this book.`;
}

/**
 * Prompt for one interior storybook page, generated via image-to-image from
 * the character reference. Asks for a cinematic, fully-art-directed picture-
 * book page — a real environment with depth and lighting, not a sketch or an
 * empty backdrop — and grounds the scene in the page's actual story text so
 * the artwork visually matches what's happening, not just a loose paraphrase.
 */
export function buildStoryImagePrompt(params: {
  illustrationStyle: string;
  characterDescription: string;
  settingDescription: string;
  sceneDescription: string;
  storyPageText: string;
}): string {
  return [
    "Using the exact character shown in the reference image, illustrate this children's storybook page as a rich, cinematic full-page scene — the quality of a page from a premium published picture book, not a simple sketch, icon, or vector illustration.",
    `Character reference notes (for when the photo/reference is ambiguous): ${params.characterDescription}.`,
    `Consistent world: ${params.settingDescription}.`,
    `The story text this illustration must visually match: "${params.storyPageText}"`,
    `Scene to draw: ${params.sceneDescription}.`,
    "Build a fully realized environment with meaningful background detail, relevant props and secondary characters or creatures where the story calls for them, dynamic and directional lighting with real shadow, and a clear sense of depth across foreground, midground, and background. Never an empty, flat, generic, or placeholder background.",
    "The character must be clearly present and actively performing the described action, with an expressive pose and face that matches the story's mood.",
    buildConsistencyPrompt(params.illustrationStyle),
    "No text, letters, words, numbers, speech bubbles, or logos anywhere in the image. No watermarks or borders. Bright, warm, wholesome, and appropriate for young children. Single cohesive illustration that visually tells this exact moment of the story.",
  ].join(" ");
}

/** Prompt for the book cover, generated via image-to-image from the character reference. */
export function buildCoverImagePrompt(params: {
  illustrationStyle: string;
  characterDescription: string;
  settingDescription: string;
  themeId: string;
  title: string;
}): string {
  const theme = findTheme(params.themeId);
  return [
    `Using the exact character shown in the reference image, illustrate a storybook COVER for a book titled "${params.title}", set in ${theme.promptFragment}.`,
    `Character reference notes (for when the photo/reference is ambiguous): ${params.characterDescription}.`,
    `Consistent world: ${params.settingDescription}.`,
    "This is a striking, cinematic, inviting hero cover image with the character front and center, full of warmth and a sense of adventure — a fully realized environment with depth, lighting, and atmosphere, never a flat or empty backdrop.",
    buildConsistencyPrompt(params.illustrationStyle),
    "No text, letters, words, numbers, or logos anywhere in the image — the title will be added separately outside the illustration. No watermarks. Bright, warm, wholesome, and appropriate for young children.",
  ].join(" ");
}

/**
 * Prompt for regenerating a single page's text while keeping the rest of the
 * book unchanged. The model sees the full current story so the rewritten
 * page still fits naturally between its neighbors.
 */
export function buildRegeneratePagePrompt(params: {
  childName: string;
  age: AgeRangeId;
  theme: string;
  title: string;
  settingDescription: string;
  pages: StoryPageContent[];
  pageNumber: number;
}): string {
  const age = findAge(params.age);
  const theme = findTheme(params.theme);
  const context = params.pages.map((p) => `Page ${p.pageNumber}: ${p.text}`).join("\n");

  return `You are revising ONE page of an existing original children's book titled "${params.title}" starring ${params.childName}. Reader age range: ${age.label}. Theme: ${theme.label}. World/setting: ${params.settingDescription}

FULL CURRENT STORY (for context — every page except the one requested must stay exactly as it is; do not summarize or rewrite the others):
${context}

Rewrite ONLY page ${params.pageNumber}. It must still fit naturally between the pages immediately before and after it and must not contradict anything in the rest of the story. Produce a genuinely fresh alternative — different specific details, actions, and wording than the current page ${params.pageNumber} — while keeping a similar length (2-4 short sentences) and the same warm, age-appropriate tone as the rest of the book.

Respond with ONLY valid JSON and nothing else — no markdown code fences, no commentary:
{ "text": string, "illustrationPrompt": string }
"illustrationPrompt" is one vivid, detailed sentence describing exactly what ${params.childName} is doing on this page — action, pose, expression, immediate surroundings — for an illustrator. Do NOT describe ${params.childName}'s physical appearance in it (hair, face, clothing) — that is fixed separately by a character reference image.`;
}
