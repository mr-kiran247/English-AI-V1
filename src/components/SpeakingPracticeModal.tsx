import React, { useState } from 'react';
import { X, Volume2, Mic, MicOff, CheckCircle2, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { audioService, VoiceRecorder } from '../utils/audio';
import { SpeakingEvaluationResult } from '../types';
import confetti from 'canvas-confetti';

interface SpeakingPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPhrase: string;
  phoneticGuide?: string;
  hindiMarathiContext?: string;
  onSuccessPractice?: () => void;
}

export const SpeakingPracticeModal: React.FC<SpeakingPracticeModalProps> = ({
  isOpen,
  onClose,
  targetPhrase,
  phoneticGuide,
  hindiMarathiContext,
  onSuccessPractice,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorderInstance] = useState(() => new VoiceRecorder());
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<SpeakingEvaluationResult | null>(null);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlayModelAudio = () => {
    audioService.speakText(targetPhrase);
  };

  const handleToggleRecording = async () => {
    setErrorMsg(null);

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsEvaluating(true);
      try {
        const { base64, mimeType } = await recorderInstance.stop();

        // 1. Transcribe the audio via Gemini
        const transcribeRes = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64, mimeType }),
        });

        if (!transcribeRes.ok) {
          throw new Error('Could not transcribe audio');
        }

        const { text: spokenText } = await transcribeRes.json();
        setUserTranscript(spokenText || '(No clear speech detected)');

        if (!spokenText || spokenText.length < 2) {
          setErrorMsg('No speech detected. Please speak clearly into the microphone.');
          setIsEvaluating(false);
          return;
        }

        // 2. Evaluate speaking against target
        const evalRes = await fetch('/api/gemini/evaluate-speaking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetPhrase,
            spokenText,
          }),
        });

        if (evalRes.ok) {
          const evalData: SpeakingEvaluationResult = await evalRes.json();
          setEvaluationResult(evalData);

          if (evalData.matchScore >= 75) {
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
            });
            onSuccessPractice?.();
          }
        }
      } catch (err: any) {
        console.error('Recording or evaluation failed:', err);
        setErrorMsg('Could not process speech. Please check microphone permissions and try again.');
      } finally {
        setIsEvaluating(false);
      }
    } else {
      // Start recording
      setEvaluationResult(null);
      setUserTranscript('');
      try {
        await recorderInstance.start();
        setIsRecording(true);
      } catch (err: any) {
        console.error('Failed to start recording:', err);
        setErrorMsg('Microphone access denied. Please allow microphone permissions in iPhone / browser settings.');
      }
    }
  };

  const handleReset = () => {
    setEvaluationResult(null);
    setUserTranscript('');
    setErrorMsg(null);
    if (isRecording) {
      recorderInstance.cancel();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">English Speaking Practice</h3>
              <p className="text-[11px] text-slate-400">बोलून सराव करा • बोलकर अभ्यास करें</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isRecording) recorderInstance.cancel();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Target sentence card */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 relative">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                  Target English Sentence
                </span>
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  "{targetPhrase}"
                </p>
              </div>
              <button
                onClick={handlePlayModelAudio}
                title="Listen to native pronunciation"
                className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
              >
                <Volume2 className="h-4 w-4" />
                <span>Listen</span>
              </button>
            </div>

            {phoneticGuide && (
              <div className="mt-3 pt-3 border-t border-indigo-500/20 flex items-center gap-2">
                <span className="text-[11px] text-indigo-300 font-medium">Pronounce as:</span>
                <span className="text-xs font-mono font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {phoneticGuide}
                </span>
              </div>
            )}

            {hindiMarathiContext && (
              <p className="mt-2 text-xs text-slate-300 devanagari-font italic">
                अर्थ: {hindiMarathiContext}
              </p>
            )}
          </div>

          {/* Interactive Mic Practice */}
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <button
              onClick={handleToggleRecording}
              disabled={isEvaluating}
              className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all shadow-lg ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40 ring-4 ring-rose-500/30'
                  : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-600/30 hover:scale-105 active:scale-95'
              } ${isEvaluating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isEvaluating ? (
                <RefreshCw className="h-8 w-8 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>

            <div className="text-center">
              <p className="text-xs font-semibold text-slate-200">
                {isEvaluating
                  ? 'Analyzing your pronunciation & grammar...'
                  : isRecording
                  ? 'Listening... Tap to stop and get instant feedback!'
                  : 'Tap microphone and speak the sentence aloud'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 devanagari-font">
                {isRecording ? 'थांबवण्यासाठी पुन्हा टॅप करा' : 'माईक दाबा आणि इंग्रजीत स्पष्ट बोला'}
              </p>
            </div>

            {/* Visualizer wave while recording */}
            {isRecording && (
              <div className="flex items-center gap-1.5 h-6">
                <span className="w-1 bg-rose-500 rounded-full animate-soundwave-1"></span>
                <span className="w-1 bg-rose-500 rounded-full animate-soundwave-2"></span>
                <span className="w-1 bg-rose-500 rounded-full animate-soundwave-3"></span>
                <span className="w-1 bg-rose-500 rounded-full animate-soundwave-4"></span>
                <span className="w-1 bg-rose-500 rounded-full animate-soundwave-5"></span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Spoken Transcript */}
          {userTranscript && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                What we heard you say:
              </span>
              <p className="text-sm font-medium text-slate-200 mt-1 italic">
                "{userTranscript}"
              </p>
            </div>
          )}

          {/* Feedback & Score */}
          {evaluationResult && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      evaluationResult.matchScore >= 80
                        ? 'text-emerald-400'
                        : evaluationResult.matchScore >= 60
                        ? 'text-amber-400'
                        : 'text-indigo-400'
                    }`}
                  />
                  <span className="text-sm font-bold text-white">
                    {evaluationResult.verdict}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-xl font-extrabold ${
                      evaluationResult.matchScore >= 80
                        ? 'text-emerald-400'
                        : evaluationResult.matchScore >= 60
                        ? 'text-amber-400'
                        : 'text-indigo-400'
                    }`}
                  >
                    {evaluationResult.matchScore}%
                  </span>
                  <span className="text-[11px] text-slate-400">accuracy</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {evaluationResult.feedback}
              </p>

              {/* Native cheer */}
              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2.5 text-xs text-indigo-300 devanagari-font">
                ⭐ {evaluationResult.marathiCheer || evaluationResult.hindiCheer}
              </div>

              {/* Pronunciation tips list */}
              {evaluationResult.pronunciationTips && evaluationResult.pronunciationTips.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-amber-300">
                    Pronunciation Tips for Indian Speakers:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-300">
                    {evaluationResult.pronunciationTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
