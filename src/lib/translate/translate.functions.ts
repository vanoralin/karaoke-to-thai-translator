import { createServerFn } from "@tanstack/react-start";
import { TranslateRequest } from "./types";

// Safe helper to read environment variables across different runtimes (Node.js, Edge, Cloudflare Workers)
const getEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== "undefined" && process.env) {
      return process.env[key];
    }
  } catch {}
  try {
    if (typeof globalThis !== "undefined") {
      return (globalThis as any)[key];
    }
  } catch {}
  return undefined;
};

export const translateServerFn = createServerFn({ method: "POST" })
  .validator((d: TranslateRequest) => d)
  .handler(async ({ data }) => {
    // Universal OpenAI-Compatible API credentials to hide provider brand completely in public repo
    const apiKey = getEnv("AI_API_KEY");
    const apiUrl = getEnv("AI_API_URL");
    const model = getEnv("AI_MODEL");

    if (!apiKey || !apiUrl || !model) {
      console.warn("AI configurations (AI_API_KEY, AI_API_URL, or AI_MODEL) are not fully configured.");
      return { success: false, error: "AI API is not fully configured" };
    }

    const { text, from, to } = data;

    // 1. Build translation guidelines and few-shot examples
    let systemInstruction = "";
    let fewShots: Array<{ input: string; output: string }> = [];

    if (from === "karaoke" && to === "th") {
      // Secret prompt read from environment variables to protect intellectual property on public repository
      const secretPrompt = getEnv("AI_SYSTEM_PROMPT_KARAOKE_TO_THAI");

      if (secretPrompt) {
        // Replace literal \n with real newline characters if loaded from env string
        systemInstruction = secretPrompt.replace(/\\n/g, "\n");
      } else {
        // Public fallback prompt stub
        systemInstruction = `You are a professional translator translating informal Thai karaoke language (Thai phonetics written in the Roman/English alphabet) into natural, grammatically correct standard Thai.
Your main goal is to understand the context of the entire sentence to resolve ambiguous homophones.`;
      }

      fewShots = [
        { input: "oh mygod i guang non mak", output: "oh mygod ฉันง่วงนอนมาก" },
        { input: "pai nai ma mai glai na", output: "ไปไหนมา ไม่ไกลนะ" },
        { input: "kin khao rue yung ter", output: "กินข้าวหรือยังเธอ" },
        { input: "mai pen rai na ka jer gan", output: "ไม่เป็นไรนะคะ เจอกัน" },
        { input: "pom rak ter mak na", output: "ผมรักเธอมากนะ" },
        { input: "glai ban mak loei", output: "ใกล้บ้านมากเลย" },
        { input: "u doing what yoo na", output: "เธอทำอะไรอยู่เหรอ" },
        { input: "i missed u mak", output: "ฉันคิดถึงเธอมาก" }
      ];
    } else {
      // Secret prompt read from environment variables to protect intellectual property on public repository
      const secretPrompt = getEnv("AI_SYSTEM_PROMPT_THAI_TO_KARAOKE");

      if (secretPrompt) {
        // Replace literal \n with real newline characters if loaded from env string
        systemInstruction = secretPrompt.replace(/\\n/g, "\n");
      } else {
        // Public fallback prompt stub
        systemInstruction = `You are a professional translator Romanizing Thai language into conversational karaoke language commonly used by Thai youths and international school students in chats.`;
      }

      fewShots = [
        { input: "โอ้มายก็อด ฉันง่วงนอนมาก", output: "oh mygod i nguang non mak" },
        { input: "ไปไหนมา ไม่ไกลนะ", output: "pai nai ma mai glai na" },
        { input: "กินข้าวหรือยังเธอ", output: "kin khao rue yung ter" },
        { input: "ไม่เป็นไรนะคะ เจอกัน", output: "mai pen rai na ka jer gan" }
      ];
    }

    // Clean trailing slash from URL
    const cleanApiUrl = apiUrl.replace(/\/$/, "");

    // 2. Build standard OpenAI-compatible message payload
    const messages: Array<any> = [
      { role: "system", content: systemInstruction }
    ];

    // Append few-shots
    for (const shot of fewShots) {
      messages.push({
        role: "user",
        content: `Translate this text:\n"${shot.input}"`
      });
      messages.push({
        role: "assistant",
        content: shot.output
      });
    }

    // Append target text
    messages.push({
      role: "user",
      content: `Translate this text:\n"${text}"`
    });

    try {
      const response = await fetch(`${cleanApiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.1,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API request failed:", errorText);
        return { success: false, error: `API responded with status ${response.status}` };
      }

      const json = (await response.json()) as any;
      const translatedText = json.choices?.[0]?.message?.content || "";

      // Post-process the output to strip unwanted quotes or spacing
      let cleanText = translatedText.trim();
      if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
        cleanText = cleanText.slice(1, -1);
      }
      if (cleanText.startsWith("'") && cleanText.endsWith("'")) {
        cleanText = cleanText.slice(1, -1);
      }

      return { success: true, translatedText: cleanText.trim() };
    } catch (err: any) {
      console.error("Network or internal error calling AI API:", err);
      return { success: false, error: err.message || "Network request failed" };
    }
  });
