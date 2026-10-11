import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Mp3Encoder } from '@breezystack/lamejs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '20mb' }));

// In-memory cache for shared audio files (stores up to 500 clips)
interface SharedAudio {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  speed: number;
  pitch: number;
  audioBase64: string;
  format: string;
  createdAt: number;
}

const shareStore = new Map<string, SharedAudio>();

// Curated voices with focus on Adam (ElevenLabs) and versatile natural voices
const VOICES = [
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    elevenLabsId: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    gender: 'Nam',
    tag: 'Trầm ấm & Tự nhiên nhất',
    shortCode: 'AD',
    categoryTag: '[MẶC ĐỊNH]',
    geminiVoice: 'Charon',
    desc: 'Giọng đọc số 1 tại ElevenLabs, tông trầm ấm, diễn đạt tự nhiên như người thật.',
    sample: 'Xin chào, tôi là Adam. Rất vui được đồng hành cùng bạn trong trải nghiệm đọc văn bản tiếng Việt hôm nay.',
  },
  {
    id: 'eGSd0uV8dNQnZuEEX9lu',
    elevenLabsId: 'eGSd0uV8dNQnZuEEX9lu',
    name: 'Adam (Dominant, Firm)',
    gender: 'Nam',
    tag: 'Uy lực, dứt khoát & Trầm hùng',
    shortCode: 'AD+',
    categoryTag: 'DOMINANT, FIRM',
    geminiVoice: 'Fenrir',
    desc: 'Bản quyền ElevenLabs (ID: eGSd0uV8dNQnZuEEX9lu) - Tông giọng Adam uy lực, dứt khoát, quyền uy và đĩnh đạc nhất.',
    sample: 'Tôi là Adam - Dominant, Firm từ ElevenLabs. Từng lời nói đều mang sức nặng của sự kiên định, đanh thép và quyết đoán.',
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    gender: 'Nữ',
    tag: 'Dịu dàng & Thanh thoát',
    geminiVoice: 'Kore',
    desc: 'Giọng nữ nhẹ nhàng, truyền cảm, thích hợp cho đọc sách, tản văn và hướng dẫn.',
    sample: 'Chào bạn, tôi là Rachel. Giọng đọc nhẹ nhàng và trong trẻo sẽ giúp câu chuyện của bạn thêm cuốn hút.',
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    gender: 'Nam',
    tag: 'Trẻ trung & Năng động',
    geminiVoice: 'Puck',
    desc: 'Giọng nam thanh niên hiện đại, đĩnh đạc, phù hợp với tin tức và video ngắn.',
    sample: 'Xin chào! Tôi là Josh. Tôi mang đến năng lượng tươi mới và rõ ràng cho mọi bài thuyết trình.',
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    gender: 'Nam',
    tag: 'Lịch lãm & Sâu lắng',
    geminiVoice: 'Charon',
    desc: 'Giọng nam chuẩn mực, ấm áp, thích hợp cho tự sự, podcast và triết lý.',
    sample: 'Chào bạn, tôi là Antoni. Giọng nói lịch lãm và sâu sắc sẽ mang lại chiều sâu cho từng câu chữ.',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    gender: 'Nữ',
    tag: 'Ngọt ngào & Biểu cảm',
    geminiVoice: 'Zephyr',
    desc: 'Giọng nữ trong trẻo, giàu biểu cảm, phù hợp lồng tiếng và truyện audio.',
    sample: 'Xin chào bạn nhé! Tôi là Bella. Giọng đọc ngọt ngào của tôi sẵn sàng truyền tải mọi cảm xúc chân thật nhất.',
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    gender: 'Nam',
    tag: 'Trầm hùng & Uy lực',
    geminiVoice: 'Fenrir',
    desc: 'Giọng nam uy quyền, vang khỏe, thích hợp cho phim tài liệu và thông cáo.',
    sample: 'Xin chào, tôi là Arnold. Giọng đọc trầm hùng và dứt khoát sẽ làm nổi bật tính trang trọng trong văn bản.',
  },
  {
    id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    gender: 'Nam',
    tag: 'Chuyên nghiệp & Báo chí',
    geminiVoice: 'Puck',
    desc: 'Giọng nam phát thanh viên, tiết tấu đều đặn, chuẩn xác cho thời sự.',
    sample: 'Bản tin sáng nay: Tôi là Sam, kính mời quý vị và các bạn lắng nghe thông tin tổng hợp cập nhật mới nhất.',
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    gender: 'Nữ',
    tag: 'Ấm áp & Thân thiện',
    geminiVoice: 'Kore',
    desc: 'Giọng nữ dễ thương, thủ thỉ, tạo cảm giác gần gũi như bạn bè tâm sự.',
    sample: 'Chào bạn yêu quý, tôi là Elli. Hãy để tôi đọc cho bạn nghe những dòng tâm sự thật dịu êm nhé.',
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    gender: 'Nữ',
    tag: 'Sắc sảo & Hiện đại',
    geminiVoice: 'Zephyr',
    desc: 'Giọng nữ mạnh mẽ, dứt khoát, hiện đại, thuyết phục.',
    sample: 'Xin chào! Tôi là Domi. Giọng đọc sắc sảo, dứt khoát sẽ làm rõ nét từng luận điểm trong nội dung của bạn.',
  },
];

