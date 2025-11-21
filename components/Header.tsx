import React, { useEffect, useState, useRef } from 'react';
import { Globe, Menu, User, ChevronDown, Sparkles } from 'lucide-react';
import { getPanchang } from '../services/geminiService';
import { PanchangData, Language } from '../types';

interface HeaderProps {
  toggleSidebar: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
  isLoggedIn: boolean;
  onProfileClick: () => void;
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, language, setLanguage, isLoggedIn, onProfileClick, onLogoClick }) => {
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPanchang(language).then(setPanchang);
  }, [language]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-[100] w-full bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300">
                    <Menu className="w-6 h-6" />
                </button>
                
                {/* Logo Area */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={onLogoClick}>
                    <div className="relative group">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <span className="font-display font-bold text-white text-xl -rotate-3 group-hover:-rotate-6 transition-transform">D</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-[#020617] flex items-center justify-center">
                            <Sparkles className="w-2 h-2 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-bold tracking-wide text-white">Divya Drishti</h1>
                    </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 sm:gap-6">
                {/* Floating Panchang Ticker (Desktop) */}
                <div className="hidden xl:flex items-center bg-slate-900/50 rounded-full px-5 py-2 border border-white/5 gap-4 text-xs shadow-inner">
                        {panchang ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                <span className="text-amber-200/90 font-medium">{panchang.tithi}</span>
                            </div>
                            <div className="w-px h-3 bg-white/10"></div>
                            <span className="text-indigo-200/90 font-medium">{panchang.nakshatra}</span>
                        </>
                        ) : <span className="text-slate-500">Loading Panchang...</span>}
                </div>

                {/* Language Selector */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={(e) => {
                        e.stopPropagation();
                        setIsLangOpen(!isLangOpen);
                        }}
                        className="flex items-center gap-2 text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-200 px-3 py-2 rounded-lg border border-white/10 transition-all"
                    >
                        <Globe className="w-3.5 h-3.5 text-amber-500" />
                        <span className="hidden sm:inline uppercase tracking-wider">{language}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLangOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-[#1e293b] border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[110]">
                            {Object.values(Language).map((lang) => (
                                <button 
                                    key={lang}
                                    onClick={() => {
                                        setLanguage(lang);
                                        setIsLangOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors border-b border-white/5 last:border-0
                                        ${language === lang ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                                    `}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    onClick={onProfileClick} 
                    className={`flex items-center gap-2 group relative transition-all ${!isLoggedIn ? 'hover:scale-105' : ''}`}
                >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all overflow-hidden
                        ${isLoggedIn ? 'border-emerald-500/50 bg-emerald-900/20' : 'border-white/10 bg-white/5 group-hover:border-amber-500/50'}`}>
                        {isLoggedIn ? (
                            <span className="font-bold text-emerald-400 text-xs">YOU</span>
                        ) : (
                            <User className="w-4 h-4 text-slate-400 group-hover:text-white" />
                        )}
                    </div>
                </button>
            </div>
        </div>
    </header>
  );
};

export default Header;