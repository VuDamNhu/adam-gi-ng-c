/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Volume2,
  Clipboard,
  Trash2,
  Sparkles,
  ShieldCheck,
  User,
  Loader2,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { Voice, AudioHistoryItem, TTSResponse } from './types';
import { AudioConfigPanel } from './components/AudioConfigPanel';
import { AudioPlayer } from './components/AudioPlayer';
import { HistoryList } from './components/HistoryList';
import { ShareModal } from './components/ShareModal';
import {
  base64ToBlobUrl,
  createClientMp3Blob,
  speakWithBrowserSynthesis,
} from './utils/audioEncoder';

const DEFAULT_VOICES: Voice[] = [
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    gender: 'Nam',
    shortCode: 'AD',
    categoryTag: '[MẶC ĐỊNH]',
    tag: 'Trầm ấm & Tự nhiên nhất',
    geminiVoice: 'Charon',
    desc: 'Nam trầm ấm, tự nhiên, đĩnh đạc',
    sample: 'Xin chào, tôi là Adam. Rất vui được đồng hành cùng bạn trong trải nghiệm đọc văn bản tiếng Việt hôm nay.',
  },
  {
    id: 'eGSd0uV8dNQnZuEEX9lu',
    name: 'Adam (Dominant, Firm)',
    gender: 'Nam',
    shortCode: 'AD+',
    categoryTag: 'DOMINANT, FIRM',
    tag: 'Uy lực, dứt khoát & Trầm hùng',
    geminiVoice: 'Fenrir',
    desc: 'Bản quyền ElevenLabs (ID: eGSd0uV8dNQnZuEEX9lu) - Tông giọng Adam uy lực, dứt khoát, quyền uy và đĩnh đạc nhất.',
    sample: 'Tôi là Adam - Dominant, Firm từ ElevenLabs. Từng lời nói đều mang sức nặng của sự kiên định, đanh thép và quyết đoán.',
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    gender: 'Nữ',
    shortCode: 'RC',
    categoryTag: 'NỮ CHUYÊN NGHIỆP',
    tag: 'Dịu dàng & Thanh thoát',
    geminiVoice: 'Kore',
    desc: 'Nữ truyền cảm, điền đọc kể chuyện',
    sample: 'Chào bạn, tôi là Rachel. Giọng đọc nhẹ nhàng và trong trẻo sẽ giúp câu chuyện của bạn thêm cuốn hút.',
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    gender: 'Nam',
    shortCode: 'AT',
    categoryTag: 'NAM NĂNG ĐỘNG',
    tag: 'Lịch lãm & Sâu lắng',
    geminiVoice: 'Charon',
    desc: 'Nam tự nhiên, phong cách hội thoại',
    sample: 'Chào bạn, tôi là Antoni. Giọng nói lịch lãm và sâu sắc sẽ mang lại chiều sâu cho từng câu chữ.',
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    gender: 'Nam',
    shortCode: 'JS',
    categoryTag: 'TRẺ TRUNG',
    tag: 'Trẻ trung & Năng động',
    geminiVoice: 'Puck',
    desc: 'Nam thanh niên đĩnh đạc, hiện đại',
    sample: 'Xin chào! Tôi là Josh. Tôi mang đến năng lượng tươi mới và rõ ràng cho mọi bài thuyết trình.',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    gender: 'Nữ',
    shortCode: 'BL',
    categoryTag: 'BIỂU CẢM',
    tag: 'Ngọt ngào & Biểu cảm',
    geminiVoice: 'Zephyr',
    desc: 'Nữ trong trẻo, giàu biểu cảm',
    sample: 'Xin chào bạn nhé! Tôi là Bella. Giọng đọc ngọt ngào của tôi sẵn sàng truyền tải mọi cảm xúc chân thật nhất.',
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    gender: 'Nam',
    shortCode: 'AR',
    categoryTag: 'TRẦM HÙNG',
    tag: 'Trầm hùng & Uy lực',
    geminiVoice: 'Fenrir',
    desc: 'Nam uy quyền, vang khỏe, trang trọng',
    sample: 'Xin chào, tôi là Arnold. Giọng đọc trầm hùng và dứt khoát sẽ làm nổi bật tính trang trọng trong văn bản.',
  },
  {
    id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    gender: 'Nam',
    shortCode: 'SM',
    categoryTag: 'BÁO CHÍ',
    tag: 'Chuyên nghiệp & Báo chí',
    geminiVoice: 'Puck',
    desc: 'Nam phát thanh viên thời sự',
    sample: 'Bản tin sáng nay: Tôi là Sam, kính mời quý vị và các bạn lắng nghe thông tin tổng hợp cập nhật mới nhất.',
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    gender: 'Nữ',
    shortCode: 'EL',
    categoryTag: 'TÂM SỰ',
    tag: 'Ấm áp & Thân thiện',
    geminiVoice: 'Kore',
    desc: 'Nữ ấm áp, thân thiện, gần gũi',
    sample: 'Chào bạn yêu quý, tôi là Elli. Hãy để tôi đọc cho bạn nghe những dòng tâm sự thật dịu êm nhé.',
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    gender: 'Nữ',
    shortCode: 'DM',
    categoryTag: 'SẮC SẢO',
    tag: 'Sắc sảo & Hiện đại',
    geminiVoice: 'Zephyr',
    desc: 'Nữ dứt khoát, hiện đại, thuyết phục',
    sample: 'Xin chào! Tôi là Domi. Giọng đọc sắc sảo, dứt khoát sẽ làm rõ nét từng luận điểm trong nội dung của bạn.',
  },
];