// Helper: Convert WAV buffer to MP3 buffer using lamejs
function wavToMp3(wavBuffer: Buffer): Buffer {
  try {
    // Standard WAV header is 44 bytes
    if (wavBuffer.length < 44) {
      return wavBuffer;
    }

    // Read WAV header metadata
    const channels = wavBuffer.readUInt16LE(22) || 1;
    const sampleRate = wavBuffer.readUInt32LE(24) || 24000;
    const bitsPerSample = wavBuffer.readUInt16LE(34) || 16;

    if (bitsPerSample !== 16) {
      // Fallback if not 16-bit
      return wavBuffer;
    }

    // Extract PCM data starting at offset 44
    const pcmData = wavBuffer.subarray(44);
    const numSamples = Math.floor(pcmData.length / 2);
    const int16Samples = new Int16Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      int16Samples[i] = pcmData.readInt16LE(i * 2);
    }

    const encoder = new Mp3Encoder(channels, sampleRate, 128);
    const mp3Chunks: Buffer[] = [];

    if (channels === 1) {
      const chunk = encoder.encodeBuffer(int16Samples);
      if (chunk.length > 0) mp3Chunks.push(Buffer.from(chunk));
    } else {
      // Split interleaved stereo into left and right
      const halfLength = Math.floor(numSamples / 2);
      const left = new Int16Array(halfLength);
      const right = new Int16Array(halfLength);
      for (let i = 0; i < halfLength; i++) {
        left[i] = int16Samples[i * 2];
        right[i] = int16Samples[i * 2 + 1];
      }
      const chunk = encoder.encodeBuffer(left, right);
      if (chunk.length > 0) mp3Chunks.push(Buffer.from(chunk));
    }

    const endChunk = encoder.flush();
    if (endChunk.length > 0) mp3Chunks.push(Buffer.from(endChunk));

    return Buffer.concat(mp3Chunks);
  } catch (err) {
    console.error('Error converting WAV to MP3:', err);
    return wavBuffer;
  }
}

// API: Get available AI voices
app.get('/api/voices', (_req: Request, res: Response) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const hasElevenLabs = Boolean(apiKey && (apiKey.startsWith('sk_') || apiKey.length >= 24));
  res.json({
    voices: VOICES,
    defaultVoiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
    hasElevenLabsKey: hasElevenLabs,
  });
});

