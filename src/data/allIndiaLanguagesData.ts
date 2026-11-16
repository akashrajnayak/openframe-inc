import {
  AllIndiaBoardRecord,
  AllIndiaLanguagePack,
  MultilingualGlossaryEntry,
  MultilingualText,
  SchoolLanguage,
} from '../types';

export const ALL_INDIA_LANGUAGE_PACKS: AllIndiaLanguagePack[] = [
  {
    id: 'English',
    name: 'English',
    nativeLabel: 'English',
    scriptName: 'Latin',
    bcp47Code: 'en-IN',
    primaryRegions: ['All India', 'CBSE', 'CISCE', 'IB', 'Cambridge'],
    traceCharacters: ['A', 'B', 'C', '5', '9'],
    sampleSentence:
      'Photosynthesis converts light energy into chemical glucose in green plant chloroplasts.',
  },
  {
    id: 'Kannada',
    name: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ (Kannada)',
    scriptName: 'Kannada',
    bcp47Code: 'kn-IN',
    primaryRegions: ['Karnataka (KSEAB / KTBS / DSERT)'],
    traceCharacters: ['ಅ', 'ಆ', 'ಕ', 'ಗ', '೫'],
    sampleSentence:
      'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis) ಮೂಲಕ ಹಸಿರು ಸಸ್ಯಗಳು ಸೂರ್ಯನ ಬೆಳಕಿನಿಂದ ಆಹಾರ ತಯಾರಿಸುತ್ತವೆ.',
  },
  {
    id: 'Hindi',
    name: 'Hindi',
    nativeLabel: 'हिन्दी (Hindi)',
    scriptName: 'Devanagari',
    bcp47Code: 'hi-IN',
    primaryRegions: ['All India', 'CBSE', 'UP', 'Bihar', 'MP', 'Rajasthan', 'Haryana', 'Delhi'],
    traceCharacters: ['अ', 'आ', 'क', 'ख', '५'],
    sampleSentence:
      'प्रकाश संश्लेषण (Photosynthesis) द्वारा हरे पौधे सूर्य के प्रकाश से ग्लूकोज़ बनाते हैं।',
  },
  {
    id: 'Tamil',
    name: 'Tamil',
    nativeLabel: 'தமிழ் (Tamil)',
    scriptName: 'Tamil',
    bcp47Code: 'ta-IN',
    primaryRegions: ['Tamil Nadu (TNSCERT / DGE)', 'Puducherry'],
    traceCharacters: ['அ', 'ஆ', 'க', 'ச', '௫'],
    sampleSentence:
      'ஒளிச்சேர்க்கை (Photosynthesis) மூலம் பசுந்தாவரங்கள் சூரிய ஒளியைப் பயன்படுத்தி உணவு தயாரிக்கின்றன.',
  },
  {
    id: 'Telugu',
    name: 'Telugu',
    nativeLabel: 'తెలుగు (Telugu)',
    scriptName: 'Telugu',
    bcp47Code: 'te-IN',
    primaryRegions: ['Andhra Pradesh (APSCERT)', 'Telangana (TSCERT)'],
    traceCharacters: ['అ', 'ఆ', 'క', 'గ', '౫'],
    sampleSentence:
      'కిరణజన్య సంయోగక్రియ (Photosynthesis) ద్వారా ఆకుపచ్చ మొక్కలు సూర్యకాంతితో ఆహారాన్ని తయారుచేస్తాయి.',
  },
  {
    id: 'Malayalam',
    name: 'Malayalam',
    nativeLabel: 'മലയാളം (Malayalam)',
    scriptName: 'Malayalam',
    bcp47Code: 'ml-IN',
    primaryRegions: ['Kerala (SCERT / KBPE)', 'Lakshadweep', 'Mahe'],
    traceCharacters: ['അ', 'ആ', 'ക', 'ഗ', '൫'],
    sampleSentence:
      'പ്രകാശസംശ്ലേഷണം (Photosynthesis) വഴി ഹരിത സസ്യങ്ങൾ സൂര്യപ്രകാശത്തിൽ നിന്ന് ആഹാരം നിർമ്മിക്കുന്നു.',
  },
  {
    id: 'Marathi',
    name: 'Marathi',
    nativeLabel: 'मराठी (Marathi)',
    scriptName: 'Devanagari',
    bcp47Code: 'mr-IN',
    primaryRegions: ['Maharashtra (MSBSHSE / Balbharati)', 'Goa'],
    traceCharacters: ['अ', 'आ', 'क', 'ळ', '५'],
    sampleSentence:
      'प्रकाशसंश्लेषण (Photosynthesis) प्रक्रियेद्वारे हिरव्या वनस्पती सूर्यप्रकाशातून अन्न तयार करतात.',
  },
  {
    id: 'Gujarati',
    name: 'Gujarati',
    nativeLabel: 'ગુજરાતી (Gujarati)',
    scriptName: 'Gujarati',
    bcp47Code: 'gu-IN',
    primaryRegions: ['Gujarat (GSEB / GCERT)', 'DNH & DD'],
    traceCharacters: ['અ', 'આ', 'ક', 'ગ', '૫'],
    sampleSentence:
      'પ્રકાશસંશ્લેષણ (Photosynthesis) દ્વારા લીલા છોડ સૂર્યપ્રકાશની મદદથી ખોરાક બનાવે છે.',
  },
  {
    id: 'Bengali',
    name: 'Bengali',
    nativeLabel: 'বাংলা (Bengali)',
    scriptName: 'Bengali',
    bcp47Code: 'bn-IN',
    primaryRegions: ['West Bengal (WBBSE / WBCHSE)', 'Tripura (TBSE)'],
    traceCharacters: ['অ', 'আ', 'ক', 'খ', '৫'],
    sampleSentence:
      'সালোকসংশ্লেষ (Photosynthesis) প্রক্রিয়ায় সবুজ উদ্ভিদ সূর্যালোকের সাহায্যে খাদ্য তৈরি করে।',
  },
  {
    id: 'Odia',
    name: 'Odia',
    nativeLabel: 'ଓଡ଼ିଆ (Odia)',
    scriptName: 'Odia',
    bcp47Code: 'or-IN',
    primaryRegions: ['Odisha (BSE Odisha / CHSE / OSEPA)'],
    traceCharacters: ['ଅ', 'ଆ', 'କ', 'ଖ', '୫'],
    sampleSentence:
      'ଆଲୋକଶ୍ଳେଷଣ (Photosynthesis) ପ୍ରକ୍ରିୟାରେ ସବୁଜ ଉଦ୍ଭିଦ ସୂର୍ଯ୍ୟାଲୋକରୁ ଖାଦ୍ୟ ପ୍ରସ୍ତୁତ କରନ୍ତି।',
  },
  {
    id: 'Punjabi',
    name: 'Punjabi',
    nativeLabel: 'ਪੰਜਾਬੀ (Punjabi)',
    scriptName: 'Gurmukhi',
    bcp47Code: 'pa-IN',
    primaryRegions: ['Punjab (PSEB)', 'Chandigarh'],
    traceCharacters: ['ੳ', 'ਅ', 'ਕ', 'ਖ', '੫'],
    sampleSentence:
      'ਪ੍ਰਕਾਸ਼ ਸੰਸ਼ਲੇਸ਼ਣ (Photosynthesis) ਰਾਹੀਂ ਹਰੇ ਪੌਦੇ ਸੂਰਜ ਦੀ ਰੌਸ਼ਨੀ ਨਾਲ ਭੋਜਨ ਬਣਾਉਂਦੇ ਹਨ।',
  },
  {
    id: 'Assamese',
    name: 'Assamese',
    nativeLabel: 'অসমীয়া (Assamese)',
    scriptName: 'Assamese',
    bcp47Code: 'as-IN',
    primaryRegions: ['Assam (ASSEB / SCERT Assam)'],
    traceCharacters: ['অ', 'আ', 'ক', 'ৰ', '৫'],
    sampleSentence:
      'সালোকসংশ্লেষণ (Photosynthesis) প্ৰক্ৰিয়াৰে সেউজীয়া উদ্ভিদে সূৰ্যৰ পোহৰত খাদ্য প্ৰস্তুত কৰে।',
  },
  {
    id: 'Urdu',
    name: 'Urdu',
    nativeLabel: 'اردو (Urdu)',
    scriptName: 'Perso-Arabic (Nastaliq)',
    bcp47Code: 'ur-IN',
    rtl: true,
    primaryRegions: ['Karnataka', 'Telangana', 'UP', 'Bihar', 'J&K', 'Delhi', 'Maharashtra'],
    traceCharacters: ['ا', 'ب', 'پ', 'ت', '۵'],
    sampleSentence:
      'ضیائی تالیف (Photosynthesis) کے عمل سے ہرے پودے سورج کی روشنی میں اپنی غذا تیار کرتے ہیں۔',
  },
  {
    id: 'Sanskrit',
    name: 'Sanskrit',
    nativeLabel: 'संस्कृतम् (Sanskrit)',
    scriptName: 'Devanagari',
    bcp47Code: 'sa-IN',
    primaryRegions: ['All India Classical Language (CBSE / State Boards)'],
    traceCharacters: ['अ', 'क', 'ज्ञ', 'ॐ', '५'],
    sampleSentence:
      'प्रकाशसंश्लेषणम् (Photosynthesis) इति प्रक्रियया हरितपादपाः सूर्यरश्मिभिः अन्नं निर्मान्ति।',
  },
];

