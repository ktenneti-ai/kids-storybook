import { NextRequest, NextResponse } from "next/server";
import { generateCover, generateStoryImage, hasImageProvider } from "@/lib/ai/image";
import { generateDemoStoryIllustration } from "@/lib/mock/mockImage";
import { validateIllustrationRequest } from "@/lib/validation";
import type { ApiErrorResponse, IllustrationResponse } from "@/lib/types";

export async function POST(req: NextRequest): Promise<NextResponse<IllustrationResponse | ApiErrorResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateIllustrationRequest(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const {
    illustrationStyle,
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
  } = validation.value;
  const bodyRecord = body as Record<string, unknown>;
  const childName = typeof bodyRecord.childName === "string" ? bodyRecord.childName : "";

  if (!hasImageProvider() || forceMock) {
    const imageUrl = generateDemoStoryIllustration({
      themeId,
      childName,
      sceneDescription: isCover ? title : sceneDescription,
      isCover,
      seed,
    });
    return NextResponse.json({ imageUrl, mode: "mock" });
  }

  try {
    const imageUrl = isCover
      ? await generateCover({ characterReferenceImageUrl, characterDescription, title, themeId, illustrationStyle, settingDescription })
      : await generateStoryImage({
          characterReferenceImageUrl,
          characterDescription,
          sceneDescription,
          storyPageText,
          settingDescription,
          illustrationStyle,
        });
    return NextResponse.json({ imageUrl, mode: "ai" });
  } catch (err) {
    console.error("[api/illustration] generation failed:", err);
    return NextResponse.json(
      { error: "We couldn't create this illustration right now. You can try again or use a placeholder instead.", canFallbackToMock: true },
      { status: 502 }
    );
  }
}
