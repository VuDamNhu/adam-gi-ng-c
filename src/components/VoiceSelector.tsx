import React, { useState } from 'react';
import { Volume2, Check, User } from 'lucide-react';
import { Voice } from '../types';
import { speakWithBrowserSynthesis } from '../utils/audioEncoder';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoiceId: string;
  onSelectVoice: (voice: Voice) => void;
  speed: number;
  pitch: number;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  speed,
  pitch,
}) => {
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  const handlePreviewVoice = (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();
    setPreviewingVoiceId(voice.id);

    // Play quick voice sample
    speakWithBrowserSynthesis(voice.sample, speed, 1 + pitch * 0.4, () => {
      setPreviewingVoiceId(null);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Chọn giọng đọc AI (ElevenLabs)
        </label>
        <span className="text-xs text-neutral-400">
          {voices.length} giọng tối ưu tiếng Việt
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {voices.map((voice) => {
          const isSelected = voice.id === selectedVoiceId;
          const isAdam = voice.name.toLowerCase() === 'adam';
          const isPreviewing = previewingVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice)}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm ring-1 ring-neutral-900'
                  : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{voice.name}</span>
                        {isAdam && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                              isSelected ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-amber-100 text-amber-900 font-medium'
                            }`}
                          >
                            Đề xuất
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {voice.gender} · {voice.tag}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white text-neutral-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className={`text-xs line-clamp-2 mt-1 leading-relaxed ${isSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  {voice.desc}
                </p>
              </div>

              {/* Sample preview button */}
              <div className="mt-3 pt-2.5 border-t border-dashed border-current/10 flex items-center justify-between">
                <span className={`text-[11px] ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                  {voice.name === 'Adam' ? 'Chuẩn ElevenLabs' : 'Đa ngôn ngữ v2'}
                </span>
                <button
                  type="button"
                  onClick={(e) => handlePreviewVoice(e, voice)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white hover:bg-white/25'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  title="Nghe thử câu thoại mẫu"
                >
                  <Volume2 className={`w-3 h-3 ${isPreviewing ? 'animate-pulse text-amber-300' : ''}`} />
                  <span>{isPreviewing ? 'Đang đọc...' : 'Nghe thử'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
