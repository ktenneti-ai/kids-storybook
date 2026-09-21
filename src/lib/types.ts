export type AgeRangeId = "3-5" | "6-8" | "9-12";

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
  /** Gradient palette used for mock illustrations and UI accents. */
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
  age: AgeRangeId;
  theme: string;
  length: number;
  illustrationStyle: string;
  photoDataUrl?: string | null;
}

export interface StoryPageContent {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
}

export interface StoryTextResponse {
  title: string;
  settingDescription: string;
  characterDescription: string;
  pages: StoryPageContent[];
  mode: GenerationMode;
  warning?: string;
}

export interface IllustrationResponse {
  imageUrl: string;
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
