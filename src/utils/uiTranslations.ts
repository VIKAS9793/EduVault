/**
 * UI Translation Utility
 * Provides comprehensive translations for all UI elements
 */

import type { Language } from '../types';

interface UITranslations {
  [key: string]: {
    [key in Language]: string;
  };
}

const UI_TRANSLATIONS: UITranslations = {
  // Navigation and Main UI
  'app.title': {
    en: 'EduVault',
    hi: 'एजुवॉल्ट',
    ta: 'எடுவால்ட்',
    te: 'ఎడువాల్ట్',
    bn: 'এডুভল্ট',
    gu: 'એડુવોલ્ટ',
    kn: 'ಎಡುವಾಲ್ಟ್',
    ml: 'എഡുവാൾട്ട്',
    mr: 'एडुवॉल्ट',
    or: 'ଏଡୁଭୋଲ୍ଟ',
    pa: 'ਏਡੂਵਾਲਟ',
    as: 'এডুভল্ট',
    ur: 'ایڈووالٹ',
  },
  'app.tagline': {
    en: 'Knowledge reaches every corner',
    hi: 'ज्ञान की पहुंच, हर कोने तक',
    ta: 'அறிவு ஒவ்வொரு மூலையையும் அடைகிறது',
    te: 'జ్ఞానం ప్రతి మూలకు చేరుతుంది',
    bn: 'জ্ঞান প্রতিটি কোণে পৌঁছায়',
    gu: 'જ્ઞાન દરેક ખૂણા સુધી પહોંચે છે',
    kn: 'ಜ್ಞಾನವು ಪ್ರತಿ ಮೂಲೆಯನ್ನು ತಲುಪುತ್ತದೆ',
    ml: 'ജ്ഞാനം എല്ലാ മൂലയിലേക്കും എത്തുന്നു',
    mr: 'ज्ञान प्रत्येक कोपऱ्यात पोहोचते',
    or: 'ଜ୍ଞାନ ପ୍ରତ୍ୟେକ କୋଣରେ ପହଞ୍ଚେ',
    pa: 'ਗਿਆਨ ਹਰ ਕੋਨੇ ਤੱਕ ਪਹੁੰਚਦਾ ਹੈ',
    as: 'জ্ঞান প্ৰতিটো কোণলৈ পায়',
    ur: 'علم ہر کونے تک پہنچتا ہے',
  },
  'app.subtitle': {
    en: 'Offline-first education platform • Made in India',
    hi: 'ऑफलाइन-फर्स्ट शिक्षा मंच • भारत में निर्मित',
    ta: 'ஆஃப்லைன்-முதல் கல்வி தளம் • இந்தியாவில் தயாரிக்கப்பட்டது',
    te: 'ఆఫ్లైన్-మొదటి విద్యా వేదిక • భారతదేశంలో తయారు చేయబడింది',
    bn: 'অফলাইন-প্রথম শিক্ষা প্ল্যাটফর্ম • ভারত তৈরি',
    gu: 'ઓફલાઇન-પ્રથમ શિક્ષણ પ્લેટફોર્મ • ભારતમાં બનાવેલ',
    kn: 'ಆಫ್ಲೈನ್-ಮೊದಲ ಶಿಕ್ಷಣ ವೇದಿಕೆ • ಭಾರತದಲ್ಲಿ ತಯಾರಿಸಲಾಗಿದೆ',
    ml: 'ഓഫ്ലൈൻ-ആദ്യ വിദ്യാഭ്യാസ പ്ലാറ്റ്ഫോം • ഇന്ത്യയിൽ നിർമ്മിച്ചത്',
    mr: 'ऑफलाइन-फर्स्ट शिक्षा मंच • भारतात बनवले',
    or: 'ଅଫଲାଇନ-ପ୍ରଥମ ଶିକ୍ଷା ପ୍ଲାଟଫର୍ମ • ଭାରତରେ ନିର୍ମିତ',
    pa: 'ਆਫਲਾਈਨ-ਪਹਿਲਾ ਸਿੱਖਿਆ ਪਲੇਟਫਾਰਮ • ਭਾਰਤ ਵਿੱਚ ਬਣਾਇਆ',
    as: 'অফলাইন-প্ৰথম শিক্ষা প্লেটফৰ্ম • ভাৰতত নিৰ্মিত',
    ur: 'آف لائن-پہلا تعلیمی پلیٹ فارم • بھارت میں بنایا گیا',
  },

  // Language Selector
  'language.label': {
    en: 'Language:',
    hi: 'भाषा:',
    ta: 'மொழி:',
    te: 'భాష:',
    bn: 'ভাষা:',
    gu: 'ભાષા:',
    kn: 'ಭಾಷೆ:',
    ml: 'ഭാഷ:',
    mr: 'भाषा:',
    or: 'ଭାଷା:',
    pa: 'ਭਾਸ਼ਾ:',
    as: 'ভাষা:',
    ur: 'زبان:',
  },
  'language.english': {
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
  'language.hindi': {
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

  // Voice and Sync
  'voice.help': {
    en: 'Voice Help',
    hi: 'आवाज़ सहायता',
    ta: 'குரல் உதவி',
    te: 'వాయిస్ సహాయం',
    bn: 'ভয়েস সাহায্য',
    gu: 'વૉઇસ સહાય',
    kn: 'ವಾಯ್ಸ್ ಸಹಾಯ',
    ml: 'വോയ്സ് സഹായം',
    mr: 'आवाज मदत',
    or: 'ଭଏସ୍ ସହାୟତା',
    pa: 'ਵੌਇਸ ਸਹਾਇਤਾ',
    as: 'ভয়েচ সহায়তা',
    ur: 'آواز کی مدد',
  },
  'sync.button': {
    en: 'Sync',
    hi: 'सिंक',
    ta: 'ஒத்திசைவு',
    te: 'సమకాలీకరణ',
    bn: 'সিঙ্ক',
    gu: 'સિંક',
    kn: 'ಸಿಂಕ್',
    ml: 'സിംക്',
    mr: 'सिंक',
    or: 'ସିଂକ୍',
    pa: 'ਸਿੰਕ',
    as: 'ছিংক',
    ur: 'سینک',
  },

  // Lesson Content
  'lessons.loading': {
    en: 'Loading lessons...',
    hi: 'पाठ लोड हो रहे हैं...',
    ta: 'பாடங்கள் ஏற்றப்படுகின்றன...',
    te: 'పాఠాలు లోడ్ అవుతున్నాయి...',
    bn: 'পাঠ লোড হচ্ছে...',
    gu: 'પાઠ લોડ થઈ રહ્યા છે...',
    kn: 'ಪಾಠಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...',
    ml: 'പാഠങ്ങൾ ലോഡ് ചെയ്യുന്നു...',
    mr: 'धडे लोड होत आहेत...',
    or: 'ପାଠଗୁଡ଼ିକ ଲୋଡ୍ ହେଉଛି...',
    pa: 'ਪਾਠ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
    as: 'পাঠ লোড হৈ আছে...',
    ur: 'سبق لوڈ ہو رہے ہیں...',
  },
  'lessons.no_lessons': {
    en: 'No lessons available for selected filters.',
    hi: 'चयनित फिल्टर के लिए कोई पाठ उपलब्ध नहीं है।',
    ta: 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளுக்கு பாடங்கள் இல்லை.',
    te: 'ఎంచుకున్న ఫిల్టర్లకు పాఠాలు లేవు.',
    bn: 'নির্বাচিত ফিল্টারের জন্য কোন পাঠ নেই।',
    gu: 'પસંદ કરેલા ફિલ્ટર માટે કોઈ પાઠ ઉપલબ્ધ નથી.',
    kn: 'ಆಯ್ಕೆ ಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಪಾಠಗಳು ಇಲ್ಲ.',
    ml: 'തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകൾക്ക് പാഠങ്ങൾ ഇല്ല.',
    mr: 'निवडलेल्या फिल्टरसाठी धडे उपलब्ध नाहीत.',
    or: 'ବାଛିଥିବା ଫିଲ୍ଟର ପାଇଁ କୌଣସି ପାଠ ନାହିଁ।',
    pa: 'ਚੁਣੇ ਗਏ ਫਿਲਟਰਾਂ ਲਈ ਕੋਈ ਪਾਠ ਉਪਲਬਧ ਨਹੀਂ।',
    as: 'নিৰ্বাচিত ফিল্টাৰৰ বাবে কোনো পাঠ নাই।',
    ur: 'منتخب فلٹرز کے لیے کوئی سبق دستیاب نہیں۔',
  },
  'lessons.grade': {
    en: 'Grade',
    hi: 'कक्षा',
    ta: 'தரம்',
    te: 'తరగతి',
    bn: 'শ্রেণী',
    gu: 'ધોરણ',
    kn: 'ತರಗತಿ',
    ml: 'ക്ലാസ്',
    mr: 'इयत्ता',
    or: 'ଶ୍ରେଣୀ',
    pa: 'ਕਲਾਸ',
    as: 'শ্ৰেণী',
    ur: 'گریڈ',
  },

  // Quiz
  'quiz.start': {
    en: 'Start Quiz',
    hi: 'क्विज़ शुरू करें',
    ta: 'வினாடி வினா தொடங்கு',
    te: 'క్విజ్ ప్రారంభించండి',
    bn: 'কুইজ শুরু করুন',
    gu: 'ક્વિઝ શરૂ કરો',
    kn: 'ಕ್ವಿಜ್ ಪ್ರಾರಂಭಿಸಿ',
    ml: 'ക്വിസ് ആരംഭിക്കുക',
    mr: 'क्विझ सुरू करा',
    or: 'କ୍ୱିଜ୍ ଆରମ୍ଭ କରନ୍ତୁ',
    pa: 'ਕੁਇਜ਼ ਸ਼ੁਰੂ ਕਰੋ',
    as: 'কুইজ আৰম্ভ কৰক',
    ur: 'کوئز شروع کریں',
  },
  'quiz.next': {
    en: 'Next',
    hi: 'अगला',
    ta: 'அடுத்து',
    te: 'తదుపరి',
    bn: 'পরবর্তী',
    gu: 'આગળ',
    kn: 'ಮುಂದೆ',
    ml: 'അടുത്തത്',
    mr: 'पुढे',
    or: 'ପରବର୍ତ୍ତୀ',
    pa: 'ਅਗਲਾ',
    as: 'পৰৱৰ্তী',
    ur: 'اگلا',
  },
  'quiz.submit': {
    en: 'Submit',
    hi: 'जमा करें',
    ta: 'சமர்ப்பிக்கவும்',
    te: 'సమర్పించండి',
    bn: 'জমা দিন',
    gu: 'સબમિટ કરો',
    kn: 'ಸಲ್ಲಿಸಿ',
    ml: 'സമർപ്പിക്കുക',
    mr: 'सबमिट करा',
    or: 'ଦାଖଲ କରନ୍ତୁ',
    pa: 'ਜਮ੍ਹਾ ਕਰੋ',
    as: 'দাখিল কৰক',
    ur: 'جمع کریں',
  },
  'quiz.complete': {
    en: 'Quiz Complete!',
    hi: 'क्विज़ पूर्ण!',
    ta: 'வினாடி வினா முடிந்தது!',
    te: 'క్విజ్ పూర్తయింది!',
    bn: 'কুইজ সম্পূর্ণ!',
    gu: 'ક્વિઝ પૂર્ણ!',
    kn: 'ಕ್ವಿಜ್ ಪೂರ್ಣಗೊಂಡಿದೆ!',
    ml: 'ക്വിസ് പൂർത്തിയായി!',
    mr: 'क्विझ पूर्ण!',
    or: 'କ୍ୱିଜ୍ ସମ୍ପୂର୍ଣ୍ଣ!',
    pa: 'ਕੁਇਜ਼ ਪੂਰੀ!',
    as: 'কুইজ সম্পূৰ্ণ!',
    ur: 'کوئز مکمل!',
  },

  // Performance Monitor
  'performance.title': {
    en: 'Performance Monitor',
    hi: 'प्रदर्शन मॉनिटर',
    ta: 'செயல்திறன் கண்காணிப்பு',
    te: 'పనితీరు మానిటర్',
    bn: 'পারফরম্যান্স মনিটর',
    gu: 'પ્રદર્શન મોનિટર',
    kn: 'ಪ್ರದರ್ಶನ ಮಾನಿಟರ್',
    ml: 'പ്രകടന മോണിറ്റർ',
    mr: 'कामगिरी मॉनिटर',
    or: 'ପ୍ରଦର୍ଶନ ମନିଟର୍',
    pa: 'ਪ੍ਰਦਰਸ਼ਨ ਮਾਨੀਟਰ',
    as: 'প্ৰদৰ্শন মনিটৰ',
    ur: 'پرفارمنس مانیٹر',
  },
  'performance.cache_hits': {
    en: 'Cache Hits:',
    hi: 'कैश हिट्स:',
    ta: 'கேச் ஹிட்ஸ்:',
    te: 'క్యాచ్ హిట్స్:',
    bn: 'ক্যাশ হিটস:',
    gu: 'કેશ હિટ્સ:',
    kn: 'ಕ್ಯಾಶ್ ಹಿಟ್ಸ್:',
    ml: 'കാഷ് ഹിറ്റുകൾ:',
    mr: 'कॅश हिट्स:',
    or: 'କ୍ୟାଚ୍ ହିଟ୍ସ୍:',
    pa: 'ਕੈਸ਼ ਹਿਟਸ:',
    as: 'ক্যাশ হিটছ:',
    ur: 'کیش ہٹس:',
  },
  'performance.cache_misses': {
    en: 'Cache Misses:',
    hi: 'कैश मिस:',
    ta: 'கேச் மிஸ்:',
    te: 'క్యాచ్ మిస్:',
    bn: 'ক্যাশ মিস:',
    gu: 'કેશ મિસ:',
    kn: 'ಕ್ಯಾಶ್ ಮಿಸ್:',
    ml: 'കാഷ് മിസ്:',
    mr: 'कॅश मिस:',
    or: 'କ୍ୟାଚ୍ ମିସ୍:',
    pa: 'ਕੈਸ਼ ਮਿਸ:',
    as: 'ক্যাশ মিছ:',
    ur: 'کیش مس:',
  },
  'performance.total_lessons': {
    en: 'Total Lessons:',
    hi: 'कुल पाठ:',
    ta: 'மொத்த பாடங்கள்:',
    te: 'మొత్తం పాఠాలు:',
    bn: 'মোট পাঠ:',
    gu: 'કુલ પાઠ:',
    kn: 'ಒಟ್ಟು ಪಾಠಗಳು:',
    ml: 'മൊത്തം പാഠങ്ങൾ:',
    mr: 'एकूण धडे:',
    or: 'ମୋଟ ପାଠ:',
    pa: 'ਕੁੱਲ ਪਾਠ:',
    as: 'মুঠ পাঠ:',
    ur: 'کل سبق:',
  },
  'performance.last_sync': {
    en: 'Last Sync:',
    hi: 'अंतिम सिंक:',
    ta: 'கடைசி ஒத்திசைவு:',
    te: 'చివరి సమకాలీకరణ:',
    bn: 'শেষ সিঙ্ক:',
    gu: 'છેલ્લું સિંક:',
    kn: 'ಕೊನೆಯ ಸಿಂಕ್:',
    ml: 'അവസാന സിംക്:',
    mr: 'शेवटचा सिंक:',
    or: 'ଶେଷ ସିଂକ୍:',
    pa: 'ਆਖਰੀ ਸਿੰਕ:',
    as: 'শেষ ছিংক:',
    ur: 'آخری سینک:',
  },
  'performance.force_sync': {
    en: 'Force Sync',
    hi: 'जबरदस्ती सिंक',
    ta: 'பலவந்தமாக ஒத்திசைவு',
    te: 'బలవంతంగా సమకాలీకరణ',
    bn: 'জোর করে সিঙ্ক',
    gu: 'જબરદસ્ત સિંક',
    kn: 'ಬಲವಂತವಾಗಿ ಸಿಂಕ್',
    ml: 'ബലപ്രയോഗം സിംക്',
    mr: 'जबरदस्ती सिंक',
    or: 'ବଳପ୍ରୟୋଗ ସିଂକ୍',
    pa: 'ਜ਼ਬਰਦਸਤੀ ਸਿੰਕ',
    as: 'জোৰ কৰি ছিংক',
    ur: 'زبردستی سینک',
  },
  'performance.clear_cache': {
    en: 'Clear Cache',
    hi: 'कैश साफ़ करें',
    ta: 'கேச் அழிக்கவும்',
    te: 'క్యాచ్ క్లియర్ చేయండి',
    bn: 'ক্যাশ সাফ করুন',
    gu: 'કેશ સાફ કરો',
    kn: 'ಕ್ಯಾಶ್ ಕ್ಲಿಯರ್ ಮಾಡಿ',
    ml: 'കാഷ് മായ്ക്കുക',
    mr: 'कॅश साफ करा',
    or: 'କ୍ୟାଚ୍ ସଫା କରନ୍ତୁ',
    pa: 'ਕੈਸ਼ ਸਾਫ ਕਰੋ',
    as: 'ক্যাশ পৰিষ্কাৰ কৰক',
    ur: 'کیش صاف کریں',
  },
};

/**
 * Get translated UI text
 * @param key - The translation key
 * @param language - The target language
 * @returns Translated text or key if translation not found
 */
export function getUITranslation(key: string, language: Language): string {
  const translations = UI_TRANSLATIONS[key];
  if (!translations) {
    console.warn(`No translations found for UI key: ${key}`);
    return key;
  }

  const translation = translations[language];
  if (!translation) {
    console.warn(`No translation found for UI key ${key} in language ${language}`);
    return key;
  }

  return translation;
}

/**
 * Get all available translation keys
 * @returns Array of all translation keys
 */
export function getAvailableTranslationKeys(): string[] {
  return Object.keys(UI_TRANSLATIONS);
}

/**
 * Check if a translation key exists
 * @param key - The translation key to check
 * @returns True if key exists, false otherwise
 */
export function hasTranslation(key: string): boolean {
  return key in UI_TRANSLATIONS;
}
