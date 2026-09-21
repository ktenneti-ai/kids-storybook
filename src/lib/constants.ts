import type { AgeOption, CharacterGender, StyleOption, ThemeOption } from "./types";

export interface GenderOption {
  id: CharacterGender;
  label: string;
  emoji: string;
}

export const GENDER_OPTIONS: GenderOption[] = [
  { id: "boy", label: "Boy", emoji: "👦" },
  { id: "girl", label: "Girl", emoji: "👧" },
];

export const THEMES: ThemeOption[] = [
  {
    id: "space-adventure",
    label: "Space Adventure",
    emoji: "🚀",
    description: "Zooming past planets and twinkling stars in a friendly rocket ship.",
    promptFragment:
      "a whimsical outer-space adventure with candy-colored planets, friendly stars, and a cozy little rocket ship",
    titleNoun: "Little Star",
    palette: ["#4c1d95", "#0ea5e9"],
  },
  {
    id: "under-the-sea",
    label: "Under the Sea",
    emoji: "🐠",
    description: "Diving into a sparkling coral reef full of gentle sea friends.",
    promptFragment:
      "a magical underwater kingdom with glowing coral reefs, bubbles, and playful sea creatures",
    titleNoun: "Coral Kingdom",
    palette: ["#0891b2", "#22d3ee"],
  },
  {
    id: "enchanted-forest",
    label: "Enchanted Forest",
    emoji: "🌳",
    description: "Wandering a magical woodland with fireflies and talking animals.",
    promptFragment:
      "an enchanted forest full of glowing fireflies, giant friendly trees, and curious woodland animals",
    titleNoun: "Whispering Woods",
    palette: ["#166534", "#84cc16"],
  },
  {
    id: "dinosaur-discovery",
    label: "Dinosaur Discovery",
    emoji: "🦕",
    description: "Exploring a prehistoric valley alongside gentle, goofy dinosaurs.",
    promptFragment:
      "a prehistoric valley with gentle, goofy dinosaurs, lush ferns, and misty volcanoes in the distance",
    titleNoun: "Dino Valley",
    palette: ["#b45309", "#65a30d"],
  },
  {
    id: "fairy-tale-kingdom",
    label: "Fairy Tale Kingdom",
    emoji: "🏰",
    description: "Visiting a sparkling castle kingdom with kind fairies and dragons.",
    promptFragment:
      "a sparkling fairy-tale kingdom with a candy-colored castle, kind fairies, and a friendly baby dragon",
    titleNoun: "Sparkling Kingdom",
    palette: ["#a21caf", "#f472b6"],
  },
  {
    id: "superhero-adventure",
    label: "Superhero Adventure",
    emoji: "🦸",
    description: "Soaring over a sunny city, using kindness as a superpower.",
    promptFragment:
      "a bright, cheerful city skyline where a young superhero uses kindness and cleverness to help neighbors",
    titleNoun: "Kindness Cape",
    palette: ["#b91c1c", "#f59e0b"],
  },
  {
    id: "jungle-safari",
    label: "Jungle Safari",
    emoji: "🐒",
    description: "Trekking through a lush jungle with playful monkeys and parrots.",
    promptFragment:
      "a lush green jungle safari with playful monkeys, colorful parrots, and a winding river",
    titleNoun: "Jungle Trail",
    palette: ["#166534", "#facc15"],
  },
  {
    id: "winter-wonderland",
    label: "Winter Wonderland",
    emoji: "❄️",
    description: "Sledding through a snowy village that sparkles like sugar.",
    promptFragment:
      "a cozy snowy village that sparkles like sugar, with friendly snow creatures and warm golden lights",
    titleNoun: "Snowy Village",
    palette: ["#1d4ed8", "#e0f2fe"],
  },
];

export const AGE_RANGES: AgeOption[] = [
  { id: "3-5", label: "3–5 years", description: "Very short sentences, simple words, gentle pacing." },
  { id: "6-8", label: "6–8 years", description: "Playful vocabulary with a light sense of adventure." },
  { id: "9-12", label: "9–12 years", description: "Richer vocabulary and a bit more story detail." },
];

export const STORY_LENGTHS = [8, 10, 12] as const;

export const ILLUSTRATION_STYLES: StyleOption[] = [
  {
    id: "pixar-3d",
    label: "3D Pixar-Style Cartoon",
    description: "Glossy, richly detailed 3D-rendered movie style, like a modern animated film.",
    promptFragment:
      "glossy, richly detailed 3D-rendered animated movie style (Pixar/Disney-caliber character animation), vibrant volumetric lighting and sun rays, expressive large eyes, soft global illumination and subsurface scattering on skin, cinematic depth of field, ultra-detailed textures and materials",
  },
  {
    id: "storybook-watercolor",
    label: "Colorful Picture Book",
    description: "Warm, colorful, classic children's picture book illustration.",
    promptFragment:
      "colorful children's picture book illustration, soft watercolor and gouache textures, warm inviting lighting, rounded friendly shapes",
  },
  {
    id: "playful-cartoon",
    label: "Playful Cartoon",
    description: "Bold outlines and bright flat colors, like a fun cartoon.",
    promptFragment:
      "playful flat-color cartoon illustration, bold clean outlines, bright saturated colors, simple expressive shapes",
  },
  {
    id: "soft-pastel",
    label: "Soft Pastel",
    description: "Gentle pastel colors with a dreamy, cozy feel.",
    promptFragment:
      "soft pastel storybook illustration, dreamy gentle color palette, delicate linework, cozy and calm mood",
  },
  {
    id: "vibrant-digital",
    label: "Vibrant Digital Art",
    description: "Rich, vibrant modern digital storybook art.",
    promptFragment:
      "vibrant modern digital storybook illustration, rich saturated colors, dynamic lighting, crisp clean linework",
  },
];

export function findTheme(id: string): ThemeOption {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function findStyle(id: string): StyleOption {
  return ILLUSTRATION_STYLES.find((s) => s.id === id) ?? ILLUSTRATION_STYLES[0];
}

export function findAge(id: string): AgeOption {
  return AGE_RANGES.find((a) => a.id === id) ?? AGE_RANGES[1];
}

export function findGender(id: string): GenderOption {
  return GENDER_OPTIONS.find((g) => g.id === id) ?? GENDER_OPTIONS[0];
}
