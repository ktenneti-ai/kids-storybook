import { buildCharacterReferencePrompt, buildDefaultCharacterDescription } from "../prompt";
import type { AgeRangeId, CharacterGender } from "../types";
import { generateImage, hasImageProvider } from "./image";

export interface CreateCharacterReferenceInput {
  childName: string;
  gender: CharacterGender;
  age: AgeRangeId;
  illustrationStyle: string;
}

export interface CreateCharacterReferenceResult {
  imageUrl: string;
  description: string;
}

/**
 * Generates a single reusable cartoon character reference image from the
 * child's name, gender, and age. Every later page and cover illustration is
 * generated via image-to-image from THIS image, which is what carries the
 * character's identity through the whole book.
 */
export async function createCharacterReference(input: CreateCharacterReferenceInput): Promise<CreateCharacterReferenceResult> {
  if (!hasImageProvider()) throw new Error("Image provider is not configured.");

  const description = buildDefaultCharacterDescription({ childName: input.childName, gender: input.gender, age: input.age });

  const prompt = buildCharacterReferencePrompt({
    childName: input.childName,
    gender: input.gender,
    age: input.age,
    illustrationStyle: input.illustrationStyle,
    description,
  });

  const imageUrl = await generateImage(prompt, "1024x1024");

  return { imageUrl, description };
}
