import React from 'react';
import { Video, Film, Download, Share2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StudioConfig } from '../types';

interface ExportTabProps {
  config: StudioConfig;
  onUpdateConfig: (partial: Partial<StudioConfig>) => void;
  isRecording: boolean;
  recordingProgress: number;
  recordingStatusText: string;
  recordedVideoUrl: string | null;
  recordedVideoExt: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onShareVideo: () => void;
  canShare: boolean;
  hasAudio: boolean;
}

export const ExportTab: React.FC<ExportTabProps> = ({
  config,
  onUpdateConfig,
  isRecording,
  recordingProgress,
  recordingStatusText,
  recordedVideoUrl,
  recordedVideoExt,
  onStartRecording,
  onStopRecording,
  onShareVideo,
  canShare,
  hasAudio,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Intro & Outro Settings (BUG #3 FIXED) */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">৩s ইন্ট্রো ও ৩s আউটরো ব্যানার</h2>
            <p className="text-xs text-slate-400">
              Bug #3 Solved: ফাইনাল ভিডিও রেকর্ডে শুরুতে ৩ সেকেন্ড ইন্ট্রো ও শেষে ৩ সেকেন্ড সাবস্ক্রাইব আউটরো অটো রেন্ডার হবে
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Intro Box */}
          <div className="p-3.5 rounded-xl bg-[#090d22] border border-[#1f2c5d]">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hasIntro}
                  onChange={(e) => onUpdateConfig({ hasIntro: e.target.checked })}
                  className="accent-pink-500 w-4 h-4 rounded cursor-pointer"
                />
                <span>ইন্ট্রো অন্তর্ভুক্ত করুন (প্রথম ৩ সেকেন্ড)</span>
              </label>
              <span className="text-[10px] font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">
                3s Intro
              </span>
            </div>

            <div className="space-y-2 mt-2">
              <input
                type="text"
                value={config.introTitle}
                onChange={(e) => onUpdateConfig({ introTitle: e.target.value })}
                placeholder="ইন্ট্রো টাইটেল (যেমন: Tanvir Rahman Rony Presents)"
                className="w-full bg-[#060a1a] border border-[#233160] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-['Hind_Siliguri']"
              />
              <input
                type="text"
                value={config.introSubtitle}
                onChange={(e) => onUpdateConfig({ introSubtitle: e.target.value })}
                placeholder="সাবটাইটেল (যেমন: Official Bangla Lyric Video)"
                className="w-full bg-[#060a1a] border border-[#233160] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-['Hind_Siliguri']"
              />
            </div>
          </div>

          {/* Outro Box */}
          <div className="p-3.5 rounded-xl bg-[#090d22] border border-[#1f2c5d]">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hasOutro}
                  onChange={(e) => onUpdateConfig({ hasOutro: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                />
                <span>আউটরো অন্তর্ভুক্ত করুন (শেষের ৩ সেকেন্ড)</span>
              </label>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                3s Outro
              </span>
            </div>

            <div className="space-y-2 mt-2">
              <input
                type="text"
                value={config.outroText}
                onChange={(e) => onUpdateConfig({ outroText: e.target.value })}
                placeholder="আউটরো টেক্সট (যেমন: Like • Comment • Subscribe)"
                className="w-full bg-[#060a1a] border border-[#233160] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-['Hind_Siliguri']"
              />
              <input
                type="text"
                value={config.outroChannel}
                onChange={(e) => onUpdateConfig({ outroChannel: e.target.value })}
                placeholder="চ্যানেল নাম (যেমন: Thanks For Watching)"
                className="w-full bg-[#060a1a] border border-[#233160] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-['Hind_Siliguri']"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Video Recorder Box */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">এইচডি ভিডিও এক্সপোর্ট (MediaRecorder)</h2>
            <p className="text-xs text-slate-400">
              ক্যানভাস অ্যানিমেশন ও অডিও একসাথে ফুল এইচডি কোয়ালিটিতে রেকর্ড হবে
            </p>
          </div>
        </div>

        {!hasAudio && (
          <div className="p-3 mb-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-none" />
            <span>ভিডিও রেকর্ড শুরু করার আগে ড্যাশবোর্ড থেকে একটি অডিও গান লোড করুন।</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onStartRecording}
            disabled={isRecording || !hasAudio}
            className="flex-1 py-3.5 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg shadow-pink-500/25 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-400 animate-ping' : 'bg-white'}`} />
            <span>{isRecording ? 'রেকর্ড হচ্ছে...' : '🎬 ভিডিও রেকর্ড শুরু করুন (Intro+Lyrics+Outro)'}</span>
          </button>

          {isRecording && (
            <button
              onClick={onStopRecording}
              className="py-3.5 px-6 rounded-xl font-bold text-sm bg-[#221730] hover:bg-[#322045] text-rose-300 border border-rose-500/40 transition"
            >
              ⏹ রেকর্ড থামান
            </button>
          )}
        </div>

        {/* Progress bar */}
        {isRecording && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span>{recordingStatusText || 'রেকর্ড চলছে...'}</span>
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {Math.round(recordingProgress)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#080d22] overflow-hidden border border-[#1b254a]">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${recordingProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              ⚠️ রেকর্ডের সময় ব্রাউজার ট্যাব খোলা রাখুন এবং স্ক্রিন বন্ধ করবেন না।
            </p>
          </div>
        )}

        {/* Recorded video preview & download link */}
        {recordedVideoUrl && (
          <div className="mt-5 p-4 rounded-xl bg-[#090d22] border border-emerald-500/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>ভিডিও সফলভাবে রেন্ডার হয়েছে! নিচে প্লে করে দেখুন ও ডাউনলোড করুন।</span>
            </div>

            <video
              src={recordedVideoUrl}
              controls
              playsInline
              className="w-full rounded-xl bg-black shadow-lg max-h-72"
            />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={recordedVideoUrl}
                download={`LyricCraft_Ultra_Video.${recordedVideoExt}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-md shadow-emerald-500/20 transition text-decoration-none"
              >
                <Download className="w-4 h-4" />
                <span>ভিডিও ডাউনলোড করুন ({recordedVideoExt.toUpperCase()})</span>
              </a>

              {canShare && (
                <button
                  onClick={onShareVideo}
                  className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-bold text-xs bg-[#162145] hover:bg-[#202e5e] text-slate-200 border border-[#27386d] transition"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>শেয়ার করুন</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
