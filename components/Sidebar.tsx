
import React from 'react';
import { 
    LayoutDashboard, Sparkles, ScrollText, HeartHandshake, 
    MessageCircle, FileText, Gift, Calendar, X, UserPlus, Crown, ShieldCheck
} from 'lucide-react';
import { getTranslation } from '../constants';
import { Language } from '../types';

interface SidebarProps {
    isOpen: boolean;
    closeSidebar: () => void;
    currentPage: string;
    setPage: (page: string) => void;
    language: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar, currentPage, setPage, language }) => {
    
    const t = (key: string) => getTranslation(language, key);

    const menuItems = [
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { id: 'horoscope', label: t('horoscope'), icon: Sparkles },
        { id: 'kundali', label: t('kundali'), icon: ScrollText },
        { id: 'matching', label: t('matching'), icon: HeartHandshake },
        { id: 'chat', label: t('chat'), icon: MessageCircle },
        { id: 'remedies', label: t('remedies'), icon: Gift },
        { id: 'numerology', label: t('numerology'), icon: FileText },
        { id: 'panchang', label: t('panchang'), icon: Calendar },
        { id: 'babyNames', label: t('babyNames'), icon: UserPlus },
        { id: 'profile', label: t('privacy'), icon: ShieldCheck },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-[#0f172a] border-r border-white/5 z-50 transition-transform duration-300 ease-out shadow-2xl flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-auto
            `}>
                <div className="p-4 flex justify-between items-center lg:hidden border-b border-white/5">
                    <span className="font-display font-bold text-white text-xl">Menu</span>
                    <button onClick={closeSidebar} className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setPage(item.id);
                                    if (window.innerWidth < 1024) closeSidebar();
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 text-sm font-medium tracking-wide
                                    ${isActive 
                                        ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' 
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-slate-500'}`} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 mt-auto border-t border-white/5 bg-[#020617]">
                    <div className="relative overflow-hidden bg-amber-500/10 rounded-lg p-4 border border-amber-500/20 text-center">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Crown className="w-4 h-4 text-black" />
                        </div>
                        <h4 className="text-amber-500 font-display text-xs font-bold mb-1 uppercase tracking-widest">Premium</h4>
                        <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                            Unlock full features
                        </p>
                        <button className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10px] uppercase tracking-widest rounded transition-all">
                            {t('upgrade')}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
