import React from 'react';
import { Radio, Play, Plus } from 'lucide-react';

interface SharedBannerProps {
  voiceName: string;
  onPlayShared: () => void;
  onCreateNew: () => void;
}

export const SharedBanner: React.FC<SharedBannerProps> = ({
  voiceName,
  onPlayShared,
  onCreateNew,
}) => {
  return (
    <div className="rounded-xl bg-neutral-900 text-white p-4 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">
            Đang mở tệp âm thanh được chia sẻ ({voiceName})
          </h3>
          <p className="text-xs text-neutral-300">
            Nội dung và bản thu MP3 đã được tải sẵn. Bạn có thể nghe ngay hoặc tải về máy.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={onPlayShared}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Nghe ngay</span>
        </button>

        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo bản mới</span>
        </button>
      </div>
    </div>
  );
};
