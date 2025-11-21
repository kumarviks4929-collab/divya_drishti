
export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  SANSKRIT = 'Sanskrit',
  MARATHI = 'Marathi',
  TAMIL = 'Tamil',
  TELUGU = 'Telugu',
  BENGALI = 'Bengali',
  GUJARATI = 'Gujarati'
}

export interface UserActivity {
  id: string;
  type: 'chat' | 'kundali' | 'matching' | 'horoscope' | 'tool';
  title: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  username: string; // New field for login
  password?: string; // New field for login (optional because we might clear it in state)
  name: string;
  dob: string; // ISO string
  time: string;
  place: string;
  isLoggedIn: boolean;
  activities: UserActivity[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ZodiacSign {
  name: string;
  hindiName: string;
  icon: string; // emoji char
  image: string; // 3D image url
  dates: string;
}

export interface KundaliData {
  lagna: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  houses: { [key: number]: string[] }; // House number -> Array of planets
}

export interface MatchResult {
  score: number;
  total: number;
  description: string;
  gunaMilan: {
    area: string;
    score: number;
    max: number;
  }[];
}

export interface PanchangData {
  tithi: string;
  nakshatra: string;
  yog: string;
  karan: string;
  sunrise: string;
  sunset: string;
}
