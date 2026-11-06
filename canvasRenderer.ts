import { StudioConfig, LyricLine } from '../types';

export interface Particle {
  x: number;
  y: number;
  speed: number;
  radius: number;
  alpha: number;
  length: number;
}

export function createRainParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: 7 + Math.random() * 10,
    radius: 1 + Math.random() * 2,
    alpha: 0.25 + Math.random() * 0.45,
    length: 12 + Math.random() * 20,
  }));
}

export function createBokehParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: 0.4 + Math.random() * 0.8,
    radius: 18 + Math.random() * 45,
    alpha: 0.12 + Math.random() * 0.2,
    length: 0,
  }));
}

// Bengali grapheme segmenter for accurate typewriter slicing
const graphemeSegmenter =
  typeof window !== 'undefined' && 'Intl' in window && 'Segmenter' in (window.Intl as any)
    ? new (window.Intl as any).Segmenter('bn', { granularity: 'grapheme' })
    : null;

export function getBengaliGraphemes(text: string): string[] {
  if (graphemeSegmenter) {
    return [...graphemeSegmenter.segment(text)].map((x: any) => x.segment);
  }
  return [...text];
}

export function wrapBengaliText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontFamily: string,
  fontSize: number
): { lines: string[]; words: { word: string; width: number; lineIndex: number }[] } {
  ctx.font = `700 ${fontSize}px "${fontFamily}", system-ui, sans-serif`;
  const spaceWidth = ctx.measureText(' ').width;
  const rawWords = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  const words: { word: string; width: number; lineIndex: number }[] = [];

  let currentLine = '';
  let currentLineWidth = 0;
  let currentLineIndex = 0;

  for (const w of rawWords) {
    const wWidth = ctx.measureText(w).width;
    if (currentLineWidth + wWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine.trim());
      currentLine = w + ' ';
      currentLineWidth = wWidth + spaceWidth;
      currentLineIndex++;
    } else {
      currentLine += w + ' ';
      currentLineWidth += wWidth + spaceWidth;
    }
    words.push({ word: w, width: wWidth, lineIndex: currentLineIndex });
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return { lines, words };
}

