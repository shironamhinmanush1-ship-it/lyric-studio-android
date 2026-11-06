import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Clock,
  Palette,
  Image as ImageIcon,
  Film,
  Languages,
  Play,
  Pause,
} from 'lucide-react';
import { StudioConfig, LyricLine, AspectRatioType } from './types';
import { Navbar } from './components/Navbar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { DashboardTab } from './components/DashboardTab';
import { SyncTab } from './components/SyncTab';
import { StyleTab } from './components/StyleTab';
import { BackgroundTab } from './components/BackgroundTab';
import { ExportTab } from './components/ExportTab';
import { ThumbnailTab } from './components/ThumbnailTab';
import { TranslatorTab } from './components/TranslatorTab';

const DEFAULT_CONFIG: StudioConfig = {
  font: 'Hind Siliguri',
  fontSize: 48,
  textColor: '#ffffff',
  glowColor: '#ff2a7a',
  preset: 'neon',
  bgType: 'rain',
  darkOverlay: 40,
  bgBlur: 0,
  ratio: '16:9',
  hasIntro: true,
  introTitle: 'Tanvir Rahman Rony Presents',
  introSubtitle: 'Official Lyric Video',
  hasOutro: true,
  outroText: 'Like • Share • Subscribe',
  outroChannel: 'Thanks For Watching',
  kineticEnabled: true,
  beatPulseEnabled: true,
  vignetteEnabled: true,
  particlesEnabled: true,
  scanlinesEnabled: false,
  songTitle: 'উজাড় করে দিয়েছিলাম',
  artistName: 'Tanvir Rahman Rony',
};

const INITIAL_LYRICS_TEXT = `উজাড় করে দিয়েছিলাম
তবুও তুমি বুঝলে না
বৃষ্টি ভেজা এই রাতে
তোমাকেই খুঁজেছি`;