export const ALL_INDIA_LANGUAGE_IDS: SchoolLanguage[] = ALL_INDIA_LANGUAGE_PACKS.map((p) => p.id);

export function getLanguagePack(lang?: string): AllIndiaLanguagePack {
  if (!lang) return ALL_INDIA_LANGUAGE_PACKS[0];
  const found = ALL_INDIA_LANGUAGE_PACKS.find(
    (p) => p.id.toLowerCase() === lang.toLowerCase() || p.name.toLowerCase() === lang.toLowerCase()
  );
  return found || ALL_INDIA_LANGUAGE_PACKS[0];
}

export function getLocalizedText(
  textMap: MultilingualText | Record<string, string | undefined> | undefined,
  lang: SchoolLanguage,
  overrideTranslated?: string
): string {
  if (overrideTranslated && overrideTranslated.trim()) {
    return overrideTranslated;
  }
  if (!textMap) return '';
  const exact = textMap[lang];
  if (exact && exact.trim()) return exact;
  return textMap.English || textMap.Hindi || textMap.Kannada || '';
}

export function getBoardRecommendedLanguages(board?: AllIndiaBoardRecord | null): SchoolLanguage[] {
  const rec = new Set<SchoolLanguage>(['English']);
  if (board?.supportedMediums) {
    for (const mediumRaw of board.supportedMediums) {
      const m = mediumRaw.toLowerCase();
      for (const pack of ALL_INDIA_LANGUAGE_PACKS) {
        if (m.includes(pack.id.toLowerCase()) || m.includes(pack.name.toLowerCase())) {
          rec.add(pack.id);
        }
      }
    }
  }
  if (board?.curriculumGroupId === 'KAR_STATE') {
    rec.add('Kannada');
    rec.add('Urdu');
  }
  if (board?.curriculumGroupId === 'CBSE') {
    rec.add('Hindi');
  }
  return Array.from(rec);
}

