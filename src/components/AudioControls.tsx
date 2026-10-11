import React, { useState } from 'react';
import { Sliders, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface AudioControlsProps {
  speed: number;
  setSpeed: (speed: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  stability: number;
  setStability: (stability: number) => void;
  similarityBoost: number;
  setSimilarityBoost: (boost: number) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  speed,
  setSpeed,
  pitch,
  setPitch,
  stability,
  setStability,
  similarityBoost,
  setSimilarityBoost,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const resetAll = () => {
    setSpeed(1.0);
    setPitch(0);
    setStability(0.5);
    setSimilarityBoost(0.75);
  };

  const getPitchLabel = (val: number): string => {
    if (val < -0.1) return 'Trầm ấm';
    if (val > 0.1) return 'Trong trẻo / Cao';
    return 'Chuẩn tự nhiên';
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-neutral-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
            Tùy chỉnh thông số giọng đọc
          </h3>
        </div>

        <button
          onClick={resetAll}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          title="Đặt lại các thông số về mặc định"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speed / Tốc độ đọc */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-neutral-700">Tốc độ đọc (Speed)</span>
            <span className="font-mono tabular-nums font-semibold text-neutral-900">
              {speed.toFixed(2)}x
            </span>
          </div>

          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.05}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between items-center text-[11px] text-neutral-400">
            <span>0.5x (Chậm)</span>
            <div className="flex gap-1.5">
              {[0.8, 1.0, 1.25, 1.5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSpeed(preset)}
                  className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                    speed === preset
                      ? 'bg-neutral-900 text-white font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>
            <span>2.0x (Nhanh)</span>
          </div>
        </div>

        {/* Pitch / Cao độ giọng nói */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-neutral-700">Cao độ giọng nói (Pitch)</span>
            <span className="font-mono tabular-nums font-semibold text-neutral-900">
              {pitch > 0 ? `+${(pitch * 100).toFixed(0)}%` : `${(pitch * 100).toFixed(0)}%`}{' '}
              <span className="text-neutral-400 font-normal text-[11px]">({getPitchLabel(pitch)})</span>
            </span>
          </div>

          <input
            type="range"
            min={-0.5}
            max={0.5}
            step={0.05}
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between items-center text-[11px] text-neutral-400">
            <span>-50% (Trầm)</span>
            <div className="flex gap-1.5">
              {[-0.3, 0, 0.3].map((pVal) => (
                <button
                  key={pVal}
                  type="button"
                  onClick={() => setPitch(pVal)}
                  className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                    pitch === pVal
                      ? 'bg-neutral-900 text-white font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {pVal === 0 ? 'Chuẩn' : pVal < 0 ? 'Trầm' : 'Cao'}
                </button>
              ))}
            </div>
            <span>+50% (Trong/Cao)</span>
          </div>
        </div>
      </div>

      {/* Advanced ElevenLabs Tuning (Stability & Similarity Boost) */}
      <div className="border-t border-neutral-100 pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
        >
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>Tùy chỉnh chất lượng âm thanh ElevenLabs (Độ ổn định & Độ rõ nét)</span>
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-2 bg-neutral-50 p-3 rounded-lg">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-600 font-medium">Độ ổn định (Stability)</span>
                <span className="font-mono tabular-nums text-neutral-900 font-semibold">
                  {(stability * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[11px] text-neutral-400">
                Cao hơn: giọng đọc đều đặn, ít biến tấu. Thấp hơn: giàu biểu cảm hơn.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-600 font-medium">Độ rõ nét & tương đồng (Clarity)</span>
                <span className="font-mono tabular-nums text-neutral-900 font-semibold">
                  {(similarityBoost * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={similarityBoost}
                onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[11px] text-neutral-400">
                Tăng cường độ chi tiết của âm sắc và phát âm tiếng Việt sắc nét.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
