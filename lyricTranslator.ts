/**
 * LyricCraft Multi-Mode Lyric Translator & Transliteration Engine
 * 1. Banglish (Romanized Bangla) to Unicode Bangla
 * 2. English Lyrics to Poetic Bengali Translation
 * 3. Bengali Lyrics to Romanized Subtitles (Banglish)
 * 4. Bijoy 52 (ANSI) <--> Unicode Bidirectional Conversion
 */

import { convertBijoyToUnicode } from './bijoyToUnicode';

// Common Bengali lyric word lookup for 100% accurate Banglish transliteration
const BANGLISH_DICTIONARY: Record<string, string> = {
  // Pronouns
  'ami': 'আমি', 'amar': 'আমার', 'amake': 'আমাকে', 'amader': 'আমাদের', 'amay': 'আমায়',
  'tumi': 'তুমি', 'tomar': 'তোমার', 'tomake': 'তোমাকে', 'tomader': 'তোমাদের', 'tomay': 'তোমায়',
  'tui': 'তুই', 'tor': 'তোর', 'toke': 'তোকে',
  'se': 'সে', 'she': 'সে', 'tar': 'তার', 'take': 'তাকে', 'tader': 'তাদের',
  'apni': 'আপনি', 'apnar': 'আপনার', 'apnake': 'আপনাকে',
  'ke': 'কে', 'kar': 'কার', 'kake': 'কাকে', 'koto': 'কত', 'ki': 'কী', 'keno': 'কেন',
  'kothay': 'কোথায়', 'kobe': 'কবে', 'kemon': 'কেমন', 'kivabe': 'কীভাবে',

  // Emotions & Love
  'valobashi': 'ভালোবাসি', 'bhalobashi': 'ভালোবাসি', 'valobasa': 'ভালোবাসা', 'bhalobasa': 'ভালোবাসা',
  'prem': 'প্রেম', 'preme': 'প্রেমে', 'mon': 'মন', 'moner': 'মনের', 'mone': 'মনে',
  'manush': 'মানুষ', 'buker': 'বুকের', 'buke': 'বুকে', 'hridoy': 'হৃদয়', 'poran': 'পরাণ',
  'chokhe': 'চোখে', 'chokh': 'চোখ', 'ashru': 'অশ্রু', 'kanna': 'কান্না', 'hashe': 'হাসে',
  'hasi': 'হাসি', 'dukkho': 'দুঃখ', 'kosto': 'কষ্ট', 'betha': 'ব্যথা', 'bedona': 'বেদনা',
  'maya': 'মায়া', 'shanti': 'শান্তি', 'ashar': 'আশার', 'asha': 'আশা',

  // Song & Nature & Time
  'gan': 'গান', 'gaan': 'গান', 'shur': 'সুর', 'sur': 'সুর', 'lyric': 'লিরিক', 'chondo': 'ছন্দ',
  'bristi': 'বৃষ্টি', 'brishti': 'বৃষ্টি', 'megh': 'মেঘ', 'akashe': 'আকাশে', 'akash': 'আকাশ',
  'rat': 'রাত', 'raat': 'রাত', 'rate': 'রাতে', 'raate': 'রাতে', 'shokal': 'সকাল',
  'bhor': 'ভোর', 'shondha': 'সন্ধ্যা', 'chander': 'চাঁদের', 'chand': 'চাঁদ', 'alo': 'আলো',
  'nodir': 'নদীর', 'nodi': 'নদী', 'dhew': 'ঢেউ', 'batash': 'বাতাস', 'ful': 'ফুল', 'phul': 'ফুল',

  // Common Verbs & Actions
  'ujhar': 'উজাড়', 'ujar': 'উজাড়', 'diyechilam': 'দিয়েছিলাম', 'bujhle': 'বুঝলে',
  'na': 'না', 'khujechi': 'খুঁজেছি', 'khuji': 'খুঁজি', 'hariye': 'হারিয়ে', 'harale': 'হারালে',
  'achho': 'আছো', 'acho': 'আছো', 'achi': 'আছি', 'thako': 'থাকা', 'thakbe': 'থাকবে',
  'chai': 'চাই', 'chao': 'চাও', 'jane': 'জানে', 'jani': 'জানি', 'bolo': 'বলো',
  'boli': 'বলি', 'shuno': 'শুনো', 'dekho': 'দেখো', 'chole': 'চলে', 'gecho': 'গেছো',
  'asho': 'আসো', 'fire': 'ফিরে', 'ashe': 'আসে', 'diyo': 'দিও', 'nebe': 'নেবে',
  'rakhbo': 'রাখবো', 'joton': 'যতন', 'kore': 'করে', 'shob': 'সব', 'kichu': 'কিছু',
  'kokhono': 'কখনো', 'ekla': 'একলা', 'ekaki': 'একাকী', 'shudu': 'শুধু', 'shudhu': 'শুধু',
  'ar': 'আর', 'aar': 'আর', 'ei': 'এই', 'oi': 'ওই', 'shei': 'সেই', 'tai': 'তাই'
};

