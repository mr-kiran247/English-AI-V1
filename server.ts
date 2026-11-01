import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '35mb' }));

// Server-side GoogleGenAI initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient wrapper with exponential backoff & model fallback for 503 high-demand spikes
async function generateWithRetry(params: {
  contents: any;
  config?: any;
  primaryModel?: string;
}) {
  const models = [
    params.primaryModel || 'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];

  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || '';
        const isTemporary =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('429');

        if (isTemporary) {
          // Wait briefly before retry/fallback
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          continue;
        } else {
          // Non-retryable error, try next model or throw
          break;
        }
      }
    }
  }

  throw lastError || new Error('All model attempts failed');
}

// Endpoint: Interactive Conversational Roleplay & Live Feedback
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      scenario,
      userPreferredHelpLang = 'both', // 'hindi' | 'marathi' | 'both'
      scenarioMode = 'daily', // 'daily' | 'professional' | 'open'
    } = req.body;

    const systemInstruction = `
You are "BoliSpeak Coach", a friendly, patient, and highly effective English speaking & grammar tutor specifically designed for native Hindi and Marathi speakers learning spoken English.
Target categories: Daily Life Conversation (shopping, cafes, directions, small talk, medical) and Professional Speaking (job interviews, daily standup, presentation, workplace meetings, formal emails/requests).

CRITICAL INSTRUCTIONS:
1. Detect user's language: User might speak/type in:
   - English (good or with grammatical mistakes)
   - Hindi (Devanagari or Hinglish Roman script)
   - Marathi (Devanagari or Marathish Roman script)
   - A mix (code-switching)
2. If the user speaks in Hindi or Marathi:
   - DO NOT just answer them in Hindi/Marathi!
   - IMMEDIATELY teach them how they should say their thought in natural spoken English!
   - Give them the exact English sentence(s) with both Daily Life & Professional options.
   - Then reply in character in English to keep the conversation going smoothly.
   - Provide a gentle, warm encouragement in Hindi or Marathi (e.g. "खूप छान! आता हे इंग्रजीत म्हणा:" or "बहुत बढ़िया! अब इसे इंग्लिश में कहिए:")
3. If the user speaks in English:
   - Give constructive, motivating grammar & vocabulary feedback.
   - Point out typical Indian English patterns / Indianisms (e.g. "I am having two brothers" -> "I have two brothers", "prepone" -> "reschedule earlier", "revert back" -> "reply", "discuss about" -> "discuss", "cousin brother" -> "cousin", "myself Ramesh" -> "I am Ramesh").
   - Offer a "Daily Spoken" and a "Professional / Polite" version of their sentence.
   - Give practical pronunciation / accent rhythm tips.
4. Keep AI conversational replies natural, conversational, realistic to the chosen scenario:
   Scenario details: ${JSON.stringify(scenario || {})}
   Mode: ${scenarioMode}
5. Always output structured JSON matching the schema.
`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Conversation History:\n${JSON.stringify(messages || [])}\n\nUser's preferred guidance language: ${userPreferredHelpLang}\nRespond as the coach & roleplay partner in JSON format.`,
          },
        ],
      },
    ];

    const response = await generateWithRetry({
      primaryModel: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: {
              type: Type.STRING,
              description: 'english, hindi, marathi, hinglish, or marathish',
            },
            isIndianLanguage: {
              type: Type.BOOLEAN,
              description: 'true if the user typed or spoke in Hindi, Marathi, Hinglish, or Marathish',
            },
            aiReplyEnglish: {
              type: Type.STRING,
              description: 'The natural conversational reply in English from the roleplay partner or coach',
            },
            aiReplyHindiTranslation: {
              type: Type.STRING,
              description: 'Hindi translation of the AI reply to aid comprehension',
            },
            aiReplyMarathiTranslation: {
              type: Type.STRING,
              description: 'Marathi translation of the AI reply to aid comprehension',
            },
            teachingFeedback: {
              type: Type.OBJECT,
              properties: {
                userThoughtInEnglish: {
                  type: Type.STRING,
                  description: 'The best English translation or improved version of what the user meant to say',
                },
                dailyCasualVersion: {
                  type: Type.STRING,
                  description: 'Natural daily life conversation version',
                },
                professionalVersion: {
                  type: Type.STRING,
                  description: 'Workplace, interview, or business polite version',
                },
                phoneticPronunciation: {
                  type: Type.STRING,
                  description: 'Simple phonetic pronunciation guide for Indian speakers',
                },
                grammarScore: {
                  type: Type.INTEGER,
                  description: 'Score from 0 to 100 for grammatical accuracy',
                },
                grammarExplanation: {
                  type: Type.STRING,
                  description: 'Clear explanation of grammar rules, tenses, or prepositions in simple English with Hindi/Marathi references',
                },
                corrections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      improved: { type: Type.STRING },
                      why: { type: Type.STRING },
                    },
                    required: ['original', 'improved', 'why'],
                  },
                },
                keyVocabulary: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      wordOrPhrase: { type: Type.STRING },
                      meaningHindi: { type: Type.STRING },
                      meaningMarathi: { type: Type.STRING },
                      exampleSentence: { type: Type.STRING },
                    },
                    required: ['wordOrPhrase', 'meaningHindi', 'meaningMarathi', 'exampleSentence'],
                  },
                },
                nativeEncouragement: {
                  type: Type.STRING,
                  description: 'Short encouraging cheer in Marathi or Hindi',
                },
              },
              required: [
                'userThoughtInEnglish',
                'dailyCasualVersion',
                'professionalVersion',
                'phoneticPronunciation',
                'grammarScore',
                'grammarExplanation',
                'corrections',
                'keyVocabulary',
                'nativeEncouragement',
              ],
            },
            suggestedQuickReplies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  hindiMarathiMeaning: { type: Type.STRING },
                },
                required: ['english', 'hindiMarathiMeaning'],
              },
            },
          },
          required: [
            'detectedLanguage',
            'isIndianLanguage',
            'aiReplyEnglish',
            'aiReplyHindiTranslation',
            'aiReplyMarathiTranslation',
            'teachingFeedback',
            'suggestedQuickReplies',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return res.status(500).json({ error: error.message || 'Chat generation failed' });
  }
});

