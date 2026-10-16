import React from 'react';
import { getStoredUserName } from '../../utils/cookie.js';
import './StickerReaction.css';

/**
 * Định dạng bình luận của sticker kèm tên người dùng một cách tự nhiên
 */
export function formatWithUserName(text, userName) {
  if (!text || typeof text !== 'string') return text;
  if (!userName) return text.replace(/{name}/g, '').trim();

  // 1. Nếu chuỗi đã có placeholder {name} thì thay thế chính xác
  if (text.includes('{name}')) {
    return text.replace(/{name}/g, userName);
  }

  // 2. Nếu chuỗi đã chứa tên người dùng thì giữ nguyên
  if (text.includes(userName)) {
    return text;
  }

  // 3. Tự động chèn tên vào câu theo ngữ điệu tiếng Việt tự nhiên
  if (text.endsWith('!!')) {
    return `${text.slice(0, -2)} ${userName} ơi!!`;
  }
  if (text.endsWith('!')) {
    return `${text.slice(0, -1)} ${userName} ơi!`;
  }
  return `${userName} ơi, ${text}`;
}

export const STICKER_CONFIGS = {
  cheer: {
    src: '/stickers/cheer.png',
    alt: 'Anh em thi thử nhé 0.0',
    getDefaultText: (name) => (name ? `${name} ơi, thi thử nhé 0.0` : 'Anh em thi thử nhé 0.0'),
    mood: 'cheer',
    color: '#4a82b8'
  },
  thinking: {
    src: '/stickers/thinking.png',
    alt: 'Mèo gãi đầu suy nghĩ',
    getDefaultText: (name) => (name ? `${name} đang suy nghĩ, gãi đầu tìm từ...` : 'Đang suy nghĩ, gãi đầu tìm từ...'),
    mood: 'thinking',
    color: '#d97706'
  },
  determined: {
    src: '/stickers/determined.png',
    alt: 'Bé cánh cụt quyết tâm',
    getDefaultText: (name) => (name ? `Quá đỉnh ${name} ơi! Thuộc làu làu 100%!` : 'Quá đỉnh! Thuộc làu làu 100%!'),
    mood: 'determined',
    color: '#15803d'
  },
  shocked: {
    src: '/stickers/shocked.png',
    alt: 'Cánh cụt hoảng hốt !!',
    getDefaultText: (name) => (name ? `Ối ${name} ơi sai mất rồi!!` : 'Ối làng nước ơi sai mất rồi!!'),
    mood: 'shocked',
    color: '#dc2626'
  },
  angry: {
    src: '/stickers/angry.png',
    alt: 'Cánh cụt quạu',
    getDefaultText: (name) => (name ? `Quạu thật đấy ${name}! Phải phục thù ngay!` : 'Quạu thật đấy! Phải phục thù ngay!'),
    mood: 'angry',
    color: '#991b1b'
  },
  wake_up: {
    src: '/stickers/wake_up.png',
    alt: 'Cánh cụt cầm súng: Tỉnh táo lên!!!',
    getDefaultText: (name) => (name ? `Tỉnh táo lên ${name} ơi! Cố lên nào, đừng bỏ trống chứ!` : 'Tỉnh táo lên! Cố lên nào, đừng bỏ trống chứ!'),
    mood: 'wake_up',
    color: '#b91c1c'
  }
};

/**
 * Chọn sticker phù hợp với kết quả điểm số kèm chèn tên người dùng từ cookie
 */
export function getStickerByScore(accuracy, isPerfect = false, wrongCount = 0, explicitName, isEmpty = false) {
  const name = explicitName !== undefined ? explicitName : getStoredUserName();
  const nameSuffix = name ? ` ${name} ơi` : '';
  const namePrefix = name ? `${name} ơi, ` : '';

  if (isEmpty) {
    return {
      type: 'wake_up',
      text: `Tỉnh táo lên${nameSuffix}! Cố lên nào, đừng bỏ trống chứ!`
    };
  }

  if (isPerfect || accuracy === 100) {
    return {
      type: 'determined',
      text: `Quá xuất sắc${nameSuffix}! Bạn đã thuộc lòng 100%!`
    };
  }
  if (accuracy >= 80) {
    return {
      type: 'cheer',
      text: `Khá lắm${nameSuffix}! Cố thêm xíu nữa là 100%!`
    };
  }
  if (accuracy >= 50) {
    return {
      type: 'thinking',
      text: `${namePrefix}hơi lú một chút! Gãi đầu xem lại từ nào sai nhé.`
    };
  }
  if (wrongCount >= 3 || accuracy < 30) {
    return {
      type: 'angry',
      text: `Quạu ghê${nameSuffix}! Sai hơi nhiều, chép lại ngay cho nhớ!`
    };
  }
  return {
    type: 'shocked',
    text: `Ối${nameSuffix}!! Nhầm mất một số từ rồi!`
  };
}

export default function StickerReaction({
  type = 'cheer',
  text,
  userName,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  layout = 'horizontal', // 'horizontal' | 'vertical' | 'badge'
  animate = 'pop', // 'pop' | 'bounce' | 'wiggle' | 'shake' | 'none'
  className = '',
  onClick
}) {
  const cfg = STICKER_CONFIGS[type] || STICKER_CONFIGS.cheer;
  const currentUserName = userName !== undefined ? userName : getStoredUserName();

  let displayText = text;
  if (displayText === undefined) {
    displayText = cfg.getDefaultText ? cfg.getDefaultText(currentUserName) : cfg.defaultText;
  } else if (typeof displayText === 'string') {
    displayText = formatWithUserName(displayText, currentUserName);
  }

  return (
    <div
      className={`sticker-reaction-wrap sticker-${type} size-${size} layout-${layout} anim-${animate} ${className}`}
      onClick={onClick}
    >
      <div className="sticker-img-container">
        <img
          src={cfg.src}
          alt={cfg.alt}
          className="sticker-img"
          loading="lazy"
          draggable="false"
        />
      </div>

      {displayText && (
        <div className="sticker-bubble">
          <span className="sticker-speech-arrow" />
          <span className="sticker-text">{displayText}</span>
        </div>
      )}
    </div>
  );
}
