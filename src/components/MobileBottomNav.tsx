import React from 'react';
import { MessageSquareText, Sparkles, Stethoscope, BookMarked } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'scenarios' | 'converter' | 'grammar' | 'notebook';
  setActiveTab: (tab: 'scenarios' | 'converter' | 'grammar' | 'notebook') => void;
  savedCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-lg pb-safe md:hidden">
      <div className="grid grid-cols-4 items-center justify-around px-1 py-1.5">
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'scenarios' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'scenarios' ? 'bg-indigo-500/20' : ''}`}>
            <MessageSquareText className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5">Roleplay</span>
        </button>

        <button
          onClick={() => setActiveTab('converter')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'converter' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'converter' ? 'bg-indigo-500/20' : ''}`}>
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5">Boli-to-Eng</span>
        </button>

        <button
          onClick={() => setActiveTab('grammar')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'grammar' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'grammar' ? 'bg-indigo-500/20' : ''}`}>
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5">Grammar</span>
        </button>

        <button
          onClick={() => setActiveTab('notebook')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative ${
            activeTab === 'notebook' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'notebook' ? 'bg-indigo-500/20' : ''}`}>
            <BookMarked className="h-5 w-5" />
          </div>
          {savedCount > 0 && (
            <span className="absolute top-1 right-5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
              {savedCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Saved</span>
        </button>
      </div>
    </nav>
  );
};
