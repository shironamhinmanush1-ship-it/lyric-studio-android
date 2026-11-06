import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Trash2,
  Download,
  Upload,
  ArrowUpCircle,
  Keyboard,
  Info,
  X,
  FastForward,
  Rewind,
  Sparkles,
} from 'lucide-react';
import { LyricLine } from '../types';

interface SyncTabProps {
  lyrics: LyricLine[];
  currentTime: number;
  duration: number;
  currentTapIndex: number;
  onTap: () => void;
  onUndo: () => void;
  onAutoSync: () => void;
  onReset: () => void;
  onUpdateLineTime: (index: number, start: number | null, end: number | null) => void;
  onSetLineStartNow: (index: number) => void;
  onSetLineEndNow: (index: number) => void;
  onSeekTo: (time: number) => void;
  onExportLrc: () => void;
  onImportLrc: (file: File) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export const SyncTab: React.FC<SyncTabProps> = ({
  lyrics,
  currentTime,
  duration,
  currentTapIndex,
  onTap,
  onUndo,
  onAutoSync,
  onReset,
  onUpdateLineTime,
  onSetLineStartNow,
  onSetLineEndNow,
  onSeekTo,
  onExportLrc,
  onImportLrc,
  isPlaying = false,
  onTogglePlay,
}) => {
  const lrcFileInputRef = useRef<HTMLInputElement>(null);
  const [showShortcutModal, setShowShortcutModal] = useState<boolean>(false);
  const [activeShortcutNotice, setActiveShortcutNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<any>(null);

  // Trigger feedback banner
  const flashShortcutNotice = (text: string) => {
    setActiveShortcutNotice(text);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setActiveShortcutNotice(null);
    }, 1200);
  };

