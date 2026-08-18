import { createServerFn } from "@tanstack/react-start";
import { TranslateRequest } from "./index";

export const translateServerFn = createServerFn({ method: "POST" })
  .validator((d: TranslateRequest) => d)
  .handler(async ({ data }) => {
    // Read the GEMINI_API_KEY from environment variables.
    // Try both upper and lower case variants to be safe.
    const apiKey = process.env["GEMINI_API_KEY"] || process.env["gemini_api_key"];

    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined.");
      return { success: false, error: "GEMINI_API_KEY is not configured" };
    }

    const { text, from, to } = data;

    // 1. Build the translation guidelines and few-shot examples
    let systemInstruction = "";
    let fewShots: Array<{ input: string; output: string }> = [];

    if (from === "karaoke" && to === "th") {
      // Secret prompt read from environment variables to protect intellectual property on public repository
      const secretPrompt = process.env["GEMINI_SYSTEM_PROMPT_KARAOKE_TO_THAI"];

      if (secretPrompt) {
        // Replace literal \n with real newline characters if loaded from env string
        systemInstruction = secretPrompt.replace(/\\n/g, "\n");
      } else {
        // Public fallback prompt stub
        systemInstruction = `You are a professional translator translating informal Thai karaoke language (Thai phonetics written in the Roman/English alphabet) into natural, grammatically correct standard Thai.
Your main goal is to understand the context of the entire sentence to resolve ambiguous homophones (like "mai", "glai", "tee", "mun").`;
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
      const secretPrompt = process.env["GEMINI_SYSTEM_PROMPT_THAI_TO_KARAOKE"];

      if (secretPrompt) {
        // Replace literal \n with real newline characters if loaded from env string
        systemInstruction = secretPrompt.replace(/\\n/g, "\n");
      } else {
        // Public fallback prompt stub
        systemInstruction = `You are a professional translator Romanizing Thai language into conversational karaoke language (phonetic English spelling) commonly used by Thai youths and international school students in chats.`;
      }

      fewShots = [
        { input: "โอ้มายก็อด ฉันง่วงนอนมาก", output: "oh mygod i nguang non mak" },
        { input: "ไปไหนมา ไม่ไกลนะ", output: "pai nai ma mai glai na" },
        { input: "กินข้าวหรือยังเธอ", output: "kin khao rue yung ter" },
        { input: "ไม่เป็นไรนะคะ เจอกัน", output: "mai pen rai na ka jer gan" }
      ];
    }

    // 2. Call Google Gemini API (using gemini-1.5-flash for speed and cost efficiency)
    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Structure contents as a clean multi-turn few-shot conversation
    const contents: Array<any> = [
      {
        role: "user",
        parts: [
          { text: `System Instruction:\n${systemInstruction}` }
        ]
      }
    ];

    // Append few-shots
    for (const shot of fewShots) {
      contents.push({
        role: "user",
        parts: [{ text: `Translate this text:\n"${shot.input}"` }]
      });
      contents.push({
        role: "model",
        parts: [{ text: shot.output }]
      });
    }

    // Append current input
    contents.push({
      role: "user",
      parts: [{ text: `Translate this text:\n"${text}"` }]
    });

    const promptPayload = {
      contents,
      generationConfig: {
        temperature: 0.1, // low temperature to make translations precise and consistent
        maxOutputTokens: 1024,
      }
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promptPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API request failed:", errorText);
        return { success: false, error: `Gemini API responded with status ${response.status}` };
      }

      const json = (await response.json()) as any;
      const translatedText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";

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
      console.error("Network or internal error calling Gemini API:", err);
      return { success: false, error: err.message || "Network request failed" };
    }
  });
