import { buildCharacterReferencePrompt, buildDefaultCharacterDescription } from "../prompt";
import type { AgeRangeId } from "../types";
import { editImageWithReference, generateImage, hasImageProvider } from "./image";
import { analyzeCharacterPhoto, hasTextProvider } from "./text";

export interface CreateCharacterReferenceInput {
  photoDataUrl?: string | null;
  childName: string;
  age: AgeRangeId;
  illustrationStyle: string;
}

export interface CreateCharacterReferenceResult {
  imageUrl: string;
  description: string;
}

/**
 * Turns an uploaded photo (or, with no photo, a text description) into a
 * single reusable cartoon character reference image. Every later page and
 * cover illustration is generated via image-to-image from THIS image, which
 * is what carries the child's identity through the whole book.
 */
export async function createCharacterReference(input: CreateCharacterReferenceInput): Promise<CreateCharacterReferenceResult> {
  if (!hasImageProvider()) throw new Error("Image provider is not configured.");

  const hasPhoto = Boolean(input.photoDataUrl);
  const description =
    hasPhoto && hasTextProvider()
      ? await analyzeCharacterPhoto(input.photoDataUrl!, input.childName, input.age)
      : buildDefaultCharacterDescription({ childName: input.childName, age: input.age });

  const prompt = buildCharacterReferencePrompt({
    childName: input.childName,
    age: input.age,
    illustrationStyle: input.illustrationStyle,
    description,
    hasPhoto,
  });

  const imageUrl = hasPhoto
    ? await editImageWithReference(input.photoDataUrl!, prompt, "1024x1024")
    : await generateImage(prompt, "1024x1024");

  return { imageUrl, description };
}
