import { findAge, findTheme } from "../constants";
import type { AgeRangeId } from "../types";
import { pickCharacterLook, renderPortraitFigure } from "./figure";

export function generateMockCharacterDescription(input: { childName: string; age: AgeRangeId; hasPhoto: boolean }): string {
  const age = findAge(input.age);
  const base = `${input.childName}, a cheerful ${age.label.replace(
    " years",
    "-year-old"
  )} child with a bright smile and warm, expressive eyes, drawn in a friendly, inclusive style`;
  return input.hasPhoto
    ? `${base} (demo mode shows a generic look — add an API key to analyze the uploaded photo)`
    : `${base} with simple, everyday play clothes`;
}

/**
 * Renders an offline "cartoon character reference" portrait so demo mode still
 * demonstrates the photo → character → consistent-illustrations pipeline. The
 * look is seeded from (childName, theme) so it stays identical across the
 * cover and every page of one story, and changes between different stories.
 */
export function generateMockCharacterPortrait(params: { childName: string; themeId: string }): string {
  const theme = findTheme(params.themeId);
  const look = pickCharacterLook(`${params.childName}|${params.themeId}`);
  const width = 800;
  const height = 800;
  const [c1, c2] = theme.palette;

  const figure = renderPortraitFigure({ cx: width / 2, cy: height / 2 - 40, scale: 1.05, look });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="${c2}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${c1}" stop-opacity="0.15" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#fdfaf3" />
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  ${figure}
  <g>
    <rect x="${width - 214}" y="18" width="196" height="30" rx="15" fill="#111827" opacity="0.32" />
    <text x="${width - 200}" y="38" font-family="Arial, sans-serif" font-size="14" fill="#ffffff">✨ Sample character style</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
