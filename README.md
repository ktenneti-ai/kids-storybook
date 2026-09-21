# StoryStars — AI Visual Storytelling for Kids

Turn a child's photo into a consistent cartoon storybook character, then generate an original, fully illustrated
children's book starring that character — every page's illustration actually shows the character performing the
story's action, generated via image-to-image from one reference image so they stay recognizable throughout.

## Features

- **Story creation wizard** — child's name, optional photo upload, age range, theme, page length, illustration style.
- **Photo → cartoon character** — an uploaded photo is converted into a single reusable cartoon character reference
  image (`createCharacterReference`), preserving face shape, hairstyle, and skin tone while rendering it as a warm
  storybook illustration. With no photo, an original character is generated from a text description instead.
- **Original story generation** (`generateStory`) — an 8/10/12-page story with a title, a consistent world/setting
  description, and a detailed action/scene description for every page.
- **Image-to-image illustration** (`generateCover`, `generateStoryImage`) — every page and the cover are generated
  via **image-to-image editing from the SAME character reference image** (OpenAI `gpt-image-1`, `input_fidelity:
  "high"`), not from a text description alone — this is what actually carries the child's identity into each new
  scene. Every call re-anchors to the one master reference (never chains page → page) so drift doesn't compound
  across a 10-page book.
- **Illustrations that tell the story** — each prompt is a specific action/pose/setting for that page, not a
  generic background; the character must be visibly present and doing the thing the story says.
- **Interactive reader** — the illustration is the dominant element on every page, cover + Previous/Next navigation,
  "The End" on the last page.
- **Read Aloud** — uses the browser's built-in `speechSynthesis` API, no external service required.
- **Regenerate controls** — regenerate the whole story (new text + new art, same character) or just one illustration
  (cover or any page) without touching the rest of the book.
- **Staged loading states** — "Creating your character…" → "Writing your adventure…" → "Illustrating page 3 of
  8…", plus per-image loading/error states with retry and a top-level error screen with "Try Again" / "Continue in
  Demo Mode".
- **Demo/offline mode** — if `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` are missing, the app renders real
  illustrated scenes offline instead of calling any API: a layered sky/ground/character SVG composition (not a flat
  color card or icon), with the character's look (skin tone, hair, outfit) seeded from the child's name so it stays
  consistent across the whole demo book too. Clearly labeled "Demo mode" / "Sample style" in the UI so it's never
  mistaken for real output.
- **Responsive** — works on desktop, tablet, and mobile.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Anthropic API](https://docs.anthropic.com) (`@anthropic-ai/sdk`) for story text generation and photo → text
  appearance analysis
- [OpenAI Images API](https://platform.openai.com/docs/guides/images) (`openai`, `gpt-image-1`) for the character
  reference image and every illustration, via both `images.generate` (text → image, when there's no photo) and
  `images.edit` (image-to-image, for the character-from-photo conversion and every later illustration)

## Project structure

```
src/
  app/
    page.tsx                    Renders <AppShell />
    api/character/route.ts      POST — createCharacterReference: photo (or text) → cartoon character image
    api/story/route.ts          POST — generateStory: title, setting, and page-by-page text
    api/illustration/route.ts   POST — generateCover / generateStoryImage: one illustration, image-to-image
  components/
    AppShell.tsx                 Top-level view state machine (home / create / reader)
    home/HomeScreen.tsx           Landing page
    create/CreateWizard.tsx       3-step story creation form
    create/PhotoUpload.tsx        Photo upload + client-side validation/preview
    reader/StorybookReader.tsx    Storybook reading view, nav, read-aloud, regenerate, staged loading copy
    reader/IllustrationFrame.tsx  Loading/ready/error states for one illustration
    ui/                           Small shared UI primitives (Button, ProgressBar, ErrorBanner, ...)
  hooks/
    useStoryPipeline.ts           Orchestrates character → story → illustration generation, regeneration, errors
    useReadAloud.ts                Wraps the browser speechSynthesis API
  lib/
    types.ts                      Shared data models (StoryInput, Story, StoryPage, CharacterReferenceResponse, ...)
    constants.ts                   Themes, age ranges, lengths, illustration styles
    prompt.ts                      Builds every prompt sent to the text/image models
    validation.ts                   Server-side request validation
    ai/character.ts                 createCharacterReference — photo/text → cartoon character reference image
    ai/text.ts                      generateStory — Anthropic client for story text + photo analysis
    ai/image.ts                     generateCover / generateStoryImage / editImageWithReference — OpenAI client
    mock/                           Offline character portrait, story text, and illustrated-scene generators
```

Concerns are kept separate on purpose: UI components never call the AI SDKs directly, the API routes never contain
UI logic, and prompt construction / mock generation live in their own modules under `src/lib`.

## How character consistency works

1. `createCharacterReference(photo | description)` → one cartoon character reference **image** (not just text),
   generated via `images.edit` (from the photo) or `images.generate` (no photo).
2. That single image is sent as the input to `images.edit` again for the cover and **every** page, with
   `input_fidelity: "high"` and a prompt that describes only the new scene/action — never re-describing the
   character's appearance, since the reference image itself carries that.
3. Every illustration is generated from the *same* master reference (fan-out, not a chain), so inconsistencies from
   one page don't compound into the next.
4. A short text description (from Claude's vision analysis of the photo, when available) rides along as a
   lightweight reinforcement, not the primary consistency mechanism.

This is a best-effort visual likeness via image-to-image editing — the strongest character consistency the current
public `gpt-image-1` API supports — not pixel-exact face-cloning.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables (optional)

```bash
cp .env.example .env.local
```

Then fill in whichever keys you have in `.env.local`:

| Variable                | Required?                     | Purpose                                                   |
| ------------------------ | ------------------------------ | ----------------------------------------------------------- |
| `ANTHROPIC_API_KEY`      | Optional                      | Story text generation + photo → text appearance description |
| `ANTHROPIC_TEXT_MODEL`   | Optional (default: `claude-sonnet-5`) | Override the Claude model used                    |
| `OPENAI_API_KEY`         | Optional                      | Character reference + cover + page illustrations (`gpt-image-1`) |
| `OPENAI_IMAGE_MODEL`     | Optional (default: `gpt-image-1`) | Override the OpenAI image model                        |

Leave one or both blank to run in **demo mode** — the app still works end-to-end offline (see Demo/offline mode
above). This is clearly indicated in the UI with a "Demo mode" badge.

API keys are read only on the server (inside `src/lib/ai/*` and the `src/app/api/*` route handlers) via
`process.env`. They are never sent to the browser or included in any client bundle.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build            # production build
npm run start             # run the production build
npm run lint               # ESLint
npm run storybook           # component workshop (see src/components/**/*.stories.tsx)
npm run build-storybook      # static Storybook build
```

## Notes & limitations

- **Photo handling**: an uploaded photo is sent once, in-memory, to the image model (to become the character
  reference) and optionally to the vision model (for the short text description). It is never stored, logged, or
  reused anywhere else.
- **Content safety**: prompts explicitly require original, non-copyrighted, gentle, age-appropriate content with no
  violence or real danger, and instruct the image model to avoid embedded text/logos/watermarks.
- **Stateless by design**: there's no database or server session, so the client holds the character reference image
  in memory and resends it as part of every `/api/illustration` request. That's simple and fine for personal use;
  a production deployment would persist the reference image server-side (keyed by a story/session id) instead of
  round-tripping it on every page.
- **Demo mode** is deterministic per (name, theme) for the character's look, but includes a variation seed so
  regenerating still produces a visibly different scene layout even without API credentials.
