import { PHRASES, WORDS, THAI_WORDS, THAI_KEYS } from "./dictionary";
import { translateServerFn } from "./translate.functions";

export type Lang = "th" | "karaoke";

export interface TranslateRequest {
  text: string;
  from: Lang;
  to: Lang;
}

/**
 * Phonetic fallback for karaoke syllables that are not in the dictionary.
 * Interprets sound clusters, not single characters.
 */
const ONSETS: Array<[string, string]> = [
  ["ngh", "ง"],
  ["kh", "ค"],
  ["ph", "พ"],
  ["th", "ท"],
  ["ch", "ช"],
  ["sh", "ช"],
  ["ng", "ง"],
  ["ny", "ญ"],
  ["gr", "กร"],
  ["kr", "คร"],
  ["pr", "ปร"],
  ["tr", "ตร"],
  ["br", "บร"],
  ["fr", "ฟร"],
  ["gl", "กล"],
  ["kl", "คล"],
  ["pl", "ปล"],
  ["bl", "บล"],
  ["fl", "ฟล"],
  ["k", "ก"],
  ["g", "ก"],
  ["j", "จ"],
  ["c", "ค"],
  ["d", "ด"],
  ["t", "ต"],
  ["b", "บ"],
  ["p", "ป"],
  ["f", "ฟ"],
  ["s", "ซ"],
  ["h", "ห"],
  ["l", "ล"],
  ["r", "ร"],
  ["m", "ม"],
  ["n", "น"],
  ["w", "ว"],
  ["v", "ว"],
  ["y", "ย"],
];

// vowel sound -> [prefix, suffix] around the initial consonant
const VOWELS: Array<[string, [string, string]]> = [
  ["ueang", ["เ", "ือง"]],
  ["uang", ["", "วง"]],
  ["iang", ["เ", "ียง"]],
  ["eung", ["", "ึง"]],
  ["oeng", ["เ", "ิง"]],
  ["aeo", ["แ", "ว"]],
  ["eaw", ["เ", "ียว"]],
  ["iew", ["เ", "ียว"]],
  ["uea", ["เ", "ือ"]],
  ["uea", ["เ", "ือ"]],
  ["oey", ["เ", "ย"]],
  ["eung", ["", "ึง"]],
  ["aew", ["แ", "ว"]],
  ["eaw", ["เ", "ียว"]],
  ["aay", ["", "าย"]],
  ["aai", ["", "าย"]],
  ["aao", ["", "าว"]],
  ["oon", ["", "ูน"]],
  ["oom", ["", "ูม"]],
  ["ooy", ["", "ูย"]],
  ["eua", ["เ", "ือ"]],
  ["oei", ["เ", "ย"]],
  ["eaa", ["เ", "า"]],
  ["ae", ["แ", ""]],
  ["oe", ["เ", "อ"]],
  ["eu", ["", "ือ"]],
  ["ue", ["", "ือ"]],
  ["oo", ["", "ู"]],
  ["ou", ["", "ู"]],
  ["ee", ["", "ี"]],
  ["ie", ["เ", "ีย"]],
  ["ia", ["เ", "ีย"]],
  ["ua", ["", "ัว"]],
  ["ai", ["ไ", ""]],
  ["ay", ["ไ", ""]],
  ["ao", ["เ", "า"]],
  ["au", ["เ", "า"]],
  ["aw", ["", "อ"]],
  ["or", ["", "อ"]],
  ["er", ["เ", "อ"]],
  ["ir", ["เ", "อ"]],
  ["ur", ["เ", "อ"]],
  ["eo", ["เ", "ว"]],
  ["oi", ["", "อย"]],
  ["oy", ["", "อย"]],
  ["a", ["", "า"]],
  ["i", ["", "ิ"]],
  ["e", ["เ", ""]],
  ["u", ["", "ุ"]],
  ["o", ["โ", ""]],
];

const FINALS: Array<[string, string]> = [
  ["ng", "ง"],
  ["k", "ก"],
  ["g", "ก"],
  ["t", "ต"],
  ["d", "ด"],
  ["p", "บ"],
  ["b", "บ"],
  ["m", "ม"],
  ["n", "น"],
  ["y", "ย"],
  ["w", "ว"],
  ["l", "ล"],
];

