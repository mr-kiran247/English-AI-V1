/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ScenarioSelector } from './components/ScenarioSelector';
import { ConversationChat } from './components/ConversationChat';
import { BoliConverter } from './components/BoliConverter';
import { GrammarClinic } from './components/GrammarClinic';
import { VocabularyNotebook } from './components/VocabularyNotebook';
import { SpeakingPracticeModal } from './components/SpeakingPracticeModal';
import {
  Scenario,
  HelpLanguage,
  SavedVocabularyItem,
} from './types';

const INITIAL_SAVED_ITEMS: SavedVocabularyItem[] = [
  {
    id: 'sample-1',
    english: 'Could I please get a cup of tea with less sugar?',
    hindi: 'मुझे कम शक्कर वाली एक चाय चाहिए',
    marathi: 'मला कमी साखरेचा एक कप चहा हवा आहे',
    category: 'daily',
    example: 'Say this politely at any cafe instead of "Give me one tea".',
    savedAt: Date.now() - 86400000,
  },
  {
    id: 'sample-2',
    english: 'I have been working in software engineering for three years.',
    hindi: 'मैं तीन साल से सॉफ्टवेयर इंजीनियरिंग में काम कर रहा हूँ',
    marathi: 'मी तीन वर्षांपासून सॉफ्टवेअर इंजिनिअरिंगमध्ये काम करत आहे',
    category: 'professional',
    example: 'Use "for 3 years" instead of "since 3 years" in job interviews.',
    savedAt: Date.now() - 43200000,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'converter' | 'grammar' | 'notebook'>('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  // Preferred Native Language Guidance: 'marathi' | 'hindi' | 'both'
  const [helpLanguage, setHelpLanguage] = useState<HelpLanguage>(() => {
    return (localStorage.getItem('bolispeak_lang') as HelpLanguage) || 'both';
  });

  // Saved vocabulary notebook
  const [savedVocabulary, setSavedVocabulary] = useState<SavedVocabularyItem[]>(() => {
    const saved = localStorage.getItem('bolispeak_vocab');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SAVED_ITEMS;
      }
    }
    return INITIAL_SAVED_ITEMS;
  });

  // Streaks & daily practice count
  const [streakCount, setStreakCount] = useState<number>(() => {
    return Number(localStorage.getItem('bolispeak_streak')) || 3;
  });
  const [totalPracticedToday, setTotalPracticedToday] = useState<number>(() => {
    return Number(sessionStorage.getItem('bolispeak_today_practiced')) || 4;
  });

  // Speaking Practice Modal state
  const [practiceModal, setPracticeModal] = useState<{
    isOpen: boolean;
    targetPhrase: string;
    phoneticGuide?: string;
    context?: string;
  }>({
    isOpen: false,
    targetPhrase: '',
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('bolispeak_lang', helpLanguage);
  }, [helpLanguage]);

  // Save vocabulary to localStorage
  useEffect(() => {
    localStorage.setItem('bolispeak_vocab', JSON.stringify(savedVocabulary));
  }, [savedVocabulary]);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const handleBackToScenarios = () => {
    setSelectedScenario(null);
  };

  const handleOpenPracticeModal = (
    phrase: string,
    phonetic?: string,
    context?: string
  ) => {
    setPracticeModal({
      isOpen: true,
      targetPhrase: phrase,
      phoneticGuide: phonetic,
      context,
    });
  };

  const handleClosePracticeModal = () => {
    setPracticeModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveVocabulary = (
    item: Omit<SavedVocabularyItem, 'id' | 'savedAt'>
  ) => {
    const newItem: SavedVocabularyItem = {
      ...item,
      id: 'vocab-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      savedAt: Date.now(),
    };
    setSavedVocabulary((prev) => [newItem, ...prev]);
  };

  const handleRemoveVocabulary = (id: string) => {
    setSavedVocabulary((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSentencePracticed = () => {
    const newCount = totalPracticedToday + 1;
    setTotalPracticedToday(newCount);
    sessionStorage.setItem('bolispeak_today_practiced', String(newCount));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // If switching tab, leave active chat if any
          if (tab !== 'scenarios') {
            setSelectedScenario(null);
          }
        }}
        helpLanguage={helpLanguage}
        setHelpLanguage={setHelpLanguage}
        streakCount={streakCount}
        totalPracticedToday={totalPracticedToday}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'scenarios' && (
          selectedScenario ? (
            <ConversationChat
              scenario={selectedScenario}
              helpLanguage={helpLanguage}
              onBackToScenarios={handleBackToScenarios}
              onPracticePhrase={handleOpenPracticeModal}
              onSaveVocabulary={handleSaveVocabulary}
              onSentencePracticed={handleSentencePracticed}
            />
          ) : (
            <ScenarioSelector
              onSelectScenario={handleSelectScenario}
              helpLanguage={helpLanguage}
            />
          )
        )}

        {activeTab === 'converter' && (
          <BoliConverter
            helpLanguage={helpLanguage}
            onPracticePhrase={handleOpenPracticeModal}
            onSaveVocabulary={handleSaveVocabulary}
            onSentencePracticed={handleSentencePracticed}
          />
        )}

        {activeTab === 'grammar' && (
          <GrammarClinic
            helpLanguage={helpLanguage}
            onPracticePhrase={handleOpenPracticeModal}
            onSentencePracticed={handleSentencePracticed}
          />
        )}

        {activeTab === 'notebook' && (
          <VocabularyNotebook
            savedItems={savedVocabulary}
            onRemoveItem={handleRemoveVocabulary}
            onPracticePhrase={handleOpenPracticeModal}
            helpLanguage={helpLanguage}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation for iPhone / Handheld */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'scenarios') {
            setSelectedScenario(null);
          }
        }}
        savedCount={savedVocabulary.length}
      />

      {/* Interactive Speaking Drill Modal */}
      <SpeakingPracticeModal
        isOpen={practiceModal.isOpen}
        onClose={handleClosePracticeModal}
        targetPhrase={practiceModal.targetPhrase}
        phoneticGuide={practiceModal.phoneticGuide}
        hindiMarathiContext={practiceModal.context}
        onSuccessPractice={handleSentencePracticed}
      />
    </div>
  );
}
