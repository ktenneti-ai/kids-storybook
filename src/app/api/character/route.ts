import { NextRequest, NextResponse } from "next/server";
import { createCharacterReference } from "@/lib/ai/character";
import { hasImageProvider } from "@/lib/ai/image";
import { generateMockCharacterDescription, generateMockCharacterPortrait } from "@/lib/mock/mockCharacter";
import { validateCharacterInput } from "@/lib/validation";
import type { ApiErrorResponse, CharacterReferenceResponse } from "@/lib/types";

export async function POST(req: NextRequest): Promise<NextResponse<CharacterReferenceResponse | ApiErrorResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateCharacterInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { childName, gender, age, illustrationStyle, forceMock } = validation.value;
  const bodyRecord = body as Record<string, unknown>;
  const themeId = typeof bodyRecord.themeId === "string" ? bodyRecord.themeId : "space-adventure";

  if (!hasImageProvider() || forceMock) {
    const description = generateMockCharacterDescription({ childName, gender, age });
    const imageUrl = generateMockCharacterPortrait({ childName, gender, themeId });
    // TODO(dev-diagnostics): remove once real-vs-demo character generation has been verified end to end.
    console.log("[character-diagnostics]", {
      theme: themeId,
      illustrationStyle,
      imageProvider: "mock",
      reason: !hasImageProvider() ? "OPENAI_API_KEY not configured" : "forceMock requested",
      imageUrl: `${imageUrl.slice(0, 60)}... (${imageUrl.length} chars)`,
    });
    return NextResponse.json({ imageUrl, description, mode: "mock" });
  }

  try {
    const { imageUrl, description } = await createCharacterReference({ childName, gender, age, illustrationStyle });
    console.log("[character-diagnostics]", {
      theme: themeId,
      illustrationStyle,
      imageProvider: "openai:gpt-image-1",
      imageUrl: `${imageUrl.slice(0, 60)}... (${imageUrl.length} chars)`,
    });
    return NextResponse.json({ imageUrl, description, mode: "ai" });
  } catch (err) {
    console.error("[api/character] generation failed:", { theme: themeId, illustrationStyle, err });
    return NextResponse.json(
      { error: "We couldn't create your character right now. You can try again or continue in demo mode.", canFallbackToMock: true },
      { status: 502 }
    );
  }
}
