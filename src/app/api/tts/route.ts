import { NextResponse } from "next/server";
import {
  isAllowedTtsLanguage,
  isGoogleTtsConfigured,
  synthesizeSpeech,
} from "@/lib/tts/google-cloud";

const MAX_TEXT_LENGTH = 500;

type TtsRequestBody = {
  text?: unknown;
  language?: unknown;
  rate?: unknown;
  pitch?: unknown;
};

export async function POST(request: Request) {
  if (!isGoogleTtsConfigured()) {
    return NextResponse.json(
      { error: "Text-to-speech is not configured" },
      { status: 503 },
    );
  }

  let body: TtsRequestBody;
  try {
    body = (await request.json()) as TtsRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }

  const language = typeof body.language === "string" ? body.language : "";
  if (!isAllowedTtsLanguage(language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const rate = typeof body.rate === "number" ? body.rate : undefined;
  const pitch = typeof body.pitch === "number" ? body.pitch : undefined;

  try {
    const audioBuffer = await synthesizeSpeech(text, language, { rate, pitch });
    return NextResponse.json({
      audio: audioBuffer.toString("base64"),
    });
  } catch (error) {
    console.error("[tts] synthesis failed:", error);
    return NextResponse.json(
      { error: "Speech synthesis failed" },
      { status: 503 },
    );
  }
}
