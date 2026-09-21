# StoryStars — AI Visual Storytelling for Kids

Enter a child's name and pick boy or girl, and the app generates a single, consistent cartoon storybook character
for them, then an original, fully illustrated children's book starring that character — every page's illustration
actually shows the character performing the story's action, generated via image-to-image from one reference image
so they stay recognizable throughout.

## Features

- **Story creation wizard** — child's name, boy/girl, age range, theme, page length, illustration style (default:
  glossy 3D animated storybook).
- **Name/gender → cartoon character** — a single reusable cartoon character reference image is generated from the
  child's name, gender, and age (`createCharacterReference`), in the chosen illustration style.
- **Original story generation** (`generateStory`) — an 8/10/12-page story (10 by default) with a title, a consistent
  world/setting description, and a detailed action/scene description for every page.
- **Cinematic image-to-image illustration** (`generateCover`, `generateStoryImage`) — every page and the cover are
  generated via **image-to-image editing from the SAME character reference image** (OpenAI `gpt-image-1`,
  `input_fidelity: "high"`), not from a text description alone. Each request is built from six explicit inputs —
  `characterReference` (the image), `characterDescription`, `storyPageText`, `sceneDescription`, `artStyle`, and a
  shared `consistencyPrompt` (`buildConsistencyPrompt`) — and asks for a fully realized environment with props,
  secondary characters, directional lighting/shadow, and foreground/midground/background depth, explicitly
  rejecting flat, empty, or generic backdrops. Every call re-anchors to the one master reference (never chains
  page → page) so drift doesn't compound across a 10-page book.
- **Illustrations that tell the story** — each prompt is grounded in that exact page's story text, not just a loose
  scene paraphrase; the character must be visibly present and doing the thing the story says.
- **Premium picture-book reader** — large edge-to-edge artwork with the story text laid directly onto the image in a
  bottom gradient scrim, big circular Previous/Next controls, tappable page-progress dots, and kid-friendly display
  typography.
- **Read Aloud** — play/pause/resume via the browser's built-in `speechSynthesis` API, no external service required.
- **Regenerate controls** — Regenerate Image (just the current illustration), Regenerate Page (rewrites that page's
  text — keeping the rest of the book and that page's narrative role intact — then re-illustrates it to match), and
  Regenerate Whole Story (new text + new art, same character).
- **Staged loading states** — "Creating your character…" → "Writing your adventure…" → "Illustrating page 3 of
  10…", plus per-image loading/error states with retry and a top-level error screen with "Try Again" / "Continue in
  Demo Mode".
- **Demo/offline mode** — if `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` are missing, the app renders real
  illustrated scenes offline instead of calling any API: a layered sky/ground/character SVG composition (not a flat
  color card or icon), with the character's look (skin tone, hair style/length by gender, outfit) seeded from the
  child's name so it stays consistent across the whole demo book too. Clearly labeled "Demo mode" / "Sample style"
  in the UI so it's never mistaken for real output.
- **Responsive** — works on desktop, tablet, and mobile.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Anthropic API](https://docs.anthropic.com) (`@anthropic-ai/sdk`) for story text generation
- [OpenAI Images API](https://platform.openai.com/docs/guides/images) (`openai`, `gpt-image-1`) for the character
  reference image (`images.generate`, text → image) and every cover/page illustration (`images.edit`,
  image-to-image from that reference)

## Project structure

```
src/
  app/
    page.tsx                    Renders <AppShell />
    api/character/route.ts      POST — createCharacterReference: name/gender/age → cartoon character image
    api/story/route.ts          POST — generateStory: title, setting, and page-by-page text
    api/story/page/route.ts     POST — regeneratePageText: rewrite one page's text, rest of the book unchanged
    api/illustration/route.ts   POST — generateCover / generateStoryImage: one illustration, image-to-image
  components/
    AppShell.tsx                 Top-level view state machine (home / create / reader)
    home/HomeScreen.tsx           Landing page
    create/CreateWizard.tsx       3-step story creation form (name, boy/girl, age/theme/length/style)
    reader/StorybookReader.tsx    Storybook reading view, nav, read-aloud, regenerate, staged loading copy
    reader/IllustrationFrame.tsx  Loading/ready/error states for one illustration
    ui/                           Small shared UI primitives (Button, ProgressBar, ErrorBanner, ...)
  hooks/
    useStoryPipeline.ts           Orchestrates character → story → illustration generation, regeneration, errors
    useReadAloud.ts                Wraps the browser speechSynthesis API
  lib/
    types.ts                      Shared data models (StoryInput, Story, StoryPage, CharacterReferenceResponse, ...)
    constants.ts                   Themes, age ranges, genders, lengths, illustration styles
    prompt.ts                      Builds every prompt sent to the text/image models
    validation.ts                   Server-side request validation
    ai/character.ts                 createCharacterReference — name/gender/age → cartoon character reference image
    ai/text.ts                      generateStory — Anthropic client for story text
    ai/image.ts                     generateCover / generateStoryImage / editImageWithReference — OpenAI client
    mock/                           Offline character portrait, story text, and illustrated-scene generators
```

Concerns are kept separate on purpose: UI components never call the AI SDKs directly, the API routes never contain
UI logic, and prompt construction / mock generation live in their own modules under `src/lib`.

## How character consistency works

1. `createCharacterReference(name, gender, age)` → one cartoon character reference **image** (not just text),
   generated via `images.generate` from a text description built from the child's name, gender, and age.
2. That single image is sent as the input to `images.edit` for the cover and **every** page, built from six
   explicit inputs: `characterReference` (the image itself), `characterDescription` (text reinforcement),
   `storyPageText` (what actually happens on this page), `sceneDescription` (the action/pose to draw),
   `artStyle`, and a shared `consistencyPrompt` — one function (`buildConsistencyPrompt`) reused by every call so
   the "must match the reference exactly" instruction never drifts between the cover and page prompts.
3. Every illustration is generated from the *same* master reference (fan-out, not a chain), so inconsistencies from
   one page don't compound into the next.

This is a best-effort visual likeness via image-to-image editing — the strongest character consistency the current
public `gpt-image-1` API supports.

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
| `ANTHROPIC_API_KEY`      | Optional                      | Story text generation |
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

- **No photo upload**: the character is generated purely from the child's name, gender, and age — no image is
  collected or sent anywhere.
- **Content safety**: prompts explicitly require original, non-copyrighted, gentle, age-appropriate content with no
  violence or real danger, and instruct the image model to avoid embedded text/logos/watermarks.
- **Stateless by design**: there's no database or server session, so the client holds the character reference image
  in memory and resends it as part of every `/api/illustration` request. That's simple and fine for personal use;
  a production deployment would persist the reference image server-side (keyed by a story/session id) instead of
  round-tripping it on every page.
- **Demo mode** is deterministic per (name, theme) for the character's look, but includes a variation seed so
  regenerating still produces a visibly different scene layout even without API credentials.
