import React, { useState } from 'react';
import { SavedVocabularyItem, HelpLanguage } from '../types';
import {
  BookMarked,
  Volume2,
  Trash2,
  Copy,
  Check,
  Search,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { audioService } from '../utils/audio';

interface VocabularyNotebookProps {
  savedItems: SavedVocabularyItem[];
  onRemoveItem: (id: string) => void;
  onPracticePhrase: (phrase: string, phonetic?: string, context?: string) => void;
  helpLanguage: HelpLanguage;
}

export const VocabularyNotebook: React.FC<VocabularyNotebookProps> = ({
  savedItems,
  onRemoveItem,
  onPracticePhrase,
  helpLanguage,
}) => {
  const [filter, setFilter] = useState<'all' | 'daily' | 'professional'>('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredItems = savedItems.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch =
      item.english.toLowerCase().includes(search.toLowerCase()) ||
      item.hindi.includes(search) ||
      item.marathi.includes(search);
    return matchesFilter && matchesSearch;
  });

  const handleCopyAll = () => {
    if (savedItems.length === 0) return;
    const text = savedItems
      .map(
        (item) =>
          `• ${item.english} (${item.marathi} / ${item.hindi}) - Example: "${item.example}"`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-5 sm:p-7 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400 border border-indigo-500/30">
              <BookMarked className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              My Speaking & Vocabulary Notebook
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 devanagari-font">
            सराव करताना सेव्ह केलेले शब्द आणि इंग्रजी वाक्ये • Saved Phrases
          </p>
        </div>

        {savedItems.length > 0 && (
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy All'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({savedItems.length})
          </button>
          <button
            onClick={() => setFilter('daily')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              filter === 'daily'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Life
          </button>
          <button
            onClick={() => setFilter('professional')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              filter === 'professional'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Professional
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved phrases..."
            className="w-full sm:w-60 rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-500">
            <BookMarked className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">
            No saved phrases in your notebook yet
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto devanagari-font">
            संभाषण (Roleplay) किंवा Boli-to-English वापरताना शब्दांशेजारील सेव्ह बटण
            दाबा.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md space-y-2.5 transition-all hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white">
                    {item.english}
                  </h4>
                  <p className="text-xs text-slate-400 devanagari-font mt-0.5">
                    {helpLanguage === 'marathi'
                      ? item.marathi
                      : helpLanguage === 'hindi'
                      ? item.hindi
                      : `${item.marathi} • ${item.hindi}`}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => audioService.speakText(item.english)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Listen"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {item.example && (
                <div className="rounded-xl bg-slate-950 p-2.5 text-xs text-slate-300 border border-slate-800/80">
                  <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block mb-0.5">
                    Example:
                  </span>
                  "{item.example}"
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border ${
                    item.category === 'professional'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {item.category === 'professional' ? 'Workplace' : 'Daily Life'}
                </span>

                <button
                  onClick={() =>
                    onPracticePhrase(
                      item.english,
                      undefined,
                      item.marathi || item.hindi
                    )
                  }
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>Practice Speaking</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