type TabKey = 'dashboard' | 'sync' | 'style' | 'background' | 'export' | 'thumbnail' | 'bijoy';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [config, setConfig] = useState<StudioConfig>(DEFAULT_CONFIG);

  // Audio state
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bass, setBass] = useState<number>(0);

  // Lyrics state
  const [lyricsText, setLyricsText] = useState<string>(INITIAL_LYRICS_TEXT);
  const [lyrics, setLyrics] = useState<LyricLine[]>(() => {
    return INITIAL_LYRICS_TEXT.split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text, i) => ({
        id: String(i + 1),
        text,
        start: null,
        end: null,
      }));
  });
  const [currentTapIndex, setCurrentTapIndex] = useState<number>(0);

  // Background media
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [bgVideo, setBgVideo] = useState<HTMLVideoElement | null>(null);

  // Video recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [recordingStatusText, setRecordingStatusText] = useState<string>('');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedVideoExt, setRecordedVideoExt] = useState<string>('webm');

  // PWA install prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstallable, setIsPwaInstallable] = useState<boolean>(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // PWA install listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPwaInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) {
      alert('আপনার ব্রাউজার মেন্যু থেকে "Add to Home screen" বা "Install App" চাপুন।');
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPwaInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Standalone Single-file HTML Download
  const handleDownloadOfflineHtml = () => {
    // We provide a link to the dedicated pre-compiled standalone offline file
    const link = document.createElement('a');
    link.href = '/LyricCraft_ULTRA_Offline.html';
    link.download = 'LyricCraft_ULTRA_Offline.html';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Setup Web Audio graph
  const ensureAudioGraph = useCallback(() => {
    if (audioContextRef.current) return;
    const audioEl = audioRef.current;
    if (!audioEl) return;

    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const source = ctx.createMediaElementSource(audioEl);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const dest = ctx.createMediaStreamDestination();

      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyser.connect(dest);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      audioDestRef.current = dest;
    } catch (_e) {
      // Audio element source already created
    }
  }, []);

  // Audio Play/Pause
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) {
      alert('আগে একটি গান আপলোড করুন');
      return;
    }
    ensureAudioGraph();
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (audio.paused) {
      audio.play().catch(() => {});
      setIsPlaying(true);
      if (bgVideo && bgVideo.paused) bgVideo.play().catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
      if (bgVideo && !bgVideo.paused) bgVideo.pause();
    }
  }, [ensureAudioGraph, bgVideo]);

  // Audio Seek
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Audio frequency data polling for Bass pulse
  useEffect(() => {
    let animId: number;
    const freqBuf = new Uint8Array(32);

    const updateBass = () => {
      const analyser = analyserRef.current;
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(freqBuf);
        let sum = 0;
        for (let i = 0; i < 6; i++) sum += freqBuf[i];
        const raw = sum / 6 / 255;
        setBass((prev) => prev + (raw - prev) * 0.35);
      } else {
        setBass((prev) => prev * 0.9);
      }
      animId = requestAnimationFrame(updateBass);
    };

    updateBass();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Audio file load
  const handleAudioUpload = (file: File) => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = URL.createObjectURL(file);
    audio.src = url;
    setAudioFileName(file.name);
    audio.load();
  };

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Apply Lyrics from Textarea
  const handleApplyLyrics = () => {
    const lines = lyricsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    if (!lines.length) {
      alert('দয়া করে অন্তত ১টি লাইন লিরিক লিখুন');
      return;
    }

    setLyrics(
      lines.map((text, i) => ({
        id: String(i + 1),
        text,
        start: null,
        end: null,
      }))
    );
    setCurrentTapIndex(0);
    alert(`✅ ${lines.length}টি লিরিক লাইন লোড হয়েছে!`);
  };

  // BUG #1 FIX: Accurate Auto-Sync dividing (duration - intro(3s) - outro(3s)) / lyrics.length
  const handleAutoSync = () => {
    if (!lyrics.length) {
      alert('আগে লিরিক্স লোড করুন');
      return;
    }
    const dur = audioRef.current?.duration || duration;
    if (!dur || !isFinite(dur)) {
      alert('গান লোড হয়নি, duration পাওয়া যায়নি');
      return;
    }

    const introOffset = config.hasIntro ? 3.0 : 0.0;
    const outroOffset = config.hasOutro ? 3.0 : 0.0;
    let totalAvailable = dur - introOffset - outroOffset;
    if (totalAvailable <= 0) {
      totalAvailable = dur;
    }

    const perLine = totalAvailable / lyrics.length;
    const updated = lyrics.map((line, i) => ({
      ...line,
      start: +(introOffset + i * perLine).toFixed(2),
      end: +(introOffset + (i + 1) * perLine - 0.15).toFixed(2),
    }));

    setLyrics(updated);
    setCurrentTapIndex(lyrics.length);
    alert('✅ নিখুঁত অটো সিঙ্ক সম্পন্ন হয়েছে (Intro ও Outro বাদ দিয়ে সমান ভাগে)!');
  };

  // Tap Sync Action
  const handleTapSync = () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) {
      alert('আগে গান বাছাই করুন');
      return;
    }
    if (audio.paused) togglePlay();
    if (!lyrics.length) return;

    let targetIdx = currentTapIndex;
    if (targetIdx >= lyrics.length) {
      targetIdx = 0;
    }

    const t = +audio.currentTime.toFixed(2);
    const updated = [...lyrics];
    updated[targetIdx].start = t;
    updated[targetIdx].end = +(t + 4).toFixed(2);

    if (targetIdx > 0) {
      updated[targetIdx - 1].end = +Math.max(
        (updated[targetIdx - 1].start ?? 0) + 0.3,
        t - 0.08
      ).toFixed(2);
    }

    setLyrics(updated);
    setCurrentTapIndex(targetIdx + 1);
  };

  // Undo Tap
  const handleUndoTap = () => {
    if (currentTapIndex > 0) {
      const prevIdx = currentTapIndex - 1;
      const updated = [...lyrics];
      updated[prevIdx].start = null;
      updated[prevIdx].end = null;
      setLyrics(updated);
      setCurrentTapIndex(prevIdx);
    }
  };

  // Reset all sync
  const handleResetSync = () => {
    if (confirm('আপনি কি সব লাইনের টাইমিং মুছে ফেলতে চান?')) {
      const updated = lyrics.map((l) => ({ ...l, start: null, end: null }));
      setLyrics(updated);
      setCurrentTapIndex(0);
    }
  };

  // Manual line time change
  const handleUpdateLineTime = (
    index: number,
    start: number | null,
    end: number | null
  ) => {
    setLyrics((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], start, end };
      return copy;
    });
  };

  // BUG #1 FIX: "এখন সেট করুন" for start and end
  const handleSetLineStartNow = (index: number) => {
    const t = +(audioRef.current?.currentTime || 0).toFixed(2);
    setLyrics((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      const newEnd = cur.end !== null && cur.end > t ? cur.end : +(t + 4).toFixed(2);
      copy[index] = { ...cur, start: t, end: newEnd };
      return copy;
    });
  };

  const handleSetLineEndNow = (index: number) => {
    const t = +(audioRef.current?.currentTime || 0).toFixed(2);
    setLyrics((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], end: t };
      return copy;
    });
  };

  // Export LRC
  const handleExportLrc = () => {
    let out = '';
    lyrics.forEach((line) => {
      if (line.start !== null) {
        const m = Math.floor(line.start / 60);
        const s = (line.start % 60).toFixed(2);
        out += `[${String(m).padStart(2, '0')}:${s.padStart(5, '0')}]${line.text}\n`;
      }
    });
    if (!out) {
      alert('এখনো কোনো লাইন সিঙ্ক করা হয়নি');
      return;
    }
    const blob = new Blob([out], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lyrics.lrc';
    a.click();
  };

  // Import LRC
  const handleImportLrc = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split('\n');
      const parsed: LyricLine[] = [];
      const regex = /\[(\d+):(\d+(?:\.\d+)?)\](.*)/;

      lines.forEach((l, idx) => {
        const match = l.match(regex);
        if (match) {
          const min = parseInt(match[1], 10);
          const sec = parseFloat(match[2]);
          const start = +(min * 60 + sec).toFixed(2);
          const textStr = match[3].trim();
          if (textStr) {
            parsed.push({
              id: String(idx + 1),
              text: textStr,
              start,
              end: +(start + 4).toFixed(2),
            });
          }
        }
      });

      if (parsed.length) {
        setLyrics(parsed);
        setLyricsText(parsed.map((p) => p.text).join('\n'));
        setCurrentTapIndex(parsed.length);
        alert(`✅ ${parsed.length}টি লাইন LRC থেকে সফলভাবে ইমপোর্ট হয়েছে!`);
      } else {
        alert('LRC ফাইলটি সঠিক ফরম্যাটে নেই');
      }
    };
    reader.readAsText(file);
  };

  // Background Image Upload
  const handleImageUpload = (file: File) => {
    const img = new Image();
    img.onload = () => {
      setBgImage(img);
      setConfig((prev) => ({ ...prev, bgType: 'image' }));
    };
    img.src = URL.createObjectURL(file);
  };

  // Background Video Upload
  const handleVideoUpload = (file: File) => {
    const vid = document.createElement('video');
    vid.src = URL.createObjectURL(file);
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.play().catch(() => {});
    setBgVideo(vid);
    setConfig((prev) => ({ ...prev, bgType: 'video' }));
  };

  // Custom Font Upload
  const handleCustomFontUpload = async (fontName: string, file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const fontFace = new FontFace(fontName, buffer);
      await fontFace.load();
      document.fonts.add(fontFace);
      setConfig((prev) => ({ ...prev, font: fontName }));
      alert(`✅ ফন্ট "${file.name}" সফলভাবে লোড হয়েছে!`);
    } catch (_e) {
      alert('ফন্ট লোড করা যায়নি');
    }
  };

  // BUG #3 FIX: Start Video Recording with Intro (3s) + Song Lyrics + Outro (3s)
  const handleStartRecording = async () => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !audio.src) {
      alert('আগে গান বাছাই করুন');
      return;
    }
    if (!canvas) return;

    ensureAudioGraph();
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const stream = canvas.captureStream(30);
    if (audioDestRef.current) {
      audioDestRef.current.stream.getAudioTracks().forEach((track) => {
        stream.addTrack(track);
      });
    }

    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
    ];
    const mime = mimeTypes.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));

    if (!mime) {
      alert('এই ডিভাইসে ভিডিও রেকর্ডিং সাপোর্ট নেই, অনুগ্রহ করে Google Chrome ব্যবহার করুন');
      return;
    }

    recordedChunksRef.current = [];
    let mr: MediaRecorder;
    try {
      const isMobile =
        typeof navigator !== 'undefined' &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const videoBitsPerSecond = isMobile ? 3500000 : 8000000;

      mr = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond,
      });
    } catch (_e) {
      alert('রেকর্ডার চালু করা যায়নি');
      return;
    }

    mediaRecorderRef.current = mr;
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size) recordedChunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const ext = mime.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunksRef.current, { type: mime.split(';')[0] });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
      setRecordedVideoExt(ext);
      setIsRecording(false);
      setRecordingProgress(100);
      setRecordingStatusText(`✅ ভিডিও সফলভাবে তৈরি হয়েছে (${(blob.size / 1024 / 1024).toFixed(1)}MB)`);
    };

    setIsRecording(true);
    setRecordedVideoUrl(null);
    setRecordingProgress(0);
    setRecordingStatusText('🔴 রেকর্ড হচ্ছে: ৩s Intro + লিরিক্স + ৩s Outro...');

    // Start recorder
    mr.start(1000);
    audio.pause();
    audio.currentTime = 0;

    const introDur = config.hasIntro ? 3.0 : 0.0;
    const songDur = audio.duration || 60;
    const outroDur = config.hasOutro ? 3.0 : 0.0;
    const totalVideoDur = introDur + songDur + outroDur;

    // Phase 1: Wait 3 seconds for intro
    if (introDur > 0) {
      let elapsed = 0;
      const introInterval = setInterval(() => {
        elapsed += 0.2;
        const pct = (elapsed / totalVideoDur) * 100;
        setRecordingProgress(Math.min(99, pct));
        if (elapsed >= 3.0) {
          clearInterval(introInterval);
          audio.play().catch(() => {});
        }
      }, 200);
    } else {
      audio.play().catch(() => {});
    }

    // Audio time update during recording
    const recordTimeUpdateHandler = () => {
      const cur = introDur + (audio.currentTime || 0);
      const pct = (cur / totalVideoDur) * 100;
      setRecordingProgress(Math.min(99, pct));
    };

    audio.addEventListener('timeupdate', recordTimeUpdateHandler);

    audio.onended = () => {
      audio.removeEventListener('timeupdate', recordTimeUpdateHandler);
      if (outroDur > 0) {
        // Phase 3: Wait 3 seconds for outro
        setTimeout(() => {
          if (mr && mr.state !== 'inactive') mr.stop();
        }, 3000);
      } else {
        if (mr && mr.state !== 'inactive') mr.stop();
      }
    };
  };

  // Stop Recording manually
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      audioRef.current?.pause();
    }
  };

  // Share Video
  const handleShareVideo = async () => {
    if (!recordedVideoUrl) return;
    try {
      const response = await fetch(recordedVideoUrl);
      const blob = await response.blob();
      const file = new File([blob], `LyricCraft_Video.${recordedVideoExt}`, {
        type: blob.type,
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: config.songTitle,
          text: 'Made with LyricCraft ULTRA',
        });
      }
    } catch (_e) {}
  };

  // Send batch converted lyrics to studio
  const handleSendTranslatedLyrics = (convertedText: string) => {
    setLyricsText(convertedText);
    const lines = convertedText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    setLyrics(
      lines.map((text, i) => ({
        id: String(i + 1),
        text,
        start: null,
        end: null,
      }))
    );
    setCurrentTapIndex(0);
    setActiveTab('sync');
    alert(`✅ ব্যাচ প্রসেসিং সফল! মোট ${lines.length}টি লিরিক লাইন স্টুডিও সিঙ্ক টেবিলে লোড হয়েছে।`);
  };

  const syncedCount = lyrics.filter((l) => l.start !== null).length;

  return (
    <div className="min-h-screen bg-[#060813] text-slate-100 flex flex-col font-['Hind_Siliguri']">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto" />

      {/* Top Navbar */}
      <Navbar
        onDownloadOfflineHtml={handleDownloadOfflineHtml}
        onInstallPwa={handleInstallPwa}
        isPwaInstallable={isPwaInstallable}
        audioFileName={audioFileName}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 pb-32 sm:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Preview Canvas (Docked & Sticky on Desktop) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3 lg:sticky lg:top-18 lg:self-start">
          <PreviewCanvas
            config={config}
            lyrics={lyrics}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onRatioChange={(ratio) => setConfig((prev) => ({ ...prev, ratio }))}
            bgImage={bgImage}
            bgVideo={bgVideo}
            bass={bass}
            canvasRef={canvasRef}
          />
        </div>

        {/* Right Column: Lazy-Loaded Modular Tabs */}
        <div className="lg:col-span-7 xl:col-span-7">
          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none no-scrollbar touch-pan-x">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition flex-none ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-[#0f152f] text-slate-400 hover:text-white border border-[#1d274f]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>ড্যাশবোর্ড</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition flex-none ${
                activeTab === 'sync'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-[#0f152f] text-slate-400 hover:text-white border border-[#1d274f]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>সিঙ্ক স্টুডিও</span>
            </button>

            <button
              onClick={() => setActiveTab('style')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition flex-none ${
                activeTab === 'style'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-[#0f152f] text-slate-400 hover:text-white border border-[#1d274f]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>স্টাইল ও ৫ প্রিসেট</span>
            </button>

            <button
              onClick={() => setActiveTab('background')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition flex-none ${
                activeTab === 'background'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-[#0f152f] text-slate-400 hover:text-white border border-[#1d274f]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>ব্যাকগ্রাউন্ড</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition flex-none ${
                activeTab === 'export'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-[#0f152f] text-slate-400 hover:text-white border border-[#1d274f]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>ভিডিও ও ইন্ট্রো</span>
            </button>

            <button
              onClick={() => setActiveTab('thumbnail')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition flex-none ${
                activeTab === 'thumbnail'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-[#0f152f] text-slate-400 hover:text-white border border-[#1d274f]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>থাম্বনেইল</span>
            </button>

            <button
              onClick={() => setActiveTab('bijoy')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition flex-none ${
                activeTab === 'bijoy'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-[#0f152f] text-slate-400 hover:text-white border border-[#1d274f]'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>🌐 লিরিক ট্রান্সলেটর</span>
            </button>
          </div>

          {/* Lazy Rendering: Active Module Only */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              onAudioUpload={handleAudioUpload}
              audioFileName={audioFileName}
              duration={duration}
              lyricsText={lyricsText}
              onLyricsTextChange={setLyricsText}
              onApplyLyrics={handleApplyLyrics}
              onAutoSync={handleAutoSync}
              onNavigateToSync={() => setActiveTab('sync')}
              lyricsCount={lyrics.length}
              syncedCount={syncedCount}
            />
          )}

          {activeTab === 'sync' && (
            <SyncTab
              lyrics={lyrics}
              currentTime={currentTime}
              duration={duration}
              currentTapIndex={currentTapIndex}
              onTap={handleTapSync}
              onUndo={handleUndoTap}
              onAutoSync={handleAutoSync}
              onReset={handleResetSync}
              onUpdateLineTime={handleUpdateLineTime}
              onSetLineStartNow={handleSetLineStartNow}
              onSetLineEndNow={handleSetLineEndNow}
              onSeekTo={handleSeek}
              onExportLrc={handleExportLrc}
              onImportLrc={handleImportLrc}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
            />
          )}

          {activeTab === 'style' && (
            <StyleTab
              config={config}
              onUpdateConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
              onCustomFontUpload={handleCustomFontUpload}
            />
          )}

          {activeTab === 'background' && (
            <BackgroundTab
              config={config}
              onUpdateConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
              onImageUpload={handleImageUpload}
              onVideoUpload={handleVideoUpload}
              hasCustomImage={!!bgImage}
              hasCustomVideo={!!bgVideo}
            />
          )}

          {activeTab === 'export' && (
            <ExportTab
              config={config}
              onUpdateConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
              isRecording={isRecording}
              recordingProgress={recordingProgress}
              recordingStatusText={recordingStatusText}
              recordedVideoUrl={recordedVideoUrl}
              recordedVideoExt={recordedVideoExt}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onShareVideo={handleShareVideo}
              canShare={typeof navigator !== 'undefined' && !!navigator.canShare}
              hasAudio={!!audioRef.current?.src}
            />
          )}

          {activeTab === 'thumbnail' && (
            <ThumbnailTab
              config={config}
              onUpdateConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
              bgImage={bgImage}
              lyricsTitle={lyrics[0]?.text || config.songTitle}
            />
          )}

          {activeTab === 'bijoy' && (
            <TranslatorTab onSendToLyrics={handleSendTranslatedLyrics} />
          )}
        </div>
      </main>

      {/* Mobile Sticky Floating Mini-Controller (Visible on Mobile Chrome < 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b1e]/95 backdrop-blur-lg border-t border-[#1e2a56] shadow-[0_-8px_30px_rgba(0,0,0,0.7)] px-3.5 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        {/* Scrub progress bar */}
        <div className="w-full mb-1.5">
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full accent-pink-500 h-1.5 bg-[#172147] rounded-lg cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Left: Play/Pause and timecode */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold flex items-center justify-center active:scale-95 shadow-md shadow-cyan-500/20 shrink-0"
              title="প্লে / পজ"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div className="font-mono text-[11px] text-cyan-300 font-bold whitespace-nowrap">
              {currentTime.toFixed(1)}s / {duration > 0 ? `${duration.toFixed(1)}s` : '0s'}
            </div>
          </div>

          {/* Right: Quick Action based on tab */}
          {activeTab === 'sync' ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  try {
                    if (navigator.vibrate) navigator.vibrate(25);
                  } catch (_e) {}
                  handleUndoTap();
                }}
                disabled={currentTapIndex === 0}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#172248] text-slate-300 border border-[#27386c] disabled:opacity-30 active:scale-95"
              >
                Undo
              </button>
              <button
                onClick={() => {
                  try {
                    if (navigator.vibrate) navigator.vibrate(40);
                  } catch (_e) {}
                  handleTapSync();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-slate-950 shadow-md shadow-orange-500/30 active:scale-95 flex items-center gap-1 shrink-0"
              >
                <span>👆 ট্যাপ সিঙ্ক</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('sync')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#141e44] text-cyan-300 border border-cyan-500/30 active:scale-95 flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>সিঙ্ক করুন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
