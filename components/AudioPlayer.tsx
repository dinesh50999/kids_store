import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';

// Helper functions for audio decoding, as per Gemini documentation
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const SpeakerOnIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
  </svg>
);

const SpeakerOffIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.94 12l-2.22 2.22a.75.75 0 101.06 1.06L20 13.06l2.22 2.22a.75.75 0 101.06-1.06L21.06 12l2.22-2.22a.75.75 0 10-1.06-1.06L20 10.94l-2.22-2.22z" />
  </svg>
);

interface AudioPlayerProps {
  textToRead: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ textToRead }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  const handlePlay = useCallback(async () => {
    if (isLoading || isPlaying) return;

    setIsLoading(true);
    setError(null);
    
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const gainNode = audioContextRef.current.createGain();
        gainNode.connect(audioContextRef.current.destination);
        gainNodeRef.current = gainNode;
    }
    const audioContext = audioContextRef.current;
    const gainNode = gainNodeRef.current;

    try {
      const base64Audio = await generateSpeech(textToRead);
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      if(gainNode) {
          source.connect(gainNode);
      } else {
          source.connect(audioContext.destination);
      }
      
      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };
      
      source.start();
      sourceNodeRef.current = source;

      setIsPlaying(true);

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while generating audio.');
    } finally {
        setIsLoading(false);
    }
  }, [textToRead, isLoading, isPlaying]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : 1, audioContextRef.current.currentTime);
    }
  }, [isMuted]);

  const toggleMute = () => {
      setIsMuted(prev => !prev);
  }

  const getButtonText = () => {
    if (isLoading) return 'Generating Audio...';
    if (isPlaying) return 'Playing Story...';
    return 'Read Story Aloud';
  };

  return (
    <div className="my-6 text-center">
        <div className="flex items-center justify-center gap-4">
            <button
                onClick={handlePlay}
                disabled={isLoading || isPlaying}
                className="bg-yellow-400 text-yellow-900 font-bold py-3 px-8 rounded-full hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 15.858a5 5 0 010-7.072m2.828 9.9a9 9 0 010-12.728M12 12h.01" />
            </svg>
                {getButtonText()}
            </button>
            <button
                onClick={toggleMute}
                disabled={!isPlaying && !isLoading && !sourceNodeRef.current}
                className="p-3 rounded-full bg-purple-200 text-purple-700 hover:bg-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 transition-all duration-300 ease-in-out disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
            </button>
        </div>
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
    </div>
  );
};

export default AudioPlayer;