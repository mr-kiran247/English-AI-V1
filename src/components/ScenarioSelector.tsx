import React, { useState } from 'react';
import { SCENARIOS } from '../data/scenarios';
import { Scenario, HelpLanguage, ScenarioCategory } from '../types';
import {
  Coffee,
  ShoppingBag,
  Compass,
  Stethoscope,
  MessageCircle,
  Briefcase,
  Clock,
  Presentation,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Sparkles,
  ArrowRight,
  Search,
  Volume2,
} from 'lucide-react';
import { audioService } from '../utils/audio';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Coffee,
  ShoppingBag,
  Compass,
  Stethoscope,
  MessageCircle,
  Briefcase,
  Clock,
  Presentation,
  TrendingUp,
  ShieldAlert,
  Calendar,
};

interface ScenarioSelectorProps {
  onSelectScenario: (scenario: Scenario) => void;
  helpLanguage: HelpLanguage;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  onSelectScenario,
  helpLanguage,
}) => {
  const [activeCategory, setActiveCategory] = useState<ScenarioCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScenarios = SCENARIOS.filter((s) => {
    const matchesCategory =
      activeCategory === 'all' || s.category === activeCategory;
    const matchesQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.titleHindi.includes(searchQuery) ||
      s.titleMarathi.includes(searchQuery) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const dailyCount = SCENARIOS.filter((s) => s.category === 'daily').length;
  const proCount = SCENARIOS.filter((s) => s.category === 'professional').length;

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 space-y-6">
      {/* Hero Banner with bilingual encouragement */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 p-5 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Interactive Speaking Gym for Indian Learners</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Speak English with Confidence & Ease
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed devanagari-font">
            जर तुम्हाला इंग्रजीत बोलताना अडचण येत असेल, तर मराठी किंवा हिंदीत बोला
            — आमचा AI शिक्षक तुम्हाला योग्य इंग्रजी वाक्ये आणि व्याकरण शिकवेल!
          </p>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed devanagari-font">
            अगर आप बात करते समय हिचकिचाते हैं, तो हिंदी या मराठी में बोलिए — AI
            कोच तुरंत सिखाएगा कि इसे सही इंग्लिश में कैसे बोलें।
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category switcher */}
        <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`rounded-lg px-3.5 py-2 transition-all ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Scenarios ({SCENARIOS.length})
          </button>
          <button
            onClick={() => setActiveCategory('daily')}
            className={`rounded-lg px-3.5 py-2 transition-all ${
              activeCategory === 'daily'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Life Speaking ({dailyCount})
          </button>
          <button
            onClick={() => setActiveCategory('professional')}
            className={`rounded-lg px-3.5 py-2 transition-all ${
              activeCategory === 'professional'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Professional Workplace ({proCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scenario or topic..."
            className="w-full sm:w-64 rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map((scenario) => {
          const IconComponent = ICON_MAP[scenario.icon] || Coffee;
          const isPro = scenario.category === 'professional';

          return (
            <div
              key={scenario.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg transition-all hover:border-slate-700 hover:bg-slate-900 hover:shadow-indigo-500/5 hover:-translate-y-0.5"
            >
              <div>
                {/* Top header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      isPro
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        isPro
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      }`}
                    >
                      {isPro ? 'Professional' : 'Daily Life'}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-medium">
                      {scenario.level}
                    </span>
                  </div>
                </div>

                {/* Title & Native Subtitle */}
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {scenario.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 devanagari-font">
                  {helpLanguage === 'marathi'
                    ? scenario.titleMarathi
                    : helpLanguage === 'hindi'
                    ? scenario.titleHindi
                    : `${scenario.titleMarathi} • ${scenario.titleHindi}`}
                </p>

                <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
                  {scenario.description}
                </p>

                {/* Persona Badge */}
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-800">
                  <span className="text-slate-500">Partner:</span>
                  <span className="font-semibold text-white">
                    {scenario.characterRole}
                  </span>
                </div>

                {/* Starter English phrase preview */}
                <div className="mt-3 rounded-xl bg-slate-950/70 border border-slate-800/80 p-2.5 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    <span>Sample Starter</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audioService.speakText(scenario.starterPhraseEnglish);
                      }}
                      className="text-slate-400 hover:text-white"
                      title="Listen"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs font-medium text-slate-200 italic">
                    "{scenario.starterPhraseEnglish}"
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {scenario.keyVocabulary.length} key phrases
                </span>
                <button
                  onClick={() => onSelectScenario(scenario)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all group-hover:px-4"
                >
                  <span>Start Roleplay</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