// English to Bengali poetic lyric phrase dictionary
const ENGLISH_LYRIC_DICTIONARY: [RegExp, string][] = [
  // Common Lyric Sentences
  [/i gave everything/gi, 'উজাড় করে দিয়েছিলাম'],
  [/you never understood/gi, 'তবুও তুমি বুঝলে না'],
  [/in this rainy night/gi, 'বৃষ্টি ভেজা এই রাতে'],
  [/i searched for you/gi, 'তোমাকেই খুঁজেছি'],
  [/i love you/gi, 'তোমাকে অনেক ভালোবাসি'],
  [/without you/gi, 'তোমাকে ছাড়া'],
  [/you are my heart/gi, 'তুমি আমার মনের মানুষ'],
  [/where will i find you/gi, 'কোথায় পাবো তোমায়'],
  [/stay with me/gi, 'আমার কাছে থেকো'],
  [/hold my hand/gi, 'হাতটা ধরে রাখো'],
  [/my heart cries/gi, 'আমার মন যে কাঁদে'],
  [/in your eyes/gi, 'তোমার চোখের মায়ায়'],
  [/forever and ever/gi, 'চিরকাল ও অনন্তকাল'],
  [/don't leave me alone/gi, 'আমাকে একলা ফেলে যেও না'],
  [/come back to me/gi, 'আমার কাছে ফিরে এসো'],
  [/you and me/gi, 'তুমি আর আমি'],
  [/broken heart/gi, 'ভাঙা হৃদয়'],
  [/sweet memory/gi, 'মধুর স্মৃতি'],
  [/lost in the dark/gi, 'অন্ধকারে হারিয়ে গিয়েছি'],
  [/listen to my song/gi, 'আমার এই গানটি শুনো'],
  [/i miss you/gi, 'তোমাকে খুব মনে পড়ছে'],
  [/like a dream/gi, 'একটি স্বপ্নের মতো'],
  [/under the moonlight/gi, 'চাঁদের মিষ্টি আলোয়'],
  [/every single day/gi, 'প্রতিটি দিন প্রতিটি ক্ষণ'],
  [/take my breath away/gi, 'আমার পরাণ জুড়িয়ে দাও'],
  [/tears in my eyes/gi, 'চোখে আমার অশ্রুধারা'],
  [/voice of heart/gi, 'হৃদয়ের ব্যাকুল সুর'],
  [/beautiful smile/gi, 'মিষ্টি হাসির ছোঁয়া'],

  // Words
  [/\blove\b/gi, 'ভালোবাসা'],
  [/\bheart\b/gi, 'হৃদয়'],
  [/\brain\b/gi, 'বৃষ্টি'],
  [/\bnight\b/gi, 'রাত'],
  [/\bdream\b/gi, 'স্বপ্ন'],
  [/\bmoon\b/gi, 'চাঁদ'],
  [/\bsong\b/gi, 'গান'],
  [/\bmusic\b/gi, 'সুর'],
  [/\btears\b/gi, 'অশ্রু'],
  [/\balone\b/gi, 'একাকী'],
  [/\bsad\b/gi, 'বিষাদময়'],
  [/\bhappy\b/gi, 'আনন্দময়'],
  [/\bforever\b/gi, 'চিরকাল'],
  [/\blife\b/gi, 'জীবন'],
  [/\bsoul\b/gi, 'পরাণ']
];

// Bengali character to Romanized English (Banglish) transliterator
const BENGALI_TO_ROMAN_MAP: Record<string, string> = {
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'ee', 'উ': 'u', 'ঊ': 'oo', 'ঋ': 'ri',
  'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': 'h', 'ঁ': '',
  'া': 'a', 'ি': 'i', 'ী': 'ee', 'ু': 'u', 'ূ': 'oo', 'ৃ': 'ri',
  'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou', '্': ''
};

/**
 * 1. Banglish to Bangla Transliteration
 */
export function transliterateBanglishToBangla(input: string): string {
  if (!input) return '';
  const lines = input.split('\n');

  return lines
    .map((line) => {
      // Split into words and punctuation
      const tokens = line.split(/([A-Za-z0-9]+)/g);
      return tokens
        .map((tok) => {
          if (!tok || !/[A-Za-z]/.test(tok)) return tok;
          const lower = tok.toLowerCase();

          // Check dictionary
          if (BANGLISH_DICTIONARY[lower]) {
            return BANGLISH_DICTIONARY[lower];
          }

          // Rule-based phonetic transliteration fallback
          let res = lower;
          const rules: [RegExp, string][] = [
            [/bhalobash[aei]/g, 'ভালোবাসা'],
            [/valobash[aei]/g, 'ভালোবাসা'],
            [/diyechilam/g, 'দিয়েছিলাম'],
            [/bujhle/g, 'বুঝলে'],
            [/khujechi/g, 'খুঁজেছি'],
            [/bris[ht]+i/g, 'বৃষ্টি'],
            [/shundor/g, 'সুন্দর'],
            [/shundori/g, 'সুন্দরী'],
            [/chh/g, 'ছ'],
            [/ch/g, 'চ'],
            [/kh/g, 'খ'],
            [/gh/g, 'ঘ'],
            [/jh/g, 'ঝ'],
            [/th/g, 'থ'],
            [/dh/g, 'ধ'],
            [/bh/g, 'ভ'],
            [/ph/g, 'ফ'],
            [/sh/g, 'শ'],
            [/ng/g, 'ং'],
            [/aa/g, 'া'],
            [/ee/g, 'ী'],
            [/oo/g, 'ূ'],
            [/oi/g, 'ৈ'],
            [/ou/g, 'ৌ'],
            [/ai/g, 'াই'],
            [/k/g, 'ক'],
            [/g/g, 'গ'],
            [/j/g, 'জ'],
            [/t/g, 'ত'],
            [/d/g, 'দ'],
            [/n/g, 'ন'],
            [/p/g, 'প'],
            [/f/g, 'ফ'],
            [/b/g, 'ব'],
            [/m/g, 'ম'],
            [/r/g, 'র'],
            [/l/g, 'ল'],
            [/s/g, 'স'],
            [/h/g, 'হ'],
            [/a/g, 'া'],
            [/i/g, 'ি'],
            [/u/g, 'ু'],
            [/e/g, 'ে'],
            [/o/g, 'ো']
          ];

          rules.forEach(([p, r]) => {
            res = res.replace(p, r);
          });

          // If starts with matra, replace with full vowel
          if (res.startsWith('া')) res = 'আ' + res.slice(1);
          if (res.startsWith('ি')) res = 'ই' + res.slice(1);
          if (res.startsWith('ী')) res = 'ঈ' + res.slice(1);
          if (res.startsWith('ু')) res = 'উ' + res.slice(1);
          if (res.startsWith('ূ')) res = 'ঊ' + res.slice(1);
          if (res.startsWith('ে')) res = 'এ' + res.slice(1);
          if (res.startsWith('ো')) res = 'ও' + res.slice(1);

          return res;
        })
        .join('');
    })
    .join('\n');
}

/**
 * 2. English Lyric to Poetic Bengali Translation
 */
export function translateEnglishToBengaliLyrics(englishText: string): string {
  if (!englishText) return '';
  let result = englishText;

  for (const [pattern, translation] of ENGLISH_LYRIC_DICTIONARY) {
    result = result.replace(pattern, translation);
  }

  return result;
}

/**
 * 3. Bengali to Romanized English (Banglish Subtitles)
 */
export function romanizeBengaliLyrics(banglaText: string): string {
  if (!banglaText) return '';
  let res = '';
  for (let i = 0; i < banglaText.length; i++) {
    const char = banglaText[i];
    if (BENGALI_TO_ROMAN_MAP[char] !== undefined) {
      res += BENGALI_TO_ROMAN_MAP[char];
    } else {
      res += char;
    }
  }
  // Capitalize line starts
  return res
    .split('\n')
    .map((l) => (l ? l.charAt(0).toUpperCase() + l.slice(1) : ''))
    .join('\n');
}

/**
 * 4. Unicode to Bijoy (SutonnyMJ / ANSI) Reverse Transliteration
 */
const UNICODE_TO_BIJOY_MAP: Record<string, string> = {
  'অ': 'A', 'আ': 'Av', 'ই': 'B', 'ঈ': 'C', 'উ': 'D', 'ঊ': 'E',
  'ঋ': 'F', 'এ': 'G', 'ঐ': 'H', 'ও': 'I', 'ঔ': 'Iq',
  'ক': 'K', 'খ': 'L', 'গ': 'M', 'ঘ': 'N', 'ঙ': 'O',
  'চ': 'P', 'ছ': 'Q', 'জ': 'R', 'ঝ': 'S', 'ঞ': 'T',
  'ট': 'U', 'ঠ': 'V', 'ড': 'W', 'ঢ': 'X', 'ণ': 'Y',
  'ত': 'Z', 'থ': '_', 'দ': '`', 'ধ': '~', 'ন': 'a',
  'প': 'b', 'ফ': 'c', 'ব': 'd', 'ভ': 'e', 'ম': 'f',
  'য': 'g', 'র': 'h', 'ল': 'i', 'শ': 'j', 'ষ': 'k',
  'স': 'l', 'হ': 'm', 'ড়': 'n', 'ঢ়': 'o', 'য়': 'p',
  'ৎ': 'q', 'ং': 'r', 'ঃ': 's', 'ঁ': 't',
  'া': 'v', 'ি': 'w', 'ী': 'x', 'ু': 'y', 'ূ': 'z',
  'ৃ': '<', 'ে': '†', 'ৈ': '‰', 'ো': '†v', 'ৌ': '†Š',
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

export function convertUnicodeToBijoy(input: string): string {
  if (!input) return '';
  let str = input;

  // Swap pre-kars in Unicode (ি, ে, ৈ) to appear before the consonant in Bijoy
  str = str.replace(/([\u0995-\u09B9\u09DC-\u09DF](?:্[\u0995-\u09B9\u09DC-\u09DF])*)([িেৈ])/g, '$2$1');

  let res = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    res += UNICODE_TO_BIJOY_MAP[char] !== undefined ? UNICODE_TO_BIJOY_MAP[char] : char;
  }
  return res;
}

export interface BatchProcessResult {
  lines: string[];
  formattedText: string;
  totalLines: number;
  wordCount: number;
  charCount: number;
}

/**
 * High-performance batch lyric processing preserving exact newline formatting
 */
export function processBatchLyrics(
  inputText: string,
  mode: 'banglish' | 'english' | 'romanize' | 'bijoy' | 'unicodeToBijoy',
  options: { removeEmptyLines?: boolean; trimLines?: boolean } = { removeEmptyLines: true, trimLines: true }
): BatchProcessResult {
  if (!inputText) {
    return { lines: [], formattedText: '', totalLines: 0, wordCount: 0, charCount: 0 };
  }

  const rawLines = inputText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const convertedLines: string[] = [];

  for (let line of rawLines) {
    if (options.trimLines) {
      line = line.trim();
    }
    if (options.removeEmptyLines && !line) {
      continue;
    }

    if (!line) {
      convertedLines.push('');
      continue;
    }

    let converted = '';
    if (mode === 'banglish') {
      converted = transliterateBanglishToBangla(line);
    } else if (mode === 'english') {
      converted = translateEnglishToBengaliLyrics(line);
    } else if (mode === 'romanize') {
      converted = romanizeBengaliLyrics(line);
    } else if (mode === 'bijoy') {
      converted = convertBijoyToUnicode(line);
    } else if (mode === 'unicodeToBijoy') {
      converted = convertUnicodeToBijoy(line);
    }

    if (options.trimLines) {
      converted = converted.trim();
    }
    convertedLines.push(converted);
  }

  const formattedText = convertedLines.join('\n');
  const wordCount = formattedText ? formattedText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = formattedText.length;

  return {
    lines: convertedLines,
    formattedText,
    totalLines: convertedLines.length,
    wordCount,
    charCount,
  };
}

