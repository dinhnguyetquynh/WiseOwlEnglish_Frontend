import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import GameCard, { type GameCardProps } from "../../../components/learner/ui/GameCard";
import "../css/GameSelectPage.css";

/* Icon SVG thuần, có thể thay bằng <img src="..."/> */
const ImageIcon = () => (
  <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="6" y="8" width="36" height="28" rx="6"></rect>
    <circle cx="18" cy="20" r="4"></circle>
    <path d="M10 30l8-8 7 7 6-6 7 7"></path>
  </svg>
);
const HeadphoneIcon = () => (
  <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 24a14 14 0 0 1 28 0"></path>
    <path d="M8 26v8a6 6 0 0 0 6 6h2V26h-2a6 6 0 0 0-6 6"></path>
    <path d="M40 26v8a6 6 0 0 1-6 6h-2V26h2a6 6 0 0 1 6 6"></path>
  </svg>
);

export default function GameSelectPage() {
  const nav = useNavigate();
  const { unitId = "" } = useParams();       // /games/select/:unitId?
  const [sp] = useSearchParams();
  const unitIdQuery = sp.get("unitId");
  const resolvedUnitId = useMemo(() => unitId || unitIdQuery || "", [unitId, unitIdQuery]);

  // ✅ chỉ cần thêm 1 object nữa là có game mới
  const GAMES: Array<Omit<GameCardProps, "onClick"> & { onClick: () => void }> = [
    {
      title: "Nhìn Hình Chọn Chữ",
      description: "Luyện trí nhớ và nhận biết mặt chữ. Nhìn hình và chọn từ đúng!",
      ctaLabel: "CHƠI NGAY!",
      icon: <ImageIcon />,
      accent: "green",
      onClick: () => {
        resolvedUnitId ? nav(`/games/picture-guessing/${resolvedUnitId}`) : nav(`/games/picture-guessing`);
      },
    },
    {
      title: "Nghe & Chọn Chữ",
      description: "Nghe âm thanh và chọn chữ phù hợp để tăng cường kỹ năng nghe.",
      ctaLabel: "CHƠI NGAY!",
      icon: <HeadphoneIcon />,
      accent: "purple",
      onClick: () => {
        resolvedUnitId ? nav(`/games/sound-word/${resolvedUnitId}`) : nav(`/games/sound-word`);
      },
    },
    // ví dụ game khóa/chưa ra mắt:
    // {
    //   title: "Xếp Chữ Thành Từ",
    //   description: "Kéo thả các chữ cái để ghép thành từ đúng.",
    //   ctaLabel: "SẮP RA MẮT",
    //   accent: "blue",
    //   icon: <span>🔤</span>,
    //   onClick: () => {},
    //   disabled: true,
    // },
  ];

  return (
    <div className="gs-wrap">
      <header className="gs-header">
        <h1 className="gs-title"><span>🌟</span> Sẵn Sàng Học Chưa? <span>🌟</span></h1>
        <p className="gs-subtitle">Chọn trò chơi bạn muốn chinh phục hôm nay!</p>
      </header>

      <section className="gs-list">
        {GAMES.map((g, i) => (
          <GameCard key={i} {...g} />
        ))}
      </section>

      <footer className="gs-footer">🎉 Chúc Bé Học Vui! 🎉</footer>
    </div>
  );
}
