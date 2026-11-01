import React, { useState } from 'react';
import {
  BoliConversionResult,
  HelpLanguage,
  SavedVocabularyItem,
} from '../types';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  BookmarkPlus,
  Check,
  Languages,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { audioService, VoiceRecorder } from '../utils/audio';

interface BoliConverterProps {
  helpLanguage: HelpLanguage;
  onPracticePhrase: (phrase: string, phonetic?: string, context?: string) => void;
  onSaveVocabulary: (item: Omit<SavedVocabularyItem, 'id' | 'savedAt'>) => void;
  onSentencePracticed: () => void;
}

const SAMPLE_CHIPS = [
  { text: 'मला उद्या सुट्टी हवी आहे', lang: 'Marathi', meaning: 'I need leave tomorrow' },
  { text: 'कल मीटिंग कितने बजे है?', lang: 'Hindi', meaning: 'What time is the meeting tomorrow?' },
  { text: 'मला एक कप चहा मिळेल का?', lang: 'Marathi', meaning: 'Could I get a cup of tea?' },
  { text: 'मुझे यह समझ नहीं आया, क्या आप दोबारा समझा सकते हैं?', lang: 'Hindi', meaning: 'Could you explain again?' },
  { text: 'मी हे काम संध्याकाळपर्यंत पूर्ण करेन', lang: 'Marathi', meaning: "I'll finish this by evening" },
  { text: 'Kya hum thodi der baad call kar sakte hain?', lang: 'Hinglish', meaning: 'Can we call a bit later?' },
];

