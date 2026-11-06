import React, { useRef, useEffect } from 'react';
import { Image as ImageIcon, Download, Sparkles, RefreshCw } from 'lucide-react';
import { StudioConfig } from '../types';
import { drawThumbnailCanvas } from '../utils/canvasRenderer';

interface ThumbnailTabProps {
  config: StudioConfig;
  onUpdateConfig: (partial: Partial<StudioConfig>) => void;
  bgImage: HTMLImageElement | null;
  lyricsTitle: string;
}

export const ThumbnailTab: React.FC<ThumbnailTabProps> = ({
  config,
  onUpdateConfig,
  bgImage,
  lyricsTitle,
}) => {
  const thumbCanvasRef = useRef<HTMLCanvasElement>(null);

  const redraw = () => {
    if (thumbCanvasRef.current) {
      drawThumbnailCanvas({
        canvas: thumbCanvasRef.current,
        config,
        title: config.songTitle || lyricsTitle || 'উজাড় করে দিয়েছিলাম',
        artist: config.artistName || 'Tanvir Rahman Rony',
        bgImage,
      });
    }
  };

  useEffect(() => {
    redraw();
  }, [config.songTitle, config.artistName, config.font, config.glowColor, bgImage, lyricsTitle]);

  const handleDownload = (format: 'jpg' | 'png') => {
    const canvas = thumbCanvasRef.current;
    if (!canvas) return;
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = 0.95;
    const url = canvas.toDataURL(mime, quality);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LyricCraft_Thumbnail_1280x720.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">১২৮০×৭২০ ইউটিউব থাম্বনেইল মেকার</h2>
              <p className="text-xs text-slate-400">
                Bug #4 Solved: বর্তমান ব্যাকগ্রাউন্ড + গানের টাইটেল + আর্টিস্ট নাম দিয়ে হাই-কোয়ালিটি থাম্বনেইল JPG
              </p>
            </div>
          </div>

          <button
            onClick={redraw}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#162148] hover:bg-[#202e60] text-slate-300 text-xs border border-[#27386c] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              গানের মূল টাইটেল (Title)
            </label>
            <input
              type="text"
              value={config.songTitle}
              onChange={(e) => onUpdateConfig({ songTitle: e.target.value })}
              placeholder="গানের নাম লিখুন (যেমন: উজাড় করে দিয়েছিলাম)"
              className="w-full bg-[#080d21] border border-[#202d5c] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-['Hind_Siliguri']"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              শিল্পী বা চ্যানেলের নাম (Artist / Channel)
            </label>
            <input
              type="text"
              value={config.artistName}
              onChange={(e) => onUpdateConfig({ artistName: e.target.value })}
              placeholder="আর্টিস্ট বা চ্যানেলের নাম (যেমন: Tanvir Rahman Rony)"
              className="w-full bg-[#080d21] border border-[#202d5c] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-['Hind_Siliguri']"
            />
          </div>
        </div>

        {/* Live Canvas Preview */}
        <div className="w-full aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden bg-black shadow-2xl border border-[#1e2a56]">
          <canvas ref={thumbCanvasRef} className="w-full h-full block" />
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#1b254a]">
          <button
            onClick={() => handleDownload('jpg')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-500/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>১২৮০×৭২০ JPG ডাউনলোড (YouTube Standard)</span>
          </button>

          <button
            onClick={() => handleDownload('png')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs bg-[#172248] hover:bg-[#202e60] text-cyan-300 border border-cyan-500/40 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>পিএনজি (PNG) ডাউনলোড</span>
          </button>
        </div>
      </div>
    </div>
  );
};
