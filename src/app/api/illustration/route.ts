import { NextRequest, NextResponse } from "next/server";
import { generateIllustration, hasImageProvider } from "@/lib/ai/image";
import { generateMockIllustration } from "@/lib/mock/mockImage";
import { buildIllustrationPrompt } from "@/lib/prompt";
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
  const { illustrationStyle, characterDescription, settingDescription, sceneDescription, themeId, isCover, forceMock, seed } =
    validation.value;

  if (!hasImageProvider() || forceMock) {
    const imageUrl = generateMockIllustration({ themeId, sceneDescription, isCover, seed });
    return NextResponse.json({ imageUrl, mode: "mock" });
  }

  try {
    const prompt = buildIllustrationPrompt({
      illustrationStyle,
      characterDescription,
      settingDescription,
      sceneDescription,
      isCover,
    });
    const imageUrl = await generateIllustration(prompt, isCover);
    return NextResponse.json({ imageUrl, mode: "ai" });
  } catch (err) {
    console.error("[api/illustration] generation failed:", err);
    return NextResponse.json(
      { error: "We couldn't create this illustration right now. You can try again or use a placeholder instead.", canFallbackToMock: true },
      { status: 502 }
    );
  }
}