export const BoliConverter: React.FC<BoliConverterProps> = ({
  helpLanguage,
  onPracticePhrase,
  onSaveVocabulary,
  onSentencePracticed,
}) => {
  const [inputText, setInputText] = useState('');
  const [contextPreference, setContextPreference] = useState<'daily' | 'professional'>('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(() => new VoiceRecorder());
  const [result, setResult] = useState<BoliConversionResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConvert = async (textToConvert?: string) => {
    const text = (textToConvert || inputText).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/gemini/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          context: contextPreference,
        }),
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const data: BoliConversionResult = await response.json();
      setResult(data);
      onSentencePracticed();

      // Automatically speak the primary English translation
      audioService.speakText(data.englishPrimary);
    } catch (err: any) {
      console.error('Error during Boli conversion:', err);
      setErrorMsg('Failed to process sentence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoiceRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsLoading(true);
      try {
        const { base64, mimeType } = await recorder.stop();
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64, mimeType }),
        });

        if (res.ok) {
          const { text } = await res.json();
          if (text) {
            setInputText(text);
            handleConvert(text);
          }
        }
      } catch (err) {
        console.error('Voice recording error:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        await recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
      }
    }
  };

  const handleSaveToNotebook = () => {
    if (!result) return;
    onSaveVocabulary({
      english: result.englishPrimary,
      hindi: result.hindiMeaning,
      marathi: result.marathiMeaning,
      category: contextPreference,
      example: result.dailyLifeVersion || result.professionalVersion,
    });
    setIsSaved(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Boli-to-English Live Coach
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed devanagari-font">
          मराठी किंवा हिंदीत विचार करा किंवा बोला — हा कोच तुम्हाला तेच वाक्य
          इंग्रजीत अस्खलितपणे कसे बोलायचे, त्याचे नियम व योग्य उच्चार शिकवेल!
        </p>
      </div>

      {/* Input Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Speak or Type Your Thought in Marathi / Hindi:
          </label>
          {/* Daily vs Professional context preference */}
          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setContextPreference('daily')}
              className={`rounded px-2.5 py-1 transition-all ${
                contextPreference === 'daily'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Life
            </button>
            <button
              onClick={() => setContextPreference('professional')}
              className={`rounded px-2.5 py-1 transition-all ${
                contextPreference === 'professional'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Workplace / Professional
            </button>
          </div>
        </div>

        {/* Text Input & Mic */}
        <div className="relative">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="उदा. 'मला कॉफी हवी आहे' / 'मुझे मीटिंग रीशेड्यूल करनी है' / 'Mala madat pahije'..."
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={handleToggleVoiceRecord}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span>{isRecording ? 'Listening (Tap to Stop)' : 'Speak in Marathi/Hindi'}</span>
            </button>

            <button
              onClick={() => handleConvert()}
              disabled={!inputText.trim() || isLoading}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                inputText.trim() && !isLoading
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Learn in English</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sample chips */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-semibold text-slate-400">
            Or try these common everyday phrases:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(chip.text);
                  handleConvert(chip.text);
                }}
                className="rounded-lg border border-slate-800 bg-slate-950/80 hover:bg-slate-800 hover:border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition-all text-left"
              >
                <span className="devanagari-font">{chip.text}</span>
                <span className="text-[10px] text-slate-500 ml-1.5">
                  ({chip.meaning})
                </span>
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

      {/* Conversion Output Result */}
      {result && (
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-5 shadow-2xl space-y-5">
          {/* Top Result Banner */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                  Detected: {result.detectedLanguage}
                </span>
                <span className="text-xs text-slate-400">Natural Spoken English</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                "{result.englishPrimary}"
              </h3>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => audioService.speakText(result.englishPrimary)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all"
                title="Listen to pronunciation"
              >
                <Volume2 className="h-4 w-4" />
                <span>Listen</span>
              </button>
              <button
                onClick={() =>
                  onPracticePhrase(
                    result.englishPrimary,
                    result.phoneticPronunciation,
                    result.hindiMeaning
                  )
                }
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all"
                title="Practice speaking with mic"
              >
                <Mic className="h-4 w-4" />
                <span>Practice</span>
              </button>
              <button
                onClick={handleSaveToNotebook}
                disabled={isSaved}
                className={`p-2 rounded-xl border border-slate-700 transition-colors ${
                  isSaved
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={isSaved ? 'Saved to notebook' : 'Save phrase'}
              >
                {isSaved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Phonetic Pronunciation Guide */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300">How to Pronounce:</span>
              <span className="font-mono text-white bg-slate-950 px-2 py-0.5 rounded border border-amber-500/30">
                {result.phoneticPronunciation}
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80">
              बोलताना प्रत्येक शब्दावर नैसर्गिक जोर द्या (Rhythm & Stress)
            </p>
          </div>

          {/* 3 Variations: Daily Life, Professional, Polite */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Daily Life */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Daily Life Casual
                </span>
                <button
                  onClick={() => audioService.speakText(result.dailyLifeVersion)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm font-semibold text-white">
                "{result.dailyLifeVersion}"
              </p>
              <p className="text-[11px] text-slate-400">
                For friends, markets, cafes & daily talk.
              </p>
            </div>

            {/* Professional Workplace */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Professional / Workplace
                </span>
                <button
                  onClick={() => audioService.speakText(result.professionalVersion)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm font-semibold text-white">
                "{result.professionalVersion}"
              </p>
              <p className="text-[11px] text-slate-400">
                For office meetings, emails & interviews.
              </p>
            </div>

            {/* Polite / Respectful */}
            <div className="rounded-xl border border-violet-500/30 bg-violet-950/15 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                  Extra Polite & Respectful
                </span>
                <button
                  onClick={() => audioService.speakText(result.politeVersion)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm font-semibold text-white">
                "{result.politeVersion}"
              </p>
              <p className="text-[11px] text-slate-400">
                When asking seniors or strangers respectfully.
              </p>
            </div>
          </div>

          {/* Word-by-Word / Chunk-by-Chunk Bridge Breakdown */}
          {result.chunkBreakdown && result.chunkBreakdown.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Language Bridge (कसे तयार झाले):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {result.chunkBreakdown.map((chunk, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs"
                  >
                    <div className="text-amber-300 font-semibold devanagari-font">
                      {chunk.indianChunk}
                    </div>
                    <div className="text-emerald-300 font-bold mt-0.5">
                      → {chunk.englishChunk}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {chunk.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Indian Speaker Mistake & Formula */}
          <div className="rounded-xl bg-rose-950/20 border border-rose-500/30 p-3.5 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold">
              <AlertTriangle className="h-4 w-4" />
              <span>Common Mistake by Indian Learners:</span>
            </div>
            <p className="text-slate-200">
              {result.commonIndianMistake}
            </p>
            <div className="pt-1 text-[11px] text-emerald-300 font-semibold">
              ✅ Correct Formula: {result.correctFormula}
            </div>
          </div>

          {/* Grammar Rule Tip */}
          <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/20 p-3.5 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span>Grammar Doctor Rule:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {result.grammarTip}
            </p>
          </div>

          {/* Practice Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() =>
                onPracticePhrase(
                  result.englishPrimary,
                  result.phoneticPronunciation,
                  result.marathiMeaning || result.hindiMeaning
                )
              }
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
            >
              <Mic className="h-4 w-4" />
              <span>Practice Speaking This Aloud Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
