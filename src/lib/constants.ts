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
      "a whimsical outer-space adventure where candy-pink and lavender nebulae swirl behind marshmallow-soft planets, warm golden starlight glowing from within a cozy little rocket ship, comet trails scattering like glitter across a deep indigo sky",
    titleNoun: "Little Star",
    palette: ["#4c1d95", "#0ea5e9"],
  },
  {
    id: "under-the-sea",
    label: "Under the Sea",
    emoji: "🐠",
    description: "Diving into a sparkling coral reef full of gentle sea friends.",
    promptFragment:
      "a magical underwater kingdom of coral glowing rose-pink and turquoise, sunbeams piercing down through deep sapphire water in soft golden shafts, bubbles drifting upward like strings of pearls past gentle, curious sea creatures",
    titleNoun: "Coral Kingdom",
    palette: ["#0891b2", "#22d3ee"],
  },
  {
    id: "enchanted-forest",
    label: "Enchanted Forest",
    emoji: "🌳",
    description: "Wandering a magical woodland with fireflies and talking animals.",
    promptFragment:
      "an enchanted forest where moss glows soft emerald over silver-dappled bark, fireflies drift like warm amber embers through shafts of dappled golden light, and curious woodland animals peek from beds of violet wildflowers",
    titleNoun: "Whispering Woods",
    palette: ["#166534", "#84cc16"],
  },
  {
    id: "dinosaur-discovery",
    label: "Dinosaur Discovery",
    emoji: "🦕",
    description: "Exploring a prehistoric valley alongside gentle, goofy dinosaurs.",
    promptFragment:
      "a prehistoric valley bathed in warm amber sunset light, lush jade-green fern fronds, gentle goofy dinosaurs with sun-warmed terracotta and moss-green hides, distant volcanoes wrapped in soft lavender mist",
    titleNoun: "Dino Valley",
    palette: ["#b45309", "#65a30d"],
  },
  {
    id: "fairy-tale-kingdom",
    label: "Fairy Tale Kingdom",
    emoji: "🏰",
    description: "Visiting a sparkling castle kingdom with kind fairies and dragons.",
    promptFragment:
      "a sparkling fairy-tale kingdom with a castle glowing rose-gold at sunset, kind fairies trailing ribbons of shimmering lilac light, and a friendly baby dragon with opal-blue scales curled beside blooming peony gardens",
    titleNoun: "Sparkling Kingdom",
    palette: ["#a21caf", "#f472b6"],
  },
  {
    id: "superhero-adventure",
    label: "Superhero Adventure",
    emoji: "🦸",
    description: "Soaring over a sunny city, using kindness as a superpower.",
    promptFragment:
      "a bright, cheerful city at golden hour, rooftops glowing warm coral and amber, a sky-blue cape rippling in the breeze, soft candy-pink clouds drifting past friendly skyscrapers as a young superhero uses kindness and cleverness to help neighbors",
    titleNoun: "Kindness Cape",
    palette: ["#b91c1c", "#f59e0b"],
  },
  {
    id: "jungle-safari",
    label: "Jungle Safari",
    emoji: "🐒",
    description: "Trekking through a lush jungle with playful monkeys and parrots.",
    promptFragment:
      "a lush jungle safari where honey-gold sunlight breaks through the canopy, oversized emerald leaves glisten with dew, and playful monkeys and coral-and-turquoise parrots chatter along a glassy, marigold-lit river",
    titleNoun: "Jungle Trail",
    palette: ["#166534", "#facc15"],
  },
  {
    id: "winter-wonderland",
    label: "Winter Wonderland",
    emoji: "❄️",
    description: "Sledding through a snowy village that sparkles like sugar.",
    promptFragment:
      "a cozy snowy village glowing with warm amber lantern light against a soft twilight-blue sky, snowflakes drifting like tiny stars, friendly snow creatures with icy periwinkle accents beside rooftops dusted in sparkling white",
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
    id: "ghibli-pixar",
    label: "Ghibli-Pixar Storybook",
    description: "Soft 2D animation blending Studio Ghibli's warmth with Pixar's polish.",
    promptFragment:
      "soft 2D modern animation style blending Studio Ghibli's painterly, hand-crafted backgrounds and gentle warmth with Pixar's polished, expressive character appeal, vibrant yet warm color palette, gentle cinematic lighting, whimsical storybook aesthetic, high detail",
  },
  {
    id: "storybook-watercolor",
    label: "Colorful Picture Book",
    description: "Warm, colorful, classic children's picture book illustration.",
    promptFragment:
      "colorful children's picture book illustration, luminous watercolor and gouache textures with soft visible brush blooms, warm light diffusing gently across every surface, rounded friendly shapes with dreamlike soft edges",
  },
  {
    id: "playful-cartoon",
    label: "Playful Cartoon",
    description: "Bold outlines and bright flat colors, like a fun cartoon.",
    promptFragment:
      "playful flat-color cartoon illustration, bold clean outlines, bright saturated jewel-tone colors, simple expressive shapes with a bouncy, high-energy feel",
  },
  {
    id: "soft-pastel",
    label: "Soft Pastel",
    description: "Gentle pastel colors with a dreamy, cozy feel.",
    promptFragment:
      "soft pastel storybook illustration, dreamy candy-colored palette of blush pink, lavender, and mint, delicate linework, a gentle glowing haze over the whole scene, cozy and calm mood",
  },
  {
    id: "vibrant-digital",
    label: "Vibrant Digital Art",
    description: "Rich, vibrant modern digital storybook art.",
    promptFragment:
      "vibrant modern digital storybook illustration, rich jewel-toned colors, dynamic glowing light with soft lens bloom, crisp clean linework with a polished, luminous finish",
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
