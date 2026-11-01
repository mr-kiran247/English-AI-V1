export type ScenarioCategory = 'daily' | 'professional' | 'all';

export type HelpLanguage = 'hindi' | 'marathi' | 'both';

export interface KeyVocabularyItem {
  term: string;
  meaningHindi: string;
  meaningMarathi: string;
  exampleSentence?: string;
}

export interface Scenario {
  id: string;
  category: 'daily' | 'professional';
  title: string;
  titleHindi: string;
  titleMarathi: string;
  description: string;
  characterRole: string;
  userRole: string;
  icon: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  initialPrompt: string;
  starterPhraseEnglish: string;
  starterPhraseHindi: string;
  starterPhraseMarathi: string;
  keyVocabulary: KeyVocabularyItem[];
  tipsForIndianSpeakers: string;
}

export interface GrammarCorrection {
  original: string;
  improved: string;
  why: string;
}

export interface TeachingFeedback {
  userThoughtInEnglish: string;
  dailyCasualVersion: string;
  professionalVersion: string;
  phoneticPronunciation: string;
  grammarScore: number;
  grammarExplanation: string;
  corrections: GrammarCorrection[];
  keyVocabulary: Array<{
    wordOrPhrase: string;
    meaningHindi: string;
    meaningMarathi: string;
    exampleSentence: string;
  }>;
  nativeEncouragement: string;
}

export interface SuggestedReply {
  english: string;
  hindiMarathiMeaning: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  detectedLanguage?: string;
  isIndianLanguage?: boolean;
  timestamp: number;
  aiReplyHindiTranslation?: string;
  aiReplyMarathiTranslation?: string;
  teachingFeedback?: TeachingFeedback;
  suggestedQuickReplies?: SuggestedReply[];
}

export interface BoliConversionResult {
  detectedLanguage: string;
  englishPrimary: string;
  dailyLifeVersion: string;
  professionalVersion: string;
  politeVersion: string;
  phoneticPronunciation: string;
  hindiMeaning: string;
  marathiMeaning: string;
  chunkBreakdown: Array<{
    indianChunk: string;
    englishChunk: string;
    note: string;
  }>;
  commonIndianMistake: string;
  correctFormula: string;
  grammarTip: string;
  practicePrompt: string;
}

export interface GrammarAnalysisResult {
  overallScore: number;
  fluencyRating: string;
  isIndianism: boolean;
  detectedIndianismDetail?: string;
  correctedSentence: string;
  moreNaturalAlternative: string;
  executiveProfessionalAlternative: string;
  ruleExplanation: string;
  hindiExplanation: string;
  marathiExplanation: string;
  grammarHighlights: Array<{
    fragment: string;
    issueType: string;
    correction: string;
    explanation: string;
  }>;
}

export interface SpeakingEvaluationResult {
  matchScore: number;
  verdict: string;
  feedback: string;
  hindiCheer: string;
  marathiCheer: string;
  pronunciationTips: string[];
}

export interface SavedVocabularyItem {
  id: string;
  english: string;
  hindi: string;
  marathi: string;
  category: 'daily' | 'professional';
  example: string;
  savedAt: number;
}
