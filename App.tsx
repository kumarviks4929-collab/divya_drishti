
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { Language, UserProfile, UserActivity } from './types';
import { ZODIAC_SIGNS, getTranslation } from './constants';
import { getHoroscope, generateKundaliAnalysis, matchKundali, chatWithAstrologer, getGenericPrediction, getPanchang, api } from './services/geminiService';
import KundaliChart from './components/KundaliChart';
import { 
    Send, Loader2, Sparkles, Heart, Users, Download, 
    Baby, Palette, Timer, ScrollText, CalendarDays, 
    UserPlus, Search, Gift, ArrowRight, Star, ShieldCheck,
    ArrowRightCircle, Compass, Sun, Moon, CloudFog, X, ArrowLeft, History, Trash2, Lock, MessageCircle, Maximize2, Minimize2,
    Briefcase, Coins, Globe, ChevronDown, MapPin, LogIn, Eye, EyeOff, WifiOff
} from 'lucide-react';

// --- Auto-Fill / History Helpers ---
const getNameHistory = (): string[] => {
    try {
        const history = localStorage.getItem('astro_name_history');
        return history ? JSON.parse(history) : [];
    } catch (e) { return []; }
};

const saveNameHistory = (name: string) => {
    if (!name) return;
    try {
        const history = getNameHistory();
        if (!history.includes(name)) {
            const newHistory = [name, ...history].slice(0, 10);
            localStorage.setItem('astro_name_history', JSON.stringify(newHistory));
        }
    } catch (e) { }
};

// --- Location Helper ---
const detectCurrentLocation = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation is not supported by this browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || "Unknown Location";
                resolve(`${city}, ${data.address.country}`);
            } catch (error) {
                reject("Unable to retrieve address details.");
            }
        }, (error) => {
            reject("Location permission denied.");
        });
    });
};

// --- Audio Helpers ---
const playNotificationSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log("Audio play prevented", e));
    } catch (e) { }
};

const playMessageSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3');
        audio.volume = 0.4;
        audio.play().catch(e => console.log("Audio play prevented", e));
    } catch (e) { }
};

// --- Custom Components ---

// Smooth Date Selector
const DateSelector = ({ name, value, onChange, required }: any) => {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    useEffect(() => {
        if (value) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                setDay(d.getDate().toString());
                setMonth((d.getMonth() + 1).toString());
                setYear(d.getFullYear().toString());
            }
        }
    }, [value]);

    const updateDate = (d: string, m: string, y: string) => {
        setDay(d); setMonth(m); setYear(y);
        if (d && m && y) {
            const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            onChange({ target: { name, value: iso } });
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const selectClass = "bg-[#020617]/50 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:border-amber-500/50 outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors custom-scrollbar";

    return (
        <div className="grid grid-cols-3 gap-2">
            <div className="relative">
                <select value={day} onChange={(e) => updateDate(e.target.value, month, year)} required={required} className={`${selectClass} w-full`}>
                    <option value="" disabled>Day</option>
                    {days.map(d => <option key={d} value={d} className="bg-[#0f172a]">{d}</option>)}
                </select>
            </div>
            <div className="relative">
                <select value={month} onChange={(e) => updateDate(day, e.target.value, year)} required={required} className={`${selectClass} w-full`}>
                    <option value="" disabled>Month</option>
                    {months.map((m, i) => <option key={i} value={i + 1} className="bg-[#0f172a]">{m}</option>)}
                </select>
            </div>
            <div className="relative">
                <select value={year} onChange={(e) => updateDate(day, month, e.target.value)} required={required} className={`${selectClass} w-full`}>
                    <option value="" disabled>Year</option>
                    {years.map(y => <option key={y} value={y} className="bg-[#0f172a]">{y}</option>)}
                </select>
            </div>
        </div>
    );
};

// Smooth Time Selector
const TimeSelector = ({ name, value, onChange, required }: any) => {
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');
    const [ampm, setAmpm] = useState('AM');

    useEffect(() => {
        if (value) {
            const [hStr, mStr] = value.split(':');
            let h = parseInt(hStr);
            const m = mStr;
            let ap = 'AM';
            if (h >= 12) {
                ap = 'PM';
                if (h > 12) h -= 12;
            }
            if (h === 0) h = 12;
            setHour(h.toString());
            setMinute(m);
            setAmpm(ap);
        }
    }, [value]);

    const updateTime = (h: string, m: string, ap: string) => {
        setHour(h); setMinute(m); setAmpm(ap);
        if (h && m && ap) {
            let hNum = parseInt(h);
            if (ap === 'PM' && hNum !== 12) hNum += 12;
            if (ap === 'AM' && hNum === 12) hNum = 0;
            const timeStr = `${hNum.toString().padStart(2, '0')}:${m}`;
            onChange({ target: { name, value: timeStr } });
        }
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 00, 05, 10... for easier selection

    const selectClass = "bg-[#020617]/50 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:border-amber-500/50 outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors custom-scrollbar";

    return (
        <div className="grid grid-cols-3 gap-2">
            <div className="relative">
                <select value={hour} onChange={(e) => updateTime(e.target.value, minute, ampm)} required={required} className={`${selectClass} w-full`}>
                    <option value="" disabled>Hr</option>
                    {hours.map(h => <option key={h} value={h} className="bg-[#0f172a]">{h}</option>)}
                </select>
            </div>
            <div className="relative">
                <select value={minute} onChange={(e) => updateTime(hour, e.target.value, ampm)} required={required} className={`${selectClass} w-full`}>
                    <option value="" disabled>Min</option>
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => <option key={m} value={m} className="bg-[#0f172a]">{m}</option>)}
                </select>
            </div>
             <div className="relative">
                <select value={ampm} onChange={(e) => updateTime(hour, minute, e.target.value)} required={required} className={`${selectClass} w-full`}>
                    <option value="AM" className="bg-[#0f172a]">AM</option>
                    <option value="PM" className="bg-[#0f172a]">PM</option>
                </select>
            </div>
        </div>
    );
};

