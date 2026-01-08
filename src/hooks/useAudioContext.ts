import { useRef, useCallback } from 'react';
import * as Tone from 'tone';

export const useAudioContext = () => {
  const isStarted = useRef(false);

  const ensureAudioContext = useCallback(async () => {
    if (!isStarted.current) {
      await Tone.start();
      isStarted.current = true;
    }
  }, []);

  return { ensureAudioContext };
};
