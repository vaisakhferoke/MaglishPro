// Transliteration Service for Manglish to Malayalam Script

// Offline phonetic mapping rules for fallback transliteration
const VOWELS = {
  'a': 'അ', 'aa': 'ആ', 'A': 'ആ', 'i': 'ഇ', 'ee': 'ഈ', 'I': 'ഈ',
  'u': 'ഉ', 'oo': 'ഊ', 'U': 'ഊ', 'e': 'എ', 'ea': 'ഏ', 'E': 'ഏ',
  'ai': 'ഐ', 'o': 'ഒ', 'oa': 'ഓ', 'O': 'ഓ', 'au': 'ഔ', 'ou': 'ഔ'
};

const _VOWEL_SIGNS = {
  'a': '', 'aa': 'ാ', 'A': 'ാ', 'i': 'ി', 'ee': 'ീ', 'I': 'ീ',
  'u': 'ു', 'oo': 'ൂ', 'U': 'ൂ', 'e': 'െ', 'ea': 'േ', 'E': 'േ',
  'ai': 'ൈ', 'o': 'ൊ', 'oa': 'ോ', 'O': 'ോ', 'au': 'ൌ', 'ou': 'ൌ'
};

const CONSONANTS = {
  'k': 'ക', 'kh': 'ഖ', 'g': 'ഗ', 'gh': 'ഘ', 'ng': 'ങ',
  'ch': 'ച', 'chh': 'ഛ', 'j': 'ജ', 'jh': 'ഝ', 'nj': 'ഞ',
  't': 'ത', 'th': 'ഥ', 'd': 'ദ', 'dh': 'ധ', 'n': 'ന',
  'T': 'ട', 'Th': 'ഠ', 'D': 'ഡ', 'Dh': 'ഢ', 'N': 'ണ',
  'p': 'പ', 'ph': 'ഫ', 'f': 'ഫ', 'b': 'ബ', 'bh': 'ഭ', 'm': 'മ',
  'y': 'യ', 'r': 'ര', 'l': 'ല', 'v': 'വ', 'w': 'വ',
  'sh': 'ശ', 'S': 'ഷ', 's': 'സ', 'h': 'ഹ', 'L': 'ള',
  'zh': 'ഴ', 'R': 'റ'
};

const _CHILLU = {
  'n': 'ൻ', 'r': 'ർ', 'l': 'ൽ', 'L': 'ൾ', 'N': 'ൺ', 'k': 'ൿ'
};

/**
 * Perform offline phonetic conversion of a Manglish word into Malayalam candidate strings
 */

/**
 * Fetch Malayalam candidates using Google Input Tools API + offline fallback
 */
export async function getMalayalamSuggestions(word) {
  if (!word || word.trim() === '') return [];

  const cleanWord = word.trim().toLowerCase();

  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(cleanWord)}&itc=ml-t-i0-und&num=6&cp=0&cs=1&ie=utf-8&oe=utf-8`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
        const suggestions = data[1][0][1];
        // Append original word as last suggestion if not present
        if (!suggestions.includes(cleanWord)) {
          suggestions.push(cleanWord);
        }
        return suggestions;
      }
    }
  } catch (error) {
    console.warn('Google Input Tools network fetch failed, using offline fallback', error);
  }

  // Fallback offline dictionary & rule generator
  return generateOfflineSuggestions(cleanWord);
}

/**
 * Simple offline candidate generator for common Manglish patterns
 */
function generateOfflineSuggestions(word) {
  const commonDict = {
    'malayalam': ['മലയാളം', 'മലയാളം', 'മലയാളത്തെ', 'മലയാളവും', 'malayalam'],
    'kannil': ['കണ്ണിൽ', 'കണ്ണിൽ', 'കണ്ണിനെ', 'കണ്ണുകൾ', 'kannil'],
    'njan': ['ഞാൻ', 'ഞാൻ', 'ഞാനും', 'njan'],
    'office': ['ഓഫീസ്', 'ഓഫീസിൽ', 'office'],
    'veettil': ['വീട്ടിൽ', 'വീട്ടിലേക്ക്', 'veettil'],
    'sugamano': ['സുഖമാണോ', 'സുഖമാണോ', 'sugamano'],
    'namaskaram': ['നമസ്കാരം', 'നമസ്കാരം', 'namaskaram'],
    'nandhi': ['നന്ദി', 'നന്ദി', 'nandhi'],
    'today': ['ഇന്ന്', 'today'],
    'arjun': ['അർജുൻ', 'അർജുൻ', 'arjun'],
    'peru': ['പേര്', 'പേര്', 'peru'],
    'meeting': ['മീറ്റിംഗ്', 'meeting'],
    'time': ['സമയം', 'time'],
    'ready': ['റെഡി', 'ready']
  };

  if (commonDict[word]) {
    return commonDict[word];
  }

  // Generative rule fallback
  let mal = '';
  let i = 0;
  while (i < word.length) {
    // Check 2-letter consonant matches
    let two = word.slice(i, i + 2);
    if (CONSONANTS[two]) {
      mal += CONSONANTS[two];
      i += 2;
      continue;
    }
    let one = word[i];
    if (CONSONANTS[one]) {
      mal += CONSONANTS[one];
    } else if (VOWELS[one]) {
      mal += VOWELS[one];
    } else {
      mal += one;
    }
    i++;
  }

  return [mal || word, word];
}
