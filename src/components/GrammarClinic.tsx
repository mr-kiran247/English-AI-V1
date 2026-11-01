import React, { useState } from 'react';
import { GRAMMAR_CLINIC_RULES, GrammarClinicRule } from '../data/grammarRules';
import { GrammarAnalysisResult, HelpLanguage } from '../types';
import {
  Stethoscope,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2,
  RefreshCw,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { audioService } from '../utils/audio';

interface GrammarClinicProps {
  helpLanguage: HelpLanguage;
  onPracticePhrase: (phrase: string, phonetic?: string, context?: string) => void;
  onSentencePracticed: () => void;
}

export const GrammarClinic: React.FC<GrammarClinicProps> = ({
  helpLanguage,
  onPracticePhrase,
  onSentencePracticed,
}) => {
  const [activeTab, setActiveTab] = useState<'checker' | 'indianisms'>('checker');
  const [inputSentence, setInputSentence] = useState('');
  const [targetContext, setTargetContext] = useState<'general' | 'daily' | 'professional'>('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GrammarAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick sample test sentences
  const SAMPLE_GRAMMAR_TESTS = [
    'Myself Kiran, I am working in IT since 4 years.',
    'Please revert back to me today night regarding the proposal.',
    'I am having a severe headache today morning.',
    'Can we prepone tomorrow meeting to 10 AM?',
    'We will discuss about this project with client.',
  ];

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || inputSentence).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/analyze-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: text,
          targetContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data: GrammarAnalysisResult = await response.json();
      setAnalysisResult(data);
      onSentencePracticed();
    } catch (err: any) {
      console.error('Error analyzing grammar:', err);
      setErrorMsg('Failed to analyze sentence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400 border border-indigo-500/30">
            <Stethoscope className="h-5 w-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Grammar & Indianisms Doctor
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed devanagari-font">
          आपले इंग्रजी वाक्य तपासा किंवा भारतीय भाषिकांकडून वारंवार होणाऱ्या
          व्याकरणाच्या चुका समजून घ्या (उदा. "Myself...", "Revert back", "Since 3
          years").
        </p>

        {/* Tab Switcher */}
        <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-4">
          <button
            onClick={() => setActiveTab('checker')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'checker'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Instant Sentence Checker
          </button>
          <button
            onClick={() => setActiveTab('indianisms')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'indianisms'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Common Indianisms & Rules ({GRAMMAR_CLINIC_RULES.length})
          </button>
        </div>
      </div>

      {/* View 1: Sentence Checker */}
      {activeTab === 'checker' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Type or Paste an English Sentence to Inspect:
              </label>
              <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setTargetContext('daily')}
                  className={`rounded px-2 py-1 transition-all ${
                    targetContext === 'daily'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Daily Life
                </button>
                <button
                  onClick={() => setTargetContext('professional')}
                  className={`rounded px-2 py-1 transition-all ${
                    targetContext === 'professional'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Professional
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={inputSentence}
              onChange={(e) => setInputSentence(e.target.value)}
              placeholder="e.g. 'I am working in this company since 3 years and myself handling client calls'..."
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Checks grammar, tense, prepositions & Indianisms.
              </span>
              <button
                onClick={() => handleAnalyze()}
                disabled={!inputSentence.trim() || isLoading}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                  inputSentence.trim() && !isLoading
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Inspect Sentence</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick samples to test */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">
                Or test one of these common sentences:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_GRAMMAR_TESTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputSentence(sample);
                      handleAnalyze(sample);
                    }}
                    className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 hover:border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition-all text-left"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Analysis Result Card */}
          {analysisResult && (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-2xl space-y-5">
              {/* Score & Fluency Rating */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-extrabold ${
                      analysisResult.overallScore >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : analysisResult.overallScore >= 60
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {analysisResult.overallScore}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {analysisResult.fluencyRating} Fluency
                      </h3>
                      {analysisResult.isIndianism && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                          Indianism Detected 🇮🇳
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Grammar & natural phrasing evaluation
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    audioService.speakText(analysisResult.correctedSentence)
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Listen</span>
                </button>
              </div>

              {/* Corrected & Better Versions */}
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Corrected English Sentence
                  </span>
                  <p className="text-base font-bold text-white mt-1">
                    "{analysisResult.correctedSentence}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      More Natural Casual Phrasing
                    </span>
                    <p className="text-sm font-semibold text-slate-200">
                      "{analysisResult.moreNaturalAlternative}"
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Executive / Corporate Alternative
                    </span>
                    <p className="text-sm font-semibold text-slate-200">
                      "{analysisResult.executiveProfessionalAlternative}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Grammar Highlights */}
              {analysisResult.grammarHighlights &&
                analysisResult.grammarHighlights.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Issue Highlights:
                    </span>
                    <div className="space-y-2">
                      {analysisResult.grammarHighlights.map((hl, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-rose-300 line-through">
                              "{hl.fragment}"
                            </span>
                            <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                              {hl.issueType}
                            </span>
                          </div>
                          <div className="text-emerald-300 font-semibold">
                            → "{hl.correction}"
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {hl.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Explanations in Marathi & Hindi */}
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2 devanagari-font text-xs">
                <div className="font-bold text-slate-200">
                  नियम स्पष्टीकरण (Explanation in Native Languages):
                </div>
                {analysisResult.marathiExplanation && (
                  <p className="text-slate-300">
                    <span className="text-indigo-400 font-semibold">मराठी:</span>{' '}
                    {analysisResult.marathiExplanation}
                  </p>
                )}
                {analysisResult.hindiExplanation && (
                  <p className="text-slate-300">
                    <span className="text-amber-400 font-semibold">हिंदी:</span>{' '}
                    {analysisResult.hindiExplanation}
                  </p>
                )}
              </div>

              {/* Practice CTA */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    onPracticePhrase(
                      analysisResult.correctedSentence,
                      undefined,
                      analysisResult.ruleExplanation
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Practice Speaking Corrected Sentence</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View 2: Curated Indianisms Catalog */}
      {activeTab === 'indianisms' && (
        <div className="space-y-4">
          {GRAMMAR_CLINIC_RULES.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-slate-400 devanagari-font mt-0.5">
                    {helpLanguage === 'marathi'
                      ? rule.titleMarathi
                      : rule.titleHindi}
                  </p>
                </div>
                <span
                  className={`self-start sm:self-auto rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                    rule.category === 'professional'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {rule.category === 'professional' ? 'Workplace English' : 'Daily Life'}
                </span>
              </div>

              {/* Before vs After */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Don't Say:
                  </span>
                  <p className="text-sm font-semibold text-rose-200 line-through">
                    "{rule.commonIndianMistake}"
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Say This Instead:
                  </span>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-emerald-200">
                      "{rule.correctEnglish}"
                    </p>
                    <button
                      onClick={() => audioService.speakText(rule.correctEnglish)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Listen"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Why this happens & Native explanations */}
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  <span className="font-semibold text-indigo-300">
                    Why this happens in Indian ESL:
                  </span>{' '}
                  {rule.whyThisHappens}
                </p>

                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1 devanagari-font text-slate-300">
                  <p>
                    <span className="text-indigo-400 font-semibold">मराठी:</span>{' '}
                    {rule.marathiExplanation}
                  </p>
                  <p>
                    <span className="text-amber-400 font-semibold">हिंदी:</span>{' '}
                    {rule.hindiExplanation}
                  </p>
                </div>
              </div>

              {/* Practice Examples */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Practice Drills:
                </span>
                <div className="space-y-1.5">
                  {rule.practiceExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-slate-950 border border-slate-800/80 p-2.5 text-xs gap-2"
                    >
                      <div>
                        <span className="line-through text-rose-400/80 mr-2">
                          "{ex.incorrect}"
                        </span>
                        <span className="text-emerald-300 font-semibold">
                          → "{ex.correct}"
                        </span>
                        <p className="text-[10px] text-slate-400 devanagari-font mt-0.5">
                          {helpLanguage === 'marathi' ? ex.marathi : ex.hindi}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                        <button
                          onClick={() => audioService.speakText(ex.correct)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Listen"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            onPracticePhrase(
                              ex.correct,
                              undefined,
                              ex.marathi || ex.hindi
                            )
                          }
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 text-[11px] font-semibold"
                        >
                          Practice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
