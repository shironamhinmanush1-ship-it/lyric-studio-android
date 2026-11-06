import React, { useState } from 'react';
import {
  Download,
  Sparkles,
  Smartphone,
  Music,
  FolderArchive,
  Package,
  X,
  ExternalLink,
  FileCode,
  Check,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  onDownloadOfflineHtml: () => void;
  onInstallPwa: () => void;
  isPwaInstallable: boolean;
  audioFileName: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onDownloadOfflineHtml,
  onInstallPwa,
  isPwaInstallable,
  audioFileName,
}) => {
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#060813]/90 backdrop-blur-md border-b border-[#1c274e] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                  LyricCraft ULTRA
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                Unique Bangla Lyric Video Studio • APK & PWA Ready
              </p>
            </div>
          </div>

          {/* Audio status badge & Action buttons */}
          <div className="flex items-center gap-2">
            {audioFileName && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 text-xs">
                <Music className="w-3.5 h-3.5 animate-pulse" />
                <span className="truncate max-w-[130px]">{audioFileName}</span>
              </div>
            )}

            {/* Standalone HTML Downloads */}
            <div className="hidden sm:flex items-center gap-1.5">
              <a
                href="/LyricCraft_ULTRA_Studio.html"
                download="LyricCraft_ULTRA_Studio.html"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#182348] hover:bg-[#223163] text-slate-200 border border-[#2b3a6e] transition shadow-sm no-underline"
                title="Download HTML 1: Flagship Ultra Video Studio"
              >
                <Download className="w-3.5 h-3.5 text-pink-400" />
                <span>HTML ১: স্টুডিও</span>
              </a>

              <a
                href="/Lyric_Translator_Pro.html"
                download="Lyric_Translator_Pro.html"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#142340] hover:bg-[#1a3058] text-cyan-300 border border-cyan-500/40 transition shadow-sm no-underline"
                title="Download HTML 2: Dedicated Lyric Translator"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>HTML ২: ট্রান্সলেটর</span>
              </a>
            </div>

            {/* APK & GitHub ZIP Modal Trigger */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 hover:from-cyan-400 hover:to-pink-600 text-white shadow-md shadow-cyan-500/20 transition ring-1 ring-cyan-400/40"
            >
              <Package className="w-3.5 h-3.5" />
              <span>📦 APK ও গিটহাব জিপ</span>
            </button>

            {/* Direct PWA Install Button */}
            {isPwaInstallable && (
              <button
                onClick={onInstallPwa}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-500/20 transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* APK & GitHub ZIP Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0c122a] border border-cyan-500/40 p-5 sm:p-6 shadow-2xl space-y-5 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#1f2d5e]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>PWA, GitHub রেডি ও Android APK প্যাকেজ</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ১০০% অফলাইন
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    আপনার প্রয়োজন অনুযায়ী সরাসরি জিপ (.zip) বা সিঙ্গেল ফাইল ডাউনলোড করুন।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-lg bg-[#141d40] hover:bg-[#1e2a58] text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick ZIP Downloads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: GitHub Ready ZIP */}
              <div className="p-4 rounded-xl bg-[#080d22] border border-[#23336a] hover:border-cyan-400/60 transition space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Package className="w-5 h-5 text-pink-400" />
                    <span className="font-bold text-sm text-white">GitHub Ready Project Zip</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    পুরো প্রজেক্টের সম্পূর্ণ সোর্স কোড (React, Vite, Tailwind, Components ও Configs)। সরাসরি GitHub রিপোজিটরিতে আপলোড করার জন্য রেডি।
                  </p>
                </div>
                <a
                  href="/LyricCraft_ULTRA_GitHub_Project.zip"
                  download="LyricCraft_ULTRA_GitHub_Project.zip"
                  className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-pink-500/20 no-underline"
                >
                  <Download className="w-4 h-4" />
                  <span>GitHub জিপ ডাউনলোড (.zip)</span>
                </a>
              </div>

              {/* Option 2: Android APK & PWA Package */}
              <div className="p-4 rounded-xl bg-[#080d22] border border-[#23336a] hover:border-cyan-400/60 transition space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-sm text-white">Android APK & PWA প্যাকেজ</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Android Studio WebView টেমপ্লেট (`AndroidManifest.xml`, `MainActivity.java`), PWA Manifest, আইকনসমূহ ও অফলাইন স্টুডিও HTML।
                  </p>
                </div>
                <a
                  href="/LyricCraft_Android_APK_Package.zip"
                  download="LyricCraft_Android_APK_Package.zip"
                  className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-cyan-500/20 no-underline"
                >
                  <Download className="w-4 h-4" />
                  <span>APK প্যাকেজ জিপ (.zip)</span>
                </a>
              </div>
            </div>

            {/* Standalone Single File Downloads */}
            <div className="p-3.5 rounded-xl bg-[#090e24] border border-[#1b2650] space-y-2.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-purple-400" />
                আলাদা সিঙ্গেল HTML ফাইল (যেকোনো ব্রাউজার ও WebView-তে ডাবল-ক্লিকে চলে):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="/LyricCraft_ULTRA_Studio.html"
                  download="LyricCraft_ULTRA_Studio.html"
                  className="p-2.5 rounded-lg bg-[#11193d] hover:bg-[#1a2559] border border-[#253570] text-xs font-semibold text-slate-200 flex items-center justify-between transition no-underline"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    HTML ১: ভিডিও মেকার স্টুডিও
                  </span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href="/Lyric_Translator_Pro.html"
                  download="Lyric_Translator_Pro.html"
                  className="p-2.5 rounded-lg bg-[#11193d] hover:bg-[#1a2559] border border-[#253570] text-xs font-semibold text-cyan-300 flex items-center justify-between transition no-underline"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    HTML ২: লিরিক ট্রান্সলেটর প্রো
                  </span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* 3 Methods to Make APK & Install */}
            <div className="space-y-3 pt-2 border-t border-[#1e2a56]">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                📱 APK ও PWA ব্যবহারের ৩টি সহজ পদ্ধতি:
              </h4>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-[#070b1d] border border-[#1a254e]">
                  <p className="font-bold text-cyan-300 flex items-center justify-between">
                    <span>১. PWABuilder দিয়ে ১-ক্লিকে সরাসরি APK তৈরি (অনলাইন)</span>
                    <a
                      href="https://www.pwabuilder.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-pink-400 hover:underline inline-flex items-center gap-1"
                    >
                      pwabuilder.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PWABuilder-এ আপনার লাইভ সাইটের URL দিন &gt; "Package for Android" চাপুন &gt; সরাসরি রেডিমেড `.apk` ফাইল ডাউনলোড করে ফোনে ইনস্টল করুন।
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#070b1d] border border-[#1a254e]">
                  <p className="font-bold text-purple-300">
                    ২. Android Studio দিয়ে অফলাইন WebView APK তৈরি
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    ডাউনলোড করা APK প্যাকেজের `AndroidManifest.xml` এবং `MainActivity.java` ফাইল দুটি Android Studio-তে পেস্ট করুন এবং `assets/` ফোল্ডারে `LyricCraft_ULTRA_Studio.html` দিয়ে "Build APK" চাপুন।
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#070b1d] border border-[#1a254e]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-emerald-300">
                        ৩. মোবাইল ক্রোম ব্রাউজার থেকে সরাসরি PWA ইনস্টল
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        ফোনের ক্রোম ব্রাউজারের থ্রি-ডট (⋮) মেনু থেকে "Add to Home screen" বা "Install App" চাপুন।
                      </p>
                    </div>
                    {isPwaInstallable && (
                      <button
                        onClick={() => {
                          onInstallPwa();
                          setShowExportModal(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 ml-2"
                      >
                        Install Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl bg-[#141d40] hover:bg-[#1e2a58] text-xs font-bold text-slate-300 transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
