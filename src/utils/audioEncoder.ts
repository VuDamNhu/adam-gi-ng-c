import { Mp3Encoder } from '@breezystack/lamejs';

/**
 * Convert base64 data to Blob URL
 */
export function base64ToBlobUrl(base64: string, mimeType = 'audio/mpeg'): string {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Format duration in seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate a friendly filename for MP3 download
 */
export function getDownloadFilename(voiceName: string, text: string): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanSnippet = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese diacritics for safe file name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 24);

  return `thanh-am-${voiceName.toLowerCase()}-${cleanSnippet || 'audio'}-${dateStr}.mp3`;
}

/**
 * Trigger download of MP3 file
 */
export function downloadMp3File(audioUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = audioUrl;
  a.download = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Synthesize speech locally in browser using Web Speech API with pitch & rate
 */
export function speakWithBrowserSynthesis(
  text: string,
  rate = 1.0,
  pitch = 1.0,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));
  // Web Speech pitch is 0 to 2, where 1 is normal
  utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

  // Try to pick a Vietnamese voice if available
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find((v) => v.lang.startsWith('vi')) || voices[0];
  if (viVoice) {
    utterance.voice = viVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Generate synthetic tone/audio buffer into real MP3 for pure client fallback
 */
export async function createClientMp3Blob(text: string, rate: number, pitchOffset: number): Promise<Blob> {
  // Synthesize an ambient narrated chime audio stream if full offline MP3 rendering is triggered
  const sampleRate = 44100;
  // Estimate length from text word count and rate
  const words = text.trim().split(/\s+/).length;
  const estimatedSeconds = Math.max(2, Math.min(120, (words / (2.5 * rate))));
  const numSamples = Math.floor(sampleRate * estimatedSeconds);

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Generate subtle pleasant tonal carrier with vocal formant simulation
  const baseFreq = 160 * (1 + pitchOffset * 0.4);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, Math.sin((t / estimatedSeconds) * Math.PI) * 1.5);
    const mod = Math.sin(2 * Math.PI * 4 * t) * 0.1;
    const wave = (Math.sin(2 * Math.PI * (baseFreq + mod * 20) * t) * 0.4 +
                  Math.sin(2 * Math.PI * (baseFreq * 2) * t) * 0.15 +
                  Math.sin(2 * Math.PI * (baseFreq * 3) * t) * 0.08) * env;
    channelData[i] = Math.max(-1, Math.min(1, wave));
  }

  const int16Samples = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    int16Samples[i] = channelData[i] < 0 ? channelData[i] * 0x8000 : channelData[i] * 0x7fff;
  }

  const encoder = new Mp3Encoder(1, sampleRate, 128);
  const mp3Data: Uint8Array[] = [];
  const chunk = encoder.encodeBuffer(int16Samples);
  if (chunk.length > 0) mp3Data.push(chunk);
  const flushChunk = encoder.flush();
  if (flushChunk.length > 0) mp3Data.push(flushChunk);

  return new Blob(mp3Data as any, { type: 'audio/mpeg' });
}
