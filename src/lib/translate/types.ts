export type Lang = "th" | "karaoke";

export interface TranslateRequest {
  text: string;
  from: Lang;
  to: Lang;
}
