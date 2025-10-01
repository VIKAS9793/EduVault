/**
 * Subject Translation Utility
 * Provides translations for subject names in different languages
 */

import type { Subject, Language } from '../types';

interface SubjectTranslations {
  [key: string]: {
    [key in Language]: string;
  };
}

const SUBJECT_TRANSLATIONS: SubjectTranslations = {
  Science: {
    en: 'Science',
    hi: 'विज्ञान',
    ta: 'அறிவியல்',
    te: 'విజ్ఞాన శాస్త్రం',
    bn: 'বিজ্ঞান',
    gu: 'વિજ્ઞાન',
    kn: 'ವಿಜ್ಞಾನ',
    ml: 'ശാസ്ത്രം',
    mr: 'विज्ञान',
    or: 'ବିଜ୍ଞାନ',
    pa: 'ਵਿਗਿਆਨ',
    as: 'বিজ্ঞান',
    ur: 'سائنس',
  },
  Mathematics: {
    en: 'Mathematics',
    hi: 'गणित',
    ta: 'கணிதம்',
    te: 'గణితం',
    bn: 'গণিত',
    gu: 'ગણિત',
    kn: 'ಗಣಿತ',
    ml: 'ഗണിതം',
    mr: 'गणित',
    or: 'ଗଣିତ',
    pa: 'ਗਣਿਤ',
    as: 'গণিত',
    ur: 'ریاضی',
  },
  Civics: {
    en: 'Civics',
    hi: 'नागरिक शास्त्र',
    ta: 'குடியியல்',
    te: 'పౌర శాస్త్రం',
    bn: 'নাগরিকতা',
    gu: 'નાગરિક શાસ્ત્ર',
    kn: 'ನಾಗರಿಕ ಶಾಸ್ತ್ರ',
    ml: 'പൗരശാസ്ത്രം',
    mr: 'नागरीक शास्त्र',
    or: 'ନାଗରିକ ଶାସ୍ତ୍ର',
    pa: 'ਨਾਗਰਿਕਤਾ',
    as: 'নাগৰিকতা',
    ur: 'شہریت',
  },
  History: {
    en: 'History',
    hi: 'इतिहास',
    ta: 'வரலாறு',
    te: 'చరిత్ర',
    bn: 'ইতিহাস',
    gu: 'ઇતિહાસ',
    kn: 'ಇತಿಹಾಸ',
    ml: 'ചരിത്രം',
    mr: 'इतिहास',
    or: 'ଇତିହାସ',
    pa: 'ਇਤਿਹਾਸ',
    as: 'ইতিহাস',
    ur: 'تاریخ',
  },
  Geography: {
    en: 'Geography',
    hi: 'भूगोल',
    ta: 'புவியியல்',
    te: 'భౌగోళిక శాస్త్రం',
    bn: 'ভূগোল',
    gu: 'ભૂગોળ',
    kn: 'ಭೂಗೋಳಶಾಸ್ತ್ರ',
    ml: 'ഭൂമിശാസ്ത്രം',
    mr: 'भूगोल',
    or: 'ଭୂଗୋଳ',
    pa: 'ਭੂਗੋਲ',
    as: 'ভূগোল',
    ur: 'جغرافیہ',
  },
  English: {
    en: 'English',
    hi: 'अंग्रेजी',
    ta: 'ஆங்கிலம்',
    te: 'ఆంగ్లం',
    bn: 'ইংরেজি',
    gu: 'અંગ્રેજી',
    kn: 'ಇಂಗ್ಲಿಷ್',
    ml: 'ഇംഗ്ലീഷ്',
    mr: 'इंग्रजी',
    or: 'ଇଂରାଜୀ',
    pa: 'ਅੰਗਰੇਜ਼ੀ',
    as: 'ইংৰাজী',
    ur: 'انگریزی',
  },
  Hindi: {
    en: 'Hindi',
    hi: 'हिंदी',
    ta: 'ஹிந்தி',
    te: 'హిందీ',
    bn: 'হিন্দি',
    gu: 'હિન્દી',
    kn: 'ಹಿಂದಿ',
    ml: 'ഹിന്ദി',
    mr: 'हिंदी',
    or: 'ହିନ୍ଦୀ',
    pa: 'ਹਿੰਦੀ',
    as: 'হিন্দী',
    ur: 'ہندی',
  },
  Physics: {
    en: 'Physics',
    hi: 'भौतिकी',
    ta: 'இயற்பியல்',
    te: 'భౌతిక శాస్త్రం',
    bn: 'পদার্থবিদ্যা',
    gu: 'ભૌતિક શાસ્ત્ર',
    kn: 'ಭೌತಶಾಸ್ತ್ರ',
    ml: 'ഭൗതികശാസ്ത്രം',
    mr: 'भौतिकशास्त्र',
    or: 'ଭୌତିକ ବିଜ୍ଞାନ',
    pa: 'ਭੌਤਿਕ ਵਿਗਿਆਨ',
    as: 'পদাৰ্থ বিজ্ঞান',
    ur: 'طبیعیات',
  },
  Chemistry: {
    en: 'Chemistry',
    hi: 'रसायन विज्ञान',
    ta: 'வேதியியல்',
    te: 'రసాయన శాస్త్రం',
    bn: 'রসায়ন',
    gu: 'રસાયણ શાસ્ત્ર',
    kn: 'ರಸಾಯನಶಾಸ್ತ್ರ',
    ml: 'രസതന്ത്രം',
    mr: 'रसायनशास्त्र',
    or: 'ରସାୟନ ବିଜ୍ଞାନ',
    pa: 'ਰਸਾਇਣ ਵਿਗਿਆਨ',
    as: 'ৰসায়ন বিজ্ঞান',
    ur: 'کیمیا',
  },
  Biology: {
    en: 'Biology',
    hi: 'जीव विज्ञान',
    ta: 'உயிரியல்',
    te: 'జీవ శాస్త్రం',
    bn: 'জীববিজ্ঞান',
    gu: 'જીવ શાસ્ત્ર',
    kn: 'ಜೀವಶಾಸ್ತ್ರ',
    ml: 'ജീവശാസ്ത്രം',
    mr: 'जीवशास्त्र',
    or: 'ଜୀବ ବିଜ୍ଞାନ',
    pa: 'ਜੀਵ ਵਿਗਿਆਨ',
    as: 'জীৱ বিজ্ঞান',
    ur: 'حیاتیات',
  },
};

