
import { ZodiacSign, Language } from "./types";

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { 
    name: 'Aries', 
    hindiName: 'Mesh (मेष)', 
    icon: '♈', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Mesh%20Rashi%20Ram%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20glowing%20horns%20mystical%20fire%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2001',
    dates: 'Mar 21 - Apr 19' 
  },
  { 
    name: 'Taurus', 
    hindiName: 'Vrishabha (वृषभ)', 
    icon: '♉', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Vrishabha%20Rashi%20Bull%20Nandi%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20shiva%20energy%20mystical%20earth%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2002',
    dates: 'Apr 20 - May 20' 
  },
  { 
    name: 'Gemini', 
    hindiName: 'Mithun (मिथुन)', 
    icon: '♊', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Mithun%20Rashi%20Twins%20divine%20couple%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20mercury%20energy%20mystical%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2003',
    dates: 'May 21 - Jun 20' 
  },
  { 
    name: 'Cancer', 
    hindiName: 'Kark (कर्क)', 
    icon: '♋', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Kark%20Rashi%20Crab%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20moon%20energy%20water%20mystical%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2004',
    dates: 'Jun 21 - Jul 22' 
  },
  { 
    name: 'Leo', 
    hindiName: 'Simha (सिंह)', 
    icon: '♌', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Simha%20Rashi%20Lion%20Narasimha%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20sun%20energy%20fire%20mystical%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2005',
    dates: 'Jul 23 - Aug 22' 
  },
  { 
    name: 'Virgo', 
    hindiName: 'Kanya (कन्या)', 
    icon: '♍', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Kanya%20Rashi%20Maiden%20Goddess%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20flowers%20purity%20mystical%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2006',
    dates: 'Aug 23 - Sep 22' 
  },
  { 
    name: 'Libra', 
    hindiName: 'Tula (तुला)', 
    icon: '♎', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Tula%20Rashi%20Balance%20Scales%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20justice%20air%20mystical%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2007',
    dates: 'Sep 23 - Oct 22' 
  },
  { 
    name: 'Scorpio', 
    hindiName: 'Vrishchik (वृश्चिक)', 
    icon: '♏', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Vrishchik%20Rashi%20Scorpion%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20mars%20energy%20intense%20mystical%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2008',
    dates: 'Oct 23 - Nov 21' 
  },
  { 
    name: 'Sagittarius', 
    hindiName: 'Dhanu (धनु)', 
    icon: '♐', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Dhanu%20Rashi%20Archer%20Bow%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20jupiter%20energy%20warrior%20mystical%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2009',
    dates: 'Nov 22 - Dec 21' 
  },
  { 
    name: 'Capricorn', 
    hindiName: 'Makar (मकर)', 
    icon: '♑', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Makar%20Rashi%20Sea%20Goat%20Crocodile%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20saturn%20energy%20karma%20mystical%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2010',
    dates: 'Dec 22 - Jan 19' 
  },
  { 
    name: 'Aquarius', 
    hindiName: 'Kumbh (कुंभ)', 
    icon: '♒', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Kumbh%20Rashi%20Pot%20Water%20Pitcher%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20saturn%20energy%20mystical%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2011',
    dates: 'Jan 20 - Feb 18' 
  },
  { 
    name: 'Pisces', 
    hindiName: 'Meen (मीन)', 
    icon: '♓', 
    image: 'https://image.pollinations.ai/prompt/Vedic%20Astrology%20Meen%20Rashi%20Fish%20Matsya%20symbol%20Hindu%20mythology%20art%20dark%20cosmic%20background%20jupiter%20energy%20ocean%20mystical%208k%20highly%20detailed?width=400&height=400&nologo=true&seed=2012',
    dates: 'Feb 19 - Mar 20' 
  },
];

