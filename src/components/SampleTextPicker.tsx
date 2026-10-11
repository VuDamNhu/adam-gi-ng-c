import React from 'react';
import { BookOpen } from 'lucide-react';

interface SampleTextPickerProps {
  onSelectSample: (text: string) => void;
}

const SAMPLES = [
  {
    title: 'Thời sự & Công nghệ',
    text: 'Trí tuệ nhân tạo đang mở ra một kỷ nguyên mới cho ngành sản xuất nội dung số. Giờ đây, những công cụ chuyển đổi giọng nói tự nhiên từ ElevenLabs giúp người dùng dễ dàng tạo ra những bản tin audio chất lượng phòng thu chỉ trong vài giây, tiết kiệm tối đa thời gian và chi phí.',
  },
  {
    title: 'Văn chương & Tản văn',
    text: 'Hà Nội những sớm đầu thu luôn mang trong mình một nét dịu dàng khó tả. Gió heo may se lạnh luồn qua từng tán cây cổ thụ, hương hoa sữa thoang thoảng nơi góc phố quen. Đôi khi, chỉ cần dừng lại một nhịp, lắng nghe hơi thở của đất trời, ta lại thấy lòng mình bình yên đến lạ kỳ.',
  },
  {
    title: 'Triết lý & Động lực',
    text: 'Hành trình vạn dặm luôn khởi đầu từ một bước chân nhỏ bé. Đừng chờ đợi một thời điểm hoàn hảo, bởi vì thời điểm hoàn hảo nhất chính là ngay lúc này. Hãy kiên trì với mục tiêu của bạn mỗi ngày, bởi sự nỗ lực không ngừng nghỉ sẽ luôn đem lại quả ngọt xứng đáng.',
  },
  {
    title: 'Thông báo & Chuyên nghiệp',
    text: 'Kính chào quý khách hàng! Chúng tôi xin trân trọng thông báo phiên bản nâng cấp dịch vụ đã chính thức đi vào hoạt động. Với hệ thống tối ưu hóa và chất lượng âm thanh vượt trội, chúng tôi cam kết mang đến cho quý khách trải nghiệm hài lòng nhất.',
  },
];

export const SampleTextPicker: React.FC<SampleTextPickerProps> = ({ onSelectSample }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1 mr-1">
        <BookOpen className="w-3 h-3" /> Mẫu nhanh:
      </span>
      {SAMPLES.map((sample) => (
        <button
          key={sample.title}
          type="button"
          onClick={() => onSelectSample(sample.text)}
          className="px-2.5 py-1 text-xs text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
        >
          {sample.title}
        </button>
      ))}
    </div>
  );
};
