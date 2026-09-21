import { findTheme } from "../constants";
import { pickCharacterLook, renderStandingFigure } from "./figure";
import { hashString, mulberry32 } from "./random";

type PropKind = "star" | "bubble" | "leaf" | "frond" | "sparkle" | "streak" | "snow";

interface SceneTheme {
  skyTop: string;
  skyBottom: string;
  ground: string;
  celestial: string;
  celestialGlow: string;
  accent: string;
  propKind: PropKind;
}

const SCENE_THEME: Record<string, SceneTheme> = {
  "space-adventure": { skyTop: "#1e1b4b", skyBottom: "#4c1d95", ground: "#c4b5fd", celestial: "#fef08a", celestialGlow: "#fde68a", accent: "#f5d0fe", propKind: "star" },
  "under-the-sea": { skyTop: "#0e7490", skyBottom: "#22d3ee", ground: "#0891b2", celestial: "#fef9c3", celestialGlow: "#fef9c3", accent: "#a5f3fc", propKind: "bubble" },
  "enchanted-forest": { skyTop: "#14532d", skyBottom: "#65a30d", ground: "#365314", celestial: "#fef08a", celestialGlow: "#fef9c3", accent: "#bef264", propKind: "frond" },
  "dinosaur-discovery": { skyTop: "#78350f", skyBottom: "#f59e0b", ground: "#4d7c0f", celestial: "#fde68a", celestialGlow: "#fef3c7", accent: "#fcd34d", propKind: "frond" },
  "fairy-tale-kingdom": { skyTop: "#581c87", skyBottom: "#f472b6", ground: "#fbcfe8", celestial: "#fef9c3", celestialGlow: "#fce7f3", accent: "#f0abfc", propKind: "sparkle" },
  "superhero-adventure": { skyTop: "#1d4ed8", skyBottom: "#60a5fa", ground: "#fbbf24", celestial: "#fef08a", celestialGlow: "#fef9c3", accent: "#fca5a5", propKind: "streak" },
  "jungle-safari": { skyTop: "#14532d", skyBottom: "#84cc16", ground: "#365314", celestial: "#fde68a", celestialGlow: "#fef9c3", accent: "#facc15", propKind: "leaf" },
  "winter-wonderland": { skyTop: "#1e3a8a", skyBottom: "#bfdbfe", ground: "#eff6ff", celestial: "#fef9c3", celestialGlow: "#ffffff", accent: "#93c5fd", propKind: "snow" },
};

function renderAccentShape(kind: PropKind, cx: number, cy: number, size: number, color: string): string {
  switch (kind) {
    case "star":
      return `<path d="M ${cx} ${cy - size} L ${cx + size * 0.28} ${cy - size * 0.28} L ${cx + size} ${cy} L ${cx + size * 0.28} ${cy + size * 0.28} L ${cx} ${cy + size} L ${cx - size * 0.28} ${cy + size * 0.28} L ${cx - size} ${cy} L ${cx - size * 0.28} ${cy - size * 0.28} Z" fill="${color}" opacity="0.85" />`;
    case "bubble":
      return `<circle cx="${cx}" cy="${cy}" r="${size}" fill="none" stroke="${color}" stroke-width="${Math.max(1.5, size * 0.15)}" opacity="0.8" />`;
    case "sparkle":
      return `<g opacity="0.85"><path d="M ${cx} ${cy - size} L ${cx + size} ${cy} L ${cx} ${cy + size} L ${cx - size} ${cy} Z" fill="${color}" /><line x1="${cx - size * 1.4}" y1="${cy}" x2="${cx + size * 1.4}" y2="${cy}" stroke="${color}" stroke-width="1.5" /><line x1="${cx}" y1="${cy - size * 1.4}" x2="${cx}" y2="${cy + size * 1.4}" stroke="${color}" stroke-width="1.5" /></g>`;
    case "snow":
      return `<g stroke="${color}" stroke-width="${Math.max(1.5, size * 0.12)}" opacity="0.85" stroke-linecap="round"><line x1="${cx - size}" y1="${cy}" x2="${cx + size}" y2="${cy}" /><line x1="${cx}" y1="${cy - size}" x2="${cx}" y2="${cy + size}" /><line x1="${cx - size * 0.7}" y1="${cy - size * 0.7}" x2="${cx + size * 0.7}" y2="${cy + size * 0.7}" /><line x1="${cx - size * 0.7}" y1="${cy + size * 0.7}" x2="${cx + size * 0.7}" y2="${cy - size * 0.7}" /></g>`;
    case "streak":
      return `<line x1="${cx - size}" y1="${cy - size * 0.4}" x2="${cx + size}" y2="${cy + size * 0.4}" stroke="${color}" stroke-width="${Math.max(2, size * 0.25)}" stroke-linecap="round" opacity="0.7" />`;
    case "frond":
      return `<g fill="${color}" opacity="0.75"><ellipse cx="${cx}" cy="${cy}" rx="${size * 0.35}" ry="${size}" transform="rotate(-20 ${cx} ${cy})" /><ellipse cx="${cx}" cy="${cy}" rx="${size * 0.35}" ry="${size}" /><ellipse cx="${cx}" cy="${cy}" rx="${size * 0.35}" ry="${size}" transform="rotate(20 ${cx} ${cy})" /></g>`;
    case "leaf":
    default:
      return `<ellipse cx="${cx}" cy="${cy}" rx="${size}" ry="${size * 0.55}" fill="${color}" opacity="0.75" transform="rotate(${(cx * 37) % 360} ${cx} ${cy})" />`;
  }
}

