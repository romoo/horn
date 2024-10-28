'use server';

import OpenAI from 'openai';
import { createServerAction } from 'zsa';

import { z } from 'zod';

import { concatArrayBuffers } from '@/lib/utils';

export const convertTextToSpeechAction = createServerAction()
  .input(
    z.object({
      text: z.string(),
      model: z.string(),
      voice: z.string(),
      speed: z.number(),
    }),
  )
  .handler(async ({ input }) => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });

    const splitTextIntoChunks = (text: string, maxLength: number): string[] => {
      const chunks: string[] = [];
      let currentChunk = '';

      text.split(/\s+/).forEach((word) => {
        if ((currentChunk + ' ' + word).length <= maxLength) {
          currentChunk += (currentChunk ? ' ' : '') + word;
        } else {
          chunks.push(currentChunk);
          currentChunk = word;
        }
      });

      if (currentChunk) {
        chunks.push(currentChunk);
      }

      return chunks;
    };

    // Split the input text into chunks
    const textChunks = splitTextIntoChunks(input.text, 4000); // Using 4000 to leave some buffer

    // Process each chunk
    const audioChunks: ArrayBuffer[] = [];
    for (const chunk of textChunks) {
      const mp3 = await openai.audio.speech.create({
        model: input.model,
        voice: input.voice.toLowerCase() as any,
        input: chunk,
        speed: input.speed,
      });

      audioChunks.push(await mp3.arrayBuffer());
    }

    // Combine all audio chunks
    const combinedBuffer = concatArrayBuffers(audioChunks);
    const audioBuffer = Buffer.from(combinedBuffer).toString('base64');

    return { audioBuffer };
  });