// Comprehensive translation keys for UI
export const TRANSLATIONS: Record<string, any> = {
  [Language.ENGLISH]: {
    dashboard: "Dashboard",
    horoscope: "Horoscope",
    kundali: "Janampatri / Kundali",
    matching: "Matchmaking",
    chat: "Ask Astrologer",
    remedies: "Remedies & Upay",
    numerology: "Numerology",
    panchang: "Panchang & Festivals",
    babyNames: "Baby Names",
    welcome: "Namaste",
    daily_prediction: "Daily",
    weekly_prediction: "Weekly",
    monthly_prediction: "Monthly",
    generate_kundali: "Generate Kundali",
    love_match: "Love Compatibility",
    lucky_color: "Lucky Color",
    lucky_number: "Lucky Number",
    enter_details: "Enter Details",
    submit: "Get Report",
    loading: "Consulting the stars...",
    select_sign: "Select Your Zodiac Sign",
    ask_question: "Ask your question...",
    online: "Online",
    create_profile: "Create Profile",
    sign_out: "Sign Out",
    premium_access: "Premium Access",
    upgrade: "Upgrade Now",
    name: "Name",
    dob: "Date of Birth",
    time: "Time of Birth",
    place: "Place of Birth",
    boy_details: "Boy's Details",
    girl_details: "Girl's Details",
    check_compatibility: "Check Compatibility",
    verdict: "Astrological Verdict",
    analysis: "Analysis",
    download_pdf: "Download PDF",
    history: "Activity History",
    saved_kundalis: "Saved Kundalis",
    privacy_security: "Privacy & Security",
    delete_account: "Delete Account",
    privacy_notice: "Your data is encrypted and stored securely on our private servers. We use bcrypt hashing for passwords. You can permanently delete your account and all associated data at any time.",
    secure_vault: "Secure Encrypted Vault",
    clear_data: "Clear All Data",
    privacy: "Privacy",
    q_career: "When will I get a job?",
    q_marriage: "When will I get married?",
    q_wealth: "Financial prediction for 2024",
    q_health: "How will be my health?",
  },
  [Language.HINDI]: {
    dashboard: "डैशबोर्ड",
    horoscope: "राशिफल",
    kundali: "जन्म कुंडली",
    matching: "गुण मिलान",
    chat: "ज्योतिषी से पूछें",
    remedies: "उपाय और टोटके",
    numerology: "अंकशास्त्र",
    panchang: "पंचांग और त्यौहार",
    babyNames: "शिशु नामकरण",
    welcome: "नमस्ते",
    daily_prediction: "दैनिक",
    weekly_prediction: "साप्ताहिक",
    monthly_prediction: "मासिक",
    generate_kundali: "कुंडली बनाएं",
    love_match: "विवाह मिलान",
    lucky_color: "शुभ रंग",
    lucky_number: "शुभ अंक",
    enter_details: "विवरण दर्ज करें",
    submit: "रिपोर्ट प्राप्त करें",
    loading: "ग्रहों की गणना हो रही है...",
    select_sign: "अपनी राशि चुनें",
    ask_question: "अपना प्रश्न पूछें...",
    online: "ऑनलाइन",
    create_profile: "प्रोफाइल बनाएं",
    sign_out: "लॉग आउट",
    premium_access: "प्रीमियम सेवा",
    upgrade: "अभी अपग्रेड करें",
    name: "नाम",
    dob: "जन्म तिथि",
    time: "जन्म समय",
    place: "जन्म स्थान",
    boy_details: "लड़के का विवरण",
    girl_details: "लड़की का विवरण",
    check_compatibility: "मिलान देखें",
    verdict: "ज्योतिषीय परिणाम",
    analysis: "विश्लेषण",
    download_pdf: "PDF डाउनलोड करें",
    history: "गतिविधि इतिहास",
    saved_kundalis: "सहेजी गई कुंडलियां",
    privacy_security: "गोपनीयता और सुरक्षा",
    delete_account: "खाता हटाएं",
    privacy_notice: "आपका डेटा हमारे निजी सर्वर पर सुरक्षित रूप से एन्क्रिप्टेड और संग्रहीत है। हम पासवर्ड के लिए bcrypt हैशिंग का उपयोग करते हैं। आप किसी भी समय अपना खाता और उससे जुड़ा सारा डेटा स्थायी रूप से हटा सकते हैं।",
    secure_vault: "सुरक्षित एन्क्रिप्टेड वॉल्ट",
    clear_data: "सभी डेटा मिटाएं",
    privacy: "गोपनीयता",
    q_career: "मुझे नौकरी कब मिलेगी?",
    q_marriage: "मेरी शादी कब होगी?",
    q_wealth: "2024 के लिए आर्थिक भविष्यवाणी",
    q_health: "मेरा स्वास्थ्य कैसा रहेगा?",
  }
};

export const getTranslation = (lang: string, key: string) => {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[Language.ENGLISH];
  return dict[key] || TRANSLATIONS[Language.ENGLISH][key] || key;
};