function renderScene(params: { themeId: string; childName: string; layoutSeedKey: string; isCover: boolean }): string {
  const theme = findTheme(params.themeId);
  const sceneTheme = SCENE_THEME[theme.id] ?? SCENE_THEME["space-adventure"];
  const width = 800;
  const height = params.isCover ? 1000 : 800;

  // The character's look (skin tone, hair, outfit) is seeded from name+theme only,
  // so it stays IDENTICAL across every demo illustration in this story.
  const look = pickCharacterLook(`${params.childName}|${params.themeId}`);
  // Layout (prop placement, pose) can vary per page/regenerate for visual variety.
  const layoutRng = mulberry32(hashString(params.layoutSeedKey));
  const poseSeed = Math.floor(layoutRng() * 1000);

  const groundTopY = height * 0.74;
  const groundY = height * 0.83;

  const celestialCx = width * (0.16 + layoutRng() * 0.12);
  const celestialCy = height * (0.12 + layoutRng() * 0.06);
  const celestialR = 42 + layoutRng() * 12;

  const propCount = 9 + Math.floor(layoutRng() * 6);
  const props: string[] = [];
  for (let i = 0; i < propCount; i++) {
    const px = layoutRng() * width;
    const py = layoutRng() * groundTopY * 0.92;
    const size = 8 + layoutRng() * 15;
    props.push(renderAccentShape(sceneTheme.propKind, px, py, size, sceneTheme.accent));
  }

  const figureCx = width * (0.4 + layoutRng() * 0.2);
  const figure = renderStandingFigure({ cx: figureCx, groundY, scale: params.isCover ? 1.35 : 1.1, look, poseSeed });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${sceneTheme.skyTop}" />
      <stop offset="100%" stop-color="${sceneTheme.skyBottom}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#sky)" />
  <circle cx="${celestialCx}" cy="${celestialCy}" r="${celestialR * 1.9}" fill="${sceneTheme.celestialGlow}" opacity="0.22" />
  <circle cx="${celestialCx}" cy="${celestialCy}" r="${celestialR}" fill="${sceneTheme.celestial}" />
  ${props.join("\n  ")}
  <path d="M 0 ${groundTopY} Q ${width / 2} ${groundTopY - 46} ${width} ${groundTopY} L ${width} ${height} L 0 ${height} Z" fill="${sceneTheme.ground}" />
  ${figure}
  <g>
    <rect x="16" y="${height - 44}" width="150" height="28" rx="14" fill="#111827" opacity="0.35" />
    <text x="30" y="${height - 24}" font-family="Arial, sans-serif" font-size="14" fill="#ffffff">✨ Sample style</text>
  </g>
</svg>`;
}

/**
 * Offline "AI-generated-style" demo illustration: a full illustrated scene
 * (sky, ground, theme props, and the story's character actually posed in it)
 * rather than a flat color card — so the app visually demonstrates the
 * intended final experience even with no image API configured. The
 * character's look is stable across every page/cover of one story; only the
 * layout (pose, prop placement) varies per page or on regenerate.
 */
export function generateDemoStoryIllustration(params: {
  themeId: string;
  childName: string;
  sceneDescription: string;
  isCover: boolean;
  seed: number;
}): string {
  const svg = renderScene({
    themeId: params.themeId,
    childName: params.childName,
    layoutSeedKey: `${params.themeId}|${params.sceneDescription}|${params.seed}`,
    isCover: params.isCover,
  });
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
