/**
 * Native text-to-speech for commentary (Web Speech API — no keys, no cost).
 * Prefers an Odia/Oriya voice when the device has one, else English.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

function pickVoice(): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    return (
      voices.find((v) => /^or([-_]|$)/i.test(v.lang)) ||
      voices.find((v) => /oriya|odia/i.test(v.name)) ||
      voices.find((v) => /^en([-_]|$)/i.test(v.lang)) ||
      voices[0]
    );
  } catch {
    return null;
  }
}

export function useSpeech() {
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);

  // Warm up the (async) voice list; stop speech on unmount.
  useEffect(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.getVoices();
    } catch {
      /* ignore */
    }
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [supported]);

  const stop = useCallback(() => {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string) => {
      if (!supported || !text.trim()) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
        const voice = pickVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }
        utterance.rate = 1;
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
        setSpeakingId(id);
        window.speechSynthesis.speak(utterance);
      } catch {
        setSpeakingId(null);
      }
    },
    [supported]
  );

  return { supported, speakingId, auto, setAuto, speak, stop };
}
