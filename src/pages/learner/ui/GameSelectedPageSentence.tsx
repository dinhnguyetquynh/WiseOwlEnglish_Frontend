import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import GameCard, { type GameCardProps } from "../../../components/learner/ui/GameCard";
import "../css/GameSelectPage.css";
import { getGamesForReview, type GameResByLesson } from "../../../api/game";

/* Icon SVG thuần, có thể thay bằng <img src="..."/> */
// const ImageIcon = () => (
//   <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="6" y="8" width="36" height="28" rx="6"></rect>
//     <circle cx="18" cy="20" r="4"></circle>
//     <path d="M10 30l8-8 7 7 6-6 7 7"></path>
//   </svg>
// );
// const HeadphoneIcon = () => (
//   <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M10 24a14 14 0 0 1 28 0"></path>
//     <path d="M8 26v8a6 6 0 0 0 6 6h2V26h-2a6 6 0 0 0-6 6"></path>
//     <path d="M40 26v8a6 6 0 0 1-6 6h-2V26h2a6 6 0 0 1 6 6"></path>
//   </svg>
// );
type MenuState = {
  unitName?: string;
  unitTitle?: string;
  title?: string;
};

// HÀM HELPER ĐỂ MAP GAMETYPE CỦA CÂU --- 
const getGameUIDetails = (game: GameResByLesson, unitId: string): Omit<GameCardProps, "onClick"> => {
  const iconImgClass = "gs-game-icon"; // Dùng chung class CSS

  switch (game.gameType) {
    case "SENTENCE_HIDDEN_WORD":
      return {
        title: game.title,
        description: "Luyện khả năng viết và nhớ cấu trúc câu.",
        ctaLabel: "CHƠI NGAY!",
        icon: <img 
                src="https://res.cloudinary.com/dxhhluk84/image/upload/v1762760731/comment_hg1pip.png" 
                alt={game.title} 
                className={iconImgClass} 
              />,
        accent: "green", // (Bạn có thể đổi màu)
      };
    case "PICTURE_SENTENCE_MATCHING":
      return {
        title: game.title,
        description: "Luyện khả ghi nhớ, nhìn hình và chọn câu mô tả đúng.",
        ctaLabel: "CHƠI NGAY!",
        icon: <img 
                src="https://res.cloudinary.com/dxhhluk84/image/upload/v1762758792/picture_ngfzyw.png" 
                alt={game.title} 
                className={iconImgClass} 
              />,
        accent: "green",
      };
    case "WORD_TO_SENTENCE":
      return {
        title: game.title,
        description: "Luyện khả năng nhớ và viết câu đúng ngữ pháp.",
        ctaLabel: "CHƠI NGAY!",
        icon: <img 
                src="https://res.cloudinary.com/dxhhluk84/image/upload/v1762760736/stacking-rings_pcozrs.png" 
                alt={game.title} 
                className={iconImgClass} 
              />,
        accent: "green",
      };
    default:
      return {
        title: game.title,
        description: `Game ôn tập (Loại: ${game.gameType})`,
        ctaLabel: "CHƠI",
        icon: <img 
                src="URL_CLOUDINARY_DEFAULT" 
                alt={game.title} 
                className={iconImgClass} 
              />,
        accent: "green",
      };
  }
};
// --- HÀM HELPER ĐỂ LẤY ROUTE CỦA CÂU --- 
const getGameRoute = (game: GameResByLesson, unitId: string): string => {
    switch (game.gameType) {
        case "SENTENCE_HIDDEN_WORD":
            return `/games/sentence-word-hidden/${unitId}`;
        case "PICTURE_SENTENCE_MATCHING":
            return `/games/picture-sentence/${unitId}`;
        case "WORD_TO_SENTENCE":
            return `/games/word-to-sentence/${unitId}`;
        default:
            return "#"; // Fallback
    }
}
export default function GameSelectedPageSentence() {
  const nav = useNavigate();
  const { unitId = "" } = useParams();       // /games/select/:unitId?
  const [sp] = useSearchParams();
  const unitIdQuery = sp.get("unitId");
  const resolvedUnitId = useMemo(() => unitId || unitIdQuery || "", [unitId, unitIdQuery]);
  const location = useLocation();

  const [games, setGames] = useState<GameResByLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedUnitId) {
        setError("Không tìm thấy ID bài học");
        setLoading(false);
        return;
    }
    
    let isMounted = true;
    setLoading(true);
    
    // 👈 GỌI API VỚI CATEGORY LÀ "sentence"
    getGamesForReview(Number(resolvedUnitId), "sentence") 
        .then(data => {
            if (isMounted) {
                setGames(data);
                setError(null);
            }
        })
        .catch(err => {
            if (isMounted) setError(err.message || "Lỗi tải danh sách game");
        })
        .finally(() => {
            if (isMounted) setLoading(false);
        });
        
    return () => { isMounted = false; };
  }, [resolvedUnitId]);
  
  // ✅ chỉ cần thêm 1 object nữa là có game mới
  // const GAMES: Array<Omit<GameCardProps, "onClick"> & { onClick: () => void }> = [
  //   {
  //     title: "Điền từ còn thiếu trong câu",
  //     description: "Luyện khả năng viết",
  //     ctaLabel: "CHƠI NGAY!",
  //     icon: <ImageIcon />,
  //     accent: "green",
  //     onClick: () => {
  //       resolvedUnitId ? nav(`/games/sentence-word-hidden/${resolvedUnitId}`) : nav(`/games/sentence-word-hidden`);
  //     },
  //   },
  //   {
  //     title: "Nhìn hình chọn câu",
  //     description: "Luyện khả ghi nhớ",
  //     ctaLabel: "CHƠI NGAY!",
  //     icon: <ImageIcon />,
  //     accent: "green",
  //     onClick: () => {
  //       resolvedUnitId ? nav(`/games/picture-sentence/${resolvedUnitId}`) : nav(`/games/picture-sentence`);
  //     },
  //   },
  //   {
  //     title: "Sắp xếp từ thành câu",
  //     description: "Luyện khả năng nhớ và viết câu",
  //     ctaLabel: "CHƠI NGAY!",
  //     icon: <ImageIcon />,
  //     accent: "green",
  //     onClick: () => {
  //       resolvedUnitId ? nav(`/games/word-to-sentence/${resolvedUnitId}`) : nav(`/games/word-to-sentence`);
  //     },
  //   }
  // ];

  const savedStateStr: MenuState | undefined = (() => {
    const raw = localStorage.getItem("lessonMenuState");
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as MenuState;
    } catch {
      console.warn("Failed to parse lessonMenuState from localStorage");
      return undefined;
    }
  })();
  console.log("Dữ liệu lấy từ localStorage:" + (savedStateStr?.title ?? "no title"))
  const handleBack = () => {
    // điều hướng về LessonMenu route cố định, kèm state để LessonMenu hiển thị header đúng
    nav(`/learn/units/${resolvedUnitId}`, { state: savedStateStr });
  };

  return (
    <div className="gs-wrap">
      <header className="gs-header">
      <button className="gs-back-btn" onClick={handleBack}>
        ← Trở lại trang trước
      </button>
        <p>Trang chủ &gt; Menu bài học &gt; Ôn tập câu </p>
        <h1 className="gs-title"><span>🌟</span> Sẵn Sàng Học Chưa? <span>🌟</span></h1>
        <p className="gs-subtitle">Chọn trò chơi bạn muốn chinh phục hôm nay!</p>
      </header>

      <section className="gs-list">
        {loading && <p>Đang tải danh sách game...</p>}
        {error && <p style={{color: 'red'}}>{error}</p>}
        {!loading && !error && games.length === 0 && (
            <p>Bài học này chưa có game ôn tập câu.</p>
        )}

        {!loading && !error && games.map((game) => {
            const uiProps = getGameUIDetails(game, resolvedUnitId);
            const route = getGameRoute(game, resolvedUnitId);
            
            return (
                <GameCard 
                    key={game.id} 
                    {...uiProps}
                    onClick={() => nav(route)} // Gán hành động click
                    disabled={route === "#"} // Khóa nếu không tìm thấy route
                />
            );
        })}
      </section>

      <footer className="gs-footer">🎉 Chúc Bé Học Vui! 🎉</footer>
    </div>
  );
}
