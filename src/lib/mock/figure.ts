import type { CharacterGender } from "../types";
import { hashString, mulberry32, pick } from "./random";

export interface CharacterLook {
  skinTone: string;
  hairColor: string;
  outfitColor: string;
  outfitAccent: string;
}

const SKIN_TONES = ["#fbdcc0", "#f0c39a", "#d9a06b", "#a9713f", "#6b4326"] as const;
const HAIR_COLORS = ["#2b1b12", "#5a3a22", "#8a5a2b", "#c98a3b", "#1c1c1c", "#a13d2b"] as const;
const OUTFIT_PAIRS: readonly [string, string][] = [
  ["#f97316", "#fde68a"],
  ["#0ea5e9", "#e0f2fe"],
  ["#db2777", "#fbcfe8"],
  ["#16a34a", "#d9f99d"],
  ["#7c3aed", "#e9d5ff"],
  ["#facc15", "#fef9c3"],
];

/** Derives a stable "look" (skin tone, hair color, outfit) from a seed key so the same character stays visually consistent across every demo illustration in one story. */
export function pickCharacterLook(seedKey: string): CharacterLook {
  const rng = mulberry32(hashString(seedKey));
  const skinTone = pick(rng, SKIN_TONES);
  const hairColor = pick(rng, HAIR_COLORS);
  const [outfitColor, outfitAccent] = pick(rng, OUTFIT_PAIRS);
  return { skinTone, hairColor, outfitColor, outfitAccent };
}

/** A simple, friendly full-body cartoon figure standing at (cx, groundY), used inside demo scene illustrations. */
export function renderStandingFigure(params: { cx: number; groundY: number; scale: number; look: CharacterLook; gender: CharacterGender; poseSeed: number }): string {
  const { cx, groundY, scale, look, gender, poseSeed } = params;
  const wave = poseSeed % 2 === 0;
  const strideL = poseSeed % 3 === 0 ? -1 : 1;

  const headR = 34 * scale;
  const neckY = groundY - 150 * scale;
  const headCy = neckY - headR * 0.85;
  const bodyTop = neckY;
  const bodyBottom = groundY - 55 * scale;
  const bodyW = 58 * scale;
  const hipY = bodyBottom;
  const footY = groundY;

  const longHair =
    gender === "girl"
      ? `<path d="M ${cx - headR * 0.95} ${headCy - headR * 0.1} Q ${cx - headR * 1.15} ${headCy + headR * 1.3} ${cx - headR * 0.55} ${headCy + headR * 1.9} L ${cx - headR * 0.2} ${headCy + headR * 1.7} Q ${cx - headR * 0.55} ${headCy + headR * 0.6} ${cx - headR * 0.7} ${headCy} Z" fill="${look.hairColor}" /><path d="M ${cx + headR * 0.95} ${headCy - headR * 0.1} Q ${cx + headR * 1.15} ${headCy + headR * 1.3} ${cx + headR * 0.55} ${headCy + headR * 1.9} L ${cx + headR * 0.2} ${headCy + headR * 1.7} Q ${cx + headR * 0.55} ${headCy + headR * 0.6} ${cx + headR * 0.7} ${headCy} Z" fill="${look.hairColor}" />`
      : "";

  return `
  <g>
    <!-- legs -->
    <line x1="${cx - 14 * scale}" y1="${hipY}" x2="${cx - 14 * scale - 10 * scale * strideL}" y2="${footY}" stroke="${look.outfitAccent}" stroke-width="${16 * scale}" stroke-linecap="round" />
    <line x1="${cx + 14 * scale}" y1="${hipY}" x2="${cx + 14 * scale + 10 * scale * strideL}" y2="${footY}" stroke="${look.outfitAccent}" stroke-width="${16 * scale}" stroke-linecap="round" />
    <ellipse cx="${cx - 14 * scale - 10 * scale * strideL}" cy="${footY}" rx="${13 * scale}" ry="${7 * scale}" fill="#3f3f46" />
    <ellipse cx="${cx + 14 * scale + 10 * scale * strideL}" cy="${footY}" rx="${13 * scale}" ry="${7 * scale}" fill="#3f3f46" />
    <!-- body -->
    <rect x="${cx - bodyW / 2}" y="${bodyTop}" width="${bodyW}" height="${bodyBottom - bodyTop}" rx="${bodyW * 0.4}" fill="${look.outfitColor}" />
    <!-- arms -->
    <line x1="${cx - bodyW / 2}" y1="${bodyTop + 18 * scale}" x2="${cx - bodyW / 2 - 34 * scale}" y2="${wave ? bodyTop - 20 * scale : bodyTop + 46 * scale}" stroke="${look.outfitColor}" stroke-width="${14 * scale}" stroke-linecap="round" />
    <line x1="${cx + bodyW / 2}" y1="${bodyTop + 18 * scale}" x2="${cx + bodyW / 2 + 34 * scale}" y2="${wave ? bodyTop + 46 * scale : bodyTop - 20 * scale}" stroke="${look.outfitColor}" stroke-width="${14 * scale}" stroke-linecap="round" />
    <!-- long hair (behind head), girl only -->
    ${longHair}
    <!-- head -->
    <circle cx="${cx}" cy="${headCy}" r="${headR}" fill="${look.skinTone}" />
    <!-- hair -->
    <path d="M ${cx - headR} ${headCy - headR * 0.2} Q ${cx} ${headCy - headR * 1.6} ${cx + headR} ${headCy - headR * 0.2} Q ${cx + headR * 0.7} ${headCy - headR * 0.7} ${cx} ${headCy - headR * 0.65} Q ${cx - headR * 0.7} ${headCy - headR * 0.7} ${cx - headR} ${headCy - headR * 0.2} Z" fill="${look.hairColor}" />
    <!-- face -->
    <circle cx="${cx - headR * 0.35}" cy="${headCy + headR * 0.05}" r="${headR * 0.09}" fill="#292524" />
    <circle cx="${cx + headR * 0.35}" cy="${headCy + headR * 0.05}" r="${headR * 0.09}" fill="#292524" />
    <path d="M ${cx - headR * 0.32} ${headCy + headR * 0.4} Q ${cx} ${headCy + headR * 0.65} ${cx + headR * 0.32} ${headCy + headR * 0.4}" stroke="#292524" stroke-width="${3 * scale}" fill="none" stroke-linecap="round" />
  </g>`;
}

