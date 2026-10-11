import React, { useState } from 'react';
import { SlidersHorizontal, Volume2, Radio } from 'lucide-react';
import { Voice } from '../types';
import { speakWithBrowserSynthesis } from '../utils/audioEncoder';

interface AudioConfigPanelProps {
  voices: Voice[];
  selectedVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
}

export const AudioConfigPanel: React.FC<AudioConfigPanelProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  speed,
  setSpeed,
  pitch,
  setPitch,
}) => {
  const [filterGender, setFilterGender] = useState<'ALL' | 'Nam' | 'Nữ'>('ALL');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  const filteredVoices = voices.filter((v) => {
    if (filterGender === 'ALL') return true;
    return v.gender === filterGender;
  });

  const handlePreviewVoice = (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();

    // If already previewing this voice, clicking again immediately stops it
    if (previewingVoiceId === voice.id) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPreviewingVoiceId(null);
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setPreviewingVoiceId(voice.id);
    speakWithBrowserSynthesis(voice.sample, speed, 1 + pitch * 0.4, () => {
      setPreviewingVoiceId(null);
    });
  };

  // Convert pitch (-0.5 to 0.5) to semitones display (-5 st to +5 st)
  const pitchSemitones = Math.round(pitch * 10);

  return (
    <div className="border border-neutral-200 bg-white rounded-md p-4 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>CẤU HÌNH ÂM THANH</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            Chọn giọng đọc (Voice Model) • {voices.length} giọng AI
          </span>
        </div>

        <span className="font-mono text-[10px] uppercase text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-xs border border-neutral-200">
          MODEL: MULTI-V2
        </span>
      </div>

      {/* Gender filter tabs */}
      <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
        <span className="text-neutral-400 text-[10px] uppercase">Lọc giọng:</span>
        <div className="flex items-center gap-1 bg-neutral-50 p-0.5 rounded border border-neutral-200">
          <button
            type="button"
            onClick={() => setFilterGender('ALL')}
            className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
              filterGender === 'ALL'
                ? 'bg-black text-white font-bold'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Tất cả ({voices.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterGender('Nam')}
            className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
              filterGender === 'Nam'
                ? 'bg-black text-white font-bold'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Nam ({voices.filter((v) => v.gender === 'Nam').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterGender('Nữ')}
            className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
              filterGender === 'Nữ'
                ? 'bg-black text-white font-bold'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Nữ ({voices.filter((v) => v.gender === 'Nữ').length})
          </button>
        </div>
      </div>

      {/* Voice Selection List: Shows ALL voices in clean scrollable list */}
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
        {filteredVoices.map((voice) => {
          const isSelected = voice.id === selectedVoice.id;
          const isPreviewing = previewingVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice)}
              className={`flex items-center justify-between p-2.5 rounded-sm border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Shortcode Badge */}
                <div
                  className={`w-7 h-7 rounded-xs font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-800'
                  }`}
                >
                  {voice.shortCode || voice.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">{voice.name}</span>
                    {voice.categoryTag && (
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 rounded-xs uppercase tracking-wider ${
                          isSelected
                            ? 'border border-neutral-600 bg-neutral-900 text-neutral-200'
                            : 'border border-neutral-200 bg-neutral-50 text-neutral-600'
                        }`}
                      >
                        {voice.categoryTag}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isSelected ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    {voice.desc}
                  </p>
                </div>
              </div>

              {/* Speaker Preview Button */}
              <button
                type="button"
                onClick={(e) => handlePreviewVoice(e, voice)}
                className={`p-1.5 rounded-xs transition-colors shrink-0 cursor-pointer ml-2 ${
                  isSelected
                    ? 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                    : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                }`}
                title="Nghe thử giọng này"
              >
                <Volume2
                  className={`w-4 h-4 ${isPreviewing ? 'animate-pulse text-amber-400' : ''}`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Sliders Area */}
      <div className="space-y-4 pt-1">
        {/* Speed Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-medium text-neutral-800">
            <span>Tốc độ đọc (Speed)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-neutral-900 tabular-nums">
                {speed.toFixed(1)}x
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">2.0x</span>
            </div>
          </div>

          {/* Slider input */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-1 bg-neutral-200 rounded-xs appearance-none cursor-pointer accent-black"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
            <span>Chậm rãi</span>
            <button
              type="button"
              onClick={() => setSpeed(1.0)}
              className="text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
            >
              Đặt lại (1.0x)
            </button>
            <span>Nhanh</span>
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-medium text-neutral-800">
            <span>Cao độ giọng (Pitch)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-neutral-900 tabular-nums">
                {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} st
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">+5</span>
            </div>
          </div>

          {/* Slider input */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={-0.5}
              max={0.5}
              step={0.05}
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-1 bg-neutral-200 rounded-xs appearance-none cursor-pointer accent-black"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
            <span>Trầm hơn</span>
            <button
              type="button"
              onClick={() => setPitch(0)}
              className="text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
            >
              Đặt lại (0)
            </button>
            <span>Bổng hơn</span>
          </div>
        </div>
      </div>

      {/* Footer info: 44.1kHz / 192kbps CBR | MP3 HIGH FIDELITY */}
      <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-[10px] font-mono text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-neutral-500" />
          <span>44.1kHz / 192kbps CBR</span>
        </div>
        <span className="tracking-wider uppercase font-semibold text-neutral-500">
          MP3 HIGH FIDELITY
        </span>
      </div>
    </div>
  );
};
