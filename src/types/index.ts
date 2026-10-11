export interface Voice {
  id: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  tag: string;
  shortCode: string;
  categoryTag?: string;
  geminiVoice?: string;
  desc: string;
  sample: string;
}

export interface AudioHistoryItem {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  speed: number;
  pitch: number;
  duration?: number;
  fileSizeMb?: string;
  filename?: string;
  createdAt: number;
  audioUrl: string; // Blob or Data URL
  shareId?: string;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  speed: number;
  pitch: number;
  stability?: number;
  similarityBoost?: number;
}

export interface TTSResponse {
  success: boolean;
  engine: 'elevenlabs' | 'gemini' | 'client-synthesis';
  format: string;
  voiceName: string;
  audioBase64?: string;
  mimeType?: string;
  fallbackToClient?: boolean;
  message?: string;
  error?: string;
}
