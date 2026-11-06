import React, { useState, useRef, useMemo } from 'react';
import {
  Languages,
  Copy,
  Check,
  Send,
  Sparkles,
  Search,
  Upload,
  Download,
  ListOrdered,
  FileText,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { TranslationMode } from '../types';
import { processBatchLyrics, BatchProcessResult } from '../utils/lyricTranslator';

interface TranslatorTabProps {
  onSendToLyrics: (translatedText: string) => void;
}

const RHYMES_MAP: Record<string, string[]> = {
  গান: ['প্রাণ', 'দান', 'মান', 'টান', 'শান', 'ধ্যান', 'স্নান', 'সন্ধান', 'তুফান'],
  রাত: ['হাত', 'বাত', 'পাত', 'জাত', 'প্রভাত', 'আঘাত', 'সংঘাৎ', 'বারাত'],
  মন: ['জন', 'ধন', 'বন', 'রণ', 'ক্ষণ', 'জীবন', 'স্বপন', 'ভুবন', 'নয়ন'],
  আলো: ['ভালো', 'কালো', 'ঢালো', 'জ্বালো', 'নিভালো'],
  চোখ: ['বুক', 'সুখ', 'দুখ', 'মুখ', 'অসুখ'],
  বৃষ্টি: ['সৃষ্টি', 'দৃষ্টি', 'মিষ্টি', 'কৃষ্টি'],
  ভালোবাসা: ['আশা', 'ভাষা', 'হতাশা', 'পিপাসা', 'ভরসা'],
  কথা: ['ব্যথা', 'লতা', 'কথা', 'নীরবতা', 'আকুলতা'],
};

export const TranslatorTab: React.FC<TranslatorTabProps> = ({ onSendToLyrics }) => {
  const [mode, setMode] = useState<TranslationMode>('banglish');
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [showArrayPreview, setShowArrayPreview] = useState(true);
  const [rhymeQuery, setRhymeQuery] = useState('');
  const [rhymeResults, setRhymeResults] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute batch result with memoization preserving newlines
  const batchResult: BatchProcessResult = useMemo(() => {
    return processBatchLyrics(inputText, mode, {
      removeEmptyLines,
      trimLines,
    });
  }, [inputText, mode, removeEmptyLines, trimLines]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  const loadMultiVerseSample = () => {
    let sample = '';
    if (mode === 'banglish') {
      sample = `tumi amar moner manush\nharale tomay kothay pabo\nei monete joton kore\ntomay ami rakhbo\n\nujhar kore diyechilam\ntobuo tumi bujhle na\nbristi bheja ei rate\ntomakei khujechi\n\nkache thakle valo lage\ndure gele betha lage\nchokher jole vese jay\namar e moner gaan`;
    } else if (mode === 'english') {
      sample = `I gave everything\nYou never understood\nIn this rainy night\nI searched for you\n\nStay with me forever\nHold my hand tonight\nWithout you my heart cries\nWhere will I find you\n\nListen to my song\nLike a sweet memory\nTears in my eyes\nLost in the dark`;
    } else if (mode === 'bijoy') {
      sample = 'Avgvi fv‡jvvevmv\nAvgvi †mvbvi evsjv\nZzwg Avgvi g‡bi gvbyl\n\nDrbœwZ‡Z †M‡jI\nIq‡Rvi K‡i w`‡qwQjvg\nZeyI Zzwg eyS‡j bv';
    } else if (mode === 'romanize') {
      sample = `উজাড় করে দিয়েছিলাম\nতবুও তুমি বুঝলে না\nবৃষ্টি ভেজা এই রাতে\nতোমাকেই খুঁজেছি\n\nতুমি আমার মনের মানুষ\nহারালে তোমায় কোথায় পাবো\nএই মনেতে যতন করে\nতোমায় আমি রাখবো`;
    } else {
      sample = `আমি তোমায় ভালোবাসি\nবৃষ্টি ভেজা এই রাতে\nতোমার চোখের মায়ায়\nহারিয়ে গেছি চিরতরে`;
    }
    setInputText(sample);
  };

  const handleCopy = () => {
    if (!batchResult.formattedText) return;
    navigator.clipboard.writeText(batchResult.formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!batchResult.formattedText) {
      alert('কোনো অনূদিত লিরিক্স নেই');
      return;
    }
    const blob = new Blob([batchResult.formattedText], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Batch_Lyrics_${mode}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleSendToStudio = () => {
    if (!batchResult.lines.length) {
      alert('আগে অন্তত ১টি লিরিক লাইন লিখুন বা পেস্ট করুন');
      return;
    }
    onSendToLyrics(batchResult.formattedText);
  };

  const handleSearchRhymes = () => {
    const q = rhymeQuery.trim();
    if (!q) return;
    const found = RHYMES_MAP[q] || [];
    if (found.length) {
      setRhymeResults(found);
    } else {
      const last = q.slice(-1);
      setRhymeResults([`ছন্দ মিল: "${last}" দিয়ে শেষ হওয়া শব্দসমূহ (যেমন: গান, প্রাণ, মন, আলো)`]);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Translation Modes */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>ব্যাচ লিরিক ট্রান্সলেটর স্টুডিও (Batch Processing)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Newlines Preserved
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                একসাথে একাধিক বা পুরো গানের ২০-৫০+ লাইন পেস্ট করুন — প্রতিটি লাইন আলাদা রেখে নিমেষেই কনভার্ট হবে
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.lrc"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151f42] hover:bg-[#1d2c5e] text-slate-300 text-xs border border-[#233368] transition"
              title="টেক্সট ফাইল থেকে লিরিক্স আপলোড করুন"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>ফাইল লোড (.txt)</span>
            </button>
            <button
              onClick={loadMultiVerseSample}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#201736] hover:bg-[#2b1f48] text-pink-300 text-xs border border-pink-500/40 transition font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>নমুনা গান (ব্যাচ)</span>
            </button>
          </div>
        </div>

        {/* 5 Translation Modes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
          <button
            onClick={() => setMode('banglish')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
              mode === 'banglish'
                ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-md shadow-cyan-500/15'
                : 'border-[#1e2a58] bg-[#090d20] text-slate-400 hover:text-white'
            }`}
          >
            <span className="block text-[11px] text-cyan-400">Avro Phonetic</span>
            <span>🔤 বাংলিশ ➔ বাংলা</span>
          </button>

          <button
            onClick={() => setMode('english')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
              mode === 'english'
                ? 'border-pink-500 bg-pink-500/15 text-pink-200 shadow-md shadow-pink-500/15'
                : 'border-[#1e2a58] bg-[#090d20] text-slate-400 hover:text-white'
            }`}
          >
            <span className="block text-[11px] text-pink-400">Poetic Lyric</span>
            <span>🇬🇧 ইংরেজি ➔ বাংলা</span>
          </button>

          <button
            onClick={() => setMode('romanize')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
              mode === 'romanize'
                ? 'border-purple-500 bg-purple-500/15 text-purple-200 shadow-md shadow-purple-500/15'
                : 'border-[#1e2a58] bg-[#090d20] text-slate-400 hover:text-white'
            }`}
          >
            <span className="block text-[11px] text-purple-400">Karaoke / Subs</span>
            <span>🔠 বাংলা ➔ রোমান বাংলিশ</span>
          </button>

          <button
            onClick={() => setMode('bijoy')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
              mode === 'bijoy'
                ? 'border-amber-400 bg-amber-500/15 text-amber-200 shadow-md shadow-amber-500/15'
                : 'border-[#1e2a58] bg-[#090d20] text-slate-400 hover:text-white'
            }`}
          >
            <span className="block text-[11px] text-amber-400">ANSI to Unicode</span>
            <span>⚡ বিজয় ৫২ ➔ ইউনিকোড</span>
          </button>

          <button
            onClick={() => setMode('unicodeToBijoy')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
              mode === 'unicodeToBijoy'
                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-md shadow-emerald-500/15'
                : 'border-[#1e2a58] bg-[#090d20] text-slate-400 hover:text-white'
            }`}
          >
            <span className="block text-[11px] text-emerald-400">Unicode to ANSI</span>
            <span>🔄 ইউনিকোড ➔ বিজয়</span>
          </button>
        </div>

        {/* Formatting Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-[#090d22] border border-[#1a254c] mb-3 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={removeEmptyLines}
                onChange={(e) => setRemoveEmptyLines(e.target.checked)}
                className="accent-cyan-400 rounded cursor-pointer"
              />
              <span>খালি লাইন বাদ দিন (Remove empty lines)</span>
            </label>

            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={trimLines}
                onChange={(e) => setTrimLines(e.target.checked)}
                className="accent-cyan-400 rounded cursor-pointer"
              />
              <span>স্পেস ট্রিম (Trim spaces)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold font-mono">
              {batchResult.totalLines} লাইন
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold font-mono">
              {batchResult.wordCount} শব্দ
            </span>
          </div>
        </div>

        {/* Side-by-Side Dual Textarea Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {mode === 'banglish' && 'ইনপুট: একাধিক বাংলিশ লাইন একসাথে পেস্ট করুন'}
                {mode === 'english' && 'ইনপুট: সম্পূর্ণ ইংরেজি গানের লিরিক্স পেস্ট করুন'}
                {mode === 'romanize' && 'ইনপুট: বাংলা লিরিক্স পেস্ট করুন'}
                {mode === 'bijoy' && 'ইনপুট: বিজয় ৫২ ফন্টে লেখা লিরিক্স পেস্ট করুন'}
                {mode === 'unicodeToBijoy' && 'ইনপুট: ইউনিকোড বাংলা লিরিক্স পেস্ট করুন'}
              </label>
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>মুছে ফেলুন</span>
                </button>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`এখানে সম্পূর্ণ গানের ১০-৫০+ লাইন একসাথে পেস্ট করুন...\nপ্রতিটি লাইন স্বাভাবিক নিউ-লাইনে সাজানো থাকবে`}
              className="w-full h-56 bg-[#080d21] border border-[#202d5c] rounded-xl p-3 text-base sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-y leading-relaxed"
            />
          </div>

          {/* Output Panel */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                অনূদিত ব্যাচ আউটপুট (লাইন বিন্যাস সংরক্ষিত)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  disabled={!batchResult.formattedText}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white disabled:opacity-30"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  <span>সেভ .txt</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!batchResult.formattedText}
                  className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 disabled:opacity-30"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={batchResult.formattedText}
              readOnly
              placeholder="অনূদিত লিরিক্সের প্রতিটি লাইন এখানে প্রদর্শিত হবে..."
              className="w-full h-56 bg-[#080d21] border border-[#202d5c] rounded-xl p-3 text-sm text-cyan-200 placeholder:text-slate-500 font-['Hind_Siliguri'] resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#1b254a]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArrayPreview(!showArrayPreview)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#141e3d] hover:bg-[#1b2852] text-slate-300 border border-[#212f5a] transition"
            >
              <ListOrdered className="w-3.5 h-3.5 text-purple-400" />
              <span>{showArrayPreview ? 'অ্যারে প্রিভিউ লুকান' : 'লিরিক্স অ্যারে প্রিভিউ দেখুন'}</span>
            </button>
          </div>

          <button
            onClick={handleSendToStudio}
            disabled={!batchResult.lines.length}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400 hover:opacity-90 text-white shadow-lg shadow-pink-500/25 disabled:opacity-40 transition transform active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            <span>📥 সম্পূর্ণ ব্যাচ লিরিক্স স্টুডিওতে পাঠান ({batchResult.totalLines} লাইন)</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Lyrics Array Breakdown Preview */}
      {showArrayPreview && batchResult.lines.length > 0 && (
        <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                <ListOrdered className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  ব্যাচ লিরিক্স অ্যারে ইনস্পেক্টর (Parsed Lyrics Array)
                </h3>
                <p className="text-[11px] text-slate-400">
                  নিচে দেখুন প্রতিটি লাইন কীভাবে স্টুডিওর টাইমিং সিঙ্ক অ্যারেতে আলাদা ইন্ডেক্স হিসেবে লোড হবে:
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-[#080d22] px-2.5 py-1 rounded-lg border border-[#1c274f]">
              Array[{batchResult.lines.length}]
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto rounded-xl border border-[#1b254a] bg-[#070b1a] divide-y divide-[#151f44]">
            {batchResult.lines.map((lineText, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2.5 hover:bg-[#0c122b] transition text-xs"
              >
                <span className="flex-none font-mono font-bold text-cyan-400 w-8 text-right pt-0.5">
                  #{idx + 1}
                </span>
                <span className="font-semibold text-slate-100 font-['Hind_Siliguri'] text-sm leading-snug">
                  {lineText}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Rhyme & Lyric Assistant */}
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">বাংলা গানের ছন্দ ও অন্তমিল সহকারী (Rhyme Assistant)</h3>
            <p className="text-xs text-slate-400">
              গান লেখার সময় যে কোনো শব্দের সাথে ছন্দের অন্তমিল বা রাইমিং শব্দ খুঁজুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <input
            type="text"
            value={rhymeQuery}
            onChange={(e) => setRhymeQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchRhymes()}
            placeholder="শব্দ লিখুন (যেমন: গান, রাত, মন, আলো, চোখ, বৃষ্টি...)"
            className="flex-1 bg-[#080d21] border border-[#202d5c] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleSearchRhymes}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1a2550] hover:bg-[#233368] text-cyan-300 border border-cyan-500/40 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>ছন্দ খুঁজুন</span>
          </button>
        </div>

        {rhymeResults.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 p-3 rounded-xl bg-[#080d22] border border-[#1b254a]">
            {rhymeResults.map((r, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-xs"
              >
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
