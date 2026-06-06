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
): Promise<void> {
  const synth = getSynth();
  if (!synth) {
    return Promise.reject(new Error("Speech synthesis is not supported"));
  }

  return loadVoices(synth).then(
    (voices) =>
      new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = pickVoice(voices, language);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.lang = language;
        utterance.rate = options.rate ?? 1;
        utterance.pitch = options.pitch ?? 1;
        utterance.volume = options.volume ?? 1;

        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
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

async function speakWithGoogleTts(
  text: string,
  language: SpeechLanguage,
  options: SpeakOptions,
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

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  const data = (await response.json()) as { audio?: string };
  if (!data.audio) {
    throw new Error("TTS API returned no audio");
  }

  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
    currentAudio = audio;
    audio.volume = options.volume ?? 1;

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null;
      reject(new Error("Failed to play audio"));
    };

    void audio.play().catch((err: unknown) => {
      if (currentAudio === audio) currentAudio = null;
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
    throw new Error("Cannot speak empty text");
  }

  stopSpeech();

  try {
    await speakWithGoogleTts(trimmed, language, options);
  } catch (error) {
    console.warn("[audio] Google TTS unavailable, falling back to Web Speech:", error);
    await speakWithWebSpeech(trimmed, language, options);
  }
}
