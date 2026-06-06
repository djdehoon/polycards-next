import { existsSync } from "fs";
import { resolve } from "path";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

export const TTS_LANGUAGE_CODES = [
  "uk-UA",
  "nl-NL",
  "es-ES",
  "en-US",
  "it-IT",
] as const;

export type TtsLanguageCode = (typeof TTS_LANGUAGE_CODES)[number];

export type TtsSynthesizeOptions = {
  rate?: number;
  pitch?: number;
};

const VOICE_MAP: Record<TtsLanguageCode, string> = {
  "uk-UA": "uk-UA-Wavenet-A",
  "nl-NL": "nl-NL-Neural2-A",
  "es-ES": "es-ES-Neural2-A",
  "en-US": "en-US-Neural2-A",
  "it-IT": "it-IT-Neural2-A",
};

let client: TextToSpeechClient | null = null;

function getCredentialsPath(): string | null {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!raw) return null;
  const path = resolve(process.cwd(), raw);
  return existsSync(path) ? path : null;
}

export function isGoogleTtsConfigured(): boolean {
  if (process.env.GOOGLE_CREDENTIALS_JSON?.trim()) return true;
  return getCredentialsPath() !== null;
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

  const keyFilename = getCredentialsPath();
  if (!keyFilename) {
    throw new Error("Google Cloud TTS is not configured");
  }

  client = new TextToSpeechClient({ keyFilename });
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
  const voiceName = VOICE_MAP[languageCode];

  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode,
      name: voiceName,
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
