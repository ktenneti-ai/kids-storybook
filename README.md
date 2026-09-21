# StoryStars — AI Kids Storybook Maker

Generate an original, illustrated children's storybook starring your own child. Enter a name (and optionally a
photo), pick an age range, theme, length, and art style, and the app writes an 8–12 page story and illustrates
every page — with a cover, page navigation, read-aloud, and regenerate controls.

## Features

- **Story creation wizard** — child's name, optional photo upload, age range, theme, page length, illustration style.
- **Original story generation** — an 8/10/12-page story with a title, consistent world/setting description, and a
  short illustration prompt for every page.
- **Consistent character across pages** — when a photo is provided, a vision model turns it into a short text
  description (hair, skin tone, clothing) that's injected into every illustration prompt, along with a fixed
  art-style and setting description, so the character, outfit, and world stay visually consistent.
- **Interactive reader** — cover + Previous/Next page navigation, "The End" on the last page.
- **Read Aloud** — uses the browser's built-in `speechSynthesis` API, no external service required.
- **Regenerate controls** — regenerate the whole story (new text + new art) or just one illustration (cover or any
  page) without touching the rest of the book.
- **Loading & error states** — a progress bar while the story is written and illustrated, per-image loading/error
  states with retry, and a top-level error screen with "Try Again" / "Continue in Demo Mode".
- **Demo/mock mode** — if `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` are missing, the app automatically falls back
  to a built-in offline story generator and colorful placeholder illustrations, so the whole app is testable with
  zero credentials.
- **Responsive** — works on desktop, tablet, and mobile.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Anthropic API](https://docs.anthropic.com) (`@anthropic-ai/sdk`) for story text generation and photo analysis
- [OpenAI Images API](https://platform.openai.com/docs/guides/images) (`openai`, `gpt-image-1`) for illustrations

## Project structure

```
src/
  app/
    page.tsx                 Renders <AppShell />
    api/story/route.ts       POST — generates title, setting, and page text (+ character description)
    api/illustration/route.ts POST — generates one illustration (cover or a page)
  components/
    AppShell.tsx              Top-level view state machine (home / create / reader)
    home/HomeScreen.tsx        Landing page
    create/CreateWizard.tsx    3-step story creation form
    create/PhotoUpload.tsx     Photo upload + client-side validation/preview
    reader/StorybookReader.tsx Storybook reading view, nav, read-aloud, regenerate
    reader/IllustrationFrame.tsx Loading/ready/error states for one illustration
    ui/                        Small shared UI primitives (Button, ProgressBar, ErrorBanner, ...)
  hooks/
    useStoryPipeline.ts        Orchestrates story + illustration generation, regeneration, errors
    useReadAloud.ts             Wraps the browser speechSynthesis API
  lib/
    types.ts                   Shared data models (StoryInput, Story, StoryPage, ...)
    constants.ts                Themes, age ranges, lengths, illustration styles
    prompt.ts                   Builds the prompts sent to the text/image models
    validation.ts                Server-side request validation
    ai/text.ts                   Anthropic client — story text + photo analysis
    ai/image.ts                  OpenAI client — illustration generation
    mock/                        Offline story + illustration generators (no API keys needed)
```

Concerns are kept separate on purpose: UI components never call the AI SDKs directly, the API routes never contain
UI logic, and prompt construction / mock generation live in their own modules under `src/lib`.

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
| `ANTHROPIC_API_KEY`      | Optional                      | Story text generation + photo → character description     |
| `ANTHROPIC_TEXT_MODEL`   | Optional (default: `claude-sonnet-5`) | Override the Claude model used                    |
| `OPENAI_API_KEY`         | Optional                      | Illustration generation (`gpt-image-1`)                    |
| `OPENAI_IMAGE_MODEL`     | Optional (default: `gpt-image-1`) | Override the OpenAI image model                        |

Leave one or both blank to run in **demo mode** — the app still works end-to-end, using a built-in templated story
generator and colorful SVG placeholder illustrations instead of real AI calls. This is clearly indicated in the UI
with a "Demo mode" badge.

API keys are read only on the server (inside `src/lib/ai/*` and the `src/app/api/*` route handlers) via
`process.env`. They are never sent to the browser or included in any client bundle.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
```

## Notes & limitations

- **Photo handling**: an uploaded photo is sent once, in-memory, to the text/vision model to produce a short
  written description (hair, skin tone, clothing). The photo itself is never stored, logged, or sent to the image
  model — illustration consistency is achieved by reusing that same text description (plus a fixed setting/style
  description) in every image prompt, not by literal face-matching.
- **Content safety**: prompts explicitly require original, non-copyrighted, gentle, age-appropriate content with no
  violence or real danger, and instruct the image model to avoid embedded text/logos/watermarks.
- **Mock mode** is deterministic per (name, theme, age) but includes a "Regenerate" variation seed so regenerating
  produces a visibly different result even without API credentials.
