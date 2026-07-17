import { TextToSpeechClient } from "@google-cloud/text-to-speech";

export const TTS_LANGUAGE_CODES = [
  "uk-UA",
  "nl-NL",
  "es-ES",
  "en-US",
  "it-IT",
  "zh-CN",
] as const;

export type TtsLanguageCode = (typeof TTS_LANGUAGE_CODES)[number];

export type TtsSynthesizeOptions = {
  rate?: number;
  pitch?: number;
};

const VOICE_MAP: Record<
  TtsLanguageCode,
  { languageCode: string; name: string }
> = {
  "uk-UA": { languageCode: "uk-UA", name: "uk-UA-Wavenet-A" },
  "nl-NL": { languageCode: "nl-NL", name: "nl-NL-Neural2-A" },
  "es-ES": { languageCode: "es-ES", name: "es-ES-Neural2-A" },
  "en-US": { languageCode: "en-US", name: "en-US-Neural2-A" },
  "it-IT": { languageCode: "it-IT", name: "it-IT-Neural2-A" },
  "zh-CN": { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-A" },
};

let client: TextToSpeechClient | null = null;

export function isGoogleTtsConfigured(): boolean {
  if (process.env.GOOGLE_CREDENTIALS_JSON?.trim()) return true;
  return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim());
}

function getClient(): TextToSpeechClient {
  if (client) return client;

  const jsonCredentials = process.env.GOOGLE_CREDENTIALS_JSON?.trim();
  if (jsonCredentials) {
    client = new TextToSpeechClient({
      credentials: JSON.parse(jsonCredentials) as object,
    });
    return client;
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    throw new Error("Google Cloud TTS is not configured");
  }

  // Application Default Credentials reads GOOGLE_APPLICATION_CREDENTIALS.
  // Avoid fs/path + process.cwd() here — it triggers Turbopack whole-project NFT tracing.
  client = new TextToSpeechClient();
  return client;
}

export function isAllowedTtsLanguage(
  language: string,
): language is TtsLanguageCode {
  return (TTS_LANGUAGE_CODES as readonly string[]).includes(language);
}

export async function synthesizeSpeech(
  text: string,
  languageCode: TtsLanguageCode,
  options: TtsSynthesizeOptions = {},
): Promise<Buffer> {
  const ttsClient = getClient();
  const voice = VOICE_MAP[languageCode];

  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode: voice.languageCode,
      name: voice.name,
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: options.rate ?? 1,
      pitch: options.pitch ?? 0,
    },
  });

  if (!response.audioContent) {
    throw new Error("Google Cloud TTS returned no audio content");
  }

  return Buffer.from(response.audioContent as Uint8Array);
}
