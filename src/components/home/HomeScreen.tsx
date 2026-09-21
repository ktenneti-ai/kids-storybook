import { Button } from "@/components/ui/Button";
import { THEMES } from "@/lib/constants";

export function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="relative flex-1 overflow-hidden bg-linear-to-b from-violet-100 via-fuchsia-50 to-orange-50">
      <div className="pointer-events-none absolute -left-10 top-10 text-7xl opacity-30 animate-float-slow">⭐</div>
      <div className="pointer-events-none absolute right-6 top-32 text-6xl opacity-30 animate-float-slow" style={{ animationDelay: "1s" }}>
        🌈
      </div>
      <div className="pointer-events-none absolute left-1/4 bottom-10 text-6xl opacity-20 animate-float-slow" style={{ animationDelay: "2s" }}>
        ☁️
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center sm:py-24">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-violet-700 shadow-sm">
          ✨ Made just for your child
        </span>
        <h1 className="font-display text-4xl font-extrabold leading-tight text-violet-900 sm:text-6xl">
          Turn your child into the
          <span className="block bg-linear-to-r from-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
            hero of their own storybook
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-violet-800/80">
          Enter a name, pick a theme, and watch an original, beautifully illustrated adventure come to life in
          minutes &mdash; ready to read aloud together.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" onClick={onStart} icon={<span aria-hidden>📖</span>}>
            Create Your Story
          </Button>
        </div>

        <div className="mt-14 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {THEMES.slice(0, 8).map((theme) => (
            <div
              key={theme.id}
              className="animate-pop-in rounded-2xl border border-white/60 bg-white/70 p-4 text-center shadow-sm backdrop-blur-sm"
            >
              <div className="text-3xl">{theme.emoji}</div>
              <div className="mt-1 text-xs font-semibold text-violet-800">{theme.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {[
            { icon: "📝", title: "1. Tell us about them", body: "A name, boy or girl, an age, a theme, and a length." },
            { icon: "🪄", title: "2. We write & illustrate", body: "An original story and matching art are generated page by page." },
            { icon: "🔊", title: "3. Read together", body: "Flip through pages, listen with read-aloud, and enjoy!" },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur-sm">
              <div className="text-2xl">{step.icon}</div>
              <div className="mt-2 font-display font-bold text-violet-900">{step.title}</div>
              <div className="mt-1 text-sm text-violet-800/70">{step.body}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
