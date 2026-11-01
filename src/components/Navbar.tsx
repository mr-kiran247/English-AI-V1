import React from 'react';
import { HelpLanguage } from '../types';
import { MessageSquareText, Sparkles, Stethoscope, BookMarked, Flame, Globe2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scenarios' | 'converter' | 'grammar' | 'notebook';
  setActiveTab: (tab: 'scenarios' | 'converter' | 'grammar' | 'notebook') => void;
  helpLanguage: HelpLanguage;
  setHelpLanguage: (lang: HelpLanguage) => void;
  streakCount: number;
  totalPracticedToday: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  helpLanguage,
  setHelpLanguage,
  streakCount,
  totalPracticedToday,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md pt-safe">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white">BoliSpeak</span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                AI Coach
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-400 sm:block devanagari-font">
              मराठी आणि हिंदीतून इंग्रजी शिका • Daily & Professional English
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'scenarios'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageSquareText className="h-4 w-4" />
            <span>Roleplay Scenarios</span>
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'converter'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Boli-to-English</span>
          </button>
          <button
            onClick={() => setActiveTab('grammar')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'grammar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            <span>Grammar & Indianisms</span>
          </button>
          <button
            onClick={() => setActiveTab('notebook')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'notebook'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookMarked className="h-4 w-4" />
            <span>Saved Words</span>
          </button>
        </nav>

        {/* Right controls: Language helper toggle & Streak */}
        <div className="flex items-center gap-2">
          {/* Native Language Guidance selector */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <span className="hidden px-2 text-[11px] text-slate-400 lg:inline-flex items-center gap-1">
              <Globe2 className="h-3 w-3" /> Guide:
            </span>
            <button
              onClick={() => setHelpLanguage('marathi')}
              title="मराठी मार्गदर्शन"
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                helpLanguage === 'marathi'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => setHelpLanguage('hindi')}
              title="हिंदी मार्गदर्शन"
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                helpLanguage === 'hindi'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setHelpLanguage('both')}
              title="दोन्ही भाषा"
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                helpLanguage === 'both'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Both
            </button>
          </div>

          {/* Daily streak indicator */}
          <div
            className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300"
            title={`${totalPracticedToday} sentences practiced today`}
          >
            <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{streakCount}d</span>
          </div>
        </div>
      </div>
    </header>
  );
};
