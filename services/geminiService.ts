import { KundaliData, MatchResult, PanchangData } from "../types";

// Backend URL: Dynamically uses VITE_API_URL environment variable if available (Production),
// otherwise falls back to localhost (Development).
const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

// --- Helper to get Auth Token ---
const getAuthHeader = () => {
  const token = localStorage.getItem("astro_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

// Circuit Breaker: If true, serve mocks immediately to prevent API spam
let isQuotaExceeded = false;
const resetQuotaTimer = () => {
  setTimeout(() => {
    isQuotaExceeded = false;
    console.log("Attempting to restore API connectivity...");
  }, 5 * 60 * 1000); // Retry after 5 minutes
};

// --- Local Storage Security Helpers ---
// Simple obfuscation to prevent casual reading of local data
const secureParse = (str: string) => {
  try {
    // Try parsing as plain JSON first (migration support)
    return JSON.parse(str);
  } catch (e) {
    try {
      // Try decoding base64 then parsing
      return JSON.parse(atob(str));
    } catch (err) {
      return [];
    }
  }
};

const secureStringify = (data: any) => {
  // Encode to Base64 to hide plain text
  return btoa(JSON.stringify(data));
};

// --- Local Storage "Database" Helpers (Hybrid Auth Fallback) ---
const LOCAL_DB_KEY = "divya_drishti_local_users";

const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    if (!raw) return [];
    return secureParse(raw);
  } catch {
    return [];
  }
};

const saveLocalUser = (user: any) => {
  const users = getLocalUsers();
  // Remove if existing to update
  const filtered = users.filter((u: any) => u.username !== user.username);
  filtered.push(user);
  localStorage.setItem(LOCAL_DB_KEY, secureStringify(filtered));
};

const updateLocalUserActivity = (username: string, activity: any) => {
  const users = getLocalUsers();
  const idx = users.findIndex((u: any) => u.username === username);
  if (idx !== -1) {
    if (!users[idx].activities) users[idx].activities = [];
    users[idx].activities.unshift(activity);
    users[idx].activities = users[idx].activities.slice(0, 50);
    localStorage.setItem(LOCAL_DB_KEY, secureStringify(users));
  }
};

// --- Mock Data Helpers (Client Side Fallback) ---
const getMockKundaliAnalysis = (
  name: string,
  language: string
): { analysis: string; rawData: KundaliData } => {
  const isHindi = language === "Hindi";
  return {
    analysis: isHindi
      ? `**${name} की कुंडली विश्लेषण (AI सर्वर व्यस्त - ऑफलाइन मोड)**\n\n**1. व्यक्तित्व:** आप एक दृढ़ निश्चय वाले व्यक्ति हैं। सूर्य की स्थिति आपके नेतृत्व गुणों को दर्शाती है।\n\n**2. करियर:** आने वाला समय करियर में स्थिरता लाएगा। शनि का प्रभाव कड़ी मेहनत का फल देगा।\n\n**3. संबंध:** शुक्र की स्थिति बताती है कि पारिवारिक जीवन सुखमय रहेगा।`
      : `**Kundali Analysis for ${name} (Offline Mode)**\n\n**1. Personality:** You are a determined individual with strong leadership qualities indicated by the Sun's position.\n\n**2. Career:** Saturn suggests success through hard work and discipline. Stability is indicated.\n\n**3. Relationships:** Venus in your chart suggests a harmonious family life.`,
    rawData: {
      lagna: "Aries",
      moonSign: "Taurus",
      sunSign: "Leo",
      nakshatra: "Rohini",
      houses: {
        1: ["Ma"],
        2: ["Ve"],
        3: [],
        4: ["Mo"],
        5: ["Su", "Me"],
        6: ["Ra"],
        7: [],
        8: [],
        9: ["Ju"],
        10: ["Sa"],
        11: [],
        12: ["Ke"],
      },
    },
  };
};

const getMockMatchResult = (language: string): MatchResult => {
  const isHindi = language === "Hindi";
  return {
    score: 24.5,
    total: 36,
    description: isHindi
      ? "यह मिलान उत्तम है। ग्रह मैत्री और नाड़ी दोष परिहार के कारण वैवाहिक जीवन सुखमय रहने की संभावना है। (ऑफलाइन मोड)"
      : "This match is favorable. Good compatibility is seen in mental and financial aspects. (Offline Mode)",
    gunaMilan: [
      { area: isHindi ? "वर्ण" : "Varna", score: 1, max: 1 },
      { area: isHindi ? "वश्य" : "Vashya", score: 2, max: 2 },
      { area: isHindi ? "तारा" : "Tara", score: 1.5, max: 3 },
      { area: isHindi ? "योनि" : "Yoni", score: 3, max: 4 },
      { area: isHindi ? "ग्रह मैत्री" : "Graha Maitri", score: 4, max: 5 },
      { area: isHindi ? "गण" : "Gana", score: 6, max: 6 },
      { area: isHindi ? "भकूट" : "Bhakoot", score: 0, max: 7 },
      { area: isHindi ? "नाड़ी" : "Nadi", score: 8, max: 8 },
    ],
  };
};

