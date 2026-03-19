'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

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
}

const SecureAudioPlayer = forwardRef<SecureAudioPlayerHandle, SecureAudioPlayerProps>(
  ({ stationId, isActive, isPoweredOn, onPlay, onError, onAudioData }, ref) => {
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
          audioRef.current.play().catch(err => {
            console.error('Play error:', err);
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

      } catch (err) {
        console.error('Web Audio API error:', err);
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }, [onAudioData]);

    // Handle play/pause based on isPoweredOn
    useEffect(() => {
      if (!audioRef.current || !isActive) return;

      if (isPoweredOn) {
        console.log('Attempting to play stream from:', `/api/stream/${stationId}`);
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Playback started successfully');
            })
            .catch(err => {
              console.error('Play error:', err);
              onError?.(`Playback failed: ${err.message}`);
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
              audioRef.current.play().catch(err => {
                console.error('Retry play error:', err);
              });
            }
          }
        }, delay);
      } else {
        onError?.('Maximum retry attempts reached');
      }
    };

    return (
      <audio
        ref={audioRef}
        src={`/api/stream/${stationId}`}
        onPlay={() => {
          console.log('Audio element fired onPlay event');
          onPlay?.();
        }}
        onError={(e) => {
          console.error('Audio element error event:', e);
          handleError();
        }}
        onLoadStart={() => console.log('Audio loading started')}
        onLoadedMetadata={() => console.log('Metadata loaded')}
        onCanPlay={() => {
          console.log('Audio can play - attempting playback');
          // Force play when stream is ready
          if (audioRef.current && isPoweredOn) {
            audioRef.current.play().catch(err => console.error('Auto-play after canplay failed:', err));
          }
        }}
        onWaiting={() => console.log('Audio buffering...')}
        onPlaying={() => console.log('Audio is now playing!')}
        onStalled={() => console.log('Stream stalled')}
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
    );
  }
);

SecureAudioPlayer.displayName = 'SecureAudioPlayer';

export default SecureAudioPlayer;