const AutocompleteInput = ({ name, value, onChange, placeholder, required, className }: any) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setShowSuggestions(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(e);
        if (val.length > 0) {
            const history = getNameHistory();
            const filtered = history.filter(h => h.toLowerCase().includes(val.toLowerCase()));
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else setShowSuggestions(false);
    };

    const selectSuggestion = (val: string) => {
        onChange({ target: { name, value: val } } as any);
        setShowSuggestions(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <input name={name} value={value} onChange={handleInputChange} placeholder={placeholder} required={required} className={className} onFocus={() => { if(value) handleInputChange({target: {value}} as any); }} />
            {showSuggestions && (
                <div className="absolute z-50 w-full bg-[#1e293b] border border-white/10 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-xl custom-scrollbar">
                    {suggestions.map((s, i) => (
                        <div key={i} onClick={() => selectSuggestion(s)} className="px-4 py-2 hover:bg-white/5 text-slate-300 text-sm cursor-pointer border-b border-white/5">{s}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PlaceAutocompleteInput = ({ name, value, onChange, placeholder, required, className }: any) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setShowSuggestions(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(e);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.length >= 3) {
            debounceRef.current = setTimeout(async () => {
                setLoading(true);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${val}&limit=5&addressdetails=1`);
                    const data = await res.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                } catch(e) {}
                setLoading(false);
            }, 500);
        } else setShowSuggestions(false);
    };

    const selectSuggestion = (place: any) => {
        const cityName = place.address.city || place.address.town || place.name;
        const formattedPlace = [cityName, place.address.state, place.address.country].filter(Boolean).join(", ");
        onChange({ target: { name, value: formattedPlace } } as any);
        setShowSuggestions(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
             <div className="relative">
                <input name={name} value={value} onChange={handleInputChange} placeholder={placeholder} required={required} className={className} autoComplete="off" />
                {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-4 h-4 animate-spin text-slate-500" /></div>}
             </div>
            {showSuggestions && (
                <div className="absolute z-50 w-full bg-[#1e293b] border border-white/10 rounded-lg mt-1 max-h-52 overflow-y-auto shadow-xl custom-scrollbar">
                    {suggestions.map((s, i) => (
                        <div key={i} onClick={() => selectSuggestion(s)} className="px-4 py-3 hover:bg-white/5 text-slate-300 text-sm cursor-pointer border-b border-white/5 flex flex-col gap-0.5">
                            <span className="font-medium text-white">{s.display_name.split(',')[0]}</span>
                            <span className="text-[10px] text-slate-500">{s.display_name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '', name: '', dob: '', time: '', place: '' });
  const [isLocating, setIsLocating] = useState(false);

  // --- Persisted User Session (Initial Load) ---
  const [user, setUser] = useState<UserProfile | null>(() => {
      try {
        const saved = localStorage.getItem('astro_user_session');
        return saved ? JSON.parse(saved) : null;
      } catch (e) { return null; }
  });

  useEffect(() => {
      if (user) {
          localStorage.setItem('astro_user_session', JSON.stringify(user));
      } else {
          localStorage.removeItem('astro_user_session');
      }
  }, [user]);

  const t = (key: string) => getTranslation(language, key);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string, value: string } }) => {
      setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
      setAuthError('');
  };

  const handleDetectLocation = async () => {
      setIsLocating(true);
      try {
          const address = await detectCurrentLocation();
          setLoginData(prev => ({ ...prev, place: address }));
      } catch (error) { alert("Could not detect location."); } finally { setIsLocating(false); }
  };

  // --- Auth Logic (Hybrid: Backend + Local Fallback) ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      setAuthLoading(true);

      try {
          let response;
          if (isLoginMode) {
              response = await api.login({ username: loginData.username, password: loginData.password });
          } else {
              saveNameHistory(loginData.name);
              response = await api.signup(loginData);
          }
          
          localStorage.setItem('astro_token', response.token);
          if (response.token.includes('local')) {
              console.log("Hybrid Auth: Logged in locally.");
          }

          const userData = { ...response.user, isLoggedIn: true };
          setUser(userData);
          localStorage.setItem('astro_user_session', JSON.stringify(userData));
          setCurrentPage('dashboard');
      } catch (err: any) {
          setAuthError(err.message || "Authentication failed. Please check connection.");
      } finally {
          setAuthLoading(false);
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('astro_token');
      localStorage.removeItem('astro_user_session');
      setUser(null);
      setLoginData({ username: '', password: '', name: '', dob: '', time: '', place: '' });
      setIsLoginMode(true);
      setCurrentPage('dashboard');
  };

  const addToHistory = (type: UserActivity['type'], title: string) => {
      if (!user) return;
      const newActivity = { id: Date.now().toString(), type, title, timestamp: Date.now() };
      const updatedUser = { ...user, activities: [newActivity, ...(user.activities || [])].slice(0, 50) };
      setUser(updatedUser);
      api.logHistory(type, title);
  };
  
  const handleDeleteAccount = async () => {
      if (confirm("Are you sure? This cannot be undone.")) {
          try {
              await api.deleteAccount();
              handleLogout();
          } catch (e) { alert("Delete failed"); }
      }
  };

  const handleNavigation = (page: string) => {
      if (page === 'chat') {
          setIsChatOpen(true);
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
      } else {
          setCurrentPage(page);
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
      }
  };

  if (!user) {
      // Login Screen
      return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-body flex flex-col relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black opacity-90"></div>
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                        <div key={i} 
                            className="absolute bg-white rounded-full animate-pulse"
                            style={{
                                width: Math.random() * 2 + 'px',
                                height: Math.random() * 2 + 'px',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%',
                                animationDuration: Math.random() * 3 + 2 + 's',
                                opacity: Math.random() * 0.5 + 0.2
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#0f172a]/70 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl shadow-amber-900/20 animate-fadeIn relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="text-center mb-6 relative">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl rotate-3 mb-4 shadow-lg shadow-amber-500/30">
                            <span className="font-display font-bold text-white text-3xl -rotate-3">D</span>
                        </div>
                        <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-wide">Divya Drishti</h1>
                        <p className="text-slate-300 text-sm font-medium">{isLoginMode ? "Enter the Cosmic Portal" : "Begin your Astrological Journey"}</p>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-4 relative">
                        <div>
                            <label className="block text-[10px] text-amber-500/80 mb-1 uppercase font-bold tracking-wider">Username</label>
                            <input name="username" value={loginData.username} onChange={handleLoginChange} required className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all outline-none" placeholder="Enter username" />
                        </div>
                        <div className="relative">
                             <label className="block text-[10px] text-amber-500/80 mb-1 uppercase font-bold tracking-wider">Password</label>
                             <input name="password" type={showPassword ? "text" : "password"} value={loginData.password} onChange={handleLoginChange} required className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-4 py-3 text-white pr-10 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all outline-none" placeholder="••••••••" />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-slate-500 hover:text-amber-500 transition-colors">{showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
                        </div>
                        {!isLoginMode && (
                            <div className="space-y-4 animate-slideUp">
                                <div>
                                    <label className="block text-[10px] text-amber-500/80 mb-1 uppercase font-bold tracking-wider">{t('name')}</label>
                                    <AutocompleteInput name="name" value={loginData.name} onChange={handleLoginChange} required className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all outline-none" placeholder="Full Name" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-amber-500/80 mb-1 uppercase font-bold tracking-wider">{t('dob')}</label>
                                    <DateSelector name="dob" value={loginData.dob} onChange={handleLoginChange} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-amber-500/80 mb-1 uppercase font-bold tracking-wider">{t('time')}</label>
                                    <TimeSelector name="time" value={loginData.time} onChange={handleLoginChange} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-amber-500/80 mb-1 uppercase font-bold tracking-wider">{t('place')}</label>
                                    <div className="relative">
                                        <PlaceAutocompleteInput name="place" value={loginData.place} onChange={handleLoginChange} required className="w-full bg-[#020617]/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all outline-none" placeholder="City, Country" />
                                        <button type="button" onClick={handleDetectLocation} disabled={isLocating} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-amber-500 transition-colors">{isLocating ? <Loader2 className="w-4 h-4 animate-spin"/> : <MapPin className="w-4 h-4"/>}</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {authError && <div className="text-red-400 text-xs text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{authError}</div>}
                        <button disabled={authLoading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl transition-all mt-2 flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transform hover:scale-[1.02] active:scale-[0.98]">
                            {authLoading ? <Loader2 className="animate-spin w-5 h-5"/> : (isLoginMode ? <span className="flex items-center gap-2"><LogIn className="w-4 h-4"/> Enter Portal</span> : <span className="flex items-center gap-2"><Sparkles className="w-4 h-4"/> Create Profile</span>)}
                        </button>
                    </form>
                    <div className="mt-6 text-center relative z-10">
                        <p className="text-xs text-slate-400">
                            {isLoginMode ? "New user? " : "Has account? "}
                            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-amber-400 font-bold hover:text-amber-300 transition-colors hover:underline">{isLoginMode ? "Sign Up" : "Login"}</button>
                        </p>
                    </div>
                </div>
                
                <div className="mt-8 text-center text-[10px] text-slate-500/50 font-serif italic relative z-10">
                    "The stars incline, but do not compel."
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-body flex flex-col relative overflow-x-hidden">
      <Header toggleSidebar={toggleSidebar} language={language} setLanguage={setLanguage} isLoggedIn={true} onProfileClick={() => setCurrentPage(currentPage === 'profile' ? 'dashboard' : 'profile')} onLogoClick={() => setCurrentPage('dashboard')} />
      <div className="flex flex-1 relative">
            <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} currentPage={currentPage} setPage={handleNavigation} language={language} />
            <main className="flex-1 overflow-y-auto p-0 scroll-smooth pb-24 custom-scrollbar relative">
                <div className="animate-fadeIn">
                    {currentPage === 'dashboard' && <DashboardView setPage={handleNavigation} user={user} language={language} />}
                    {currentPage === 'horoscope' && <HoroscopeView language={language} onBack={() => handleNavigation('dashboard')} logActivity={addToHistory} />}
                    {currentPage === 'kundali' && <KundaliView language={language} user={user} onBack={() => handleNavigation('dashboard')} logActivity={addToHistory} />}
                    {currentPage === 'matching' && <MatchingView language={language} onBack={() => handleNavigation('dashboard')} logActivity={addToHistory} />}
                    {currentPage === 'profile' && <ProfileView user={user} logout={handleLogout} deleteAccount={handleDeleteAccount} language={language} onClose={() => handleNavigation('dashboard')} />}
                    {currentPage === 'remedies' && <GenericGeneratorView type="remedies" title={t('remedies')} icon={Gift} language={language} onBack={() => handleNavigation('dashboard')} logActivity={addToHistory} />}
                    {currentPage === 'numerology' && <GenericGeneratorView type="numerology" title={t('numerology')} icon={Timer} language={language} onBack={() => handleNavigation('dashboard')} logActivity={addToHistory} />}
                    {currentPage === 'panchang' && <GenericGeneratorView type="festival" title={t('panchang')} icon={CalendarDays} language={language} onBack={() => handleNavigation('dashboard')} logActivity={addToHistory} />}
                    {currentPage === 'babyNames' && <GenericGeneratorView type="babyNames" title={t('babyNames')} icon={Baby} language={language} onBack={() => handleNavigation('dashboard')} logActivity={addToHistory} />}
                </div>
            </main>
      </div>
      <FloatingChat isOpen={isChatOpen} setIsOpen={setIsChatOpen} user={user} language={language} logActivity={addToHistory} />
    </div>
  );
};

// --- Views Implementation ---

const DashboardView = ({ setPage, user, language }: any) => {
    const t = (key: string) => getTranslation(language, key);
    const [panchang, setPanchang] = useState<any>(null);
    useEffect(() => { getPanchang(language).then(setPanchang); }, [language]);

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-1">
                        {t('welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                         <CalendarDays className="w-4 h-4"/>
                         <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panchang Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/10 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-500/10 rounded-lg"><Sun className="w-5 h-5 text-amber-500"/></div>
                        <h2 className="text-lg font-bold text-white">Daily Panchang</h2>
                    </div>
                    
                    {panchang ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                            <div className="bg-[#020617]/50 p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Tithi</span>
                                <span className="text-sm font-medium text-amber-200">{panchang.tithi}</span>
                            </div>
                            <div className="bg-[#020617]/50 p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Nakshatra</span>
                                <span className="text-sm font-medium text-indigo-200">{panchang.nakshatra}</span>
                            </div>
                            <div className="bg-[#020617]/50 p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Yog</span>
                                <span className="text-sm font-medium text-emerald-200">{panchang.yog}</span>
                            </div>
                             <div className="bg-[#020617]/50 p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Sunrise</span>
                                <span className="text-sm font-medium text-orange-200">{panchang.sunrise}</span>
                            </div>
                        </div>
                    ) : <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 className="animate-spin w-4 h-4"/> Loading...</div>}
                </div>

                {/* AI Chat CTA */}
                <div onClick={() => setPage('chat')} className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl cursor-pointer border border-white/10 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                    <div className="absolute -bottom-4 -right-4 text-white/10"><MessageCircle className="w-32 h-32"/></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                                <Sparkles className="w-5 h-5 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{t('chat')}</h3>
                            <p className="text-indigo-100 text-xs opacity-90 leading-relaxed">Ask generic questions about life, career, or destiny.</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white mt-4 bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            Chat Now <ArrowRight className="w-3 h-3"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {id:'horoscope', icon: Sparkles, t: 'horoscope', color: 'text-amber-500', bg: 'bg-amber-500/10'}, 
                    {id:'kundali', icon: ScrollText, t: 'kundali', color: 'text-orange-500', bg: 'bg-orange-500/10'},
                    {id:'matching', icon: Heart, t: 'matching', color: 'text-pink-500', bg: 'bg-pink-500/10'}, 
                    {id:'remedies', icon: Gift, t: 'remedies', color: 'text-emerald-500', bg: 'bg-emerald-500/10'},
                    {id:'numerology', icon: Timer, t: 'numerology', color: 'text-blue-500', bg: 'bg-blue-500/10'},
                    {id:'panchang', icon: CalendarDays, t: 'panchang', color: 'text-yellow-500', bg: 'bg-yellow-500/10'},
                    {id:'babyNames', icon: Baby, t: 'babyNames', color: 'text-purple-500', bg: 'bg-purple-500/10'},
                    {id:'profile', icon: ShieldCheck, t: 'privacy', color: 'text-slate-400', bg: 'bg-slate-500/10'}
                ].map(i => (
                    <div key={i.id} onClick={() => setPage(i.id)} className="bg-[#0f172a] p-5 rounded-2xl border border-white/5 hover:border-white/20 cursor-pointer transition-all hover:bg-[#1e293b] group">
                        <div className={`w-10 h-10 ${i.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <i.icon className={`w-5 h-5 ${i.color}`}/>
                        </div>
                        <span className="text-sm font-bold text-white block group-hover:translate-x-1 transition-transform">{t(i.t)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HoroscopeView = ({ language, onBack, logActivity }: any) => {
    const [sign, setSign] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState('daily');
    const [data, setData] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { 
        if(sign) { 
            setLoading(true); 
            getHoroscope(sign, timeframe, language).then(d => { 
                setData(d); 
                setLoading(false); 
                logActivity('horoscope', `${sign} - ${timeframe}`); 
            }); 
        } 
    }, [sign, timeframe, language]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <button onClick={onBack} className="text-slate-400 mb-6 flex gap-2 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/> Back to Dashboard</button>
            {!sign ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {ZODIAC_SIGNS.map(s => (
                        <div key={s.name} onClick={() => setSign(s.name)} className="bg-[#0f172a] p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-amber-500/50 group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10">
                            <div className="aspect-square rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-amber-500/50 transition-colors relative">
                                <img 
                                    src={s.image} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                    alt={s.name}
                                />
                                <div className="hidden absolute inset-0 flex items-center justify-center bg-[#020617] text-4xl">{s.icon}</div>
                            </div>
                            <p className="text-center text-white font-bold group-hover:text-amber-500 transition-colors">{language === Language.HINDI ? s.hindiName.split(' ')[0] : s.name}</p>
                            <p className="text-center text-[10px] text-slate-500">{s.dates}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden">
                    <div className="bg-[#020617] p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                         <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/30">
                                 <img src={ZODIAC_SIGNS.find(z => z.name === sign)?.image} className="w-full h-full object-cover"/>
                             </div>
                             <div>
                                 <h2 className="text-2xl font-bold text-white">{sign}</h2>
                                 <p className="text-slate-400 text-sm">{new Date().toLocaleDateString()}</p>
                             </div>
                         </div>
                         <div className="flex bg-[#1e293b] rounded-lg p-1 gap-1">
                             {['daily', 'weekly', 'monthly'].map(t => (
                                 <button key={t} onClick={() => setTimeframe(t)} className={`px-4 py-2 rounded-md text-xs font-bold capitalize transition-colors ${timeframe === t ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}>{t}</button>
                             ))}
                         </div>
                    </div>
                    <div className="p-8 min-h-[300px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <Loader2 className="w-8 h-8 text-amber-500 animate-spin"/>
                                <p className="text-slate-500 text-sm animate-pulse">Consulting the stars...</p>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none">
                                {data.split('\n').map((line, i) => {
                                    if (line.startsWith('##') || line.startsWith('**')) return <h3 key={i} className="text-amber-500 font-bold text-lg mt-4 mb-2">{line.replace(/[#*]/g, '')}</h3>;
                                    return <p key={i} className="text-slate-300 leading-relaxed mb-2">{line}</p>;
                                })}
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-[#020617]/50 border-t border-white/5 flex justify-center">
                        <button onClick={() => setSign(null)} className="text-sm text-slate-400 hover:text-white underline">Check another sign</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const KundaliView = ({ language, user, onBack, logActivity }: any) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [localUser, setLocalUser] = useState({ ...user });
    
    const handleKundaliChange = (e: any) => {
        setLocalUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = async (e: any) => {
        e.preventDefault(); setLoading(true);
        const f = e.target;
        const res = await generateKundaliAnalysis(f.k_name.value, f.dob.value, f.k_time.value, f.k_place.value, language);
        setData(res); setLoading(false); logActivity('kundali', f.k_name.value);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
             <button onClick={onBack} className="text-slate-400 mb-6 flex gap-2 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/> Back to Dashboard</button>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <form onSubmit={handleSubmit} className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 space-y-5 h-fit shadow-lg">
                     <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4 mb-2">Enter Birth Details</h3>
                     <div>
                        <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Name</label>
                        <AutocompleteInput name="k_name" value={localUser.name} onChange={(e:any) => setLocalUser({...localUser, name: e.target.value})} required className="w-full bg-[#020617] p-3 rounded-lg border border-white/10 text-white focus:border-amber-500/50 outline-none" placeholder="Name"/>
                     </div>
                     <div>
                         <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Date</label>
                         <DateSelector name="dob" value={localUser.dob} onChange={handleKundaliChange} required />
                     </div>
                     <div>
                         <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Time</label>
                         <TimeSelector name="k_time" value={localUser.time} onChange={handleKundaliChange} required />
                     </div>
                     <div>
                        <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Place</label>
                        <PlaceAutocompleteInput name="k_place" value={localUser.place} onChange={(e:any) => setLocalUser({...localUser, place: e.target.value})} required className="w-full bg-[#020617] p-3 rounded-lg border border-white/10 text-white focus:border-amber-500/50 outline-none" placeholder="Place"/>
                     </div>
                     <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-lg font-bold text-black mt-2 hover:scale-[1.02] transition-transform shadow-lg shadow-amber-900/20">
                        {loading ? <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-4 h-4"/> Generating...</div> : "Generate Kundali"}
                     </button>
                 </form>
                 
                 <div className="lg:col-span-2 bg-[#0f172a] p-8 rounded-2xl border border-white/5 min-h-[500px] shadow-xl">
                     {data ? (
                         <div className="animate-fadeIn">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Vedic Chart & Analysis</h2>
                                <button className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-2"><Download className="w-3 h-3"/> Save PDF</button>
                             </div>
                             <div className="w-full max-w-sm mx-auto mb-10">
                                 <KundaliChart data={data.rawData?.houses || {}}/>
                             </div>
                             <div className="space-y-4">
                                 {data.analysis.split('\n').map((line: string, i: number) => {
                                     if(line.trim() === '') return null;
                                     if(line.includes('**')) return <h4 key={i} className="text-amber-400 font-bold mt-4 text-lg">{line.replace(/\*\*/g, '')}</h4>
                                     return <p key={i} className="text-slate-300 leading-relaxed text-sm">{line}</p>
                                 })}
                             </div>
                         </div>
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
                            <ScrollText className="w-16 h-16"/>
                            <p>Enter birth details to generate your Janam Kundali.</p>
                        </div>
                     )}
                 </div>
             </div>
        </div>
    );
};

const MatchingView = ({ language, onBack, logActivity }: any) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    const handleMatch = async (e: any) => {
        e.preventDefault(); setLoading(true);
        const f = e.target;
        const res = await matchKundali({name: f.b_name.value}, {name: f.g_name.value}, language);
        setData(res); setLoading(false); logActivity('matching', `Match: ${f.b_name.value} & ${f.g_name.value}`);
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
             <button onClick={onBack} className="text-slate-400 mb-6 flex gap-2 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/> Back to Dashboard</button>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <form onSubmit={handleMatch} className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 shadow-xl h-fit">
                     <div className="mb-6">
                         <h3 className="text-indigo-400 font-bold flex items-center gap-2 mb-3"><Users className="w-4 h-4"/> Boy's Details</h3>
                         <AutocompleteInput name="b_name" value="" onChange={()=>{}} required className="w-full bg-[#020617] p-3 rounded-lg border border-white/10 text-white focus:border-indigo-500/50 outline-none mb-3" placeholder="Boy's Name"/>
                     </div>
                     <div className="mb-6">
                         <h3 className="text-pink-400 font-bold flex items-center gap-2 mb-3"><Users className="w-4 h-4"/> Girl's Details</h3>
                         <AutocompleteInput name="g_name" value="" onChange={()=>{}} required className="w-full bg-[#020617] p-3 rounded-lg border border-white/10 text-white focus:border-pink-500/50 outline-none mb-3" placeholder="Girl's Name"/>
                     </div>
                     <button className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 p-3.5 rounded-lg font-bold text-white mt-2 hover:scale-[1.02] transition-transform shadow-lg shadow-indigo-900/20">
                        {loading ? <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-4 h-4"/> Analyzing...</div> : "Check Compatibility"}
                     </button>
                 </form>

                 <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 shadow-xl min-h-[300px] flex flex-col justify-center">
                     {data ? (
                         <div className="text-center animate-fadeIn">
                             <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                                 <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                                 <div className="absolute inset-0 border-4 border-amber-500 rounded-full" style={{ clipPath: `inset(${100 - (data.score/36)*100}% 0 0 0)` }}></div>
                                 <div className="text-3xl font-bold text-white">{data.score}<span className="text-sm text-slate-500">/36</span></div>
                             </div>
                             <h3 className="text-xl font-bold text-white mb-2">Guna Milan Result</h3>
                             <p className="text-slate-300 text-sm leading-relaxed mb-6">{data.description}</p>
                             
                             <div className="bg-[#020617] rounded-xl overflow-hidden border border-white/5">
                                 {data.gunaMilan?.map((g: any, i: number) => (
                                     <div key={i} className="flex justify-between px-4 py-2 border-b border-white/5 last:border-0 text-sm">
                                         <span className="text-slate-400">{g.area}</span>
                                         <span className="font-mono text-amber-500">{g.score}/{g.max}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     ) : (
                         <div className="text-center text-slate-500 opacity-50">
                             <Heart className="w-16 h-16 mx-auto mb-4"/>
                             <p>Enter both names to check Vedic compatibility score.</p>
                         </div>
                     )}
                 </div>
             </div>
        </div>
    );
};

const GenericGeneratorView = ({ type, title, icon: Icon, language, onBack, logActivity }: any) => {
    const [input, setInput] = useState('');
    const [res, setRes] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handle = async (e: any) => { 
        e.preventDefault(); 
        if(!input) return;
        setLoading(true); 
        const r = await getGenericPrediction(type, input, language); 
        setRes(r); 
        setLoading(false); 
        logActivity('tool', `${title}: ${input}`); 
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <button onClick={onBack} className="text-slate-400 mb-6 flex gap-2 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/> Back to Dashboard</button>
            <div className="bg-[#0f172a] p-8 rounded-2xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                    <div className="p-3 bg-amber-500/10 rounded-xl"><Icon className="w-8 h-8 text-amber-500"/></div>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                </div>
                
                <form onSubmit={handle} className="mb-8 flex gap-4">
                    <input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 bg-[#020617] p-4 rounded-xl border border-white/10 text-white focus:border-amber-500/50 outline-none" placeholder="Enter your details or query..."/>
                    <button className="bg-amber-500 px-8 rounded-xl text-black font-bold hover:bg-amber-400 transition-colors">
                        {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Analyze"}
                    </button>
                </form>
                
                {res && (
                    <div className="prose prose-invert max-w-none animate-fadeIn bg-[#020617]/50 p-6 rounded-xl border border-white/5">
                        {res.split('\n').map((l,i) => <p key={i} className="mb-2">{l}</p>)}
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfileView = ({ user, logout, deleteAccount, language, onClose }: any) => {
     const t = (key: string) => getTranslation(language, key);
     return (
         <div className="max-w-4xl mx-auto px-4 py-10">
             <div className="bg-[#0f172a] rounded-3xl border border-white/5 p-8 relative shadow-2xl">
                 <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400"/></button>
                 
                 <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                     <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-amber-500/20">
                        {user.name[0].toUpperCase()}
                     </div>
                     <div className="text-center md:text-left">
                         <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
                         <p className="text-amber-500 font-mono text-sm mb-4">@{user.username} {user.id.startsWith('local_') && <span className="bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded ml-2 flex inline-flex items-center gap-1"><WifiOff className="w-3 h-3"/> Offline Account</span>}</p>
                         <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400">
                             <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4"/> {user.dob}</span>
                             <span className="flex items-center gap-1"><Timer className="w-4 h-4"/> {user.time}</span>
                             <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {user.place}</span>
                         </div>
                     </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                         <h3 className="font-bold text-white flex items-center gap-2"><History className="w-4 h-4 text-amber-500"/> Recent Activity</h3>
                         <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                             {user.activities?.length > 0 ? user.activities.map((a: any, i: number) => (
                                 <div key={i} className="bg-[#020617] p-3 rounded-lg border border-white/5 flex justify-between items-center group hover:border-white/10">
                                     <div className="flex items-center gap-3">
                                         <div className="w-1 h-8 bg-amber-500/20 rounded-full group-hover:bg-amber-500 transition-colors"></div>
                                         <div>
                                             <p className="text-sm text-slate-300 font-medium">{a.title}</p>
                                             <p className="text-[10px] text-slate-500 capitalize">{a.type}</p>
                                         </div>
                                     </div>
                                     <span className="text-[10px] text-slate-600">{new Date(a.timestamp).toLocaleDateString()}</span>
                                 </div>
                             )) : <p className="text-slate-500 text-sm italic">No history yet.</p>}
                         </div>
                     </div>

                     <div className="space-y-4">
                         <h3 className="font-bold text-white flex items-center gap-2"><Lock className="w-4 h-4 text-amber-500"/> Privacy & Settings</h3>
                         <div className="bg-[#020617]/50 p-4 rounded-xl border border-white/5 space-y-4">
                             <div className="flex flex-col gap-3">
                                 <button onClick={logout} className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-slate-200 transition-colors flex items-center justify-center gap-2">
                                    <LogIn className="w-4 h-4"/> Sign Out
                                 </button>
                                 <button onClick={deleteAccount} className="w-full py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-red-500/20">
                                     <Trash2 className="w-4 h-4"/> Delete Account Permanently
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
     );
};

const FloatingChat = ({ isOpen, setIsOpen, user, language, logActivity }: any) => {
    const [msgs, setMsgs] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => { 
        if(isOpen && msgs.length === 0) {
            playNotificationSound();
            setMsgs([{role: 'model', text: `Namaste ${user.name.split(' ')[0]}, how can the stars guide you today?`}]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [msgs, loading]);

    const send = async (txt: string = input) => {
        if(!txt) return;
        const m = {role: 'user', text: txt};
        setMsgs(prev => [...prev, m]); 
        setInput(''); 
        setLoading(true);
        
        const history = msgs.map(x => ({role: x.role === 'user' ? 'user' : 'model', parts: [{text: x.text}]}));
        const r = await chatWithAstrologer(m.text, history, language);
        
        setMsgs(prev => [...prev, {role: 'model', text: r}]); 
        setLoading(false);
        playMessageSound();
        logActivity('chat', 'Ask Astrologer');
    };

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl z-[110] text-white hover:scale-110 transition-transform">
                {isOpen ? <ChevronDown/> : <MessageCircle/>}
            </button>
            
            <div className={`fixed bottom-24 right-6 w-[350px] h-[65vh] max-h-[600px] min-h-[400px] bg-[#0f172a] rounded-2xl border border-white/10 shadow-2xl flex flex-col z-[110] transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
                <div className="p-4 border-b border-white/5 font-bold text-white bg-[#020617] rounded-t-2xl flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400"><Sparkles className="w-4 h-4"/></div>
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#020617]"></div>
                    </div>
                    <div>
                        <h3 className="text-sm">Rishi AI</h3>
                        <p className="text-[10px] text-slate-400">Vedic Astrologer • Online</p>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f172a]" ref={scrollRef}>
                    {msgs.map((m,i) => (
                        <div key={i} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role==='user' ? 'bg-amber-600 text-white rounded-tr-none' : 'bg-[#1e293b] text-slate-200 rounded-tl-none'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {loading && <div className="flex gap-2 items-center text-xs text-slate-500 ml-2"><Loader2 className="w-3 h-3 animate-spin"/> Rishi AI is thinking...</div>}
                    
                    {msgs.length < 3 && !loading && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {['Career Prediction', 'Marriage Timing', 'Wealth 2025', 'Health Outlook'].map(q => (
                                <button key={q} onClick={() => send(q)} className="text-xs bg-[#1e293b] hover:bg-[#334155] text-amber-500 px-3 py-1.5 rounded-full border border-white/5 transition-colors">
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="p-3 border-t border-white/5 flex gap-2 bg-[#020617] rounded-b-2xl">
                    <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} className="flex-1 bg-[#1e293b] p-2.5 rounded-xl border border-white/10 text-white text-sm focus:border-amber-500/50 outline-none placeholder:text-slate-600" placeholder="Ask your question..."/>
                    <button onClick={() => send()} disabled={loading || !input} className="bg-amber-500 p-2.5 rounded-xl text-black hover:bg-amber-400 disabled:opacity-50 transition-colors">
                        <Send className="w-4 h-4"/>
                    </button>
                </div>
            </div>
        </>
    );
};

export default App;
