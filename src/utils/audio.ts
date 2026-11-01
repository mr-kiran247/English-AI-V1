// Audio utility for cross-platform iOS & Desktop speech synthesis and recording

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private isBrowserTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Plays English speech. Tries server Gemini TTS first (for natural human intonation);
  // falls back immediately to browser SpeechSynthesis.
  public async speakText(text: string, voiceName: string = 'Kore'): Promise<void> {
    this.stopSpeaking();

    // Clean text: strip markdown characters
    const cleanText = text.replace(/[*_#`~]/g, '').trim();
    if (!cleanText) return;

    try {
      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice: voiceName,
          style: 'Clear, encouraging English teacher with neutral accent',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
          const audio = new Audio(audioUrl);
          this.currentAudio = audio;
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Backend TTS failed, using browser synthesis fallback', e);
    }

    // Fallback: Browser Web Speech API
    this.speakWithBrowser(cleanText);
  }

  public speakWithBrowser(text: string, rate = 0.9): void {
    if (!this.isBrowserTTSSupported) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate; // slightly slower for language learners
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Try finding an English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Samantha') ||
          v.name.includes('Siri') ||
          v.name.includes('Google') ||
          v.name.includes('Natural'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (enVoice) {
      utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.isBrowserTTSSupported) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioService = new AudioService();

// Class to manage audio recording for iPhone & desktop
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;

  public async start(): Promise<void> {
    this.audioChunks = [];
    // iOS Safari supports audio/mp4 or audio/aac or audio/webm
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Pick best mime type supported by browser/iOS
    let options: MediaRecorderOptions = {};
    if (typeof MediaRecorder !== 'undefined') {
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg',
      ];
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          options = { mimeType: mime };
          break;
        }
      }
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(200); // 200ms slice
    this.isRecording = true;
  }

  public async stop(): Promise<{ audioBlob: Blob; base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        return reject(new Error('Recorder not active'));
      }

      this.mediaRecorder.onstop = async () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });

        // Clean up tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }
        this.isRecording = false;

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // extract base64 string after comma
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve({ audioBlob, base64, mimeType });
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  public get recordingStatus(): boolean {
    return this.isRecording;
  }

  public cancel(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.isRecording = false;
    this.audioChunks = [];
  }
}