/**
 * Get translated subject name
 * @param subject - The subject to translate
 * @param language - The target language
 * @returns Translated subject name or original if translation not found
 */
export function getTranslatedSubject(subject: Subject, language: Language): string {
  const translations = SUBJECT_TRANSLATIONS[subject];
  if (!translations) {
    console.warn(`No translations found for subject: ${subject}`);
    return subject;
  }

  const translation = translations[language];
  if (!translation) {
    console.warn(`No translation found for subject ${subject} in language ${language}`);
    return subject;
  }

  return translation;
}

/**
 * Get "All Subjects" translation
 * @param language - The target language
 * @returns Translated "All Subjects" text
 */
export function getAllSubjectsText(language: Language): string {
  const translations = {
    en: 'All Subjects',
    hi: 'सभी विषय',
    ta: 'அனைத்து பாடங்கள்',
    te: 'అన్ని విషయాలు',
    bn: 'সব বিষয়',
    gu: 'બધા વિષયો',
    kn: 'ಎಲ್ಲಾ ವಿಷಯಗಳು',
    ml: 'എല്ലാ വിഷയങ്ങളും',
    mr: 'सर्व विषय',
    or: 'ସମସ୍ତ ବିଷୟ',
    pa: 'ਸਾਰੇ ਵਿਸ਼ੇ',
    as: 'সকল বিষয়',
    ur: 'تمام مضامین',
  };

  return translations[language] || 'All Subjects';
}
