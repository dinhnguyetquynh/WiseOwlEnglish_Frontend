import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import GameCard, { type GameCardProps } from "../../../components/learner/ui/GameCard";
import "../css/GameSelectPage.css";
import { getGamesForReview, type GameResByLesson } from "../../../api/game";
import type { MenuState } from "../../../type/menu";



const iconImgClass = "gs-game-icon";

const getGameUIDetails = (game: GameResByLesson, unitId: string): Omit<GameCardProps, "onClick"> => {
  switch (game.gameType) {
    case "PICTURE_WORD_MATCHING":
      return {
        title: game.title,
        description: "Luyện trí nhớ và nhận biết mặt chữ. Nhìn hình và chọn từ đúng!",
        ctaLabel: "CHƠI NGAY!",
        icon: <img 
                src="https://res.cloudinary.com/dxhhluk84/image/upload/v1762758792/picture_ngfzyw.png" 
                alt={game.title} 
                className={iconImgClass} 
              />,
        accent: "green",
      };
    case "SOUND_WORD_MATCHING":
      return {
        title: game.title,
        description: "Nghe âm thanh và chọn chữ phù hợp để tăng cường kỹ năng nghe.",
        ctaLabel: "CHƠI NGAY!",
         icon: <img 
                src="https://res.cloudinary.com/dxhhluk84/image/upload/v1762758786/listen_anltoc.png" 
                alt={game.title} 
                className={iconImgClass} 
              />,
        accent: "purple",
      };
    case "PICTURE_WORD_WRITING":
      return {
        title: game.title,
        description: "Rèn luyện viết từ vựng, nhìn hình và gõ lại chữ.",
        ctaLabel: "CHƠI NGAY!",
        icon: <img 
                src="https://res.cloudinary.com/dxhhluk84/image/upload/v1762758775/writing_iizict.png" 
                alt={game.title} 
                className={iconImgClass} 
              />, // (Dùng icon riêng)
        accent: "blue",
      };
    case "PICTURE4_WORD4_MATCHING":
      return {
        title: game.title,
        description: "Rèn luyện trí nhớ bằng cách nối các cặp hình ảnh và từ vựng.",
        ctaLabel: "CHƠI NGAY!",
        icon: <img 
                src="https://res.cloudinary.com/dxhhluk84/image/upload/v1762758767/game_gu2wui.png" 
                alt={game.title} 
                className={iconImgClass} 
              />, // (Dùng icon riêng)
        accent: "purple",
      };
    // (Thêm các game từ vựng khác nếu có)
    default:
      // Fallback nếu có game lạ
      return {
        title: game.title,
        description: `Game ôn tập (Loại: ${game.gameType})`,
        ctaLabel: "CHƠI",
        icon: <img 
                src="https://res.cloudinary.com/dxhhluk84/image/upload/v1762758767/game_gu2wui.png" 
                alt={game.title} 
                className={iconImgClass} 
              />,
        accent: "green",
      };
  }
};

const getGameRoute = (game: GameResByLesson, unitId: string): string => {
    switch (game.gameType) {
        case "PICTURE_WORD_MATCHING":
            return `/games/picture-guessing/${unitId}`;
        case "SOUND_WORD_MATCHING":
            return `/games/sound-word/${unitId}`;
        case "PICTURE_WORD_WRITING":
            return `/games/picture-word/${unitId}`;
        case "PICTURE4_WORD4_MATCHING":
            return `/games/picture-match-word/${unitId}`;
        default:
            return "#"; // Fallback
    }
}

export default function GameSelectPage() {
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
    
    getGamesForReview(Number(resolvedUnitId), "vocab") // 👈 Gọi API
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
  }, [resolvedUnitId]); // Phụ thuộc vào lessonId
  
  

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
      {/* <button className="gs-back-btn" onClick={handleBack}>
        ← Trở lại trang trước
      </button> */}
        <h1 className="gs-title"><span>🌟</span> Sẵn Sàng Học Chưa? <span>🌟</span></h1>
        <p className="gs-subtitle">Chọn trò chơi bạn muốn chinh phục hôm nay!</p>
      </header>

      <section className="gs-list">
        {/* {GAMES.map((g, i) => (
          <GameCard key={i} {...g} />
        ))} */}
        {loading && <p>Đang tải danh sách game...</p>}
        {error && <p style={{color: 'red'}}>{error}</p>}
        {!loading && !error && games.length === 0 && (
            <p>Bài học này chưa có game ôn tập từ vựng.</p>
        )}

        {!loading && !error && games.map((game) => {
            const uiProps = getGameUIDetails(game, resolvedUnitId);
            const route = getGameRoute(game, resolvedUnitId);
            
            return (
                <GameCard 
                    key={game.id} 
                    {...uiProps}
                    onClick={() => nav(route)} // 👈 Gán hành động click
                    disabled={route === "#"} // 👈 Khóa nếu không tìm thấy route
                />
            );
        })}
      </section>

      <footer className="gs-footer">🎉 Chúc Bé Học Vui! 🎉</footer>
    </div>
  );
}
