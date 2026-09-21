import { NextRequest, NextResponse } from "next/server";
import { generateCover, generateStoryImage, hasImageProvider } from "@/lib/ai/image";
import { generateDemoStoryIllustration } from "@/lib/mock/mockImage";
import { buildCoverImagePrompt, buildStoryImagePrompt } from "@/lib/prompt";
import { validateIllustrationRequest } from "@/lib/validation";
import type { ApiErrorResponse, CharacterGender, IllustrationResponse } from "@/lib/types";

// TODO(dev-diagnostics): remove once real-vs-demo illustration generation has been verified end to end.
function logIllustrationDiagnostics(fields: {
  theme: string;
  illustrationStyle: string;
  pageNumber: number | "cover";
  sceneDescription: string;
  finalImagePrompt: string;
  imageProvider: "mock" | "openai:gpt-image-1";
  imageUrl: string;
}) {
  console.log("[illustration-diagnostics]", {
    theme: fields.theme,
    illustrationStyle: fields.illustrationStyle,
    pageNumber: fields.pageNumber,
    sceneDescription: fields.sceneDescription,
    finalImagePrompt: fields.finalImagePrompt,
    imageProvider: fields.imageProvider,
    imageUrl: `${fields.imageUrl.slice(0, 60)}... (${fields.imageUrl.length} chars)`,
  });
}

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
  const gender: CharacterGender = bodyRecord.gender === "girl" ? "girl" : "boy";
  const pageNumber: number | "cover" = isCover ? "cover" : typeof bodyRecord.pageNumber === "number" ? bodyRecord.pageNumber : -1;

  if (!hasImageProvider() || forceMock) {
    const imageUrl = generateDemoStoryIllustration({
      themeId,
      childName,
      gender,
      sceneDescription: isCover ? title : sceneDescription,
      isCover,
      seed,
    });
    logIllustrationDiagnostics({
      theme: themeId,
      illustrationStyle,
      pageNumber,
      sceneDescription: isCover ? title : sceneDescription,
      finalImagePrompt: `(demo mode — no image model called; reason: ${!hasImageProvider() ? "OPENAI_API_KEY not configured" : "forceMock requested"})`,
      imageProvider: "mock",
      imageUrl,
    });
    return NextResponse.json({ imageUrl, mode: "mock" });
  }

  const finalImagePrompt = isCover
    ? buildCoverImagePrompt({ illustrationStyle, characterDescription, title, themeId, settingDescription })
    : buildStoryImagePrompt({ illustrationStyle, characterDescription, settingDescription, sceneDescription, storyPageText });

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
    logIllustrationDiagnostics({
      theme: themeId,
      illustrationStyle,
      pageNumber,
      sceneDescription: isCover ? title : sceneDescription,
      finalImagePrompt,
      imageProvider: "openai:gpt-image-1",
      imageUrl,
    });
    return NextResponse.json({ imageUrl, mode: "ai" });
  } catch (err) {
    console.error("[api/illustration] generation failed:", { theme: themeId, illustrationStyle, pageNumber, finalImagePrompt, err });
    return NextResponse.json(
      { error: "We couldn't create this illustration right now. You can try again or use a placeholder instead.", canFallbackToMock: true },
      { status: 502 }
    );
  }
}
