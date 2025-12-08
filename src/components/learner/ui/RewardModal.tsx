import React from 'react';
import '../css/RewardModal.css'; // Chúng ta sẽ tạo file này ở Bước 2
import type { StickerRes } from '../../../api/shop';

// Định nghĩa kiểu dữ liệu Sticker (khớp với Backend trả về)
// interface Sticker {
//   id: number;
//   name: string;
//   imageUrl: string;
//   rarity: string;
// }

interface RewardModalProps {
  isOpen: boolean;
  sticker: StickerRes | null;
  onClose: () => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ isOpen, sticker, onClose }) => {
  if (!isOpen || !sticker) return null;

  return (
    <div className="reward-overlay">
      <div className="reward-container">
        {/* Hiệu ứng ánh sáng nền */}
        <div className="reward-shine"></div>
        
        <h2 className="reward-title">CHÚC MỪNG BÉ! 🎉</h2>
        <p className="reward-subtitle">Bé vừa nhận được Sticker mới:</p>
        
        <div className="reward-card">
          <img src={sticker.imgUrl} alt={sticker.name} className="reward-image" />
          <div className="reward-name">{sticker.name}</div>
          <div className="reward-rarity">{sticker.rarity}</div>
        </div>

        <button className="reward-btn" onClick={onClose}>
          NHẬN QUÀ & VỀ NHÀ
        </button>
      </div>
      
      {/* Hiệu ứng pháo giấy (CSS pure) */}
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
    </div>
  );
};

export default RewardModal;