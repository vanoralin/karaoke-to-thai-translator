import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeftRight, Check, Copy, Loader2 } from "lucide-react";
import { translate, type Lang } from "@/lib/translate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KaraThai — แปลภาษาคาราโอเกะ ↔ ไทย" },
      {
        name: "description",
        content:
          "เครื่องมือแปลภาษาคาราโอเกะเป็นภาษาไทยและไทยเป็นคาราโอเกะ ตีความจากเสียงและบริบท ใช้งานง่ายในหน้าเดียว",
      },
      { property: "og:title", content: "KaraThai — แปลภาษาคาราโอเกะ ↔ ไทย" },
      {
        property: "og:description",
        content: "พิมพ์ แปล คัดลอก แปลคาราโอเกะ ↔ ไทย จากเสียงที่คุณตั้งใจสื่อ",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

  const to: Lang = from === "th" ? "karaoke" : "th";

  const handleSwap = () => {
    setFrom(to);
    setInput(output);
    setOutput(input);
  };

  const handleTranslate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
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
        <h1 className="text-4xl font-extrabold tracking-tight text-primary-dark sm:text-5xl">
          KaraThai
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          แปลภาษาคาราโอเกะ ↔ ไทย จากเสียงที่คุณตั้งใจสื่อ
        </p>
      </header>

      <section className="mx-auto mt-10 w-full max-w-5xl rounded-[20px] border border-border bg-card p-5 shadow-card sm:mt-14 sm:p-8">
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-5">
          {/* Input */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-foreground" htmlFor="source">
              ภาษาต้นทาง
            </label>
            <select
              id="source-lang"
              aria-label="เลือกภาษาต้นทาง"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value as Lang);
                setOutput("");
              }}
              className="w-full rounded-2xl border border-border bg-secondary/60 px-4 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="th">ไทย</option>
              <option value="karaoke">Karaoke</option>
            </select>
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
    </main>
  );
}
