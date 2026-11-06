import React, { useRef } from 'react';
import { Image as ImageIcon, Video, CloudRain, Sparkles, Sliders } from 'lucide-react';
import { StudioConfig, BackgroundType } from '../types';

interface BackgroundTabProps {
  config: StudioConfig;
  onUpdateConfig: (partial: Partial<StudioConfig>) => void;
  onImageUpload: (file: File) => void;
  onVideoUpload: (file: File) => void;
  hasCustomImage: boolean;
  hasCustomVideo: boolean;
}

export const BackgroundTab: React.FC<BackgroundTabProps> = ({
  config,
  onUpdateConfig,
  onImageUpload,
  onVideoUpload,
  hasCustomImage,
  hasCustomVideo,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {/* Background Mode & Upload (BUG #5 FIXED) */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">ব্যাকগ্রাউন্ড ভিডিও ও ছবি সাপোর্ট</h2>
            <p className="text-xs text-slate-400">
              Bug #5 Solved: নিজের ভিডিও বা ছবি আপলোড করে পেছনে ব্যাকগ্রাউন্ড হিসেবে চালান (১০০% অফলাইন)
            </p>
          </div>
        </div>

        {/* Preset Modes */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <button
            onClick={() => onUpdateConfig({ bgType: 'rain' })}
            className={`p-3 rounded-xl border text-center transition ${
              config.bgType === 'rain'
                ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200'
                : 'border-[#1e2a58] bg-[#090d20] text-slate-300 hover:bg-[#101738]'
            }`}
          >
            <CloudRain className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
            <span className="text-xs font-bold block">🌧 বৃষ্টি মোড</span>
          </button>

          <button
            onClick={() => onUpdateConfig({ bgType: 'bokeh' })}
            className={`p-3 rounded-xl border text-center transition ${
              config.bgType === 'bokeh'
                ? 'border-pink-500 bg-pink-500/15 text-pink-200'
                : 'border-[#1e2a58] bg-[#090d20] text-slate-300 hover:bg-[#101738]'
            }`}
          >
            <Sparkles className="w-5 h-5 mx-auto mb-1 text-pink-400" />
            <span className="text-xs font-bold block">✨ বোকেহ কণা</span>
          </button>

          <button
            onClick={() => onUpdateConfig({ bgType: 'gradient' })}
            className={`p-3 rounded-xl border text-center transition ${
              config.bgType === 'gradient'
                ? 'border-purple-500 bg-purple-500/15 text-purple-200'
                : 'border-[#1e2a58] bg-[#090d20] text-slate-300 hover:bg-[#101738]'
            }`}
          >
            <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400" />
            <span className="text-xs font-bold block">🌌 গ্রেডিয়েন্ট</span>
          </button>
        </div>

        {/* Upload Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Image Upload */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(file);
            }}
          />
          <div
            onClick={() => imageInputRef.current?.click()}
            className={`p-4 rounded-xl border-2 border-dashed cursor-pointer text-center transition ${
              config.bgType === 'image' && hasCustomImage
                ? 'border-pink-500 bg-pink-500/10'
                : 'border-[#223060] bg-[#090d22] hover:border-cyan-400/60 hover:bg-[#0d1433]'
            }`}
          >
            <ImageIcon className="w-6 h-6 text-pink-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-white">🖼️ ছবি আপলোড করুন</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {hasCustomImage ? '✅ কাস্টম ছবি লোড হয়েছে' : 'JPG, PNG, WebP ফটো'}
            </p>
          </div>

          {/* Video Upload */}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onVideoUpload(file);
            }}
          />
          <div
            onClick={() => videoInputRef.current?.click()}
            className={`p-4 rounded-xl border-2 border-dashed cursor-pointer text-center transition ${
              config.bgType === 'video' && hasCustomVideo
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-[#223060] bg-[#090d22] hover:border-cyan-400/60 hover:bg-[#0d1433]'
            }`}
          >
            <Video className="w-6 h-6 text-cyan-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-white">🎥 ব্যাকগ্রাউন্ড ভিডিও আপলোড</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {hasCustomVideo ? '✅ ব্যাকগ্রাউন্ড ভিডিও অ্যাক্টিভ (লুপ চলছে)' : 'MP4, WebM ভিডিও'}
            </p>
          </div>
        </div>

        {/* Dark Overlay Slider & Blur Slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-[#1b254a]">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                ডার্ক ওভারলে (Darkness Slider)
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                {config.darkOverlay}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={1}
              value={config.darkOverlay}
              onChange={(e) => onUpdateConfig({ darkOverlay: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-400 h-2 bg-[#172045] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              ভিডিও বা ছবির ওপর হালকা অন্ধকার আভা দিলে লিরিক্স স্পষ্ট ও চকচকে ফুটে ওঠে।
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                ব্যাকগ্রাউন্ড ব্লার (Blur Slider)
              </label>
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                {config.bgBlur}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={1}
              value={config.bgBlur}
              onChange={(e) => onUpdateConfig({ bgBlur: parseInt(e.target.value, 10) })}
              className="w-full accent-purple-400 h-2 bg-[#172045] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              ব্যাকগ্রাউন্ড ছবিকে ব্লার করে টেক্সটে সিনেমাটিক গভীরতা তৈরি করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
