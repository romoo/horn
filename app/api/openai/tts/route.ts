import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const { message, voice, model, speed, apiKey } = await req.json();
  const openaiTTSKey = apiKey || process.env.OPENAI_KEY;

  if (!message || !voice || !model || !openaiTTSKey) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 },
    );
  }

  try {
    const openai = new OpenAI({ apiKey: openaiTTSKey });

    const mp3 = await openai.audio.speech.create({
      model: model,
      voice: 'alloy',
      input: message,
      speed: speed,
    });

    // const buffer = Buffer.from(await mp3.arrayBuffer());

    // Convert the response to a ReadableStream
    const stream = mp3.body as unknown as ReadableStream;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Error in text-to-speech API:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 },
    );
  }
}
