import React, { useState } from 'react';
import { Languages, ArrowRight, Copy, Check, Send } from 'lucide-react';
import { convertBijoyToUnicode } from '../utils/bijoyToUnicode';

interface BijoyTabProps {
  onSendToLyrics: (unicodeText: string) => void;
}

export const BijoyTab: React.FC<BijoyTabProps> = ({ onSendToLyrics }) => {
  const [bijoyText, setBijoyText] = useState('');
  const [unicodeText, setUnicodeText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConvert = (input: string) => {
    setBijoyText(input);
    const converted = convertBijoyToUnicode(input);
    setUnicodeText(converted);
  };

  const handleCopy = () => {
    if (!unicodeText) return;
    navigator.clipboard.writeText(unicodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!unicodeText.trim()) {
      alert('আগে কিছু টেক্সট কনভার্ট করুন');
      return;
    }
    onSendToLyrics(unicodeText);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#0f152f]/95 border border-[#1e2955] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              বিজয় টু ইউনিকোড কনভার্টার (Font Translator)
            </h2>
            <p className="text-xs text-slate-400">
              SutonnyMJ / বিজয় ৫২ ফন্টের লিরিক এখানে পেস্ট করলে স্বয়ংক্রিয়ভাবে ইউনিকোড বাংলায় রূপান্তর হবে
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bijoy Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                বিজয় (SutonnyMJ / ANSI) টেক্সট পেস্ট করুন
              </label>
              <button
                type="button"
                onClick={() => handleConvert('Avgvi fv‡jvvevmv\nAvgvi †mvbvi evsjv')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                নমুনা টেক্সট
              </button>
            </div>
            <textarea
              value={bijoyText}
              onChange={(e) => handleConvert(e.target.value)}
              placeholder="যেমন: Avgvi fv‡jvvevmv..."
              className="w-full h-48 bg-[#080d21] border border-[#202d5c] rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-y"
            />
          </div>

          {/* Unicode Output */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                কনভার্ট করা ইউনিকোড বাংলা টেক্সট
              </label>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!unicodeText}
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 disabled:opacity-40"
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
            <textarea
              value={unicodeText}
              readOnly
              placeholder="কনভার্ট করা বাংলা এখানে প্রদর্শিত হবে..."
              className="w-full h-48 bg-[#080d21] border border-[#202d5c] rounded-xl p-3 text-sm text-cyan-200 placeholder:text-slate-500 font-['Hind_Siliguri'] resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-4 pt-3 border-t border-[#1b254a]">
          <button
            onClick={() => handleConvert(bijoyText)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#172248] hover:bg-[#202e60] text-slate-200 border border-[#27386c] transition"
          >
            পুনরায় কনভার্ট করুন
          </button>

          <button
            onClick={handleSend}
            disabled={!unicodeText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400 hover:opacity-90 text-white shadow-md shadow-pink-500/20 disabled:opacity-40 transition"
          >
            <Send className="w-4 h-4" />
            <span>📥 সরাসরি লিরিক্সে পাঠান (Send to Lyrics)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