function matchPrefix<T>(input: string, table: Array<[string, T]>) {
  for (const [key, value] of table) {
    if (input.startsWith(key)) return { key, value };
  }
  return null;
}

/** Interpret an unknown karaoke syllable phonetically. */
function phoneticSyllable(raw: string): string {
  let rest = raw;
  let out = "";

  const onset = matchPrefix(rest, ONSETS);
  let initial = "อ";
  if (onset) {
    initial = onset.value;
    rest = rest.slice(onset.key.length);
  }

  const vowel = matchPrefix(rest, VOWELS);
  if (!vowel) {
    return out + initial + (rest ? phoneticFinal(rest) : "");
  }
  rest = rest.slice(vowel.key.length);
  const [pre, post] = vowel.value;
  out += pre + initial + post;

  if (rest) out += phoneticFinal(rest);
  return out;
}

function phoneticFinal(rest: string): string {
  let out = "";
  let cursor = rest;
  let guard = 0;
  while (cursor && guard++ < 6) {
    const f = matchPrefix(cursor, FINALS);
    if (!f) {
      cursor = cursor.slice(1);
      continue;
    }
    out += f.value;
    cursor = cursor.slice(f.key.length);
  }
  return out;
}

function karaokeWord(word: string): string {
  const clean = word.toLowerCase();
  if (WORDS[clean]) return WORDS[clean];
  // try trimming a repeated trailing vowel (e.g. "raoo")
  const trimmed = clean.replace(/(.)\1+$/, "$1");
  if (WORDS[trimmed]) return WORDS[trimmed];
  return phoneticSyllable(clean);
}

function karaokeToThai(text: string): string {
  let working = " " + text.toLowerCase().replace(/\s+/g, " ").trim() + " ";

  const placeholders: string[] = [];
  const sorted = [...PHRASES].sort((a, b) => b[0].length - a[0].length);
  for (const [phrase, thai] of sorted) {
    const pattern = new RegExp(`(?<=[\\s.,!?])${phrase.replace(/ /g, "\\s+")}(?=[\\s.,!?])`, "g");
    working = working.replace(pattern, () => {
      placeholders.push(thai);
      return `\u0000${placeholders.length - 1}\u0000`;
    });
  }

  const tokens = working.trim().split(/(\s+|[.,!?…]+)/);
  const translated = tokens
    .map((token) => {
      if (!token.trim()) return token;
      if (/^[.,!?…]+$/.test(token)) return token;
      const ph = token.match(/^\u0000(\d+)\u0000$/);
      if (ph) return placeholders[Number(ph[1])] ?? token;
      if (/[\u0E00-\u0E7F]/.test(token)) return token;
      if (/^\d+$/.test(token)) return token;
      return karaokeWord(token);
    })
    .join("");

  return translated
    .replace(/([\u0E00-\u0E7F]) +(?=[\u0E00-\u0E7F])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function thaiToKaraoke(text: string): string {
  const segments = text.split(/(\s+|[.,!?…]+)/);
  const out = segments.map((segment) => {
    if (!segment.trim()) return " ";
    if (/^[.,!?…]+$/.test(segment)) return segment;
    if (!/[\u0E00-\u0E7F]/.test(segment)) return segment;

    let cursor = segment;
    const parts: string[] = [];
    while (cursor.length) {
      const key = THAI_KEYS.find((k) => cursor.startsWith(k));
      if (key) {
        parts.push(THAI_WORDS[key] ?? key);
        cursor = cursor.slice(key.length);
      } else {
        // unknown chunk: take one char and try to keep reading
        const next = cursor.slice(1);
        parts.push(cursor[0] ?? "");
        cursor = next;
      }
    }
    return parts.join(" ");
  });

  return out.join("").replace(/\s+/g, " ").trim();
}

export async function translate({ text, from, to }: TranslateRequest): Promise<string> {
  const input = text.trim();
  if (!input) return "";
  if (from === to) return input;

  try {
    const response = await translateServerFn({ data: { text: input, from, to } });
    if (response.success && response.translatedText) {
      return response.translatedText;
    } else {
      console.warn("AI translation server function returned error, falling back to dictionary:", response.error);
    }
  } catch (error) {
    console.error("AI translation server function call failed, falling back to dictionary:", error);
  }

  return from === "karaoke" ? karaokeToThai(input) : thaiToKaraoke(input);
}
