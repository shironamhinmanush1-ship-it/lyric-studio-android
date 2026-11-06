import React, { useRef } from 'react';
import { Palette, Sparkles, Type, Sliders, Upload } from 'lucide-react';
import { StudioConfig, PresetType, BengaliFont } from '../types';

interface StyleTabProps {
  config: StudioConfig;
  onUpdateConfig: (partial: Partial<StudioConfig>) => void;
  onCustomFontUpload: (fontName: string, file: File) => void;
}

const PRESET_OPTIONS: { id: PresetType; name: string; tag: string; desc: string }[] = [
  {
    id: 'cinematic',
    name: '🎬 Cinematic',
    tag: 'Slow Fade & Film Tone',
    desc: 'স্লো মুভিং ক্যামেরা, সিনেমাটিক ভিনিয়েট এবং কোমল ফেড-ইন ফেড-আউট',
  },
  {
    id: 'neon',
    name: '💜 Neon Pop',
    tag: 'Kinetic Word Pop',
    desc: 'প্রতিটি শব্দ আলাদাভাবে পপ ও স্কেল হবে, গানের বিটের সাথে নিয়ন গ্লো কাপবে',
  },
  {
    id: 'rain',
    name: '🌧 Rain Soul',
    tag: 'Emotional & Rain Drops',
    desc: 'বাস্তবসম্মত বৃষ্টির কণা ও ব্যাকগ্রাউন্ড বোকেহ লাইট, স্যাড রোমান্টিক আবহ',
  },
  {
    id: 'typewriter',
    name: '⌨️ Typewriter',
    tag: 'Bangla Letter Typing',
    desc: 'বর্ণ বাই বর্ণ মেকানিক্যাল টাইপিং অ্যানিমেশন ও ব্লিংকিং কার্সর',
  },
  {
    id: 'retro',
    name: '📼 Retro VHS',
    tag: 'Chromatic Glitch & Scanline',
    desc: 'RGB চ্যানেল অফসেট, এনালগ স্ক্যানলাইন, গ্লিচ ও VCR ওএসডি ডিসপ্লে',
  },
];

const BENGALI_FONTS: { id: BengaliFont; name: string; desc: string }[] = [
  { id: 'Hind Siliguri', name: 'Hind Siliguri', desc: 'ক্লিন, মডার্ন ও সবচেয়ে জনপ্রিয়' },
  { id: 'Noto Serif Bengali', name: 'Noto Serif Bengali', desc: 'ক্লাসিকাল, আবেগঘন ও রোমান্টিক শায়রি' },
  { id: 'Baloo Da 2', name: 'Baloo Da 2', desc: 'বোল্ড, রাউন্ডেড ও ভাইরাল ডিসপ্লে' },
  { id: 'Anek Bangla', name: 'Anek Bangla', desc: 'জ্যামিতিক, ট্রেন্ডি ও স্মার্ট স্টুডিও লুক' },
];

export const StyleTab: React.FC<StyleTabProps> = ({
  config,
  onUpdateConfig,
  onCustomFontUpload,
}) => {
  const fontFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {/* 5 Presets Section */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">৫টি ভাইরাল অ্যানিমেশন প্রিসেট</h2>
            <p className="text-xs text-slate-400">
              সাধারণ লিরিক নয় — ট্রেন্ডিং ভিডিওর জন্য বিশেষ কাইনেটিক স্টাইল
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_OPTIONS.map((p) => {
            const isSelected = config.preset === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onUpdateConfig({
                    preset: p.id,
                    bgType: p.id === 'rain' ? 'rain' : config.bgType,
                  });
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-pink-500 bg-gradient-to-br from-pink-500/20 to-purple-500/15 shadow-md shadow-pink-500/15'
                    : 'border-[#1f2c5e] bg-[#0a0f26] hover:bg-[#11193d]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-extrabold text-sm text-white">{p.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#141d42] text-cyan-300">
                    {p.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-snug">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Font Picker & Auto-shrink Size Slider (BUG #2 FIXED) */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">বাংলা ফন্ট ও অটো-শ্রিংক সাইজ</h2>
            <p className="text-xs text-slate-400">
              Bug #2 Solved: ৩০ অক্ষরের বেশি হলে ফন্ট নিজে থেকেই অটো-শ্রিংক করবে
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Font Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              বাংলা ফন্ট সিলেক্ট করুন (৪টি প্রিমিয়াম ফন্ট)
            </label>
            <select
              value={config.font}
              onChange={(e) => onUpdateConfig({ font: e.target.value })}
              className="w-full bg-[#080d21] border border-[#202d5c] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              {BENGALI_FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.desc}
                </option>
              ))}
            </select>

            <div className="mt-2.5 flex items-center gap-2">
              <input
                ref={fontFileRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const customName = 'CustomFont_' + Date.now();
                    onCustomFontUpload(customName, file);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fontFileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-300 transition"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>নিজের ফন্ট ফাইল আপলোড করুন (.ttf/.otf)</span>
              </button>
            </div>
          </div>

          {/* Range Slider for Size 18px - 90px */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                ফন্ট সাইজ স্লাইডার (18px - 90px)
              </label>
              <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md">
                {config.fontSize}px
              </span>
            </div>
            <input
              type="range"
              min={18}
              max={90}
              step={1}
              value={config.fontSize}
              onChange={(e) => onUpdateConfig({ fontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-pink-500 h-2 bg-[#172045] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              💡 বড় লাইনের ক্ষেত্রে স্বয়ংক্রিয়ভাবে স্কেল অ্যাডজাস্ট হবে যাতে টেক্সট স্ক্রিনের বাইরে না যায়।
            </p>
          </div>
        </div>

        {/* Colors & Effects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#1b254a]">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              লেখার মূল রঙ (Text Color)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.textColor}
                onChange={(e) => onUpdateConfig({ textColor: e.target.value })}
                className="w-10 h-10 rounded-xl bg-transparent border border-[#212e5c] cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-400">{config.textColor}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              নিয়ন ও গ্লো রঙ (Glow / Accent Color)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.glowColor}
                onChange={(e) => onUpdateConfig({ glowColor: e.target.value })}
                className="w-10 h-10 rounded-xl bg-transparent border border-[#212e5c] cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-400">{config.glowColor}</span>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-[#1b254a] text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={config.beatPulseEnabled}
              onChange={(e) => onUpdateConfig({ beatPulseEnabled: e.target.checked })}
              className="accent-pink-500 w-4 h-4 rounded cursor-pointer"
            />
            <span>🥁 বিট পালস (গান অনুযায়ী স্ক্রিন কাঁপা)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={config.particlesEnabled}
              onChange={(e) => onUpdateConfig({ particlesEnabled: e.target.checked })}
              className="accent-pink-500 w-4 h-4 rounded cursor-pointer"
            />
            <span>✨ লাইভ কণা ও বৃষ্টির প্রভাব</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={config.vignetteEnabled}
              onChange={(e) => onUpdateConfig({ vignetteEnabled: e.target.checked })}
              className="accent-pink-500 w-4 h-4 rounded cursor-pointer"
            />
            <span>🎬 সিনেমাটিক ভিনিয়েট শ্যাডো</span>
          </label>
        </div>
      </div>
    </div>
  );
};