/** A close-up head-and-shoulders bust of the same character, used for the demo character reference portrait. */
export function renderPortraitFigure(params: { cx: number; cy: number; scale: number; look: CharacterLook; gender: CharacterGender }): string {
  const { cx, cy, scale, look, gender } = params;
  const headR = 150 * scale;
  const shoulderY = cy + headR * 1.15;

  const longHair =
    gender === "girl"
      ? `<path d="M ${cx - headR * 0.95} ${cy - headR * 0.1} Q ${cx - headR * 1.2} ${cy + headR * 1.1} ${cx - headR * 0.5} ${cy + headR * 1.6} L ${cx - headR * 0.15} ${cy + headR * 1.4} Q ${cx - headR * 0.55} ${cy + headR * 0.5} ${cx - headR * 0.7} ${cy} Z" fill="${look.hairColor}" /><path d="M ${cx + headR * 0.95} ${cy - headR * 0.1} Q ${cx + headR * 1.2} ${cy + headR * 1.1} ${cx + headR * 0.5} ${cy + headR * 1.6} L ${cx + headR * 0.15} ${cy + headR * 1.4} Q ${cx + headR * 0.55} ${cy + headR * 0.5} ${cx + headR * 0.7} ${cy} Z" fill="${look.hairColor}" />`
      : "";

  return `
  <g>
    <ellipse cx="${cx}" cy="${shoulderY + 90 * scale}" rx="${220 * scale}" ry="${140 * scale}" fill="${look.outfitColor}" />
    <rect x="${cx - 90 * scale}" y="${shoulderY - 10 * scale}" width="${180 * scale}" height="${40 * scale}" rx="${18 * scale}" fill="${look.outfitAccent}" />
    ${longHair}
    <circle cx="${cx}" cy="${cy}" r="${headR}" fill="${look.skinTone}" />
    <path d="M ${cx - headR} ${cy - headR * 0.15} Q ${cx} ${cy - headR * 1.7} ${cx + headR} ${cy - headR * 0.15} Q ${cx + headR * 0.65} ${cy - headR * 0.75} ${cx} ${cy - headR * 0.7} Q ${cx - headR * 0.65} ${cy - headR * 0.75} ${cx - headR} ${cy - headR * 0.15} Z" fill="${look.hairColor}" />
    <circle cx="${cx - headR * 0.35}" cy="${cy + headR * 0.05}" r="${headR * 0.09}" fill="#292524" />
    <circle cx="${cx + headR * 0.35}" cy="${cy + headR * 0.05}" r="${headR * 0.09}" fill="#292524" />
    <circle cx="${cx - headR * 0.35}" cy="${cy - headR * 0.02}" r="${headR * 0.03}" fill="#ffffff" opacity="0.85" />
    <circle cx="${cx + headR * 0.35}" cy="${cy - headR * 0.02}" r="${headR * 0.03}" fill="#ffffff" opacity="0.85" />
    <path d="M ${cx - headR * 0.34} ${cy + headR * 0.42} Q ${cx} ${cy + headR * 0.68} ${cx + headR * 0.34} ${cy + headR * 0.42}" stroke="#292524" stroke-width="${5 * scale}" fill="none" stroke-linecap="round" />
    <ellipse cx="${cx - headR * 0.55}" cy="${cy + headR * 0.28}" rx="${headR * 0.14}" ry="${headR * 0.08}" fill="#fb7185" opacity="0.35" />
    <ellipse cx="${cx + headR * 0.55}" cy="${cy + headR * 0.28}" rx="${headR * 0.14}" ry="${headR * 0.08}" fill="#fb7185" opacity="0.35" />
  </g>`;
}
