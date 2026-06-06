export type SpeechLanguage = "uk-UA" | "nl-NL";

export type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  if (!("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

export function isSpeechSupported(): boolean {
  return getSynth() !== null;
}

export function stopSpeech(): void {
  const synth = getSynth();
  if (!synth) return;
  synth.cancel();
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

export function speakWord(
  text: string,
  language: SpeechLanguage,
  options: SpeakOptions = {},
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    return Promise.reject(new Error("Cannot speak empty text"));
  }

  const synth = getSynth();
  if (!synth) {
    return Promise.reject(new Error("Speech synthesis is not supported"));
  }

  stopSpeech();

  return loadVoices(synth).then(
    (voices) =>
      new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(trimmed);
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
