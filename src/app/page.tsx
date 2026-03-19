'use client';

import Image from "next/image";
import { useRef, useState } from "react";
import SecureAudioPlayer, { type SecureAudioPlayerHandle } from "@/components/secureplayer";

export default function Home() {
  const playerRef = useRef<SecureAudioPlayerHandle>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(128));
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      {/* CRT Screen Effects Layer */}
      <div className="noise-overlay"></div>
      <div className="signal-dropout"></div>
      <div className="signal-dropout"></div>
      <div className="signal-dropout"></div>

      {/* Giant Anarchist Ⓐ Background SVG */}
      <div className="anarchist-bg" aria-hidden="true">
        <Image
          src="/anarchist-a.svg"
          alt=""
          fill
          priority
          draggable={false}
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* HUD Corner Brackets */}
      <div className="hud-corner top-left">⌜</div>
      <div className="hud-corner top-right">⌝</div>
      <div className="hud-corner bottom-left">⌞</div>
      <div className="hud-corner bottom-right">⌟</div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Broadcast Status Bar */}
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="broadcast-status">
            ⚠ UNAUTHORIZED BROADCAST ⚠
          </div>
        </div>

        {/* Signal Readout */}
        <div className="fixed top-20 right-8 z-50 text-right">
          <div className="signal-readout">SIGNAL: 314.7 MHz</div>
          <div className="signal-readout opacity-80">UPTIME: 04:17:33</div>
          <div className="signal-readout opacity-60">ENCRYPT: AES-256</div>
        </div>

        {/* Main Terminal - RADIO PLAYER FOCUSED */}
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-5xl">

            {/* Station Identity - Compact */}
            <div className="text-center mb-12">
              <div className="inline-block border-2 border-phosphor px-6 py-2 mb-6">
                <p className="terminal-text text-xs phosphor-glow tracking-widest">
                  PIRATE TRANSMISSION DETECTED
                </p>
              </div>

              <h1 className="text-7xl md:text-9xl display-text phosphor-glow leading-none mb-4 jitter-anim">
                UNTELEVISED
              </h1>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-0.5 w-20 bg-phosphor shadow-[0_0_10px_var(--accent2-400)]"></div>
                <p className="text-3xl display-text phosphor-glow-cyan">RADIO</p>
                <div className="h-0.5 w-20 bg-phosphor shadow-[0_0_10px_var(--accent2-400)]"></div>
              </div>

              <p className="terminal-text text-muted text-sm tracking-wider">
                RESISTANCE THROUGH SOUND
              </p>
            </div>

            {/* RADIO PLAYER - HERO ELEMENT */}
            <div className="terminal-panel border-4 border-phosphor p-8 md:p-12 mb-8 hover:border-phosphor-bright transition-all">

              {/* Player Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-phosphor/30">
                <div>
                  <h2 className="display-text text-2xl phosphor-glow mb-1">LIVE STREAM</h2>
                  <p className="mono-text text-xs text-muted">PLAYER_v2.4.7</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-alert rounded-full animate-pulse shadow-[0_0_15px_var(--ruby-400)]"></div>
                  <span className="terminal-text phosphor-glow-alert text-xs uppercase tracking-widest">
                    ON AIR
                  </span>
                </div>
              </div>

              {/* Secure Audio Player - Integrated */}
              <SecureAudioPlayer
                ref={playerRef}
                stationId="1"
                isActive={true}
                isPoweredOn={isPlaying}
                directStream={true}
                onPlay={() => setError(null)}
                onError={(errorMsg) => {
                  setError(errorMsg);
                  setIsPlaying(false);
                }}
                onAudioData={setAudioData}
              />

              {/* Player Controls */}
              <div className="bg-dark-900/80 border-2 border-phosphor/30 p-8 mb-8">
                <div className="flex items-center justify-center gap-6">

                  {/* Play/Pause Button */}
                  <button
                    onClick={() => {
                      if (isPlaying) {
                        playerRef.current?.pause();
                        setIsPlaying(false);
                      } else {
                        if (!playerRef.current) {
                          setError('Audio player not initialized');
                          return;
                        }
                        playerRef.current.play();
                        setIsPlaying(true);
                      }
                    }}
                    className="group relative"
                  >
                    <div className={`
                      w-24 h-24 border-4
                      ${isPlaying ? 'border-alert bg-alert/10' : 'border-phosphor bg-phosphor/10'}
                      hover:bg-phosphor/20 transition-all duration-300
                      flex items-center justify-center
                      ${isPlaying ? 'shadow-[0_0_30px_var(--ruby-400)]' : 'shadow-[0_0_30px_var(--accent2-400)]'}
                    `}>
                      {isPlaying ? (
                        <div className="flex gap-2">
                          <div className="w-2 h-8 bg-alert"></div>
                          <div className="w-2 h-8 bg-alert"></div>
                        </div>
                      ) : (
                        <div className="w-0 h-0 border-l-[16px] border-l-phosphor border-y-[12px] border-y-transparent ml-1"></div>
                      )}
                    </div>
                    <p className={`
                      mono-text text-xs mt-3 uppercase tracking-widest text-center
                      ${isPlaying ? 'text-alert' : 'text-phosphor'}
                    `}>
                      {isPlaying ? 'PAUSE' : 'PLAY'}
                    </p>
                  </button>

                  {/* Audio Visualizer */}
                  <div className="flex-1 flex items-end justify-center gap-1 h-24 bg-dark-800/50 border border-phosphor/20 px-4">
                    {Array.from(audioData).slice(0, 64).map((value, i) => {
                      // Boost lower frequencies and create more dynamic range
                      const boosted = Math.min(255, value * 1.5);
                      const height = Math.max(3, (boosted / 255) * 100);

                      return (
                        <div
                          key={i}
                          className="w-1 bg-phosphor"
                          style={{
                            height: `${height}%`,
                            opacity: isPlaying ? (0.6 + (value / 255) * 0.4) : 0.2,
                            boxShadow: isPlaying && value > 50
                              ? `0 0 ${Math.min(10, value / 25)}px var(--accent2-400)`
                              : 'none',
                            transition: 'height 50ms ease-out, opacity 50ms ease-out'
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Status Indicator */}
                  <div className="text-center">
                    <div className={`
                      w-4 h-4 rounded-full mb-2
                      ${isPlaying ? 'bg-alert animate-pulse shadow-[0_0_15px_var(--ruby-400)]' : 'bg-muted/30'}
                    `}></div>
                    <p className="mono-text text-xs text-muted uppercase tracking-widest">
                      {isPlaying ? 'LIVE' : 'IDLE'}
                    </p>
                  </div>

                </div>

                {/* Now Playing Info */}
                {isPlaying && !error && (
                  <div className="mt-6 pt-6 border-t border-phosphor/20 text-center">
                    <p className="terminal-text text-phosphor text-sm mb-1">
                      NOW BROADCASTING
                    </p>
                    <p className="mono-text text-muted text-xs">
                      FREQUENCY: 314.7 MHz • UNTELEVISED RADIO
                    </p>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mt-6 pt-6 border-t border-alert/30 text-center">
                    <p className="terminal-text text-alert text-sm mb-1 phosphor-glow-alert">
                      ⚠ STREAM ERROR
                    </p>
                    <p className="mono-text text-muted text-xs">
                      {error}
                    </p>
                    <button
                      onClick={() => {
                        setError(null);
                        setIsPlaying(false);
                      }}
                      className="mt-3 px-4 py-2 border border-phosphor/30 text-phosphor hover:bg-phosphor/10 mono-text text-xs transition-all"
                    >
                      DISMISS
                    </button>
                  </div>
                )}
              </div>

              {/* Player Technical Info */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-dark-800/50 border border-phosphor/20 p-3">
                  <p className="mono-text text-phosphor text-[10px] mb-1 tracking-widest">BITRATE</p>
                  <p className="terminal-text text-foreground text-sm">320kbps</p>
                </div>
                <div className="bg-dark-800/50 border border-phosphor/20 p-3">
                  <p className="mono-text text-phosphor text-[10px] mb-1 tracking-widest">FORMAT</p>
                  <p className="terminal-text text-foreground text-sm">MP3/OGG</p>
                </div>
                <div className="bg-dark-800/50 border border-phosphor/20 p-3">
                  <p className="mono-text text-phosphor text-[10px] mb-1 tracking-widest">LATENCY</p>
                  <p className="terminal-text text-foreground text-sm">~2.3s</p>
                </div>
              </div>
            </div>

            {/* Quick Schedule - Compact */}
            <div className="grid md:grid-cols-4 gap-3 mb-8">
              <div className="terminal-panel border-l-4 border-phosphor pl-4 py-3">
                <p className="display-text text-phosphor text-lg">06:00</p>
                <p className="terminal-text text-foreground text-xs">MORNING RESISTANCE</p>
              </div>
              <div className="terminal-panel border-l-4 border-cyan pl-4 py-3">
                <p className="display-text text-cyan text-lg">12:00</p>
                <p className="terminal-text text-foreground text-xs">VOICES UNFILTERED</p>
              </div>
              <div className="terminal-panel border-l-4 border-gold pl-4 py-3">
                <p className="display-text text-gold text-lg">18:00</p>
                <p className="terminal-text text-foreground text-xs">SOUND SYSTEM</p>
              </div>
              <div className="terminal-panel border-l-4 border-alert pl-4 py-3">
                <p className="display-text text-alert text-lg">21:00</p>
                <p className="terminal-text text-foreground text-xs">LATE NIGHT LIBERATION</p>
              </div>
            </div>

            {/* Mission - Single Line */}
            <div className="text-center">
              <p className="terminal-text text-muted text-sm max-w-3xl mx-auto leading-relaxed">
                Independent community radio broadcasting truth and resistance.
                <strong className="text-phosphor"> No corporate sponsors. No censorship.</strong>
                Supported entirely by the community we serve.
              </p>
            </div>

          </div>
        </main>

        {/* Footer - Minimal */}
        <footer className="border-t border-phosphor/30 py-6 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">

              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-phosphor rounded-full animate-pulse"></div>
                <span className="display-text text-lg phosphor-glow">UNTELEVISED</span>
                <span className="mono-text text-muted text-xs">
                  <span className="text-cyan">{'//'}</span> {new Date().getFullYear()}
                </span>
              </div>

              <div className="flex items-center gap-4 mono-text text-xs text-muted">
                <span>Independent</span>
                <span className="opacity-30">•</span>
                <span>Non-profit</span>
                <span className="opacity-30">•</span>
                <span>Ad-free</span>
              </div>

              <p className="mono-text text-[10px] text-muted/50 tracking-wider">
                [ THE REVOLUTION WILL NOT BE TELEVISED ]
              </p>

            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