const INITIAL_TEXT =
  'Trí tuệ nhân tạo thế hệ mới đang thay đổi toàn diện phương thức tương tác số giữa con người và máy móc. Với độ trễ chỉ dưới 180 mili-giây và khả năng biểu đạt cảm xúc theo ngữ cảnh thời gian thực, các công nghệ giọng nói tổng hợp hiện nay không chỉ truyền tải thông tin, mà còn tái hiện chính xác từng nhịp thở, ngữ điệu tự nhiên và sự ấm áp trong giao tiếp thường nhật của con người.';

const INITIAL_HISTORY: AudioHistoryItem[] = [
  {
    id: 'demo-1',
    text: 'Giới thiệu về trí tuệ nhân tạo thế hệ mới...',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    voiceName: 'Adam',
    speed: 1.0,
    pitch: 0,
    fileSizeMb: '1.84 MB',
    filename: 'VOX-202505-8831.MP3',
    createdAt: Date.now() - 5 * 60 * 1000,
    audioUrl: '',
  },
  {
    id: 'demo-2',
    text: 'Chào mừng bạn đến với hệ thống trợ lý ảo thông minh...',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    voiceName: 'Rachel',
    speed: 1.1,
    pitch: 0.1,
    fileSizeMb: '1.20 MB',
    filename: 'VOX-202505-4122.MP3',
    createdAt: Date.now() - 3 * 3600 * 1000,
    audioUrl: '',
  },
  {
    id: 'demo-3',
    text: 'Thông báo khẩn về lịch bảo trì máy chủ kỹ thuật số...',
    voiceId: 'ErXwobaYiN019PkySvjV',
    voiceName: 'Antoni',
    speed: 0.95,
    pitch: 0,
    fileSizeMb: '2.15 MB',
    filename: 'VOX-202505-1904.MP3',
    createdAt: Date.now() - 20 * 3600 * 1000,
    audioUrl: '',
  },
  {
    id: 'demo-4',
    text: 'Hôm nay trời có nhiều mây, không mưa, nhiệt độ...',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    voiceName: 'Rachel',
    speed: 1.0,
    pitch: 0,
    fileSizeMb: '0.94 MB',
    filename: 'VOX-202505-0811.MP3',
    createdAt: Date.now() - 48 * 3600 * 1000,
    audioUrl: '',
  },
];

const LOCAL_STORAGE_KEY = 'thanh_am_history_v2';
const MAX_CHAR_LIMIT = 2000;

