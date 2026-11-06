/**
 * Bijoy (SutonnyMJ / ANSI) to Unicode Bangla Converter
 * High-accuracy conversion engine supporting pre-kars, post-kars, reph, conjuncts, and numbers.
 */

// Mapping of dual and complex conjunct glyphs in SutonnyMJ
const BIJOY_CONJUNCTS: [string, string][] = [
  ['Av', 'আ'],
  ['Iq', 'ঔ'],
  // 3-char sequences
  ['¯’', 'স্থ'],
  ['¯‹', 'স্ক'],
  ['¯Í', 'স্ত'],
  ['¯œ', 'স্ন'],
  ['¯ú', 'স্প'],
  ['¯¢', 'স্ফ'],
  ['¯^', 'স্ব'],
  ['¯§', 'স্ম'],
  ['¯ª', 'স্র'],
  ['¯’', 'স্থ'],
  ['wjd', 'লি'],
  // 2-char & special glyphs
  ['²', 'ক্ষ'],
  ['³', 'ক্ত'],
  ['µ', 'ক্র'],
  ['¶', 'ক্ষ'],
  ['·', 'জ্ঞ'],
  ['¸', 'ঙ্ক'],
  ['¹', 'ঙ্গ'],
  ['º', 'জ্ঞ'],
  ['»', 'ঞ্চ'],
  ['¼', 'ঞ্ছ'],
  ['½', 'ঞ্জ'],
  ['¾', 'ঝ'],
  ['¿', 'ট'],
  ['À', 'ঠ'],
  ['Á', 'ড'],
  ['Â', 'ঢ'],
  ['Ã', 'ণ'],
  ['Ä', 'ত্ত'],
  ['Å', 'ত্থ'],
  ['Æ', 'ত্ম'],
  ['Ç', 'ত্ব'],
  ['È', 'ত্র'],
  ['É', 'থ'],
  ['Ê', 'দ্দ'],
  ['Ë', 'দ্ধ'],
  ['Ì', 'দ্ব'],
  ['Í', 'দ্ভ'],
  ['Î', 'দ্ম'],
  ['Ï', 'ধ'],
  ['Ð', 'ন্দ'],
  ['Ñ', 'ন্ধ'],
  ['Ò', 'ন্ন'],
  ['Ó', 'ন্ব'],
  ['Ô', 'ন্ম'],
  ['Õ', 'প্ট'],
  ['Ö', 'প্ত'],
  ['×', 'প্ন'],
  ['Ø', 'প্প'],
  ['Ù', 'প্স'],
  ['Ú', 'ব্দ'],
  ['Û', 'ব্ধ'],
  ['Ü', 'ব্ব'],
  ['Ý', 'ব্ল'],
  ['Þ', 'ভ'],
  ['ß', 'ম্ন'],
  ['à', 'ম্প'],
  ['á', 'ম্ফ'],
  ['â', 'ম্ব'],
  ['ã', 'ম্ভ'],
  ['ä', 'ম্ম'],
  ['å', 'ম্ল'],
  ['æ', 'রু'],
  ['ç', 'রূ'],
  ['è', 'ল্ক'],
  ['é', 'ল্গ'],
  ['ê', 'ল্ট'],
  ['ë', 'ল্ড'],
  ['ì', 'ল্প'],
  ['í', 'ল্ফ'],
  ['î', 'ল্ব'],
  ['ï', 'ল্ম'],
  ['ð', 'ল্ল'],
  ['ñ', 'শ্চ'],
  ['ò', 'শ্ছ'],
  ['ó', 'শ্ন'],
  ['ô', 'শ্ব'],
  ['õ', 'শ্ম'],
  ['ö', 'শ্ল'],
  ['÷', 'ষ্ক'],
  ['ø', 'ষ্খ'],
  ['ù', 'ষ্ট'],
  ['ú', 'ষ্ঠ'],
  ['û', 'ষ্ণ'],
  ['ü', 'ষ্প'],
  ['ý', 'ষ্ফ'],
  ['þ', 'ষ্ম'],
  ['ÿ', 'স্খ'],
  ['°', 'ক্ক'],
  ['±', 'ক্ট'],
  ['¡', 'হ্ণ'],
  ['¢', 'হ্ন'],
  ['£', 'হ্ম'],
  ['¤', 'হ্ল'],
  ['¥', 'হ্ব'],
  ['§', 'স'],
  ['•', 'ন্ত'],
  ['–', 'ন্দ'],
  ['—', 'ন্ধ'],
  ['“', 'ন্ম'],
  ['”', 'ন্ঠ'],
  ['„', 'ট্ট'],
  ['…', 'ট্ঠ'],
  ['†', 'ে'],
  ['‡', 'ে'],
  ['ˆ', 'ৈ'],
  ['‰', 'ৈ'],
  ['Š', 'ৌ'],
  ['‹', 'ক'],
  ['Œ', 'খ'],
  ['‘', 'গ'],
  ['’', 'ঘ'],
  ['“', 'ঙ'],
  ['”', 'চ'],
  ['•', 'ছ'],
  ['–', 'জ'],
  ['—', 'ঝ'],
  ['˜', 'ঞ'],
  ['™', 'ট']
];

