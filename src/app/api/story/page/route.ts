import { NextRequest, NextResponse } from "next/server";
import { hasTextProvider, regeneratePageText } from "@/lib/ai/text";
import { regenerateMockPageText } from "@/lib/mock/mockStory";
import { validateRegeneratePageInput } from "@/lib/validation";
import type { ApiErrorResponse, RegeneratePageResponse } from "@/lib/types";

export async function POST(req: NextRequest): Promise<NextResponse<RegeneratePageResponse | ApiErrorResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateRegeneratePageInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { childName, age, theme, length, title, settingDescription, pages, pageNumber, forceMock } = validation.value;

  if (!hasTextProvider() || forceMock) {
    const page = regenerateMockPageText({ childName, age, theme, length }, pageNumber, Date.now());
    return NextResponse.json({ page, mode: "mock" });
  }

  try {
    const page = await regeneratePageText({ childName, age, theme, title, settingDescription, pages, pageNumber });
    return NextResponse.json({ page, mode: "ai" });
  } catch (err) {
    console.error("[api/story/page] generation failed:", err);
    return NextResponse.json(
      { error: "We couldn't rewrite this page right now. You can try again or continue in demo mode.", canFallbackToMock: true },
      { status: 502 }
    );
  }
}
