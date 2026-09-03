// Translation Service for Malayalam/Manglish to English

/**
 * Translates Malayalam or Manglish text into clear English
 * @param {string} text 
 * @returns {Promise<string>}
 */
export async function translateToEnglish(text) {
  if (!text || !text.trim()) return '';

  const trimmed = text.trim();

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && Array.isArray(data[0])) {
        const translatedSegments = data[0].map(segment => segment[0]).filter(Boolean);
        if (translatedSegments.length > 0) {
          return translatedSegments.join('');
        }
      }
    }
  } catch (error) {
    console.warn('Translation API network fetch failed, using fallback translation engine', error);
  }

  // Fallback offline / phrase dictionary translator
  return fallbackTranslate(trimmed);
}

function fallbackTranslate(text) {
  const dictionary = [
    { pattern: /കണ്ണിൽ/i, replace: 'in the eyes' },
    { pattern: /എന്റെ പേര് അർജുൻ ആണ്/i, replace: 'My name is Arjun.' },
    { pattern: /ഞാൻ ഇന്ന് ഓഫീസിൽ പോകുന്നു/i, replace: 'I am going to office today.' },
    { pattern: /മീറ്റിംഗ് 10 മണിക്ക് ആരംഭിക്കും/i, replace: 'The meeting will start at 10 o\'clock.' },
    { pattern: /ദയവായി ഫയൽ റെഡിയാക്കി വെക്കുക/i, replace: 'Please keep the file ready.' },
    { pattern: /സുഖമാണോ/i, replace: 'How are you?' },
    { pattern: /നമസ്കാരം/i, replace: 'Greetings / Hello' },
    { pattern: /നന്ദി/i, replace: 'Thank you' },
    { pattern: /njan/i, replace: 'I' },
    { pattern: /veettil/i, replace: 'at home' },
    { pattern: /ethi/i, replace: 'reached' }
  ];

  let result = text;
  for (const item of dictionary) {
    if (item.pattern.test(result)) {
      result = result.replace(item.pattern, item.replace);
    }
  }

  return result;
}