export function drawCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  targetW: number,
  targetH: number
) {
  const srcW = (source as any).videoWidth || (source as any).naturalWidth || (source as any).width || targetW;
  const srcH = (source as any).videoHeight || (source as any).naturalHeight || (source as any).height || targetH;
  if (!srcW || !srcH) return;

  const scale = Math.max(targetW / srcW, targetH / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const offsetX = (targetW - drawW) / 2;
  const offsetY = (targetH - drawH) / 2;

  try {
    ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
  } catch (_e) {
    // Ignore frame draw error if video not ready
  }
}

export function drawSceneFrame({
  ctx,
  width,
  height,
  currentTime,
  duration,
  bass,
  config,
  lyrics,
  bgImage,
  bgVideo,
  rainParticles,
  bokehParticles,
  isRecording = false,
  overridePhase,
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  currentTime: number;
  duration: number;
  bass: number;
  config: StudioConfig;
  lyrics: LyricLine[];
  bgImage: HTMLImageElement | null;
  bgVideo: HTMLVideoElement | null;
  rainParticles: Particle[];
  bokehParticles: Particle[];
  isRecording?: boolean;
  overridePhase?: 'intro' | 'song' | 'outro';
}) {
  const scaleRatio = Math.min(width, height) / 720;
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // 1. BEAT PULSE
  if (config.beatPulseEnabled && bass > 0.05) {
    const pulse = 1 + bass * 0.035;
    ctx.translate(width / 2, height / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-width / 2, -height / 2);
  }

  // 2. BACKGROUND RENDERING
  if (config.bgType === 'image' && bgImage) {
    ctx.filter = config.bgBlur > 0 ? `blur(${config.bgBlur * scaleRatio}px)` : 'none';
    drawCover(ctx, bgImage, width, height);
    ctx.filter = 'none';
  } else if (config.bgType === 'video' && bgVideo && bgVideo.readyState >= 2) {
    ctx.filter = config.bgBlur > 0 ? `blur(${config.bgBlur * scaleRatio}px)` : 'none';
    drawCover(ctx, bgVideo, width, height);
    ctx.filter = 'none';
  } else {
    // Gradient backgrounds
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (config.preset === 'neon') {
      grad.addColorStop(0, '#0c071e');
      grad.addColorStop(0.5, '#1b0933');
      grad.addColorStop(1, '#05030f');
    } else if (config.preset === 'rain') {
      grad.addColorStop(0, '#0a1428');
      grad.addColorStop(0.5, '#0e1d38');
      grad.addColorStop(1, '#040712');
    } else if (config.preset === 'retro') {
      grad.addColorStop(0, '#101018');
      grad.addColorStop(0.5, '#1a1824');
      grad.addColorStop(1, '#08080c');
    } else {
      // Cinematic
      grad.addColorStop(0, '#111728');
      grad.addColorStop(0.5, '#0b1120');
      grad.addColorStop(1, '#04060d');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Dark overlay
  if (config.darkOverlay > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${config.darkOverlay / 100})`;
    ctx.fillRect(0, 0, width, height);
  }

  // 3. PARTICLES (Rain & Bokeh)
  const isRainPreset = config.preset === 'rain' || config.bgType === 'rain';
  if (config.particlesEnabled && (isRainPreset || config.preset === 'cinematic')) {
    ctx.strokeStyle = 'rgba(180, 215, 255, 0.42)';
    ctx.lineWidth = Math.max(1, 1.5 * scaleRatio);
    ctx.beginPath();
    rainParticles.forEach((p) => {
      p.y += p.speed * (1 + bass * 0.2);
      if (p.y > height) {
        p.y = -30;
        p.x = Math.random() * width;
      }
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 2.5 * scaleRatio, p.y + p.length * scaleRatio);
    });
    ctx.stroke();
  }

  if (config.particlesEnabled && (config.preset === 'neon' || config.preset === 'rain' || config.bgType === 'bokeh')) {
    bokehParticles.forEach((p, idx) => {
      p.y -= p.speed * 0.8;
      if (p.y < -p.radius * 2) {
        p.y = height + 40;
        p.x = Math.random() * width;
      }
      const pulseRadius = p.radius * (1 + bass * 0.35) * scaleRatio;
      ctx.globalAlpha = p.alpha + bass * 0.12;
      ctx.fillStyle = idx % 2 === 0 ? config.glowColor : '#00e5ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, pulseRadius), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // 4. VIGNETTE
  if (config.vignetteEnabled || config.preset === 'cinematic') {
    const vig = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.35,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
  }

  // Determine current display mode: INTRO, SONG LYRIC, or OUTRO
  let currentPhase: 'intro' | 'song' | 'outro' = 'song';
  if (overridePhase) {
    currentPhase = overridePhase;
  } else if (!isRecording) {
    if (config.hasIntro && currentTime < 3 && duration > 0) {
      currentPhase = 'intro';
    } else if (config.hasOutro && duration > 8 && currentTime > duration - 3) {
      currentPhase = 'outro';
    }
  }

  // 5. INTRO BANNER
  if (currentPhase === 'intro') {
    const introProgress = Math.min(1, Math.max(0, currentTime / 3));
    const alpha = Math.min(1, Math.max(0, Math.sin(introProgress * Math.PI) * 1.4));

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title
    const titleSize = Math.max(26, config.fontSize * 1.35 * scaleRatio);
    ctx.font = `800 ${titleSize}px "${config.font}", system-ui, sans-serif`;
    ctx.shadowColor = config.glowColor;
    ctx.shadowBlur = (25 + bass * 30) * scaleRatio;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(config.introTitle || 'LyricCraft ULTRA', width / 2, height / 2 - 25 * scaleRatio);

    // Accent line
    ctx.shadowBlur = 0;
    ctx.fillStyle = config.glowColor;
    ctx.fillRect(width / 2 - 80 * scaleRatio, height / 2 + 20 * scaleRatio, 160 * scaleRatio, 4 * scaleRatio);

    // Subtitle / Artist
    const subSize = Math.max(16, titleSize * 0.45);
    ctx.font = `600 ${subSize}px "${config.font}", system-ui, sans-serif`;
    ctx.fillStyle = '#d2dcf5';
    ctx.fillText(config.introSubtitle || 'Presents', width / 2, height / 2 + 55 * scaleRatio);

    ctx.restore();
  }

  // 6. OUTRO BANNER
  else if (currentPhase === 'outro') {
    const outroProgress = duration > 0 ? Math.min(1, Math.max(0, (currentTime - (duration - 3)) / 3)) : 0.5;
    const alpha = Math.min(1, Math.max(0, Math.sin(outroProgress * Math.PI) * 1.4));

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outro text
    const outroSize = Math.max(24, config.fontSize * 1.15 * scaleRatio);
    ctx.font = `800 ${outroSize}px "${config.font}", system-ui, sans-serif`;
    ctx.shadowColor = config.glowColor;
    ctx.shadowBlur = (25 + bass * 30) * scaleRatio;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(config.outroText || 'Like • Share • Subscribe', width / 2, height / 2 - 20 * scaleRatio);

    // Channel name / Artist
    const subSize = Math.max(16, outroSize * 0.48);
    ctx.shadowBlur = 0;
    ctx.font = `700 ${subSize}px "${config.font}", system-ui, sans-serif`;
    ctx.fillStyle = config.glowColor;
    ctx.fillText(config.outroChannel || 'Thanks For Watching', width / 2, height / 2 + 45 * scaleRatio);

    ctx.restore();
  }

  // 7. LYRICS RENDERING
  else {
    // Find active lyric line
    let activeIndex = -1;
    for (let i = 0; i < lyrics.length; i++) {
      const line = lyrics[i];
      if (line.start !== null && currentTime >= line.start) {
        if (activeIndex < 0 || (lyrics[activeIndex].start !== null && line.start >= (lyrics[activeIndex].start as number))) {
          activeIndex = i;
        }
      }
    }

    const activeLine = activeIndex >= 0 ? lyrics[activeIndex] : null;
    const nextLine = activeIndex >= 0 && activeIndex + 1 < lyrics.length ? lyrics[activeIndex + 1] : null;

    if (activeLine && activeLine.start !== null) {
      const lineStart = activeLine.start;
      const lineEnd = activeLine.end ?? (nextLine && nextLine.start !== null ? nextLine.start : lineStart + 6);
      const isWithinTime = currentTime <= lineEnd + 0.3;

      if (isWithinTime) {
        const lineDuration = Math.max(0.2, lineEnd - lineStart);
        const progress = Math.min(1, Math.max(0, (currentTime - lineStart) / lineDuration));
        const fadeOut = Math.min(1, Math.max(0, (lineEnd + 0.3 - currentTime) / 0.4));

        // Auto-shrink font size if text.length > 30 characters
        let baseSize = config.fontSize * scaleRatio;
        if (activeLine.text.length > 30) {
          const shrinkFactor = Math.max(0.55, 28 / activeLine.text.length);
          baseSize = Math.max(18 * scaleRatio, baseSize * shrinkFactor);
        }

        const maxTextWidth = width * 0.84;
        const maxTextHeight = height * 0.7;

        // Wrap lines
        let wrapRes = wrapBengaliText(ctx, activeLine.text, maxTextWidth, config.font, baseSize);

        // Extra safeguard: iteratively reduce if exceeds max height
        let guard = 0;
        while (wrapRes.lines.length * baseSize * 1.35 > maxTextHeight && guard < 6) {
          baseSize *= 0.85;
          wrapRes = wrapBengaliText(ctx, activeLine.text, maxTextWidth, config.font, baseSize);
          guard++;
        }

        const lineHeight = baseSize * 1.38;
        const totalHeight = wrapRes.lines.length * lineHeight;
        const startY = height / 2 - totalHeight / 2 + lineHeight / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Preset 1: CINEMATIC
        if (config.preset === 'cinematic') {
          const fadeIn = Math.min(1, (currentTime - lineStart) / 0.65);
          ctx.globalAlpha = fadeIn * fadeOut;
          ctx.font = `700 ${baseSize}px "${config.font}", system-ui, sans-serif`;
          ctx.shadowColor = 'rgba(0,0,0,0.95)';
          ctx.shadowBlur = 24 * scaleRatio;
          ctx.fillStyle = config.textColor || '#ffffff';

          wrapRes.lines.forEach((lineStr, li) => {
            const lineY = startY + li * lineHeight;
            ctx.fillText(lineStr, width / 2, lineY);
          });
        }

        // Preset 2: NEON POP (Kinetic Word-by-Word Pop)
        else if (config.preset === 'neon') {
          ctx.font = `800 ${baseSize}px "${config.font}", system-ui, sans-serif`;
          const totalWords = wrapRes.words.length;
          const wordDuration = lineDuration / Math.max(1, totalWords);

          wrapRes.lines.forEach((lineStr, li) => {
            const lineY = startY + li * lineHeight;
            const lineWords = wrapRes.words.filter((w) => w.lineIndex === li);
            const lineFullWidth = ctx.measureText(lineStr).width;
            let currentX = width / 2 - lineFullWidth / 2;
            const spaceWidth = ctx.measureText(' ').width;

            lineWords.forEach((wordObj) => {
              const wordGlobalIndex = wrapRes.words.indexOf(wordObj);
              const wordStartTime = lineStart + wordGlobalIndex * wordDuration * 0.85;
              const wordTime = currentTime - wordStartTime;
              const wordProgress = Math.min(1, Math.max(0, wordTime / 0.28));

              const isPopping = wordTime >= 0 && wordTime < 0.45;
              const popScale = isPopping ? 1 + (1 - wordProgress) * 0.65 : 1;
              const wordAlpha = wordTime >= 0 ? Math.min(1, wordProgress * 1.3) * fadeOut : 0.15;

              ctx.save();
              ctx.globalAlpha = Math.max(0, Math.min(1, wordAlpha));
              ctx.translate(currentX + wordObj.width / 2, lineY);
              ctx.scale(popScale, popScale);

              ctx.shadowColor = config.glowColor;
              ctx.shadowBlur = (isPopping ? 35 + bass * 40 : 18 + bass * 20) * scaleRatio;
              ctx.fillStyle = isPopping ? '#ffffff' : config.textColor;
              ctx.fillText(wordObj.word, 0, 0);

              ctx.restore();
              currentX += wordObj.width + spaceWidth;
            });
          });
        }

        // Preset 3: RAIN SOUL
        else if (config.preset === 'rain') {
          const fadeIn = Math.min(1, (currentTime - lineStart) / 0.55);
          ctx.globalAlpha = fadeIn * fadeOut;
          ctx.font = `700 ${baseSize}px "${config.font}", system-ui, sans-serif`;
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = (20 + bass * 25) * scaleRatio;
          ctx.fillStyle = config.textColor || '#e2e8f0';

          wrapRes.lines.forEach((lineStr, li) => {
            const lineY = startY + li * lineHeight;
            ctx.fillText(lineStr, width / 2, lineY);
          });
        }

        // Preset 4: TYPEWRITER (Bangla Grapheme letter typing + cursor)
        else if (config.preset === 'typewriter') {
          const graphemes = getBengaliGraphemes(activeLine.text);
          const totalGraphemes = graphemes.length;
          const typingSpeed = 16; // characters per second
          const revealCount = Math.min(totalGraphemes, Math.floor((currentTime - lineStart) * typingSpeed));
          const typedText = graphemes.slice(0, revealCount).join('');
          const typedWrap = wrapBengaliText(ctx, typedText, maxTextWidth, config.font, baseSize);

          ctx.font = `700 ${baseSize}px "${config.font}", system-ui, sans-serif`;
          ctx.globalAlpha = fadeOut;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 16 * scaleRatio;
          ctx.fillStyle = config.textColor || '#ffffff';

          typedWrap.lines.forEach((lineStr, li) => {
            const lineY = startY + li * lineHeight;
            const isLastLine = li === typedWrap.lines.length - 1;
            const isBlink = Math.floor(currentTime * 3) % 2 === 0;
            const textToDraw = lineStr + (isLastLine && isBlink && revealCount < totalGraphemes ? ' ▎' : '');
            ctx.fillText(textToDraw, width / 2, lineY);
          });
        }

        // Preset 5: RETRO VHS (Chromatic Aberration + Glitch Scanlines)
        else if (config.preset === 'retro') {
          const fadeIn = Math.min(1, (currentTime - lineStart) / 0.35);
          ctx.globalAlpha = fadeIn * fadeOut;
          ctx.font = `800 ${baseSize}px "${config.font}", system-ui, sans-serif`;

          const glitchOffset = (Math.random() < 0.12 ? (Math.random() - 0.5) * 12 : 0) + (3 + bass * 6) * scaleRatio;

          wrapRes.lines.forEach((lineStr, li) => {
            const lineY = startY + li * lineHeight;

            // Red channel shift
            ctx.fillStyle = '#ff0055';
            ctx.fillText(lineStr, width / 2 - glitchOffset, lineY);

            // Cyan channel shift
            ctx.fillStyle = '#00ffff';
            ctx.fillText(lineStr, width / 2 + glitchOffset, lineY);

            // White main text
            ctx.fillStyle = config.textColor || '#ffffff';
            ctx.fillText(lineStr, width / 2, lineY);
          });
        }

        ctx.restore();
      }
    } else if (lyrics.length > 0 && currentTime < 2 && !activeLine) {
      // Gentle hint/watermark if before first lyric
      ctx.save();
      ctx.globalAlpha = 0.55 + 0.3 * Math.sin(currentTime * 3);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${28 * scaleRatio}px "${config.font}", system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('♪ ♫ ♪', width / 2, height / 2);
      ctx.restore();
    }
  }

  // 8. RETRO VHS OVERLAYS (Scanlines & Onscreen VCR Display)
  if (config.preset === 'retro' || config.scanlinesEnabled) {
    // Horizontal scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }

    // VHS timestamp in top-left
    const curSec = Math.floor(currentTime);
    const mm = String(Math.floor(curSec / 60)).padStart(2, '0');
    const ss = String(curSec % 60).padStart(2, '0');
    const ms = String(Math.floor((currentTime % 1) * 100)).padStart(2, '0');

    ctx.save();
    ctx.font = `700 ${16 * scaleRatio}px monospace`;
    ctx.fillStyle = '#00ffcc';
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 8;
    ctx.fillText(`PLAY ▶ SP 00:${mm}:${ss}.${ms}`, 24 * scaleRatio, 36 * scaleRatio);
    ctx.fillText('HI-FI STEREO', width - 150 * scaleRatio, 36 * scaleRatio);
    ctx.restore();
  }

  // 9. CINEMATIC FILM GRAIN
  if (config.preset === 'cinematic') {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.055;
    for (let i = 0; i < 90; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
    }
    ctx.restore();
  }

  ctx.restore();
}

/**
 * 1280x720 YouTube Thumbnail Generator
 */
export function drawThumbnailCanvas({
  canvas,
  config,
  title,
  artist,
  bgImage,
}: {
  canvas: HTMLCanvasElement;
  config: StudioConfig;
  title: string;
  artist: string;
  bgImage: HTMLImageElement | null;
}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = 1280;
  const h = 720;
  canvas.width = w;
  canvas.height = h;

  // Background
  if (bgImage) {
    drawCover(ctx, bgImage, w, h);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#150a2b');
    bgGrad.addColorStop(0.5, '#0e1738');
    bgGrad.addColorStop(1, '#050714');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // Dark overlay & vignette
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, 0, w, h);

  const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.65);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Top YouTube Badge
  ctx.save();
  ctx.fillStyle = 'rgba(255, 42, 122, 0.9)';
  ctx.beginPath();
  ctx.roundRect(60, 50, 160, 38, 10);
  ctx.fill();
  ctx.font = '800 16px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OFFICIAL LYRIC', 140, 69);
  ctx.restore();

  // Song Title (Auto-wrapped and centered)
  const cleanTitle = (title || 'উজাড় করে দিয়েছিলাম').trim();
  const maxTitleW = w - 160;

  let fontSize = cleanTitle.length > 25 ? 85 : 105;
  ctx.font = `800 ${fontSize}px "${config.font}", system-ui, sans-serif`;

  const wrap = wrapBengaliText(ctx, cleanTitle, maxTitleW, config.font, fontSize);
  const totalH = wrap.lines.length * (fontSize * 1.3);
  const startY = h / 2 - totalH / 2 + (fontSize * 1.3) / 2 - 20;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 32;

  wrap.lines.forEach((lineStr, li) => {
    const ly = startY + li * (fontSize * 1.3);
    // Gradient text
    const textGrad = ctx.createLinearGradient(w / 2 - 200, ly - fontSize / 2, w / 2 + 200, ly + fontSize / 2);
    textGrad.addColorStop(0, '#ffffff');
    textGrad.addColorStop(1, '#ff9ac1');
    ctx.fillStyle = textGrad;
    ctx.fillText(lineStr, w / 2, ly);
  });
  ctx.restore();

  // Decorative Accent bar
  ctx.save();
  ctx.shadowColor = config.glowColor;
  ctx.shadowBlur = 20;
  ctx.fillStyle = config.glowColor;
  ctx.beginPath();
  ctx.roundRect(w / 2 - 90, h - 180, 180, 6, 3);
  ctx.fill();
  ctx.restore();

  // Artist Name Badge
  const cleanArtist = (artist || 'Tanvir Rahman Rony').trim();
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 42px "${config.font}", system-ui, sans-serif`;
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#00e5ff';
  ctx.fillText(cleanArtist, w / 2, h - 125);
  ctx.restore();
}
