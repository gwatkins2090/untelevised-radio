'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { getStationById } from './radio-stations';

export interface SecureAudioPlayerHandle {
  play: () => void;
  pause: () => void;
}

interface SecureAudioPlayerProps {
  stationId: string;
  isActive: boolean;
  isPoweredOn: boolean;
  onPlay?: () => void;
  onError?: (error: string) => void;
  onAudioData?: (dataArray: Uint8Array) => void;
  directStream?: boolean; // Skip proxy and stream directly
}

const SecureAudioPlayer = forwardRef<SecureAudioPlayerHandle, SecureAudioPlayerProps>(
  ({ stationId, isActive, isPoweredOn, onPlay, onError, onAudioData, directStream = false }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    // Expose play/pause methods via ref
    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          // Resume AudioContext if it exists and is suspended
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }

          audioRef.current.play().catch(() => {
            onError?.('Failed to play audio');
          });
        }
      },
      pause: () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    }));

    // Initialize Web Audio API for visualization
    useEffect(() => {
      if (!onAudioData || !audioRef.current) return;

      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Resume audio context if suspended (required for autoplay policies)
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;

        // Animation loop for frequency data
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioData = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            onAudioData(dataArray);
          }
          animationFrameRef.current = requestAnimationFrame(updateAudioData);
        };
        updateAudioData();

      } catch {
        // Silently handle Web Audio API errors
        onError?.('Audio visualization unavailable');
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }, [onAudioData, onError]);

    // Handle play/pause based on isPoweredOn
    useEffect(() => {
      if (!audioRef.current || !isActive) return;

      if (isPoweredOn) {
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise.catch(() => {
            onError?.('Playback failed');
          });
        }
      } else {
        audioRef.current.pause();
      }
    }, [isPoweredOn, isActive, onError, stationId]);

    // Handle errors and retry logic
    const handleError = () => {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          if (audioRef.current) {
            audioRef.current.load();
            if (isPoweredOn) {
              audioRef.current.play().catch(() => {
                // Silent retry
              });
            }
          }
        }, delay);
      } else {
        onError?.('Maximum retry attempts reached');
      }
    };

    // Determine stream URL - use direct stream or proxy
    const station = getStationById(stationId);
    const streamUrl = directStream && station
      ? station.url
      : `/api/stream/${stationId}`;


    return (
      <audio
        ref={audioRef}
        src={streamUrl}
        onPlay={onPlay}
        onError={handleError}
        onCanPlay={() => {
          // Force play when stream is ready
          if (audioRef.current && isPoweredOn) {
            audioRef.current.play().catch(() => {
              // Silent error
            });
          }
        }}
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
    );
  }
);

SecureAudioPlayer.displayName = 'SecureAudioPlayer';

export default SecureAudioPlayer;