  // Haptic feedback for mobile touch
  const triggerHaptic = (ms: number = 35) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch (_e) {}
  };

  // Comprehensive Desktop Keyboard Shortcut System
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when typing in inputs/textareas
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag) || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      // 1. Space -> Toggle Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        if (onTogglePlay) {
          onTogglePlay();
          flashShortcutNotice(isPlaying ? '⏸️ অডিও পজ (Space)' : '▶️ অডিও প্লে (Space)');
        }
        return;
      }

      // 2. S or Enter -> Tap Sync Next Line
      if (e.code === 'KeyS' || e.code === 'Enter') {
        e.preventDefault();
        triggerHaptic(40);
        onTap();
        const nextIdx = currentTapIndex + 1;
        flashShortcutNotice(`👆 সিঙ্ক হয়েছে (#${nextIdx}) [S]`);
        return;
      }

      // 3. U or Ctrl+Z / Cmd+Z -> Undo
      if (e.code === 'KeyU' || ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ')) {
        e.preventDefault();
        if (currentTapIndex > 0) {
          triggerHaptic(30);
          onUndo();
          flashShortcutNotice(`↩️ Undo আগের লাইন [U]`);
        }
        return;
      }

      // 4. ArrowLeft -> Rewind 2 seconds
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const target = Math.max(0, +(currentTime - 2).toFixed(1));
        onSeekTo(target);
        flashShortcutNotice(`⏪ -২ সেকেন্ড (${target}s) [←]`);
        return;
      }

      // 5. ArrowRight -> Fast Forward 2 seconds
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        const target = Math.min(duration || 1000, +(currentTime + 2).toFixed(1));
        onSeekTo(target);
        flashShortcutNotice(`⏩ +২ সেকেন্ড (${target}s) [→]`);
        return;
      }

      // 6. 0 or Home -> Seek to 0:00
      if (e.code === 'Digit0' || e.code === 'Numpad0' || e.code === 'Home') {
        e.preventDefault();
        onSeekTo(0);
        flashShortcutNotice(`⏮️ শুরুতে ফিরে গেছে (0:00) [0]`);
        return;
      }

      // 7. A -> Auto Sync
      if (e.code === 'KeyA') {
        e.preventDefault();
        onAutoSync();
        flashShortcutNotice(`⚡ অটো সিঙ্ক সম্পন্ন [A]`);
        return;
      }

      // 8. ? or Slash -> Toggle Shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) {
        e.preventDefault();
        setShowShortcutModal((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, [onTogglePlay, isPlaying, onTap, onUndo, onSeekTo, currentTime, duration, onAutoSync, currentTapIndex]);

  const activeLine =
    currentTapIndex < lyrics.length ? lyrics[currentTapIndex] : null;

  return (
    <div className="space-y-4 relative">
      {/* Visual Floating Toast for Keyboard Shortcut Execution */}
      {activeShortcutNotice && (
        <div className="fixed bottom-20 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/90 to-purple-600/90 text-white font-bold text-xs shadow-2xl backdrop-blur-md border border-cyan-400/40 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" />
            <span>{activeShortcutNotice}</span>
          </div>
        </div>
      )}

      {/* Tap Sync Action Banner */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>সিঙ্ক স্টুডিও (ম্যানুয়াল ও অটো সিঙ্ক)</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  <Keyboard className="w-3 h-3 text-cyan-400" />
                  কীবোর্ড শর্টকাট সক্রিয়
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ডেস্কটপে স্পেসবারে প্লে/পজ, <kbd className="px-1.5 py-0.5 bg-[#172248] text-cyan-300 rounded text-[10px] font-mono font-bold border border-[#27396c]">S</kbd> দিয়ে সিঙ্ক এবং <kbd className="px-1.5 py-0.5 bg-[#172248] text-cyan-300 rounded text-[10px] font-mono font-bold border border-[#27396c]">U</kbd> দিয়ে Undo করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcutModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#152042] hover:bg-[#1e2d5c] text-cyan-300 border border-cyan-500/30 transition shadow-sm"
              title="কীবোর্ড শর্টকাট তালিকা দেখুন"
            >
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">শর্টকাট গাইড</span>
              <kbd className="text-[10px] font-mono font-bold px-1 py-0.2 bg-[#090e24] text-cyan-200 rounded border border-cyan-500/40">?</kbd>
            </button>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#070b1a] text-cyan-300 border border-[#1b254a]">
              {currentTime.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Current Active Line Indicator */}
        <div className="p-3.5 my-3 rounded-xl bg-[#090d22] border border-cyan-500/30 shadow-inner">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>
              {activeLine
                ? `পরের লাইন (#${currentTapIndex + 1} of ${lyrics.length})`
                : 'সব লাইন সিঙ্ক সম্পন্ন হয়েছে!'}
            </span>
            {activeLine?.start !== null && activeLine?.start !== undefined && (
              <span className="text-emerald-400 font-mono text-xs">
                শুরু: {activeLine.start}s
              </span>
            )}
          </div>
          <p className="text-base sm:text-lg font-bold text-white font-['Hind_Siliguri'] leading-snug">
            {activeLine ? activeLine.text : '✅ সবগুলো লাইনে টাইমকোড যুক্ত হয়েছে'}
          </p>
        </div>

        {/* Desktop Shortcut Legend Badges Bar */}
        <div className="hidden sm:flex items-center gap-2 py-1.5 px-3 mb-3 bg-[#080d22] border border-[#1d2952] rounded-xl text-xs text-slate-300 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            শর্টকাট:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-0.5 rounded bg-[#162145] text-cyan-300 border border-[#26376b] font-mono text-[11px] font-bold shadow-sm">
              Space
            </kbd>
            <span className="text-slate-400">{isPlaying ? 'পজ' : 'প্লে'}</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-0.5 rounded bg-[#162145] text-amber-300 border border-[#26376b] font-mono text-[11px] font-bold shadow-sm">
              S / Enter
            </kbd>
            <span className="text-slate-400">ট্যাপ সিঙ্ক</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-0.5 rounded bg-[#162145] text-pink-300 border border-[#26376b] font-mono text-[11px] font-bold shadow-sm">
              U
            </kbd>
            <span className="text-slate-400">Undo</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-0.5 rounded bg-[#162145] text-purple-300 border border-[#26376b] font-mono text-[11px] font-bold shadow-sm">
              ← / →
            </kbd>
            <span className="text-slate-400">±২s সিক</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-0.5 rounded bg-[#162145] text-emerald-300 border border-[#26376b] font-mono text-[11px] font-bold shadow-sm">
              0
            </kbd>
            <span className="text-slate-400">০:০০ শুরুতে</span>
          </div>
        </div>

        {/* BIG TAP SYNC BUTTON WITH KEYBOARD SHORTCUT BADGE */}
        <button
          onClick={() => {
            triggerHaptic(50);
            onTap();
            flashShortcutNotice(`👆 সিঙ্ক হয়েছে (#${currentTapIndex + 1}) [S]`);
          }}
          className="w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-lg sm:text-xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:from-amber-300 hover:to-pink-400 active:scale-95 text-slate-950 shadow-xl shadow-orange-500/30 transition transform flex items-center justify-center gap-3 cursor-pointer touch-manipulation select-none relative group"
        >
          <ArrowUpCircle className="w-7 h-7 fill-current text-slate-950 group-hover:scale-110 transition" />
          <span>👆 ট্যাপ করুন — পরবর্তী লাইন শুরু</span>
          <kbd className="hidden sm:inline-block px-2.5 py-1 text-xs font-mono font-bold bg-slate-950/20 text-slate-950 border border-slate-950/30 rounded-lg">
            S / Enter
          </kbd>
        </button>

        {/* Control toolbar */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5">
          <button
            onClick={() => {
              triggerHaptic(30);
              onUndo();
              flashShortcutNotice('↩️ Undo করা হয়েছে [U]');
            }}
            disabled={currentTapIndex === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-[#172248] hover:bg-[#202e60] text-slate-300 border border-[#27386c] disabled:opacity-40 transition active:scale-95"
            title="পূর্ববর্তী লাইনের টাইমিং মুছুন (শর্টকাট: U বা Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Undo আগের লাইন</span>
            <kbd className="hidden sm:inline font-mono text-[10px] text-slate-400 bg-[#0c1228] px-1.5 py-0.5 rounded border border-[#22315c]">U</kbd>
          </button>

          <button
            onClick={() => {
              triggerHaptic(30);
              onAutoSync();
              flashShortcutNotice('⚡ নিখুঁত অটো সিঙ্ক সম্পন্ন [A]');
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-[#1c2752] hover:bg-[#26356e] text-cyan-300 border border-cyan-500/40 transition active:scale-95"
            title="গানকে সমান ভাগে ভাগ করুন (শর্টকাট: A)"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>নিখুঁত অটো সিঙ্ক</span>
            <kbd className="hidden sm:inline font-mono text-[10px] text-cyan-400 bg-[#0c1228] px-1.5 py-0.5 rounded border border-cyan-500/40">A</kbd>
          </button>

          <button
            onClick={() => {
              triggerHaptic(30);
              onReset();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-[#1f1a30] hover:bg-[#2e2348] text-rose-300 border border-rose-800/40 transition active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>রিসেট</span>
          </button>

          <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 pt-1 sm:pt-0">
            <button
              onClick={onExportLrc}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#141d3d] hover:bg-[#1d2a58] text-slate-300 border border-[#223164] transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>LRC সেভ</span>
            </button>
            <input
              ref={lrcFileInputRef}
              type="file"
              accept=".lrc,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportLrc(file);
              }}
            />
            <button
              onClick={() => lrcFileInputRef.current?.click()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#141d3d] hover:bg-[#1d2a58] text-slate-300 border border-[#223164] transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>LRC লোড</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Listing Section */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-3 sm:p-4 shadow-lg overflow-hidden">
        <h3 className="text-sm font-bold text-white mb-2.5 flex items-center justify-between">
          <span>সিঙ্ক তালিকা ({lyrics.length} লাইন)</span>
          <span className="text-[11px] text-slate-400 font-normal">
            কীবোর্ডে <kbd className="px-1.5 py-0.5 rounded bg-[#172248] text-cyan-300 font-mono text-[10px]">S</kbd> চাপলে সিরিয়াল অনুযায়ী সময় সেট হয়ে যাবে
          </span>
        </h3>

        {/* 1. Mobile Cards View (Visible on mobile screens < 768px) */}
        <div className="block md:hidden space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
          {lyrics.map((line, idx) => {
            const isCurrent = idx === currentTapIndex;
            const isPlayingNow =
              line.start !== null &&
              currentTime >= line.start &&
              (line.end === null || currentTime <= line.end);

            return (
              <div
                key={line.id}
                className={`p-3 rounded-xl border transition-all ${
                  isPlayingNow
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : isCurrent
                    ? 'bg-pink-500/15 border-pink-500/50'
                    : 'bg-[#080d22] border-[#1d2854]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#141e42] text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-bold text-white font-['Hind_Siliguri'] leading-tight">
                      {line.text}
                    </p>
                  </div>
                  <button
                    onClick={() => onSeekTo(line.start ?? 0)}
                    disabled={line.start === null}
                    className="p-1.5 rounded-lg bg-[#18234a] hover:bg-[#233368] text-cyan-300 disabled:opacity-20 shrink-0"
                    title="এই লাইনে অডিও নিন"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-400">
                      শুরু: <b className="text-cyan-300">{line.start !== null ? `${line.start}s` : '---'}</b>
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">
                      শেষ: <b className="text-pink-300">{line.end !== null ? `${line.end}s` : '---'}</b>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        triggerHaptic(30);
                        onSetLineStartNow(idx);
                        flashShortcutNotice(`শুরুর সময় সেট: লাইন #${idx + 1}`);
                      }}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-cyan-500/20 active:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40"
                    >
                      শুরু সেট
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic(30);
                        onSetLineEndNow(idx);
                        flashShortcutNotice(`শেষের সময় সেট: লাইন #${idx + 1}`);
                      }}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-pink-500/20 active:bg-pink-500/40 text-pink-300 border border-pink-500/40"
                    >
                      শেষ সেট
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Desktop Table View (Visible on screens >= 768px) */}
        <div className="hidden md:block max-h-[380px] overflow-y-auto rounded-xl border border-[#1b254a]">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-[#070b1a] text-slate-400 sticky top-0 z-10 border-b border-[#1b254a]">
              <tr>
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5">লিরিক লাইন</th>
                <th className="p-2.5 w-20">শুরু (s)</th>
                <th className="p-2.5 w-20">শেষ (s)</th>
                <th className="p-2.5 w-44 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172146]">
              {lyrics.map((line, idx) => {
                const isCurrent = idx === currentTapIndex;
                const isPlayingNow =
                  line.start !== null &&
                  currentTime >= line.start &&
                  (line.end === null || currentTime <= line.end);

                return (
                  <tr
                    key={line.id}
                    className={`transition-colors ${
                      isPlayingNow
                        ? 'bg-cyan-500/15 text-cyan-200'
                        : isCurrent
                        ? 'bg-pink-500/10'
                        : 'hover:bg-[#131b3e]'
                    }`}
                  >
                    <td className="p-2.5 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-semibold font-['Hind_Siliguri'] text-sm">
                      {line.text}
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.1"
                        value={line.start ?? ''}
                        placeholder="0.0"
                        onChange={(e) =>
                          onUpdateLineTime(
                            idx,
                            e.target.value === '' ? null : parseFloat(e.target.value),
                            line.end
                          )
                        }
                        className="w-16 px-2 py-1 rounded-lg bg-[#070b1a] border border-[#233160] text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.1"
                        value={line.end ?? ''}
                        placeholder="0.0"
                        onChange={(e) =>
                          onUpdateLineTime(
                            idx,
                            line.start,
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-16 px-2 py-1 rounded-lg bg-[#070b1a] border border-[#233160] text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            triggerHaptic(30);
                            onSetLineStartNow(idx);
                            flashShortcutNotice(`শুরুর সময় সেট: লাইন #${idx + 1}`);
                          }}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition"
                          title="বর্তমান অডিও টাইমকে শুরুর সময় হিসেবে সেট করুন"
                        >
                          এখন সেট
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic(30);
                            onSetLineEndNow(idx);
                            flashShortcutNotice(`শেষের সময় সেট: লাইন #${idx + 1}`);
                          }}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 transition"
                          title="বর্তমান অডিও টাইমকে শেষের সময় হিসেবে সেট করুন"
                        >
                          শেষ সেট
                        </button>
                        <button
                          onClick={() => onSeekTo(line.start ?? 0)}
                          disabled={line.start === null}
                          className="p-1 rounded-lg bg-[#18234a] hover:bg-[#233368] text-slate-300 disabled:opacity-30 transition"
                          title="এই লাইনে প্লেহেড নিন"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showShortcutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0c122a] border border-cyan-500/40 p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2a56]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    ডেস্কটপ কীবোর্ড শর্টকাট গাইড
                  </h3>
                  <p className="text-xs text-slate-400">
                    মাউস স্পর্শ না করেই সুপার-ফাস্ট সিঙ্ক করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowShortcutModal(false)}
                className="p-1.5 rounded-lg bg-[#141d40] hover:bg-[#1e2a58] text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-1 gap-2">
                <div className="p-2.5 rounded-xl bg-[#080d22] border border-[#1d2954] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">প্লে / পজ টগল</span>
                    <span className="text-[11px] text-slate-400">গান চালু বা সাময়িক বন্ধ করতে চাপুন</span>
                  </div>
                  <kbd className="px-2.5 py-1 rounded bg-[#162145] text-cyan-300 border border-[#27396c] font-mono font-bold text-xs shadow">
                    Space
                  </kbd>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080d22] border border-[#1d2954] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-300 block">ট্যাপ সিঙ্ক (পরবর্তী লাইন শুরু)</span>
                    <span className="text-[11px] text-slate-400">গান চলার সাথে সাথে নতুন লাইনের সুর শুরুর মুহূর্তে চাপুন</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <kbd className="px-2.5 py-1 rounded bg-[#162145] text-amber-300 border border-[#27396c] font-bold shadow">S</kbd>
                    <span className="text-slate-500">or</span>
                    <kbd className="px-2 py-1 rounded bg-[#162145] text-amber-300 border border-[#27396c] font-bold shadow">Enter</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080d22] border border-[#1d2954] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-pink-300 block">Undo আগের লাইন</span>
                    <span className="text-[11px] text-slate-400">ভুল টাইমিং হলে আগের লাইনের সময় মুছুন</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <kbd className="px-2.5 py-1 rounded bg-[#162145] text-pink-300 border border-[#27396c] font-bold shadow">U</kbd>
                    <span className="text-slate-500">or</span>
                    <kbd className="px-2 py-1 rounded bg-[#162145] text-pink-300 border border-[#27396c] font-bold shadow">Ctrl+Z</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080d22] border border-[#1d2954] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-300 block">রিওয়াইন্ড ও ফরওয়ার্ড (±২ সেকেন্ড)</span>
                    <span className="text-[11px] text-slate-400">অডিও প্লেহেডকে ২ সেকেন্ড পেছনে বা সামনে সরান</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <kbd className="px-2 py-1 rounded bg-[#162145] text-purple-300 border border-[#27396c] font-bold shadow">←</kbd>
                    <kbd className="px-2 py-1 rounded bg-[#162145] text-purple-300 border border-[#27396c] font-bold shadow">→</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080d22] border border-[#1d2954] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-300 block">শুরুতে ফিরে যাওয়া (0:00)</span>
                    <span className="text-[11px] text-slate-400">অডিওকে সরাসরি শূন্য সেকেন্ডে নিয়ে যান</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <kbd className="px-2.5 py-1 rounded bg-[#162145] text-emerald-300 border border-[#27396c] font-bold shadow">0</kbd>
                    <span className="text-slate-500">or</span>
                    <kbd className="px-2 py-1 rounded bg-[#162145] text-emerald-300 border border-[#27396c] font-bold shadow">Home</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080d22] border border-[#1d2954] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-cyan-300 block">নিখুঁত অটো সিঙ্ক</span>
                    <span className="text-[11px] text-slate-400">ইন্ট্রো ও আউটরো বাদ দিয়ে গানকে সমান ভাগে ভাগ করুন</span>
                  </div>
                  <kbd className="px-2.5 py-1 rounded bg-[#162145] text-cyan-300 border border-[#27396c] font-mono font-bold text-xs shadow">
                    A
                  </kbd>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowShortcutModal(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs transition shadow-md shadow-cyan-500/20"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
