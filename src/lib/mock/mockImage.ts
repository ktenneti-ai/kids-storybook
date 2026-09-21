import { findTheme } from "../constants";
import { hashString, mulberry32 } from "./random";

/**
 * Produces a deterministic, offline SVG "illustration" so the whole app is
 * testable without any API credentials. Not meant to resemble real AI art —
 * just a pleasant, theme-colored placeholder with a clear "Demo" label.
 */
export function generateMockIllustration(params: {
  themeId: string;
  sceneDescription: string;
  isCover: boolean;
  seed: number;
}): string {
  const theme = findTheme(params.themeId);
  const rng = mulberry32(hashString(`${params.themeId}|${params.sceneDescription}|${params.seed}`));
  const [c1, c2] = theme.palette;
  const width = 800;
  const height = params.isCover ? 1000 : 600;

  const shapeCount = 6 + Math.floor(rng() * 5);
  const shapes: string[] = [];
  for (let i = 0; i < shapeCount; i++) {
    const cx = Math.round(rng() * width);
    const cy = Math.round(rng() * height);
    const r = Math.round(14 + rng() * 70);
    const opacity = (0.08 + rng() * 0.16).toFixed(2);
    shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="${opacity}" />`);
  }

  const gradId = `g${Math.floor(rng() * 1_000_000)}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${gradId})" />
  ${shapes.join("\n  ")}
  <text x="50%" y="46%" font-size="${Math.round(width * 0.2)}" text-anchor="middle" dominant-baseline="central">${theme.emoji}</text>
  <g>
    <rect x="16" y="${height - 44}" width="168" height="28" rx="14" fill="#111827" opacity="0.35" />
    <text x="30" y="${height - 24}" font-family="Arial, sans-serif" font-size="14" fill="#ffffff">Demo illustration</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
