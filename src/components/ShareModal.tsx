import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Link2, Music } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  voiceName: string;
  snippet: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  voiceName,
  snippet,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-neutral-200 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Chia sẻ tệp âm thanh</h3>
              <p className="text-xs text-neutral-500">Đường dẫn truy cập nhanh</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview snippet card */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-medium text-neutral-700">
            <Music className="w-3.5 h-3.5 text-neutral-500" />
            <span>Giọng đọc {voiceName} (ElevenLabs)</span>
          </div>
          <p className="text-neutral-500 line-clamp-2 italic">
            &ldquo;{snippet}&rdquo;
          </p>
        </div>

        {/* Share Link Input with Copy button */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-700">
            Liên kết trực tiếp:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex items-center justify-between text-xs border-t border-neutral-100">
          <span className="text-neutral-400">
            Bất kỳ ai có liên kết đều có thể nghe và tải tệp MP3.
          </span>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-neutral-800 font-medium hover:underline shrink-0 ml-2"
          >
            <span>Mở thử</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