const getMockChatResponse = (message: string, language: string): string => {
  const msg = message.toLowerCase();
  const isHindi = language === "Hindi";
  if (msg.includes("job") || msg.includes("career"))
    return isHindi
      ? "करियर में मेहनत का फल मिलेगा।"
      : "Hard work will pay off in career.";
  if (msg.includes("marriage") || msg.includes("love"))
    return isHindi
      ? "रिश्तों के लिए समय अनुकूल है।"
      : "Favorable time for relationships.";
  if (msg.includes("money"))
    return isHindi
      ? "आर्थिक स्थिति सुधरेगी।"
      : "Financial situation will improve.";
  return isHindi
    ? "मैं अभी ऑफलाइन मोड में हूँ। कृपया बाद में प्रयास करें।"
    : "I am currently in offline mode. Please try again later.";
};

// --- Backend API Caller ---
async function callBackendAI(
  endpoint: string,
  body: any,
  fallbackFn: () => any
) {
  if (isQuotaExceeded) return fallbackFn();

  try {
    const response = await fetch(`${API_URL}/ai/${endpoint}`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      if (!isQuotaExceeded) {
        console.warn("Backend Quota Exceeded. Switching to Offline Mode.");
        isQuotaExceeded = true;
        resetQuotaTimer();
      }
      return fallbackFn();
    }

    if (!response.ok) throw new Error("Backend API Error");

    const data = await response.json();
    return data.text ? data.text : data; // Handle both raw JSON and { text: ... } wrapper
  } catch (error: any) {
    // Suppress network errors (server offline) to standard warning
    if (
      error.message &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError"))
    ) {
      console.warn(`Backend offline (${endpoint}). Using fallback data.`);
    } else {
      console.error("API Call Failed:", error);
    }
    return fallbackFn();
  }
}

// --- Exported Services (Hybrid Auth Implemented) ---

export const api = {
  login: async (credentials: any) => {
    try {
      // Try Server First
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error("Server login failed");
      return await res.json();
    } catch (e) {
      // Fallback to Local DB
      console.warn("Server unavailable, trying local login...");
      const users = getLocalUsers();
      const user = users.find(
        (u: any) =>
          u.username === credentials.username &&
          u.password === credentials.password
      );
      if (user) {
        return {
          token: "local_offline_token",
          user: { ...user, id: "local_" + user.username },
        };
      }
      throw new Error(
        "Login failed. Server offline and user not found locally."
      );
    }
  },

  signup: async (userData: any) => {
    try {
      // Try Server First
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error("Server signup failed");
      return await res.json();
    } catch (e) {
      // Fallback to Local DB
      console.warn("Server unavailable, creating local user...");
      const users = getLocalUsers();
      const existing = users.find(
        (u: any) => u.username === userData.username
      );
      if (existing) {
        throw new Error(
          "User already exists locally. Please try logging in (offline mode)."
        );
      }

      const localUser = {
        ...userData,
        id: "local_" + userData.username,
        createdAt: new Date().toISOString(),
        source: "local_offline",
      };

      saveLocalUser(localUser);

      return {
        token: "local_offline_token",
        user: localUser,
      };
    }
  },

  // Kundali generation (server + offline fallback)
  getKundali: async (payload: any & { name: string; language: string }) => {
    const { name, language } = payload;
    return await callBackendAI("kundali", payload, () =>
      getMockKundaliAnalysis(name, language)
    );
  },

  // Match making (server + offline fallback)
  matchKundali: async (payload: any & { language: string }) => {
    const { language } = payload;
    return await callBackendAI("match", payload, () =>
      getMockMatchResult(language)
    );
  },

  // Astro chat (server + offline fallback)
  astroChat: async (payload: { message: string; language: string }) => {
    const { message, language } = payload;
    return await callBackendAI("chat", payload, () =>
      getMockChatResponse(message, language)
    );
  },

  // Activity logging: server first, then local
  logActivity: async (username: string, activity: any) => {
    try {
      const res = await fetch(`${API_URL}/activity/log`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ username, activity }),
      });
      if (!res.ok) throw new Error("Server activity log failed");
      return await res.json();
    } catch (e) {
      console.warn("Activity log failed on server. Storing locally.");
      updateLocalUserActivity(username, activity);
      return { status: "stored_locally" };
    }
  },
};

// --- Panchang API (Server + Offline Fallback) ---
// Header.tsx uses: import { getPanchang } from '../services/geminiService';

export const getPanchang = async (
  payload: { language: string } & Record<string, any>
): Promise<PanchangData | any> => {
  return await callBackendAI("panchang", payload, () => {
    const isHindi = payload.language === "Hindi";

    // Simple offline fallback Panchang structure
    const fallback: PanchangData = {
      date: (payload as any).date || new Date().toISOString().split("T")[0],
      location:
        (payload as any).location ||
        (isHindi ? "आपका स्थान" : "Your Location"),
      tithi: isHindi
        ? "शुक्ल पक्ष, द्वितीया (ऑफलाइन)"
        : "Shukla Paksha, Dwitiya (Offline)",
      nakshatra: isHindi ? "रोहिणी (ऑफलाइन)" : "Rohini (Offline)",
      sunrise: "06:00",
      sunset: "18:30",
      summary: isHindi
        ? "ऑफलाइन मोड: आज का पंचांग सामान्य रूप से शुभ है। नए काम की शुरुआत के लिए मध्यम रूप से अनुकूल समय।"
        : "Offline mode: Today's panchang is generally favorable. A moderately good time for new beginnings.",
    };

    return fallback;
  });
};
