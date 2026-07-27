export type SpeechLanguage =
  | "uk-UA"
  | "nl-NL"
  | "es-ES"
  | "en-US"
  | "it-IT"
  | "zh-CN";

export type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

let currentAudio: HTMLAudioElement | null = null;
let speakGeneration = 0;

const BENIGN_SPEECH_ERRORS = new Set(["interrupted", "canceled"]);

export function isBenignSpeechError(error: string): boolean {
  return BENIGN_SPEECH_ERRORS.has(error.toLowerCase());
}

export class SpeakAbortError extends Error {
  constructor() {
    super("Speech aborted");
    this.name = "SpeakAbortError";
  }
}

export function isSpeakAbortError(err: unknown): boolean {
  if (err instanceof SpeakAbortError) return true;
  if (err instanceof Error) {
    const match = err.message.match(/Speech synthesis error: (\w+)/i);
    if (match && isBenignSpeechError(match[1])) return true;
  }
  return false;
}

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  if (!("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return true;
}

export function stopSpeech(): void {
  const synth = getSynth();
  if (synth) synth.cancel();

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function loadVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const existing = synth.getVoices();
  if (existing.length > 0) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    const onVoicesChanged = () => {
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", onVoicesChanged);
    synth.getVoices();
  });
}

function languagePrefix(language: SpeechLanguage): string {
  return language.split("-")[0].toLowerCase();
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  language: SpeechLanguage,
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;

  const normalizedLang = language.toLowerCase();
  const exact = voices.find((v) => v.lang.toLowerCase() === normalizedLang);
  if (exact) return exact;

  const prefix = languagePrefix(language);
  const byPrefix = voices.find((v) => {
    const lang = v.lang.toLowerCase();
    return lang.startsWith(`${prefix}-`) || lang === prefix;
  });
  if (byPrefix) return byPrefix;

  return voices[0];
}

function speakWithWebSpeech(
  text: string,
  language: SpeechLanguage,
  options: SpeakOptions,
  generation: number,
): Promise<void> {
  const synth = getSynth();
  if (!synth) {
    return Promise.reject(new Error("Speech synthesis is not supported"));
  }

  return loadVoices(synth).then(
    (voices) =>
      new Promise<void>((resolve, reject) => {
        if (generation !== speakGeneration) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = pickVoice(voices, language);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.lang = language;
        utterance.rate = options.rate ?? 1;
        utterance.pitch = options.pitch ?? 1;
        utterance.volume = options.volume ?? 1;

        utterance.onend = () => {
          if (generation !== speakGeneration) {
            resolve();
            return;
          }
          resolve();
        };
        utterance.onerror = (event) => {
          if (generation !== speakGeneration) {
            resolve();
            return;
          }
          if (event.error && isBenignSpeechError(event.error)) {
            resolve();
            return;
          }
          reject(
            new Error(
              event.error
                ? `Speech synthesis error: ${event.error}`
                : "Speech synthesis failed",
            ),
          );
        };

        synth.speak(utterance);
      }),
  );
}

export class SpeakError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpeakError";
  }
}

/** User-facing Dutch message when pronunciation cannot play. */
export const SPEAK_FAILED_MESSAGE =
  "Uitspraak lukte niet. Probeer het opnieuw.";

async function speakWithGoogleTts(
  text: string,
  language: SpeechLanguage,
  options: SpeakOptions,
  generation: number,
): Promise<void> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      language,
      rate: options.rate,
      pitch: options.pitch,
    }),
  });

  if (generation !== speakGeneration) {
    return;
  }

  if (!response.ok) {
    let detail = `TTS API error: ${response.status}`;
    try {
      const errBody = (await response.json()) as { error?: string };
      if (errBody.error) {
        detail = `TTS API error: ${response.status} (${errBody.error})`;
        if (
          response.status === 503 &&
          errBody.error.toLowerCase().includes("not configured")
        ) {
          console.error(
            "[audio] Google TTS is not configured on this environment. Set GOOGLE_CREDENTIALS_JSON (Vercel) or GOOGLE_APPLICATION_CREDENTIALS (local).",
          );
        }
      }
    } catch {
      // ignore JSON parse errors for error body
    }
    throw new Error(detail);
  }

  const data = (await response.json()) as { audio?: string };
  if (generation !== speakGeneration) {
    return;
  }
  if (!data.audio) {
    throw new Error("TTS API returned no audio");
  }

  return new Promise<void>((resolve, reject) => {
    if (generation !== speakGeneration) {
      resolve();
      return;
    }

    const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
    currentAudio = audio;
    audio.volume = options.volume ?? 1;

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      if (generation !== speakGeneration) {
        resolve();
        return;
      }
      resolve();
    };
    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null;
      if (generation !== speakGeneration) {
        resolve();
        return;
      }
      reject(new Error("Failed to play audio"));
    };

    void audio.play().catch((err: unknown) => {
      if (currentAudio === audio) currentAudio = null;
      if (generation !== speakGeneration) {
        resolve();
        return;
      }
      reject(err instanceof Error ? err : new Error("Failed to play audio"));
    });
  });
}

export async function speakWord(
  text: string,
  language: SpeechLanguage,
  options: SpeakOptions = {},
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new SpeakError("Cannot speak empty text");
  }

  const generation = ++speakGeneration;
  stopSpeech();
  await waitForNextFrame();

  if (generation !== speakGeneration) {
    return;
  }

  try {
    await speakWithGoogleTts(trimmed, language, options, generation);
  } catch (error) {
    if (generation !== speakGeneration) {
      return;
    }
    console.warn(
      "[audio] Google TTS unavailable, falling back to Web Speech:",
      error,
    );
    try {
      await speakWithWebSpeech(trimmed, language, options, generation);
    } catch (fallbackError) {
      if (generation !== speakGeneration || isSpeakAbortError(fallbackError)) {
        return;
      }
      console.error("[audio] Web Speech fallback failed:", fallbackError);
      throw new SpeakError(SPEAK_FAILED_MESSAGE);
    }
  }
}
