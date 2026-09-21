import OpenAI from "openai";

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

export async function generateIllustration(prompt: string, isCover: boolean): Promise<string> {
  const openai = getClient();
  if (!openai) throw new Error("Image provider is not configured.");

  const result = await openai.images.generate({
    model: IMAGE_MODEL,
    prompt,
    size: isCover ? "1024x1536" : "1024x1024",
    n: 1,
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image generation returned no data.");
  return `data:image/png;base64,${b64}`;
}
