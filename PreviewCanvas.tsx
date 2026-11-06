import React, { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Smartphone, Monitor, Square } from 'lucide-react';
import { StudioConfig, LyricLine, AspectRatioType } from '../types';
import {
  drawSceneFrame,
  createRainParticles,
  createBokehParticles,
  Particle,
} from '../utils/canvasRenderer';

interface PreviewCanvasProps {
  config: StudioConfig;
  lyrics: LyricLine[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onRatioChange: (ratio: AspectRatioType) => void;
  bgImage: HTMLImageElement | null;
  bgVideo: HTMLVideoElement | null;
  bass: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  config,
  lyrics,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onRatioChange,
  bgImage,
  bgVideo,
  bass,
  canvasRef,
}) => {
  const rainRef = useRef<Particle[]>(createRainParticles(120, 1280, 720));
  const bokehRef = useRef<Particle[]>(createBokehParticles(30, 1280, 720));

  // Determine width & height based on aspect ratio
  const getDims = () => {
    if (config.ratio === '9:16') return { width: 720, height: 1280, maxW: '340px', aspect: '9/16' };
    if (config.ratio === '1:1') return { width: 1080, height: 1080, maxW: '460px', aspect: '1/1' };
    return { width: 1280, height: 720, maxW: '640px', aspect: '16/9' };
  };

  const { width, height, maxW, aspect } = getDims();

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const render = () => {
      drawSceneFrame({
        ctx,
        width,
        height,
        currentTime,
        duration,
        bass,
        config,
        lyrics,
        bgImage,
        bgVideo,
        rainParticles: rainRef.current,
        bokehParticles: bokehRef.current,
      });
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [width, height, currentTime, duration, bass, config, lyrics, bgImage, bgVideo, canvasRef]);

  // Format seconds to mm:ss.s
  const formatTime = (sec: number) => {
    if (!isFinite(sec) || sec < 0) return '0:00.0';
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(1);
    return `${m}:${s.padStart(4, '0')}`;
  };

  return (
    <div className="bg-[#0b1026] border border-[#1e2954] rounded-2xl p-3.5 shadow-xl">
      {/* Canvas container */}
      <div
        className="mx-auto rounded-xl overflow-hidden bg-black shadow-2xl relative transition-all"
        style={{ maxWidth: maxW, aspectRatio: aspect }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Media Scrubber & Controls */}
      <div className="mt-3.5 space-y-2">
        <div className="flex items-center gap-2 py-1">
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full accent-pink-500 h-2 sm:h-1.5 bg-[#172045] rounded-lg cursor-pointer touch-pan-x"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Play/Pause & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 transition shadow-md shadow-cyan-500/20"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" /> <span>পজ</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> <span>প্লে</span>
                </>
              )}
            </button>
            <button
              onClick={() => onSeek(0)}
              className="p-1.5 rounded-xl bg-[#172248] hover:bg-[#202e60] text-slate-300 border border-[#27386c] transition"
              title="শুরু থেকে শুরু করুন"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Timecode display */}
          <div className="text-xs font-mono font-bold text-cyan-300 bg-[#070b1a] px-2.5 py-1 rounded-lg border border-[#1b254a]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Ratio Buttons */}
          <div className="flex items-center gap-1.5 bg-[#070b1a] p-1 rounded-xl border border-[#1b254a]">
            <button
              onClick={() => onRatioChange('16:9')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                config.ratio === '16:9'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9</span>
            </button>
            <button
              onClick={() => onRatioChange('9:16')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                config.ratio === '9:16'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 রিলস</span>
            </button>
            <button
              onClick={() => onRatioChange('1:1')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                config.ratio === '1:1'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>1:1</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
