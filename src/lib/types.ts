export type AgeRangeId = "3-5" | "6-8" | "9-12";

export type CharacterGender = "boy" | "girl";

export type GenerationMode = "ai" | "mock";

export interface ThemeOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Injected into the story prompt to steer plot/setting. */
  promptFragment: string;
  /** Noun used when building a mock/fallback title, e.g. "Little Star". */
  titleNoun: string;
  /** Gradient palette used for demo-mode illustration scenes and UI accents. */
  palette: [string, string];
}

export interface StyleOption {
  id: string;
  label: string;
  description: string;
  /** Injected into every illustration prompt to keep art style consistent. */
  promptFragment: string;
}

export interface AgeOption {
  id: AgeRangeId;
  label: string;
  description: string;
}

export interface StoryInput {
  childName: string;
  gender: CharacterGender;
  age: AgeRangeId;
  theme: string;
  length: number;
  illustrationStyle: string;
}

export interface StoryPageContent {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
}

export interface StoryTextResponse {
  title: string;
  settingDescription: string;
  pages: StoryPageContent[];
  mode: GenerationMode;
  warning?: string;
}

/** A single, reusable cartoon character reference image generated from the child's name, age, and gender. */
export interface CharacterReferenceResponse {
  imageUrl: string;
  description: string;
  mode: GenerationMode;
  warning?: string;
}

export interface IllustrationResponse {
  imageUrl: string;
  mode: GenerationMode;
  warning?: string;
}

/** Result of rewriting a single page's text (and matching illustration prompt) while leaving the rest of the book unchanged. */
export interface RegeneratePageResponse {
  page: StoryPageContent;
  mode: GenerationMode;
  warning?: string;
}

export type AssetStatus = "idle" | "loading" | "ready" | "error";

export interface StoryPage extends StoryPageContent {
  imageUrl?: string;
  imageStatus: AssetStatus;
  imageError?: string;
}

export interface Story {
  title: string;
  input: StoryInput;
  /** The single reference image every page/cover illustration is generated from (image-to-image). */
  characterReferenceImageUrl?: string;
  characterReferenceStatus: AssetStatus;
  characterReferenceError?: string;
  /** Short text description of the character's appearance, kept as a fallback/reinforcement alongside the reference image. */
  characterDescription: string;
  settingDescription: string;
  coverImageUrl?: string;
  coverStatus: AssetStatus;
  coverError?: string;
  pages: StoryPage[];
  mode: GenerationMode;
  warning?: string;
}

export interface ApiErrorResponse {
  error: string;
  canFallbackToMock?: boolean;
}
