import React, { useState } from 'react';
import { History, Play, Download, Trash2, Link as LinkIcon, Music2, Check } from 'lucide-react';
import { AudioHistoryItem } from '../types';
import { downloadMp3File, getDownloadFilename } from '../utils/audioEncoder';

interface HistoryListProps {
  history: AudioHistoryItem[];
  onPlayItem: (item: AudioHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onShareItem: (item: AudioHistoryItem) => void;
  currentlyPlayingId?: string | null;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onPlayItem,
  onDeleteItem,
  onClearHistory,
  onShareItem,
  currentlyPlayingId,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const d = new Date(timestamp);
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (diffMinutes < 5) return `Vừa xong (${timeStr})`;
    if (diffMinutes < 60) return `${diffMinutes} phút trước (${timeStr})`;

    const isToday = new Date().toDateString() === d.toDateString();
    if (isToday) return `Hôm nay (${timeStr})`;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === d.toDateString()) return `Hôm qua (${timeStr})`;

    const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (daysAgo <= 7) return `${daysAgo} ngày trước`;

    return d.toLocaleDateString('vi-VN');
  };

  const handleCopyLink = (item: AudioHistoryItem) => {
    onShareItem(item);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="border border-neutral-200 bg-white rounded-md p-4 shadow-xs space-y-3">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-neutral-800" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            Lịch sử chuyển đổi gần đây
          </h3>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-neutral-500 uppercase">
            LƯU CỤC BỘ: {history.length} BẢN GHI
          </span>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-neutral-500 hover:text-black underline cursor-pointer"
            >
              Xóa lịch sử
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-neutral-400 text-xs">
          Chưa có bản ghi nào trong lịch sử. Các đoạn âm thanh bạn tạo sẽ xuất hiện tại đây.
        </div>
      ) : (
        /* Table matching design in image.png */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                <th className="py-2 pr-4 font-medium">ĐOẠN VĂN BẢN</th>
                <th className="py-2 px-4 font-medium">GIỌNG ĐỌC & THAM SỐ</th>
                <th className="py-2 px-4 font-medium">THỜI GIAN TẠO</th>
                <th className="py-2 pl-4 text-right font-medium">THAO TÁC NHANH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {history.map((item) => {
                const isPlaying = currentlyPlayingId === item.id;
                const pitchSemitones = Math.round(item.pitch * 10);
                const pitchStr = pitchSemitones >= 0 ? `+${pitchSemitones}st` : `${pitchSemitones}st`;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-neutral-50/80 transition-colors ${
                      isPlaying ? 'bg-neutral-50 font-medium' : ''
                    }`}
                  >
                    {/* Text Snippet */}
                    <td className="py-3 pr-4 max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-2">
                        <Music2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate text-neutral-800 text-xs font-normal">
                          {item.text}
                        </span>
                      </div>
                    </td>

                    {/* Voice & Params */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-neutral-600">
                      <span className="font-semibold text-neutral-800">{item.voiceName}</span>{' '}
                      <span className="text-neutral-400">{item.speed.toFixed(1)}x / {pitchStr}</span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-neutral-500">
                      {formatRelativeTime(item.createdAt)}
                    </td>

                    {/* Quick Actions matching image: Play button, MP3 button, Link button */}
                    <td className="py-3 pl-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* Play button */}
                        <button
                          type="button"
                          onClick={() => onPlayItem(item)}
                          className="w-7 h-7 flex items-center justify-center border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-800 rounded-xs transition-colors cursor-pointer"
                          title="Phát lại"
                        >
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </button>

                        {/* MP3 Download button */}
                        <button
                          type="button"
                          onClick={() => {
                            const dlName = getDownloadFilename(item.voiceName, item.text);
                            downloadMp3File(item.audioUrl, dlName);
                          }}
                          className="h-7 px-2 flex items-center gap-1 border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-800 text-[11px] font-mono rounded-xs transition-colors cursor-pointer"
                          title="Tải tệp MP3"
                        >
                          <Download className="w-3 h-3" />
                          <span>MP3</span>
                        </button>

                        {/* Copy Link / Share button */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(item)}
                          className="w-7 h-7 flex items-center justify-center border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-800 rounded-xs transition-colors cursor-pointer"
                          title="Sao chép đường dẫn chia sẻ"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <LinkIcon className="w-3 h-3" />
                          )}
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center border border-neutral-200 bg-white hover:text-red-600 hover:border-red-200 text-neutral-400 rounded-xs transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
