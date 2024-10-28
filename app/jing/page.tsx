'use client';

import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TTS } from '@/components/tts-button';

const Page = () => {
  const [message, setMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const coverToAudio = async () => {
    const body = {
      model: 'tts-1',
      message,
      voice: 'alloy',
      speed: 1,
    };
    const res = await fetch('/api/openai/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    console.log('res', res);
    const audioBlob = await res.blob();
    const url = URL.createObjectURL(audioBlob);
    console.log('url', url);
    // setAudioUrl(url);

    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.onended = () => {
      // setIsVoiceToTextPlaying(false)
    };
    audioRef.current.play();
  };
  return (
    <div className=" max-w-lg mx-auto px-4">
      <h1 className=" text-lg text-center p-10">Jing&rsquo;s Tool</h1>
      <div className="grid w-full gap-2 mb-3">
        <Textarea
          value={message}
          placeholder="输入需要转换的语音"
          onChange={(e) => setMessage(e.target.value)}
        />
        {/*
        <Button onClick={coverToAudio}>转换语音</Button>
        */}
      </div>

      <TTS text={message} />
    </div>
  );
};

export default Page;
