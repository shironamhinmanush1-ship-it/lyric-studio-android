import React, { useRef } from 'react';
import { Upload, Music, FileText, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LyricLine } from '../types';

interface DashboardTabProps {
  onAudioUpload: (file: File) => void;
  audioFileName: string | null;
  duration: number;
  lyricsText: string;
  onLyricsTextChange: (text: string) => void;
  onApplyLyrics: () => void;
  onAutoSync: () => void;
  onNavigateToSync: () => void;
  lyricsCount: number;
  syncedCount: number;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onAudioUpload,
  audioFileName,
  duration,
  lyricsText,
  onLyricsTextChange,
  onApplyLyrics,
  onAutoSync,
  onNavigateToSync,
  lyricsCount,
  syncedCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {/* 1. Audio Upload Box */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">১. অডিও গান লোড করুন</h2>
            <p className="text-xs text-slate-400">MP3, WAV, অথবা M4A অডিও ফাইল বাছাই করুন</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onAudioUpload(file);
          }}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#29386d] hover:border-cyan-400/60 rounded-xl p-5 text-center cursor-pointer transition bg-[#090d20]/60 hover:bg-[#0c122c]"
        >
          <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-200">
            {audioFileName ? `বর্তমান গান: ${audioFileName}` : 'ক্লিক করে গান বাছাই করুন'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {duration > 0 ? `দৈর্ঘ্য: ${duration.toFixed(1)} সেকেন্ড` : 'ডিভাইস থেকে অডিও ফাইল সিলেক্ট করুন'}
          </p>
        </div>
      </div>

      {/* 2. Lyrics Text Input Box */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">২. বাংলা লিরিক্স</h2>
              <p className="text-xs text-slate-400">প্রতি লাইনে একটি করে লিরিক লাইন লিখুন</p>
            </div>
          </div>
          {lyricsCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {lyricsCount} লাইন
            </span>
          )}
        </div>

        <textarea
          value={lyricsText}
          onChange={(e) => onLyricsTextChange(e.target.value)}
          placeholder={`উজাড় করে দিয়েছিলাম\nতবুও তুমি বুঝলে না\nবৃষ্টি ভেজা এই রাতে\nতোমাকেই খুঁজেছি`}
          className="w-full h-36 bg-[#070b1a] border border-[#1f2b57] rounded-xl p-3 text-base sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition resize-y font-['Hind_Siliguri'] leading-relaxed"
        />

        {/* Action Row */}
        <div className="flex flex-wrap items-center gap-2.5 mt-3">
          <button
            onClick={onApplyLyrics}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-500/20 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>লিরিক্স নিশ্চিত করুন</span>
          </button>

          <button
            onClick={onAutoSync}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#1a254f] hover:bg-[#233268] text-cyan-300 border border-[#2b3a6e] transition"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>নিখুঁত অটো সিঙ্ক (Intro/Outro বাদ দিয়ে)</span>
          </button>

          <button
            onClick={onNavigateToSync}
            className="w-full sm:w-auto ml-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 transition"
          >
            <span>সিঙ্ক স্টুডিওতে যান</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick status report */}
        <div className="mt-4 p-3 rounded-xl bg-[#090d22] border border-[#1a2348] text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>সিঙ্ক স্ট্যাটাস: <b>{syncedCount} / {lyricsCount}</b> লাইন সিঙ্ক হয়েছে</span>
          </div>
          <span className="text-[11px] text-slate-400">
            স্পেসবার বা ট্যাপ বাটন দিয়ে গান চলাকালীন সহজে সিঙ্ক করতে পারবেন।
          </span>
        </div>
      </div>
    </div>
  );
};