// Single character mappings (Consonants, Vowels, Matras, Numbers)
const BIJOY_MAP: Record<string, string> = {
  // Vowels
  'A': 'অ', 'B': 'ই', 'C': 'ঈ', 'D': 'উ', 'E': 'ঊ',
  'F': 'ঋ', 'G': 'এ', 'H': 'ঐ', 'I': 'ও', 'J': 'ঔ',

  // Consonants
  'K': 'ক', 'L': 'খ', 'M': 'গ', 'N': 'ঘ', 'O': 'ঙ',
  'P': 'চ', 'Q': 'ছ', 'R': 'জ', 'S': 'ঝ', 'T': 'ঞ',
  'U': 'ট', 'V': 'ঠ', 'W': 'ড', 'X': 'ঢ', 'Y': 'ণ',
  'Z': 'ত', '_': 'থ', '`': 'দ', '~': 'ধ', 'a': 'ন',
  'b': 'প', 'c': 'ফ', 'd': 'ব', 'e': 'ভ', 'f': 'ম',
  'g': 'য', 'h': 'র', 'i': 'ল', 'j': 'শ', 'k': 'ষ',
  'l': 'স', 'm': 'হ', 'n': 'ড়', 'o': 'ঢ়', 'p': 'য়',
  'q': 'ৎ', 'r': 'ং', 's': 'ঃ', 't': 'ঁ',

  // Marks & Matras
  'v': 'া',
  'w': 'ি',
  'x': 'ী',
  'y': 'ু',
  'z': 'ূ',
  '<': 'ৃ',
  '\\': '্',
  '&': '্',
  '¨': '্য',
  'ª': '্র',
  '«': '্র',
  '¬': '্ল',
  '®': '্র',
  '¯': 'স্',

  // Digits
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

export function convertBijoyToUnicode(srcText: string): string {
  if (!srcText) return '';
  let str = srcText;

  // 1. Normalize line endings
  str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Pre-process specific Bijoy composite patterns
  // e.g. e-kar + aa-kar -> o-kar (‡...v or †...v)
  // Reph (©) processing: In Bijoy, Reph comes after the consonant/cluster: "K©" -> "©K" -> "র্ক"
  // Let's handle Reph systematically
  str = str.replace(/([A-Za-z0-9_`~¯²³µ¶·¸¹º»¼½¾¿À-ÿ])©/g, '©$1');

  // 3. Replace conjuncts from longest to shortest
  for (const [bijoy, uni] of BIJOY_CONJUNCTS) {
    str = str.split(bijoy).join(uni);
  }

  // 4. Pre-kar reordering (w, †, ‡, ˆ, ‰)
  // Pre-kar is typed BEFORE consonant in Bijoy, but in Unicode it goes AFTER consonant/cluster!
  const preKarRegex = /([w†‡ˆ‰])([\u0995-\u09B9\u09DC-\u09DF](?:্[\u0995-\u09B9\u09DC-\u09DF])*(?:্য|্র|্ল)?)/g;
  str = str.replace(preKarRegex, (_match, kar, cluster) => {
    let uniKar = 'ি';
    if (kar === '†' || kar === '‡') uniKar = 'ে';
    else if (kar === 'ˆ' || kar === '‰') uniKar = 'ৈ';
    return cluster + uniKar;
  });

  // Handle o-kar (ে + া = ো) and ou-kar (ে + ৗ = ৌ)
  str = str.replace(/ে([\u0995-\u09B9\u09DC-\u09DF](?:্[\u0995-\u09B9\u09DC-\u09DF])*)া/g, '$1ো');
  str = str.replace(/ে([\u0995-\u09B9\u09DC-\u09DF](?:্[\u0995-\u09B9\u09DC-\u09DF])*)ৌ/g, '$1ৌ');

  // 5. Replace single characters from map
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (BIJOY_MAP[char] !== undefined) {
      res += BIJOY_MAP[char];
    } else {
      res += char;
    }
  }

  // 6. Handle Reph (© -> র + ্)
  res = res.replace(/©([\u0995-\u09B9\u09DC-\u09DF](?:্[\u0995-\u09B9\u09DC-\u09DF])*)/g, 'র্$1');

  // 7. Cleanup unwanted artifacts
  res = res.replace(/্\s/g, ' ');

  return res;
}
