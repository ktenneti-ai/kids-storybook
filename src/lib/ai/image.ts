import OpenAI, { toFile } from "openai";
import { buildCoverImagePrompt, buildStoryImagePrompt } from "../prompt";

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

let client: OpenAI | null | undefined;

function getClient(): OpenAI | null {
  if (client !== undefined) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  client = apiKey ? new OpenAI({ apiKey }) : null;
  return client;
}

export function hasImageProvider(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

const IMAGE_DATA_URL_RE = /^data:image\/(png|jpe?g|webp);base64,(.+)$/;

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mimeType: "image/png" | "image/jpeg" | "image/webp" } {
  const match = IMAGE_DATA_URL_RE.exec(dataUrl);
  if (!match) throw new Error("Unsupported reference image format.");
  const rawType = match[1] === "jpg" ? "jpeg" : match[1];
  return { buffer: Buffer.from(match[2], "base64"), mimeType: `image/${rawType}` as "image/png" | "image/jpeg" | "image/webp" };
}

/** Generates a brand-new image from a text prompt only — used when there is no reference image yet. */
export async function generateImage(prompt: string, size: "1024x1024" | "1024x1536" = "1024x1024"): Promise<string> {
  const openai = getClient();
  if (!openai) throw new Error("Image provider is not configured.");

  const result = await openai.images.generate({
    model: IMAGE_MODEL,
    prompt,
    size,
    n: 1,
    output_format: "jpeg",
    output_compression: 82,
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image generation returned no data.");
  return `data:image/jpeg;base64,${b64}`;
}

/**
 * Image-to-image: edits/regenerates an image using a reference image for visual
 * continuity. This is how a child's identity (or an already-created cartoon
 * character) carries into every subsequent illustration — every call is
 * anchored to the SAME reference image rather than chaining from the previous
 * page, which keeps drift from compounding across a 10-page book.
 */
export async function editImageWithReference(
  referenceImageDataUrl: string,
  prompt: string,
  size: "1024x1024" | "1024x1536" = "1024x1024"
): Promise<string> {
  const openai = getClient();
  if (!openai) throw new Error("Image provider is not configured.");

  const { buffer, mimeType } = dataUrlToBuffer(referenceImageDataUrl);
  const file = await toFile(buffer, `reference.${mimeType.split("/")[1]}`, { type: mimeType });

  const result = await openai.images.edit({
    model: IMAGE_MODEL,
    image: file,
    prompt,
    size,
    n: 1,
    input_fidelity: "high",
    output_format: "jpeg",
    output_compression: 82,
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image generation returned no data.");
  return `data:image/jpeg;base64,${b64}`;
}

/** Illustrates the book cover via image-to-image from the character reference image. */
export async function generateCover(params: {
  characterReferenceImageUrl: string;
  title: string;
  themeId: string;
  illustrationStyle: string;
  settingDescription: string;
}): Promise<string> {
  const prompt = buildCoverImagePrompt({
    illustrationStyle: params.illustrationStyle,
    settingDescription: params.settingDescription,
    themeId: params.themeId,
    title: params.title,
  });
  return editImageWithReference(params.characterReferenceImageUrl, prompt, "1024x1536");
}

/** Illustrates one interior storybook page via image-to-image from the character reference image. */
export async function generateStoryImage(params: {
  characterReferenceImageUrl: string;
  sceneDescription: string;
  settingDescription: string;
  illustrationStyle: string;
}): Promise<string> {
  const prompt = buildStoryImagePrompt({
    illustrationStyle: params.illustrationStyle,
    settingDescription: params.settingDescription,
    sceneDescription: params.sceneDescription,
  });
  return editImageWithReference(params.characterReferenceImageUrl, prompt, "1024x1024");
}