/**
 * Verified All-India Technical Terminology Dictionary.
 * Never mistranslates technical terms literally: displays verified regional equivalent
 * paired with exact preserved English scientific/mathematical term.
 */
export const ALL_INDIA_TECH_GLOSSARY: MultilingualGlossaryEntry[] = [
  {
    id: 'term-photosynthesis',
    subject: 'Biology / Science',
    english: 'Photosynthesis',
    definition: 'Biochemical process in chloroplasts converting CO2 + water + sunlight into glucose and oxygen.',
    translations: {
      English: 'Photosynthesis',
      Kannada: 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis)',
      Hindi: 'प्रकाश संश्लेषण (Photosynthesis)',
      Tamil: 'ஒளிச்சேர்க்கை (Photosynthesis)',
      Telugu: 'కిరణజన్య సంయోగక్రియ (Photosynthesis)',
      Malayalam: 'പ്രകാശസംശ്ലേഷണം (Photosynthesis)',
      Marathi: 'प्रकाशसंश्लेषण (Photosynthesis)',
      Gujarati: 'પ્રકાશસંશ્લેષણ (Photosynthesis)',
      Bengali: 'সালোকসংশ্লেষ (Photosynthesis)',
      Odia: 'ଆଲୋକଶ୍ଳେଷଣ (Photosynthesis)',
      Punjabi: 'ਪ੍ਰਕਾਸ਼ ਸੰਸ਼ਲੇਸ਼ਣ (Photosynthesis)',
      Assamese: 'সালোকসংশ্লেষণ (Photosynthesis)',
      Urdu: 'ضیائی تالیف (Photosynthesis)',
      Sanskrit: 'प्रकाशसंश्लेषणम् (Photosynthesis)',
    },
  },
  {
    id: 'term-voltage',
    subject: 'Physics',
    english: 'Potential Difference (Voltage)',
    definition: 'Work done per unit positive charge moving between two points in an electric circuit (V = W/Q).',
    translations: {
      English: 'Potential Difference (Voltage)',
      Kannada: 'ವಿಭವಾಂತರ (Voltage)',
      Hindi: 'विभवांतर (Voltage)',
      Tamil: 'மின்னழுத்த வேறுபாடு (Voltage)',
      Telugu: 'పొటెన్షియల్ భేదం (Voltage)',
      Malayalam: 'പൊട്ടൻഷ്യൽ വ്യത്യാസം (Voltage)',
      Marathi: 'विभवांतर (Voltage)',
      Gujarati: 'વિદ્યુતસ્થિતિમાનનો તફાવત (Voltage)',
      Bengali: 'বিভব প্রভেদ (Voltage)',
      Odia: 'ବିଭବାନ୍ତର (Voltage)',
      Punjabi: 'ਪੁਟੈਂਸ਼ਲ ਅੰਤਰ (Voltage)',
      Assamese: 'বিভৱ ভেদ (Voltage)',
      Urdu: 'برقی قوّتِ فرق (Voltage)',
      Sanskrit: 'विभवान्तरम् (Voltage)',
    },
  },
  {
    id: 'term-acceleration',
    subject: 'Physics',
    english: 'Acceleration',
    definition: 'Vector rate of change of velocity per unit time (a = Δv / Δt, unit: m/s²).',
    translations: {
      English: 'Acceleration',
      Kannada: 'ವೇಗೋತ್ಕರ್ಷ (Acceleration)',
      Hindi: 'त्वरण (Acceleration)',
      Tamil: 'முடுக்கம் (Acceleration)',
      Telugu: 'త్వరణం (Acceleration)',
      Malayalam: 'ത്വരണം (Acceleration)',
      Marathi: 'त्वरण (Acceleration)',
      Gujarati: 'પ્રવેગ (Acceleration)',
      Bengali: 'ত্বরণ (Acceleration)',
      Odia: 'ତ୍ୱରଣ (Acceleration)',
      Punjabi: 'ਪ੍ਰਵੇਗ (Acceleration)',
      Assamese: 'ত্বৰণ (Acceleration)',
      Urdu: 'اسراع (Acceleration)',
      Sanskrit: 'त्वरणम् (Acceleration)',
    },
  },
  {
    id: 'term-neutralization',
    subject: 'Chemistry',
    english: 'Neutralization Reaction',
    definition: 'Reaction between an acid and a base yielding salt and water (H⁺ + OH⁻ → H₂O).',
    translations: {
      English: 'Neutralization Reaction',
      Kannada: 'ತಟಸ್ಥೀಕರಣ ಕ್ರಿಯೆ (Neutralization)',
      Hindi: 'उदासीनीकरण अभिक्रिया (Neutralization)',
      Tamil: 'நடுநிலையாக்கல் வினை (Neutralization)',
      Telugu: 'తటస్థీకరణ చర్య (Neutralization)',
      Malayalam: 'നിർവീര്യമാക്കൽ പ്രവർത്തനം (Neutralization)',
      Marathi: 'उदासिनीकरण अभिक्रिया (Neutralization)',
      Gujarati: 'તટસ્થીકરણ પ્રક્રિયા (Neutralization)',
      Bengali: 'প্রশমন বিক্রিয়া (Neutralization)',
      Odia: 'ପ୍ରଶମନ ପ୍ରତିକ୍ରିୟା (Neutralization)',
      Punjabi: 'ਉਦਾਸੀਨੀਕਰਨ ਕਿਰਿਆ (Neutralization)',
      Assamese: 'প্ৰশমন বিক্ৰিয়া (Neutralization)',
      Urdu: 'تعدیلی تعامل (Neutralization)',
      Sanskrit: 'उदासीनीकरणक्रिया (Neutralization)',
    },
  },
  {
    id: 'term-fraction-parts',
    subject: 'Mathematics',
    english: 'Numerator & Denominator',
    definition: 'Upper count of selected parts (Numerator) and lower count of total equal parts (Denominator).',
    translations: {
      English: 'Numerator & Denominator',
      Kannada: 'ಅಂಶ ಮತ್ತು ಛೇದ (Numerator & Denominator)',
      Hindi: 'अंश और हर (Numerator & Denominator)',
      Tamil: 'தொகுதி மற்றும் பகுதி (Numerator & Denominator)',
      Telugu: 'లవము మరియు హారము (Numerator & Denominator)',
      Malayalam: 'അംശവും ഛേദവും (Numerator & Denominator)',
      Marathi: 'अंश आणि छेद (Numerator & Denominator)',
      Gujarati: 'અંશ અને છેદ (Numerator & Denominator)',
      Bengali: 'লব ও হর (Numerator & Denominator)',
      Odia: 'ଲବ ଏବଂ ହର (Numerator & Denominator)',
      Punjabi: 'ਅੰਸ਼ ਅਤੇ ਹਰ (Numerator & Denominator)',
      Assamese: 'লৱ আৰু হৰ (Numerator & Denominator)',
      Urdu: 'شمار کنندہ اور مخرج (Numerator & Denominator)',
      Sanskrit: 'अंशः हरश्च (Numerator & Denominator)',
    },
  },
  {
    id: 'term-quadratic',
    subject: 'Mathematics',
    english: 'Quadratic Equation',
    definition: 'Second-degree polynomial equation of standard form ax² + bx + c = 0 (a ≠ 0).',
    translations: {
      English: 'Quadratic Equation',
      Kannada: 'ವರ್ಗ ಸಮೀಕರಣ (Quadratic Equation)',
      Hindi: 'द्विघात समीकरण (Quadratic Equation)',
      Tamil: 'இருபடிச் சமன்பாடு (Quadratic Equation)',
      Telugu: 'వర్గ సమీకరణం (Quadratic Equation)',
      Malayalam: 'ദ്വിമാന സമവാക്യം (Quadratic Equation)',
      Marathi: 'वर्गसमीकरण (Quadratic Equation)',
      Gujarati: 'દ્વિઘાત સમીકરણ (Quadratic Equation)',
      Bengali: 'দ্বিঘাত সমীকরণ (Quadratic Equation)',
      Odia: 'ଦ୍ୱିଘାତ ସମୀକରଣ (Quadratic Equation)',
      Punjabi: 'ਦੋ-ਘਾਤੀ ਸਮੀਕਰਨ (Quadratic Equation)',
      Assamese: 'দ্বিঘাত সমীকৰণ (Quadratic Equation)',
      Urdu: 'دو درجی مساوات (Quadratic Equation)',
      Sanskrit: 'द्विघातसमीकरणम् (Quadratic Equation)',
    },
  },
  {
    id: 'term-depreciation',
    subject: 'Commerce / Accountancy',
    english: 'Depreciation',
    definition: 'Systematic allocation of the depreciable cost of a tangible asset over its useful life.',
    translations: {
      English: 'Depreciation',
      Kannada: 'ಸವಕಳಿ (Depreciation)',
      Hindi: 'मूल्यह्रास (Depreciation)',
      Tamil: 'தேய்மானம் (Depreciation)',
      Telugu: 'తరుగుదల (Depreciation)',
      Malayalam: 'തേയ്മാനം (Depreciation)',
      Marathi: 'घसारा (Depreciation)',
      Gujarati: 'ઘસારો (Depreciation)',
      Bengali: 'অবচয় (Depreciation)',
      Odia: 'ଅବକ୍ଷୟ (Depreciation)',
      Punjabi: 'ਘਸਾਵਟ (Depreciation)',
      Assamese: 'অৱচয় (Depreciation)',
      Urdu: 'فرسودگی (Depreciation)',
      Sanskrit: 'मूल्यह्रासः (Depreciation)',
    },
  },
  {
    id: 'term-federalism',
    subject: 'Social Science / Civics',
    english: 'Federalism',
    definition: 'Constitutional system dividing legislative and executive authority between Union and State governments.',
    translations: {
      English: 'Federalism',
      Kannada: 'ಒಕ್ಕೂಟ ವ್ಯವಸ್ಥೆ (Federalism)',
      Hindi: 'संघवाद (Federalism)',
      Tamil: 'கூட்டாட்சி முறை (Federalism)',
      Telugu: 'సమాఖ్య విధానం (Federalism)',
      Malayalam: 'ഫെഡറലിസം / കൂട്ടായ്മ (Federalism)',
      Marathi: 'संघराज्य व्यवस्था (Federalism)',
      Gujarati: 'સંઘવાદ (Federalism)',
      Bengali: 'যুক্তরাষ্ট্রীয় ব্যবস্থা (Federalism)',
      Odia: 'ସଂଘୀୟ ବ୍ୟବସ୍ଥା (Federalism)',
      Punjabi: 'ਸੰਘਵਾਦ (Federalism)',
      Assamese: 'যুক্তৰাষ্ট্ৰীয় ব্যৱস্থা (Federalism)',
      Urdu: 'وفاقیت (Federalism)',
      Sanskrit: 'सङ्घीयव्यवस्था (Federalism)',
    },
  },
  {
    id: 'term-osmosis',
    subject: 'Biology / Chemistry',
    english: 'Osmosis',
    definition: 'Net movement of solvent (water) molecules across a semi-permeable membrane toward higher solute concentration.',
    translations: {
      English: 'Osmosis',
      Kannada: 'ಅಭಿಸರಣ (Osmosis)',
      Hindi: 'परासरण (Osmosis)',
      Tamil: 'சவ்வூடு பரவல் (Osmosis)',
      Telugu: 'ద్రవాభిసరణం (Osmosis)',
      Malayalam: 'ഓസ്‌മോസിസ് / വൃതിവ്യാപനം (Osmosis)',
      Marathi: 'परासरण (Osmosis)',
      Gujarati: 'આસૃતિ (Osmosis)',
      Bengali: 'অভিস্রবণ (Osmosis)',
      Odia: 'ଅଭିସ୍ରବଣ (Osmosis)',
      Punjabi: 'ਓਸਮੋਸਿਸ (Osmosis)',
      Assamese: 'আস্ৰৱণ (Osmosis)',
      Urdu: 'نفوذِ آب (Osmosis)',
      Sanskrit: 'परासरणम् (Osmosis)',
    },
  },
  {
    id: 'term-pythagoras',
    subject: 'Mathematics',
    english: 'Pythagoras Theorem',
    definition: 'In any right-angled triangle, square of the hypotenuse equals sum of squares of the other two sides (a² + b² = c²).',
    translations: {
      English: 'Pythagoras Theorem',
      Kannada: 'ಪೈಥಾಗೊರಸ್ ಪ್ರಮೇಯ (Pythagoras Theorem)',
      Hindi: 'पाइथागोरस प्रमेय (Pythagoras Theorem)',
      Tamil: 'பிதாகரஸ் தேற்றம் (Pythagoras Theorem)',
      Telugu: 'పైథాగరస్ సిద్ధాంతం (Pythagoras Theorem)',
      Malayalam: 'പൈതഗോറസ് സിദ്ധാന്തം (Pythagoras Theorem)',
      Marathi: 'पायथागोरस प्रमेय (Pythagoras Theorem)',
      Gujarati: 'પાયથાગોરસ પ્રમેય (Pythagoras Theorem)',
      Bengali: 'পিথাগোরাসের উপপাদ্য (Pythagoras Theorem)',
      Odia: 'ପିଥାଗୋରାସ ଉପପାଦ୍ୟ (Pythagoras Theorem)',
      Punjabi: 'ਪਾਈਥਾਗੋਰਸ ਥਿਊਰਮ (Pythagoras Theorem)',
      Assamese: 'পাইথাগোৰাছৰ উপপাদ্য (Pythagoras Theorem)',
      Urdu: 'مسئلہ فیثاغورث (Pythagoras Theorem)',
      Sanskrit: 'बौधायन-पाइथागोरस-प्रमेयः (Pythagoras Theorem)',
    },
  },
];
