import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeftRight, Check, ChevronDown, Copy, Heart, Loader2 } from "lucide-react";
import { translate, type Lang } from "@/lib/translate";
import { trackEvent } from "../lib/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KaraThai — แปลภาษาคาราโอเกะเป็นไทย" },
      {
        name: "description",
        content:
          "เครื่องมือแปล ภาษาคาราโอเกะเป็นภาษาไทย และ ไทยเป็นคาราโอเกะ ตีความจากเสียงและบริบท ใช้ได้เลยไม่ต้องล็อคอิน",
      },
      { property: "og:title", content: "KaraThai — แปลภาษาคาราโอเกะเป็นไทย" },
      {
        property: "og:description",
        content: "ใช้งานได้เลย โดยไม่ต้องล็อคอิน",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://karaoke-to-thai-translator.vercel.app/favicon.ico" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://karaoke-to-thai-translator.vercel.app/favicon.ico" },
    ],
  }),
  component: Index,
});

const LABEL: Record<Lang, string> = { th: "ไทย", karaoke: "Karaoke" };
const PLACEHOLDER: Record<Lang, string> = {
  th: "พิมพ์ภาษาไทยที่นี่...",
  karaoke: "phim karaoke tee nee...",
};

function Index() {
  const [from, setFrom] = useState<Lang>("karaoke");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const to: Lang = from === "th" ? "karaoke" : "th";

  const handleSwap = () => {
    setFrom(to);
    setInput(output);
    setOutput(input);
  };

  const handleTranslate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    trackEvent("click_translate", {
      from_lang: from,
      to_lang: to,
      text_length: input.trim().length,
    });
    try {
      setOutput(await translate({ text: input, from, to }));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center justify-center gap-3">
          <img
            src="/favicon.ico"
            alt="KaraThai Logo"
            className="size-10 rounded-xl object-contain sm:size-12"
          />
          <h1 className="text-4xl font-extrabold tracking-tight text-[#12a4b7] sm:text-5xl">
            Karaoke-to-Thai
          </h1>
        </div>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          เว็บแปลภาษาคาราโอเกะ ↔ ไทย ใช้ได้เลยไม่ต้องล็อคอิน
        </p>
      </header>

      <section className="mx-auto mt-10 w-full max-w-5xl rounded-4xl border border-border bg-card p-5 shadow-card sm:mt-14 sm:p-8">
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-5">
          {/* Input */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-foreground" htmlFor="source">
              ภาษาต้นทาง
            </label>
            <div className="relative">
              <button
                type="button"
                id="source-lang-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex w-full items-center justify-between rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm font-medium text-foreground outline-none transition-all hover:bg-secondary focus:border-primary focus:ring-2 focus:ring-primary/25 cursor-pointer"
              >
                <span>{from === "th" ? "ไทย" : "Karaoke"}</span>
                <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <>
                  {/* Backdrop overlay to close on click outside */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 right-0 mt-2 z-40 origin-top rounded-2xl border border-border bg-card p-1.5 shadow-card animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      type="button"
                      onClick={() => {
                        setFrom("th");
                        setOutput("");
                        setIsDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${from === "th"
                        ? "bg-primary-light text-primary-dark"
                        : "text-foreground hover:bg-secondary/60"
                        }`}
                    >
                      <span>ไทย</span>
                      {from === "th" && <Check className="size-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFrom("karaoke");
                        setOutput("");
                        setIsDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${from === "karaoke"
                        ? "bg-primary-light text-primary-dark"
                        : "text-foreground hover:bg-secondary/60"
                        }`}
                    >
                      <span>Karaoke</span>
                      {from === "karaoke" && <Check className="size-4" />}
                    </button>
                  </div>
                </>
              )}
            </div>
            <textarea
              id="source"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDER[from]}
              className="min-h-52 w-full resize-none rounded-2xl border border-border bg-card p-4 text-[18px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
          </div>

          {/* Swap */}
          <div className="flex items-center justify-center md:px-1">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="สลับภาษา"
              className="flex size-12 items-center justify-center rounded-full border border-border bg-primary-light text-primary-dark shadow-soft transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
            >
              <ArrowLeftRight className="size-5 md:hidden" />
              <ArrowLeftRight className="hidden size-5 md:block" />
            </button>
          </div>

          {/* Output */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                ภาษาปลายทาง · {LABEL[to]}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-primary-dark transition-colors hover:bg-primary-light disabled:opacity-40"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "คัดลอกแล้ว" : "คัดลอก"}
              </button>
            </div>
            <div className="min-h-52 w-full whitespace-pre-wrap rounded-2xl border border-border bg-secondary/50 p-4 text-[18px] leading-relaxed text-foreground">
              {output || (
                <span className="text-muted-foreground/70">ผลลัพธ์จะแสดงที่นี่</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleTranslate}
            disabled={loading || !input.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:min-w-64"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "กำลังแปล..." : "แปลภาษา"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            ระบบจะตีความจากเสียงและบริบท ไม่ได้แปลแบบตัวอักษรต่ออักษร
          </p>
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-5xl text-center text-xs text-muted-foreground/75">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p>© 2026 KaraThai · เครื่องมือแปลภาษาคาราโอเกะ ↔ ภาษาไทย</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground/80">
              <span>Made with</span>
              <Heart className="size-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              <span>by vanoralin</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