export default function App() {
  const [voices, setVoices] = useState<Voice[]>(DEFAULT_VOICES);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(DEFAULT_VOICES[0]); // Adam by default
  const [text, setText] = useState<string>(INITIAL_TEXT);

  // Audio configuration states
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(0);

  // Generation & Player states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentAudioBase64, setCurrentAudioBase64] = useState<string | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>('VOX-202505-8831.MP3');
  const [currentFileSizeMb, setCurrentFileSizeMb] = useState<string>('1.84 MB');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<AudioHistoryItem[]>([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  // Share state
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Sample texts dropdown toggle
  const [showSamplesMenu, setShowSamplesMenu] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  // Load history from localStorage or set initial demo history
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed.length > 0 ? parsed : INITIAL_HISTORY);
      } else {
        setHistory(INITIAL_HISTORY);
      }
    } catch (_) {
      setHistory(INITIAL_HISTORY);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (items: AudioHistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Check URL params for shared audio
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('share');

    if (sharedId) {
      fetch(`/api/share/${sharedId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.item) {
            setText(data.item.text);
            const foundVoice = voices.find((v) => v.id === data.item.voiceId) || voices[0];
            setSelectedVoice(foundVoice);
            setSpeed(data.item.speed || 1.0);
            setPitch(data.item.pitch || 0);

            const blobUrl = base64ToBlobUrl(data.item.audioBase64, 'audio/mpeg');
            setCurrentAudioUrl(blobUrl);
            setCurrentAudioBase64(data.item.audioBase64);
            setCurrentFilename(`VOX-SHARED-${sharedId.slice(0, 6).toUpperCase()}.MP3`);
            showToast(`Đã nạp đoạn âm thanh được chia sẻ (${data.item.voiceName})!`);
          }
        })
        .catch((err) => {
          console.warn('Error fetching shared audio:', err);
        });
    }

    // Auto-synthesize initial ready audio if none present, so player starts active as in screenshot
    if (!currentAudioUrl) {
      createClientMp3Blob(INITIAL_TEXT, 1.0, 0).then((blob) => {
        const url = URL.createObjectURL(blob);
        setCurrentAudioUrl(url);
      });
    }
  }, []);

  // Convert Text to Speech
  const handleGenerate = async () => {
    // Immediately cancel any running speech synthesis so nothing speaks unprompted
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const cleanText = text.trim();
    if (!cleanText) {
      setErrorMessage('Vui lòng nhập hoặc dán văn bản nguồn.');
      return;
    }

    if (cleanText.length > MAX_CHAR_LIMIT) {
      setErrorMessage(`Đoạn văn vượt quá ${MAX_CHAR_LIMIT} ký tự cho phép.`);
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voiceId: selectedVoice.id,
          speed,
          pitch,
        }),
      });

      const data: TTSResponse = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Lỗi khi gọi dịch vụ TTS.');
      }

      let audioUrl = '';
      let base64Data = '';
      const randId = Math.floor(1000 + Math.random() * 9000);
      const generatedFilename = `VOX-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randId}.MP3`;

      // Estimate file size based on text length
      const estSize = (Math.max(0.6, (cleanText.length / 200) * 0.9)).toFixed(2) + ' MB';
      setCurrentFilename(generatedFilename);
      setCurrentFileSizeMb(estSize);

      if (data.audioBase64) {
        base64Data = data.audioBase64;
        audioUrl = base64ToBlobUrl(data.audioBase64, data.mimeType || 'audio/mpeg');
      } else {
        // Fallback to client synthesis (generate MP3 file only, DO NOT auto-play speech!)
        const mp3Blob = await createClientMp3Blob(cleanText, speed, pitch);
        audioUrl = URL.createObjectURL(mp3Blob);
      }

      // Load prepared audio into player in ready/paused state
      setCurrentAudioUrl(audioUrl);
      setCurrentAudioBase64(base64Data);

      // Create history item
      const newItem: AudioHistoryItem = {
        id: `vox-${Date.now()}`,
        text: cleanText,
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        speed,
        pitch,
        fileSizeMb: estSize,
        filename: generatedFilename,
        createdAt: Date.now(),
        audioUrl,
      };

      const updatedHistory = [newItem, ...history.filter((h) => h.text !== cleanText)];
      saveHistory(updatedHistory);
      setCurrentlyPlayingId(newItem.id);

      showToast('Đã tạo xong tệp MP3! Bấm nút Phát để nghe.');
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err: any) {
      console.warn('Falling back to local client audio:', err);
      try {
        const mp3Blob = await createClientMp3Blob(cleanText, speed, pitch);
        const fallbackUrl = URL.createObjectURL(mp3Blob);
        const randId = Math.floor(1000 + Math.random() * 9000);
        const generatedFilename = `VOX-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randId}.MP3`;
        const estSize = '1.24 MB';

        setCurrentAudioUrl(fallbackUrl);
        setCurrentFilename(generatedFilename);
        setCurrentFileSizeMb(estSize);

        const newItem: AudioHistoryItem = {
          id: `vox-${Date.now()}`,
          text: cleanText,
          voiceId: selectedVoice.id,
          voiceName: selectedVoice.name,
          speed,
          pitch,
          fileSizeMb: estSize,
          filename: generatedFilename,
          createdAt: Date.now(),
          audioUrl: fallbackUrl,
        };
        saveHistory([newItem, ...history]);
        showToast('Đã tạo xong tệp MP3! Bấm nút Phát để nghe.');
      } catch (fallbackErr) {
        setErrorMessage(err.message || 'Không thể tạo âm thanh. Vui lòng thử lại.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Share handler
  const handleShare = async (itemOverride?: AudioHistoryItem) => {
    const targetText = itemOverride ? itemOverride.text : text.trim();
    const targetVoiceName = itemOverride ? itemOverride.voiceName : selectedVoice.name;
    const targetVoiceId = itemOverride ? itemOverride.voiceId : selectedVoice.id;
    const targetSpeed = itemOverride ? itemOverride.speed : speed;
    const targetPitch = itemOverride ? itemOverride.pitch : pitch;

    try {
      const shareRes = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: targetText,
          voiceId: targetVoiceId,
          voiceName: targetVoiceName,
          speed: targetSpeed,
          pitch: targetPitch,
          audioBase64: currentAudioBase64 || '',
        }),
      });

      const shareData = await shareRes.json();
      if (shareData.success && shareData.shareId) {
        const fullUrl = `${window.location.origin}${window.location.pathname}?share=${shareData.shareId}`;
        setShareUrl(fullUrl);
        navigator.clipboard.writeText(fullUrl);
        setIsShareModalOpen(true);
        showToast('Đã tạo liên kết chia sẻ!');
        return;
      }
    } catch (_) {}

    const fallbackUrl = `${window.location.origin}${window.location.pathname}?text=${encodeURIComponent(
      targetText.slice(0, 100)
    )}`;
    setShareUrl(fallbackUrl);
    navigator.clipboard.writeText(fallbackUrl);
    setIsShareModalOpen(true);
    showToast('Đã sao chép liên kết chia sẻ!');
  };

  // Play from history
  const handlePlayHistory = (item: AudioHistoryItem) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (item.audioUrl) {
      setCurrentAudioUrl(item.audioUrl);
    } else {
      createClientMp3Blob(item.text, item.speed, item.pitch).then((blob) => {
        const url = URL.createObjectURL(blob);
        setCurrentAudioUrl(url);
      });
    }
    setText(item.text);
    const vox = voices.find((v) => v.id === item.voiceId) || voices[0];
    setSelectedVoice(vox);
    setSpeed(item.speed);
    setPitch(item.pitch);
    if (item.filename) setCurrentFilename(item.filename);
    if (item.fileSizeMb) setCurrentFileSizeMb(item.fileSizeMb);
    setCurrentlyPlayingId(item.id);
    showToast(`Đã nạp bản ghi ${item.voiceName}. Bấm Phát để nghe!`);
  };

  // Delete from history
  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveHistory(updated);
    showToast('Đã xóa bản ghi.');
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chuyển đổi?')) {
      saveHistory([]);
      showToast('Đã xóa toàn bộ lịch sử.');
    }
  };

  // Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText.slice(0, MAX_CHAR_LIMIT));
        showToast('Đã dán văn bản từ clipboard!');
      }
    } catch (_) {
      textareaRef.current?.focus();
    }
  };

  const sampleTexts = [
    {
      title: 'Trí tuệ nhân tạo (Mặc định)',
      text: INITIAL_TEXT,
    },
    {
      title: 'Bản tin kinh tế & công nghệ',
      text: 'Thị trường công nghệ tuần qua ghi nhận sự bùng nổ của các mô hình ngôn ngữ lớn ứng dụng trực tiếp vào chăm sóc khách hàng và sản xuất nội dung số. Các chuyên gia dự báo xu hướng này sẽ tiếp tục tăng trưởng mạnh mẽ trong giai đoạn tới.',
    },
    {
      title: 'Tản văn & Kể chuyện',
      text: 'Những buổi chiều tà nơi góc phố cũ luôn gợi lại bao ký ức thân thương. Tiếng lá rụng xào xạc theo từng cơn gió thoảng, mùi hương trà sen ấm nồng lan tỏa mang lại cảm giác bình yên đến lạ thường.',
    },
  ];

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans antialiased flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Top Navigation Bar matching image: VuDamNhu | TEXT TO SPEECH AI ... Studio | API & Docs | User Icon */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand lockup: VuDamNhu + small label TEXT TO SPEECH AI */}
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold tracking-tight text-neutral-950 font-sans">
              VuDamNhu
            </span>
            <div className="border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 rounded-xs text-[9px] font-mono uppercase tracking-wider text-neutral-600 font-medium leading-none">
              TEXT TO SPEECH<br />AI
            </div>
          </div>

          {/* Right Navigation: Studio | API & Docs | User Avatar */}
          <div className="flex items-center gap-6 text-xs text-neutral-600 font-medium">
            <button
              type="button"
              onClick={() => showToast('Đang ở chế độ Studio!')}
              className="hover:text-black transition-colors cursor-pointer"
            >
              Studio
            </button>
            <button
              type="button"
              onClick={() => showToast('Tài liệu API & Docs: /api/tts')}
              className="hover:text-black transition-colors cursor-pointer"
            >
              API & Docs
            </button>
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center cursor-pointer shadow-xs">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 flex-1">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-md bg-neutral-950 text-white text-xs font-medium shadow-xl border border-neutral-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Section matching image */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider">
                ENGINE
              </span>
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                NEURAL_V4 // ELEVENLABS PIPELINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              Chuyển đổi Text sang Giọng nói AI
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-600 pb-0.5">
            <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0" />
            <span>Hỗ trợ tối đa 2.000 ký tự • Giọng đọc ElevenLabs chất lượng cao</span>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="border border-red-200 bg-red-50 text-red-700 text-xs px-3.5 py-2.5 rounded-sm">
            {errorMessage}
          </div>
        )}

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: VĂN BẢN NGUỒN (SOURCE SCRIPT) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="border border-neutral-200 bg-white rounded-md p-4 shadow-xs space-y-3">
              {/* Box Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>VĂN BẢN NGUỒN (SOURCE SCRIPT)</span>
                </div>

                <div
                  className={`text-[11px] font-mono font-semibold tabular-nums ${
                    isOverLimit ? 'text-red-600 font-bold' : 'text-neutral-700'
                  }`}
                >
                  {charCount} / {MAX_CHAR_LIMIT} ký tự
                </div>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={9}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập hoặc dán văn bản tiếng Việt của bạn vào đây..."
                className="w-full text-xs sm:text-sm leading-relaxed text-neutral-800 placeholder-neutral-400 focus:outline-none resize-y min-h-[160px] border-none p-0 bg-transparent"
              />

              {/* Bottom Toolbar matching image: Dán văn bản | Xóa | Mẫu nhanh ... UTF-8 • LIVE */}
              <div className="border-t border-neutral-100 pt-2.5 flex items-center justify-between text-xs">
                {/* Left actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="flex items-center gap-1 text-[11px] font-medium text-neutral-700 hover:text-black bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-xs transition-colors cursor-pointer"
                  >
                    <Clipboard className="w-3 h-3" />
                    <span>Dán văn bản</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="flex items-center gap-1 text-[11px] font-medium text-neutral-700 hover:text-red-600 bg-neutral-50 hover:bg-red-50 border border-neutral-200 px-2 py-1 rounded-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa</span>
                  </button>

                  {/* Mẫu nhanh dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSamplesMenu(!showSamplesMenu)}
                      className="flex items-center gap-1 text-[11px] font-medium text-neutral-700 hover:text-black bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Mẫu nhanh</span>
                    </button>

                    {showSamplesMenu && (
                      <div className="absolute left-0 bottom-full mb-1 z-30 w-64 bg-white border border-neutral-200 rounded-sm shadow-md py-1 text-xs">
                        {sampleTexts.map((st, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setText(st.text);
                              setShowSamplesMenu(false);
                              showToast(`Đã áp dụng: ${st.title}`);
                            }}
                            className="px-3 py-1.5 hover:bg-neutral-100 cursor-pointer text-neutral-800"
                          >
                            <p className="font-semibold text-[11px]">{st.title}</p>
                            <p className="text-[10px] text-neutral-500 truncate">{st.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right status info: UTF-8 • LIVE */}
                <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400">
                  <span>UTF-8</span>
                  <div className="flex items-center gap-1 text-neutral-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-black inline-block animate-pulse" />
                    <span>LIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Action CTA Button: CHUYỂN THÀNH GIỌNG NÓI (TẠO MP3) */}
            <button
              type="button"
              disabled={isGenerating || isOverLimit || text.trim().length === 0}
              onClick={handleGenerate}
              className={`w-full py-3.5 px-4 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                isGenerating || isOverLimit || text.trim().length === 0
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-neutral-800 active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ĐANG TỔNG HỢP ÂM THANH...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>CHUYỂN THÀNH GIỌNG NÓI (TẠO MP3)</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: CẤU HÌNH ÂM THANH (Audio Config) */}
          <div className="lg:col-span-5">
            <AudioConfigPanel
              voices={voices}
              selectedVoice={selectedVoice}
              onSelectVoice={(v) => setSelectedVoice(v)}
              speed={speed}
              setSpeed={setSpeed}
              pitch={pitch}
              setPitch={setPitch}
            />
          </div>
        </div>

        {/* Player Section matching image: TỆP PHÁT ÂM THANH ĐÃ TẠO (READY) */}
        <div ref={playerRef}>
          <AudioPlayer
            audioUrl={currentAudioUrl}
            voiceName={selectedVoice.name}
            sourceText={text}
            speed={speed}
            filename={currentFilename}
            fileSizeMb={currentFileSizeMb}
            onShare={() => handleShare()}
          />
        </div>

        {/* History Section matching image: Lịch sử chuyển đổi gần đây */}
        <div>
          <HistoryList
            history={history}
            onPlayItem={handlePlayHistory}
            onDeleteItem={handleDeleteHistory}
            onClearHistory={handleClearHistory}
            onShareItem={(item) => handleShare(item)}
            currentlyPlayingId={currentlyPlayingId}
          />
        </div>
      </main>

      {/* Footer matching image: VOXFLOW AUDIO CORE • v2.4.0-monochrome ... © 2025 VoxFlow Technologies */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-600">VOXFLOW AUDIO CORE</span>
            <span>•</span>
            <span>v2.4.0-monochrome</span>
          </div>

          <div>
            © 2025 VoxFlow Technologies. Precision Acoustic Engine.
          </div>
        </div>
      </footer>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        voiceName={selectedVoice.name}
        snippet={text.slice(0, 100)}
      />
    </div>
  );
}
