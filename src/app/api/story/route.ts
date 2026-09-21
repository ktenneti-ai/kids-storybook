import { NextRequest, NextResponse } from "next/server";
import { analyzeCharacterPhoto, generateStoryText, hasTextProvider } from "@/lib/ai/text";
import { generateMockCharacterDescription, generateMockStoryText } from "@/lib/mock/mockStory";
import { buildDefaultCharacterDescription } from "@/lib/prompt";
import { validateStoryInput } from "@/lib/validation";
import type { ApiErrorResponse, StoryTextResponse } from "@/lib/types";

export async function POST(req: NextRequest): Promise<NextResponse<StoryTextResponse | ApiErrorResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateStoryInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const input = validation.value;
  const bodyRecord = body as Record<string, unknown>;
  const forceMock = bodyRecord.forceMock === true;
  const variationHint = typeof bodyRecord.variationHint === "string" ? bodyRecord.variationHint : undefined;

  if (!hasTextProvider() || forceMock) {
    const characterDescription = generateMockCharacterDescription(input);
    const story = generateMockStoryText(input, characterDescription, Date.now());
    return NextResponse.json(story);
  }

  try {
    const characterDescription = input.photoDataUrl
      ? await analyzeCharacterPhoto(input.photoDataUrl, input.childName, input.age)
      : buildDefaultCharacterDescription(input);

    const { title, settingDescription, pages } = await generateStoryText(input, characterDescription, variationHint);

    return NextResponse.json({
      title,
      settingDescription,
      characterDescription,
      pages,
      mode: "ai",
    });
  } catch (err) {
    console.error("[api/story] generation failed:", err);
    return NextResponse.json(
      { error: "We couldn't generate your story right now. You can try again or continue in demo mode.", canFallbackToMock: true },
      { status: 502 }
    );
  }
}
