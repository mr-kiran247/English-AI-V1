import React, { useState, useRef, useEffect } from 'react';
import {
  Scenario,
  ChatMessage,
  HelpLanguage,
  TeachingFeedback,
  SavedVocabularyItem,
} from '../types';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  Check,
  Languages,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { audioService, VoiceRecorder } from '../utils/audio';

interface ConversationChatProps {
  scenario: Scenario;
  helpLanguage: HelpLanguage;
  onBackToScenarios: () => void;
  onPracticePhrase: (phrase: string, phonetic?: string, context?: string) => void;
  onSaveVocabulary: (item: Omit<SavedVocabularyItem, 'id' | 'savedAt'>) => void;
  onSentencePracticed: () => void;
}

export const ConversationChat: React.FC<ConversationChatProps> = ({
  scenario,
  helpLanguage,
  onBackToScenarios,
  onPracticePhrase,
  onSaveVocabulary,
  onSentencePracticed,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-ai',
      role: 'assistant',
      content: scenario.initialPrompt,
      timestamp: Date.now(),
      aiReplyHindiTranslation: scenario.starterPhraseHindi,
      aiReplyMarathiTranslation: scenario.starterPhraseMarathi,
      suggestedQuickReplies: [
        {
          english: scenario.starterPhraseEnglish,
          hindiMarathiMeaning:
            helpLanguage === 'marathi'
              ? scenario.starterPhraseMarathi
              : scenario.starterPhraseHindi,
        },
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(() => new VoiceRecorder());
  const [showTips, setShowTips] = useState(true);
  const [showAiTranslation, setShowAiTranslation] = useState<Record<string, boolean>>({});
  const [savedVocabIds, setSavedVocabIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleAiTranslation = (msgId: string) => {
    setShowAiTranslation((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    const userMsgId = 'user-' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedHistory = [...messages, newUserMessage];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          scenario,
          userPreferredHelpLang: helpLanguage,
          scenarioMode: scenario.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get coach response');
      }

      const data = await response.json();

      // Update the user's message with detected language & teaching feedback
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId
            ? {
                ...m,
                detectedLanguage: data.detectedLanguage,
                isIndianLanguage: data.isIndianLanguage,
                teachingFeedback: data.teachingFeedback,
              }
            : m
        )
      );

      // Append AI reply
      const aiReplyMessage: ChatMessage = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: data.aiReplyEnglish,
        timestamp: Date.now(),
        aiReplyHindiTranslation: data.aiReplyHindiTranslation,
        aiReplyMarathiTranslation: data.aiReplyMarathiTranslation,
        suggestedQuickReplies: data.suggestedQuickReplies,
      };

      setMessages((prev) => [...prev, aiReplyMessage]);
      onSentencePracticed();

      // Automatically speak the AI's response for immersion
      audioService.speakText(data.aiReplyEnglish);
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackAiMsg: ChatMessage = {
        id: 'ai-error-' + Date.now(),
        role: 'assistant',
        content:
          "I heard you! That was a good try. Let's practice saying it in English.",
        timestamp: Date.now(),
        aiReplyHindiTranslation: 'मैंने आपकी बात सुनी! चलिए इसे इंग्लिश में बोलने का अभ्यास करते हैं।',
        aiReplyMarathiTranslation: 'मी तुमचे ऐकले! चला हे इंग्रजीत बोलण्याचा सराव करूया.',
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
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
            handleSendMessage(text);
          }
        }
      } catch (err) {
        console.error('Voice recording failed:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        await recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Cannot start recording:', err);
      }
    }
  };

  const handleSaveVocab = (term: string, hindi: string, marathi: string, example: string) => {
    const key = `${term}-${hindi}`;
    if (!savedVocabIds.has(key)) {
      onSaveVocabulary({
        english: term,
        hindi,
        marathi,
        category: scenario.category,
        example,
      });
      setSavedVocabIds((prev) => new Set([...prev, key]));
    }
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: 'init-ai',
        role: 'assistant',
        content: scenario.initialPrompt,
        timestamp: Date.now(),
        aiReplyHindiTranslation: scenario.starterPhraseHindi,
        aiReplyMarathiTranslation: scenario.starterPhraseMarathi,
        suggestedQuickReplies: [
          {
            english: scenario.starterPhraseEnglish,
            hindiMarathiMeaning:
              helpLanguage === 'marathi'
                ? scenario.starterPhraseMarathi
                : scenario.starterPhraseHindi,
          },
        ],
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] md:h-[calc(100vh-65px)] bg-slate-950">
      {/* Scenario Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-3 py-2.5 sm:px-6 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToScenarios}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1"
            >
              ← Scenarios
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
                  {scenario.title}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    scenario.category === 'professional'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {scenario.category === 'professional' ? 'Workplace' : 'Daily Life'}
                </span>
              </div>
              <p className="text-xs text-slate-400 devanagari-font truncate max-w-[240px] sm:max-w-md">
                {helpLanguage === 'marathi'
                  ? scenario.titleMarathi
                  : helpLanguage === 'hindi'
                  ? scenario.titleHindi
                  : `${scenario.titleMarathi} • ${scenario.titleHindi}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTips(!showTips)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white transition-colors"
              title="Toggle Indian Speaker Tips"
            >
              <Lightbulb className="h-4 w-4 text-amber-400" />
            </button>
            <button
              onClick={handleResetConversation}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white transition-colors"
              title="Restart Conversation"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Indian Speaker Tip Dropdown */}
        {showTips && (
          <div className="mt-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-200/90 flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Indian Speaker Tip: </span>
              {scenario.tipsForIndianSpeakers}
            </div>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl mx-auto`}
            >
              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 max-w-[92%] sm:max-w-[85%] shadow-md transition-all ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-700 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-sm'
                }`}
              >
                {/* Header label for sender */}
                <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-80">
                  <span className="font-bold">
                    {isUser ? 'You' : scenario.characterRole}
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => audioService.speakText(message.content)}
                      className="flex items-center gap-1 rounded bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-indigo-300 transition-colors"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Listen</span>
                    </button>
                  )}
                  {isUser && message.detectedLanguage && (
                    <span className="rounded bg-indigo-900/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold">
                      {message.detectedLanguage}
                    </span>
                  )}
                </div>

                {/* Text Content */}
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* AI Translation toggle (Hindi / Marathi) */}
                {!isUser && (message.aiReplyHindiTranslation || message.aiReplyMarathiTranslation) && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => toggleAiTranslation(message.id)}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-300 transition-colors"
                    >
                      <Languages className="h-3 w-3" />
                      <span>
                        {showAiTranslation[message.id]
                          ? 'लपवा (Hide translation)'
                          : 'मराठी / हिंदी भाषांतर (Show Meaning)'}
                      </span>
                      {showAiTranslation[message.id] ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>

                    {showAiTranslation[message.id] && (
                      <div className="mt-2 space-y-1.5 rounded-lg bg-slate-950/80 p-2.5 text-xs text-slate-300 devanagari-font border border-slate-800">
                        {message.aiReplyMarathiTranslation && (
                          <div>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">
                              मराठी:
                            </span>{' '}
                            {message.aiReplyMarathiTranslation}
                          </div>
                        )}
                        {message.aiReplyHindiTranslation && (
                          <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase">
                              हिंदी:
                            </span>{' '}
                            {message.aiReplyHindiTranslation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Instant Teaching Feedback Card for User Messages */}
              {isUser && message.teachingFeedback && (
                <div className="mt-2 w-full max-w-[92%] sm:max-w-[85%] rounded-2xl border border-indigo-500/30 bg-slate-900/95 p-3.5 sm:p-4 text-xs shadow-xl space-y-3">
                  {/* Feedback Header: Language detection + Score */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      <span className="font-bold text-indigo-300 text-xs">
                        {message.isIndianLanguage
                          ? 'Native Language Detected → Learn in English'
                          : 'English Grammar & Fluency Feedback'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-extrabold text-sm ${
                          message.teachingFeedback.grammarScore >= 80
                            ? 'text-emerald-400'
                            : message.teachingFeedback.grammarScore >= 60
                            ? 'text-amber-400'
                            : 'text-indigo-400'
                        }`}
                      >
                        {message.teachingFeedback.grammarScore}/100
                      </span>
                      <span className="text-[10px] text-slate-400">Score</span>
                    </div>
                  </div>

                  {/* How to say it in English */}
                  <div className="space-y-2">
                    <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          Daily Life English
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              audioService.speakText(
                                message.teachingFeedback!.dailyCasualVersion
                              )
                            }
                            className="p-1 rounded text-slate-400 hover:text-white"
                            title="Listen"
                          >
                            <Volume2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() =>
                              onPracticePhrase(
                                message.teachingFeedback!.dailyCasualVersion,
                                message.teachingFeedback!.phoneticPronunciation,
                                message.content
                              )
                            }
                            className="flex items-center gap-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 text-[10px] font-semibold"
                          >
                            <Mic className="h-2.5 w-2.5" />
                            <span>Practice</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        "{message.teachingFeedback.dailyCasualVersion}"
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          Professional / Workplace English
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              audioService.speakText(
                                message.teachingFeedback!.professionalVersion
                              )
                            }
                            className="p-1 rounded text-slate-400 hover:text-white"
                            title="Listen"
                          >
                            <Volume2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() =>
                              onPracticePhrase(
                                message.teachingFeedback!.professionalVersion,
                                undefined,
                                message.content
                              )
                            }
                            className="flex items-center gap-1 rounded bg-amber-600 hover:bg-amber-500 text-white px-2 py-0.5 text-[10px] font-semibold"
                          >
                            <Mic className="h-2.5 w-2.5" />
                            <span>Practice</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        "{message.teachingFeedback.professionalVersion}"
                      </p>
                    </div>
                  </div>

                  {/* Phonetic guide */}
                  {message.teachingFeedback.phoneticPronunciation && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Pronunciation:</span>
                      <span className="font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {message.teachingFeedback.phoneticPronunciation}
                      </span>
                    </div>
                  )}

                  {/* Corrections & Grammar Rule */}
                  {message.teachingFeedback.corrections &&
                    message.teachingFeedback.corrections.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-rose-300">
                          Grammar Fixes:
                        </span>
                        {message.teachingFeedback.corrections.map((corr, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-rose-950/20 border border-rose-500/20 p-2 text-xs text-rose-200"
                          >
                            <div className="line-through text-rose-400/80">
                              "{corr.original}"
                            </div>
                            <div className="text-emerald-300 font-semibold mt-0.5">
                              → "{corr.improved}"
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1">
                              💡 {corr.why}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Grammar Explanation */}
                  {message.teachingFeedback.grammarExplanation && (
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                      <span className="font-semibold text-indigo-300">Rule: </span>
                      {message.teachingFeedback.grammarExplanation}
                    </p>
                  )}

                  {/* Key Vocabulary from this turn */}
                  {message.teachingFeedback.keyVocabulary &&
                    message.teachingFeedback.keyVocabulary.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Vocabulary from this turn:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {message.teachingFeedback.keyVocabulary.map((vocab, i) => {
                            const isSaved = savedVocabIds.has(
                              `${vocab.wordOrPhrase}-${vocab.meaningHindi}`
                            );
                            return (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-lg bg-slate-950/80 border border-slate-800 px-2.5 py-1.5"
                              >
                                <div>
                                  <span className="font-semibold text-white">
                                    {vocab.wordOrPhrase}
                                  </span>
                                  <p className="text-[10px] text-slate-400 devanagari-font">
                                    {helpLanguage === 'marathi'
                                      ? vocab.meaningMarathi
                                      : vocab.meaningHindi}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    handleSaveVocab(
                                      vocab.wordOrPhrase,
                                      vocab.meaningHindi,
                                      vocab.meaningMarathi,
                                      vocab.exampleSentence
                                    )
                                  }
                                  disabled={isSaved}
                                  className={`p-1 rounded text-xs transition-colors ${
                                    isSaved
                                      ? 'text-emerald-400 bg-emerald-500/10'
                                      : 'text-slate-400 hover:text-indigo-300'
                                  }`}
                                  title={isSaved ? 'Saved' : 'Save to notebook'}
                                >
                                  {isSaved ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <BookmarkPlus className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Native Encouragement */}
                  {message.teachingFeedback.nativeEncouragement && (
                    <div className="text-[11px] font-medium text-indigo-300 devanagari-font border-t border-slate-800 pt-2 flex items-center gap-1.5">
                      <span>✨</span>
                      <span>{message.teachingFeedback.nativeEncouragement}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-2 max-w-3xl mx-auto">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 animate-spin">
              <RefreshCw className="h-3 w-3" />
            </div>
            <span>Coach is analyzing speech and preparing response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Replies (Helps if learner feels hesitant or stuck) */}
      {messages.length > 0 &&
        messages[messages.length - 1].role === 'assistant' &&
        messages[messages.length - 1].suggestedQuickReplies && (
          <div className="border-t border-slate-800/80 bg-slate-950/90 px-3 py-2 overflow-x-auto">
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex-shrink-0">
                Quick Options:
              </span>
              <div className="flex items-center gap-2 flex-nowrap overflow-x-auto pb-1">
                {messages[messages.length - 1].suggestedQuickReplies!.map(
                  (reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(reply.english)}
                      className="flex-shrink-0 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 hover:border-indigo-500/50 px-3 py-1.5 text-left transition-all"
                    >
                      <div className="text-xs font-semibold text-white">
                        {reply.english}
                      </div>
                      <div className="text-[10px] text-slate-400 devanagari-font truncate max-w-[220px]">
                        {reply.hindiMarathiMeaning}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

      {/* Bottom Input Section */}
      <div className="border-t border-slate-800 bg-slate-900/95 px-3 py-3 sm:px-6 mb-safe pb-safe">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          {/* Audio Record Button (iOS & Desktop) */}
          <button
            onClick={handleToggleVoiceRecord}
            disabled={isLoading}
            className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all shadow-md ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/20'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
            title={
              isRecording
                ? 'Stop recording'
                : 'Speak in English, Hindi, or Marathi'
            }
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="English, हिंदी, or मराठी मध्ये बोला / टाइप करा..."
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm sm:text-base text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-h-32 min-h-[44px]"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all shadow-md ${
              inputText.trim() && !isLoading
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Small sub-hint for iPhone users */}
        <div className="max-w-3xl mx-auto mt-1 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            {isRecording
              ? '🔴 Recording audio... Tap mic when finished.'
              : 'Tip: You can speak or write Marathi, Hindi, or English.'}
          </span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