// Endpoint: Boli-to-English Instant Translation & Speaking Coach
app.post('/api/gemini/convert', async (req: Request, res: Response) => {
  try {
    const { text, context = 'daily' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const systemInstruction = `
You are the "Boli-to-English Master Coach".
The user provides a sentence or thought in Hindi, Marathi, Hinglish, Marathish, or broken English.
Your job is to transform it into fluent, natural English with deep learning breakdowns for Indian learners.

Provide:
1. Detected Language: (e.g. "Marathi (मराठी)", "Hindi (हिंदी)", "Hinglish", "Marathish", "English")
2. Primary Natural English
3. Casual / Daily Life version
4. Professional / Corporate / Formal version
5. Polite / Respectful version
6. Phonetic guide (easy to pronounce for Hindi/Marathi speakers)
7. Word-by-word / chunk-by-chunk bridge breakdown
8. Common Indian speaker mistake for this concept (e.g. why direct translation fails)
9. Grammar rule tip (Articles, Tense, Preposition, Subject-Verb agreement)
10. Hindi translation & Marathi translation
`;

    const response = await generateWithRetry({
      primaryModel: 'gemini-3.8-flash',
      contents: `Transform this thought into English mastery: "${text}". Context preference: ${context}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: { type: Type.STRING },
            englishPrimary: { type: Type.STRING },
            dailyLifeVersion: { type: Type.STRING },
            professionalVersion: { type: Type.STRING },
            politeVersion: { type: Type.STRING },
            phoneticPronunciation: { type: Type.STRING },
            hindiMeaning: { type: Type.STRING },
            marathiMeaning: { type: Type.STRING },
            chunkBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  indianChunk: { type: Type.STRING },
                  englishChunk: { type: Type.STRING },
                  note: { type: Type.STRING },
                },
                required: ['indianChunk', 'englishChunk', 'note'],
              },
            },
            commonIndianMistake: { type: Type.STRING },
            correctFormula: { type: Type.STRING },
            grammarTip: { type: Type.STRING },
            practicePrompt: { type: Type.STRING },
          },
          required: [
            'detectedLanguage',
            'englishPrimary',
            'dailyLifeVersion',
            'professionalVersion',
            'politeVersion',
            'phoneticPronunciation',
            'hindiMeaning',
            'marathiMeaning',
            'chunkBreakdown',
            'commonIndianMistake',
            'correctFormula',
            'grammarTip',
            'practicePrompt',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/convert:', error);
    return res.status(500).json({ error: error.message || 'Conversion failed' });
  }
});

// Endpoint: Dedicated Grammar & Accent Doctor
app.post('/api/gemini/analyze-grammar', async (req: Request, res: Response) => {
  try {
    const { sentence, targetContext = 'general' } = req.body;
    if (!sentence) {
      return res.status(400).json({ error: 'Sentence is required' });
    }

    const systemInstruction = `
You are an expert English linguist specializing in Indian ESL speakers (Marathi and Hindi mother tongues).
Analyze the input sentence for grammar errors, Indianisms, preposition errors, tense errors, and tone.
Provide detailed corrections, explanations with Hindi & Marathi equivalents, and practice suggestions.
`;

    const response = await generateWithRetry({
      primaryModel: 'gemini-3.8-flash',
      contents: `Analyze this sentence: "${sentence}" in context: "${targetContext}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Score out of 100' },
            fluencyRating: { type: Type.STRING, description: 'Native, Professional, Clear, Needs Practice, or Incorrect' },
            isIndianism: { type: Type.BOOLEAN },
            detectedIndianismDetail: { type: Type.STRING },
            correctedSentence: { type: Type.STRING },
            moreNaturalAlternative: { type: Type.STRING },
            executiveProfessionalAlternative: { type: Type.STRING },
            ruleExplanation: { type: Type.STRING },
            hindiExplanation: { type: Type.STRING },
            marathiExplanation: { type: Type.STRING },
            grammarHighlights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fragment: { type: Type.STRING },
                  issueType: { type: Type.STRING },
                  correction: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['fragment', 'issueType', 'correction', 'explanation'],
              },
            },
          },
          required: [
            'overallScore',
            'fluencyRating',
            'isIndianism',
            'correctedSentence',
            'moreNaturalAlternative',
            'executiveProfessionalAlternative',
            'ruleExplanation',
            'hindiExplanation',
            'marathiExplanation',
            'grammarHighlights',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-grammar:', error);
    return res.status(500).json({ error: error.message || 'Grammar analysis failed' });
  }
});

// Endpoint: Speaking Evaluation (Checks how well user read/spoke the target English sentence)
app.post('/api/gemini/evaluate-speaking', async (req: Request, res: Response) => {
  try {
    const { targetPhrase, spokenText } = req.body;
    if (!targetPhrase || !spokenText) {
      return res.status(400).json({ error: 'targetPhrase and spokenText are required' });
    }

    const response = await generateWithRetry({
      primaryModel: 'gemini-3.8-flash',
      contents: `Compare the target sentence: "${targetPhrase}" with what the user spoke: "${spokenText}".
Evaluate speaking accuracy, missing or added words, pronunciation hurdles for Hindi/Marathi speakers, and return constructive feedback.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER, description: '0 to 100 speaking accuracy match' },
            verdict: { type: Type.STRING, description: 'Excellent, Very Good, Good, or Keep Practicing' },
            feedback: { type: Type.STRING },
            hindiCheer: { type: Type.STRING },
            marathiCheer: { type: Type.STRING },
            pronunciationTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['matchScore', 'verdict', 'feedback', 'hindiCheer', 'marathiCheer', 'pronunciationTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/evaluate-speaking:', error);
    return res.status(500).json({ error: error.message || 'Speaking evaluation failed' });
  }
});

// Endpoint: High-fidelity Text-to-Speech via gemini-3.8-flash-lite-tts
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', style = 'Friendly, clear English tutor' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // gemini-3.8-flash-lite-tts returns a complete WAV file (audio/wav, 24kHz mono 16-bit)
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500),
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    }

    return res.json({ fallback: true, message: 'Audio part not found in response' });
  } catch (error: any) {
    console.warn('TTS error (will fallback to browser speech synthesis):', error.message);
    return res.json({ fallback: true, error: error.message });
  }
});

// Endpoint: Audio Transcription via gemini-3.5-transcribe
app.post('/api/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType.split(';')[0] || 'audio/webm',
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this audio verbatim. The speaker may speak English, Hindi, Marathi, or mixed Hinglish/Marathish. Output ONLY the transcribed words with appropriate capitalization and punctuation. No introductory or explanatory text.',
          },
        ],
      },
    });

    const transcribed = (response.text || '').trim();
    return res.json({ text: transcribed });
  } catch (error: any) {
    console.error('Error in /api/transcribe:', error);
    return res.status(500).json({ error: error.message || 'Transcription failed' });
  }
});

// Mount Vite in development or serve built files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BoliSpeak Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
