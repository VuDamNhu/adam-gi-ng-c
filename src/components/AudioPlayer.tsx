import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Download, Link as LinkIcon, Check } from 'lucide-react';
import { formatTime, downloadMp3File, getDownloadFilename } from '../utils/audioEncoder';

interface AudioPlayerProps {
  audioUrl: string | null;
  voiceName: string;
  sourceText: string;
  onShare: () => void;
  speed: number;
  filename?: string;
  fileSizeMb?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  voiceName,
  sourceText,
  onShare,
  filename = 'VOX-202505-8831.MP3',
  fileSizeMb = '1.84 MB',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // When a new audioUrl is loaded, pause and reset to 00:00 (DO NOT auto-play!)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      audioRef.current.load();
    }
  }, [audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const d = audioRef.current.duration || 0;
      setDuration(d);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Play / Pause toggle: stops and resumes exactly at currentTime
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    // Cancel any speech synthesis in the background
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  // Stop button: pauses and rewinds to 00:00
  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Seeking via waveform bar click
  const handleSeekByBar = (percent: number) => {
    if (!audioRef.current || duration === 0) return;
    const newTime = (percent / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Seeking via slider scrub bar
  const handleSeekSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const dlName = getDownloadFilename(voiceName, sourceText);
    downloadMp3File(audioUrl, dlName);
  };

  const handleCopyLink = () => {
    onShare();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

  // 42 stylized vertical waveform bars matching image
  const barHeights = [
    14, 18, 28, 38, 22, 16, 32, 44, 40, 24, 18, 30, 42, 36, 20, 16,
    28, 48, 52, 34, 20, 36, 44, 26, 18, 32, 40, 28, 16, 24, 38, 46,
    30, 18, 26, 36, 24, 16, 28, 34, 20, 14,
  ];

  if (!audioUrl) {
    return (
      <div className="border border-neutral-200 bg-white rounded-md p-6 text-center shadow-xs">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2 border-b border-neutral-100 pb-2">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-neutral-700">
            <span className="w-2.5 h-2.5 bg-neutral-400 inline-block rounded-xs" />
            TỆP PHÁT ÂM THANH ĐÃ TẠO (CHỜ XỬ LÝ)
          </div>
          <span className="font-mono text-[11px] text-neutral-400">CHƯA CÓ DỮ LIỆU</span>
        </div>
        <p className="text-xs text-neutral-500 py-4">
          Nhập văn bản và nhấn &quot;CHUYỂN THÀNH GIỌNG NÓI (TẠO MP3)&quot; để tạo tệp âm thanh.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 bg-white rounded-md p-4 shadow-xs space-y-3">
      {/* Hidden audio element with synchronized event listeners */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 inline-block rounded-xs ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-900'}`} />
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-neutral-900">
            TỆP PHÁT ÂM THANH ĐÃ TẠO ({isPlaying ? 'ĐANG PHÁT' : 'READY'})
          </h4>
          <span className="bg-neutral-100 text-neutral-700 font-mono text-[11px] px-2 py-0.5 rounded-sm border border-neutral-200">
            {filename}
          </span>
        </div>

        <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
          Kích thước: {fileSizeMb} • Giọng: <span className="font-semibold text-neutral-800">{voiceName}</span>
        </div>
      </div>

      {/* Main Player Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        {/* Play & Stop Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={togglePlay}
            className="w-9 h-9 bg-black text-white hover:bg-neutral-800 active:scale-95 rounded-sm flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title={isPlaying ? 'Tạm dừng (Pause)' : 'Phát âm thanh (Play)'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleStop}
            className="w-9 h-9 border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 active:scale-95 rounded-sm flex items-center justify-center transition-all cursor-pointer"
            title="Dừng phát và quay về đầu (Stop)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Center: Waveform + Interactive Scrub Bar + Timers */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Waveform graphic with click-to-seek */}
          <div
            className="h-10 w-full flex items-center justify-between gap-0.5 cursor-pointer bg-neutral-50/70 p-1.5 rounded-sm border border-neutral-100 hover:bg-neutral-100/50 transition-colors"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const pct = (clickX / rect.width) * 100;
              handleSeekByBar(Math.max(0, Math.min(100, pct)));
            }}
            title="Nhấp vào bất kỳ vị trí nào để nhảy đến đoạn đó"
          >
            {barHeights.map((h, idx) => {
              const barPct = (idx / barHeights.length) * 100;
              const isPassed = barPct <= progressPercent;
              return (
                <div
                  key={idx}
                  className="flex-1 flex items-center justify-center h-full"
                >
                  <span
                    style={{ height: `${h}%` }}
                    className={`w-0.5 rounded-xs transition-colors duration-100 ${
                      isPassed ? 'bg-black' : 'bg-neutral-300'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Interactive Scrub Range Slider */}
          <div className="px-0.5">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeekSlider}
              className="w-full h-1 bg-neutral-200 rounded-xs appearance-none cursor-pointer accent-black block"
              title="Kéo để tua nhanh hoặc lùi lại chính xác"
            />
          </div>

          {/* Time markers: Left: currentTime | Center: Tiến trình % | Right: duration */}
          <div className="flex justify-between items-center text-[11px] font-mono tabular-nums text-neutral-500 px-0.5">
            <span className="font-semibold text-neutral-800">{formatTime(currentTime)}</span>
            <span className="text-neutral-600 font-sans text-[11px]">
              Tiến trình: <strong className="font-mono text-neutral-900">{progressPercent}%</strong>
            </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Action Buttons: Tải xuống MP3 & Sao chép link */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-sm shadow-xs transition-colors cursor-pointer"
            title="Tải xuống tệp MP3"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải xuống MP3</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-sm transition-colors cursor-pointer"
            title="Sao chép đường dẫn chia sẻ"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã chép link</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Sao chép link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
