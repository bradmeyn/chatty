import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { MessageSquareText, Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function Header() {
  return (
    <header className="relative z-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f766e] text-white">
              <MessageSquareText size={18} />
            </div>
            <Link href="/" className="text-lg tracking-tight">
              Chatty
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="bg-[#0f766e] hover:bg-[#115e59]" asChild>
              <Link href="/register">Start free</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/5 bg-[#f7f3ec]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>Chatty © 2026</span>
          <div className="flex items-center gap-6">
            <a href="/login" className="hover:text-foreground">
              Log in
            </a>
            <a href="/register" className="hover:text-foreground">
              Get started
            </a>
            <a href="/" className="hover:text-foreground">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f3ec] text-[#1a1a1a]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-20%] h-[32rem] w-[32rem] rounded-full bg-[#0f766e]/15 blur-[120px]" />
        <div className="absolute right-[-10%] top-[10%] h-[26rem] w-[26rem] rounded-full bg-[#f97316]/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[30rem] w-[30rem] rounded-full bg-[#facc15]/20 blur-[120px]" />
      </div>
      <Header />
      <main className="grow">
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6 animate-rise-in">
            <p
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#0f766e]"
              style={{ fontFamily: "\"Trebuchet MS\", \"Verdana\", sans-serif" }}
            >
              <Sparkles size={14} /> Focused chat workspace
            </p>
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05]"
              style={{
                fontFamily:
                  "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", serif",
              }}
            >
              Turn every question into a crisp answer in seconds.
            </h1>
            <p
              className="text-lg text-[#3c3c3c] max-w-xl"
              style={{ fontFamily: "\"Trebuchet MS\", \"Verdana\", sans-serif" }}
            >
              Chatty keeps your ideas, decisions, and follow-ups in one place.
              Start a conversation, capture a plan, and keep momentum without
              switching tools.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button className="bg-[#0f766e] hover:bg-[#115e59]" asChild>
                <Link href="/register">Start chatting free</Link>
              </Button>
              <Button variant="outline" className="border-black/20" asChild>
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
            <div className="grid grid-cols-3 max-w-md gap-4 text-sm text-muted-foreground">
              <div>
                <p className="text-2xl font-semibold text-[#1a1a1a]">2x</p>
                <p>faster summaries</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1a1a1a]">48%</p>
                <p>fewer follow-ups</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1a1a1a]">5 min</p>
                <p>to set up</p>
              </div>
            </div>
          </div>

          <div className="relative animate-rise-in animate-delay-200">
            <div className="absolute -top-6 -left-6 h-28 w-28 rounded-3xl border border-black/10 bg-white/60 shadow-sm" />
            <Card className="relative border-black/10 bg-white/80 p-6 shadow-xl">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Chatty • Live session</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                  Online
                </span>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-2xl bg-[#0f766e] text-white p-4 ml-auto max-w-[80%]">
                  Draft a launch checklist for the new chatbot.
                </div>
                <div className="rounded-2xl bg-[#f3f1ed] text-[#1a1a1a] p-4 max-w-[85%]">
                  Here is a clean checklist: define goals, set tone, map
                  hand-offs, test flows, and prepare analytics.
                </div>
                <div className="rounded-2xl bg-[#f3f1ed] text-[#1a1a1a] p-4 max-w-[85%]">
                  Want me to turn it into tasks you can paste into your
                  tracker?
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs text-muted-foreground">
                <Zap size={14} className="text-[#f97316]" />
                Smart reply suggestions ready
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-16">
          <div className="grid gap-6 lg:grid-cols-3 animate-fade-in animate-delay-400">
            {[
              {
                title: "Threaded clarity",
                copy: "Keep long conversations organized with clean message history and instant search.",
              },
              {
                title: "Decisions, captured",
                copy: "Summarize action items in one click and keep everyone aligned.",
              },
              {
                title: "Always in sync",
                copy: "Every chat is attached to your account, ready on any device.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-black/10 bg-white/70 p-6">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-20">
          <Card className="border-black/10 bg-[#0f766e] text-white px-6 py-12 lg:px-12">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-semibold">
                  Ready to ship your next idea?
                </h2>
                <p className="mt-3 text-white/80">
                  Spin up a new chat in seconds and let Chatty keep your work
                  moving.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <Button className="bg-white text-[#0f766e] hover:bg-[#f3f1ed]" asChild>
                  <Link href="/register">Start free</Link>
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                  <Link href="/login">Talk to an existing account</Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