// API: Text-to-Speech synthesis
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      voiceId = 'pNInz6obpgDQGcFmaJgB',
      speed = 1.0,
      pitch = 0,
      stability = 0.5,
      similarityBoost = 0.75,
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Nội dung văn bản không được để trống.' });
      return;
    }

    if (text.length > 2500) {
      res.status(400).json({ error: 'Đoạn văn vượt quá giới hạn 2000 ký tự cho phép.' });
      return;
    }

    const cleanText = text.trim();
    const voiceMeta = VOICES.find((v) => v.id === voiceId) || VOICES[0];
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const targetElId = (voiceMeta as any).elevenLabsId || voiceId;
    const isDominantFirm = voiceId === 'eGSd0uV8dNQnZuEEX9lu' || voiceId === 'adam-dominant-firm';

    // Strategy 1: ElevenLabs API (if ELEVENLABS_API_KEY is configured)
    if (elevenLabsApiKey) {
      try {
        console.log(`[TTS] Requesting ElevenLabs for voice: ${voiceMeta.name} (${targetElId})`);
        const elResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${targetElId}?output_format=mp3_44100_128`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': elevenLabsApiKey,
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg',
            },
            body: JSON.stringify({
              text: cleanText,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: isDominantFirm ? 0.85 : (Number(stability) || 0.5),
                similarity_boost: isDominantFirm ? 0.95 : (Number(similarityBoost) || 0.75),
                style: isDominantFirm ? 0.35 : 0.0,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (elResponse.ok) {
          const arrayBuffer = await elResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Mp3 = buffer.toString('base64');

          res.json({
            success: true,
            engine: 'elevenlabs',
            format: 'mp3',
            voiceName: voiceMeta.name,
            audioBase64: base64Mp3,
            mimeType: 'audio/mpeg',
          });
          return;
        } else {
          const errDetail = await elResponse.text();
          console.warn(`[TTS] ElevenLabs returned ${elResponse.status}: ${errDetail}. Falling back to Gemini TTS.`);
        }
      } catch (elError) {
        console.warn('[TTS] ElevenLabs call failed, falling back:', elError);
      }
    }

    // Strategy 2: Gemini TTS API (gemini-3.8-flash-lite-tts)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        console.log(`[TTS] Synthesizing via Gemini TTS model: gemini-3.8-flash-lite-tts, voice: ${voiceMeta.geminiVoice}`);
        const ai = new GoogleGenAI();
        const ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanText,
                  speechMetadata: {
                    style: `Đọc tiếng Việt tự nhiên, rõ ràng, cảm xúc chân thực, phong cách ${voiceMeta.gender.toLowerCase()} tính ${voiceMeta.tag}.`,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceMeta.geminiVoice || 'Charon',
                },
              },
            },
          },
        });

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const rawWavBuffer = Buffer.from(base64Audio, 'base64');
          // Convert WAV to MP3 format for seamless download
          const mp3Buffer = wavToMp3(rawWavBuffer);
          const base64Mp3 = mp3Buffer.toString('base64');

          res.json({
            success: true,
            engine: 'gemini',
            format: 'mp3',
            voiceName: voiceMeta.name,
            audioBase64: base64Mp3,
            mimeType: 'audio/mpeg',
          });
          return;
        }
      } catch (geminiError) {
        console.warn('[TTS] Gemini TTS failed, signaling browser fallback:', geminiError);
      }
    }

    // Strategy 3: Graceful browser client fallback signal
    res.json({
      success: true,
      engine: 'client-synthesis',
      format: 'mp3',
      voiceName: voiceMeta.name,
      fallbackToClient: true,
      message: 'Sử dụng bộ tổng hợp giọng nói tiếng Việt độ trễ thấp trên thiết bị của bạn.',
    });
  } catch (error: any) {
    console.error('Unhandled TTS Error:', error);
    res.status(500).json({
      error: 'Không thể chuyển đổi văn bản sang âm thanh vào lúc này. Vui lòng thử lại.',
      details: error.message,
    });
  }
});

// API: Share an audio item
app.post('/api/share', (req: Request, res: Response): void => {
  try {
    const { text, voiceId, voiceName, speed = 1.0, pitch = 0, audioBase64, format = 'mp3' } = req.body;

    if (!text || !audioBase64) {
      res.status(400).json({ error: 'Dữ liệu chia sẻ không đầy đủ.' });
      return;
    }

    // Generate clean short identifier
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const shareId = `ta-${Date.now().toString(36)}-${randomSuffix}`;

    const record: SharedAudio = {
      id: shareId,
      text,
      voiceId: voiceId || 'pNInz6obpgDQGcFmaJgB',
      voiceName: voiceName || 'Adam',
      speed: Number(speed) || 1.0,
      pitch: Number(pitch) || 0,
      audioBase64,
      format,
      createdAt: Date.now(),
    };

    // Store in memory, evict oldest if cache exceeds 500
    if (shareStore.size > 500) {
      const oldestKey = shareStore.keys().next().value;
      if (oldestKey) shareStore.delete(oldestKey);
    }
    shareStore.set(shareId, record);

    res.json({
      success: true,
      shareId,
      createdAt: record.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Không thể tạo liên kết chia sẻ.', details: err.message });
  }
});

// API: Retrieve shared audio by share ID
app.get('/api/share/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const item = shareStore.get(id);

  if (!item) {
    res.status(404).json({ error: 'Không tìm thấy tệp âm thanh chia sẻ này hoặc tệp đã hết hạn.' });
    return;
  }

  res.json({
    success: true,
    item,
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ThanhÂm] Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
