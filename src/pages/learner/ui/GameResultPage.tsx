import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/GameResultPage.css";
import { clearSavedResult, loadSavedResult, type GameResultPayload } from "../../../utils/gameResult";



export default function GameResultPage() {
  const nav = useNavigate();
  // const { state } = useLocation() as { state?: GameResultState };
    const { state } = useLocation() as { state?: GameResultPayload};

  // Ưu tiên state, nếu không có thì lấy từ sessionStorage (trường hợp F5)
  const data: GameResultPayload | null = state ?? loadSavedResult();

  // Nếu vào trang trực tiếp không có state => đưa về chọn game
  useEffect(() => {
    if (!data) {
      nav("/games/select", { replace: true });
      return;
    }
    // dọn session để tránh dữ liệu cũ lặp lại khi đi đường khác quay về
    clearSavedResult();
  }, [data, nav]);

    if (!data) return null;

  const { total, correct, points, unitId, from ,gameType} = data;
  const percent = useMemo(
    () => (total > 0 ? Math.round((correct / total) * 100) : 0),
    [correct, total]
  );

  const tier = useMemo<"gold" | "silver" | "bronze" | "starter">(() => {
    if (percent >= 90) return "gold";
    if (percent >= 70) return "silver";
    if (percent >= 50) return "bronze";
    return "starter";
  }, [percent]);

  const title = useMemo(() => {
    switch (tier) {
      case "gold":
        return "Tuyệt vời! Siêu đỉnh 🎉";
      case "silver":
        return "Rất tốt! Tiếp tục nào ✨";
      case "bronze":
        return "Khá ổn! Cố thêm nhé 💪";
      default:
        return "Khởi đầu tốt! Cùng luyện thêm nào 🌱";
    }
  }, [tier]);

  const subtitle = `${correct}/${total} câu đúng`;
  const badgeLabel =
    tier === "gold"
      ? "Huy hiệu Vàng"
      : tier === "silver"
      ? "Huy hiệu Bạc"
      : tier === "bronze"
      ? "Huy hiệu Đồng"
      : "Huy hiệu Tập sự";

  const playAgain = () => {
    // Sử dụng switch case để code gọn gàng và logic rõ ràng hơn
    switch (from) {
      case "picture-guessing":
        console.log("da vao game nhin hinh chon tu:" + unitId);
        unitId
          ? nav(`/games/picture-guessing/${unitId}`)
          : nav(`/games/picture-guessing`);
        break;

      case "sound-word":
        unitId
          ? nav(`/games/sound-word/${unitId}`)
          : nav(`/games/sound-word`);
        break;

      case "word-writing":
        unitId
          ? nav(`/games/picture-word/${unitId}`)
          : nav(`/games/picture-word`);
        break;

      case "picture-match-word":
        unitId
          ? nav(`/games/picture-match-word/${unitId}`)
          : nav(`/games/picture-match-word`);
        break;

      case "picture-sentence":
        unitId
          ? nav(`/games/picture-sentence/${unitId}`)
          : nav(`/games/picture-sentence`);
        break;

      case "sentence-hidden":
        unitId
          ? nav(`/games/sentence-word-hidden/${unitId}`)
          : nav(`/games/sentence-word-hidden`);
        break;

      case "word-to-sentence":
        unitId
          ? nav(`/games/word-to-sentence/${unitId}`)
          : nav(`/games/word-to-sentence`);
        break;

      default:
        // Nếu không khớp game nào, hoặc gameType lạ thì về trang chọn
        console.log("Có lỗi, không chơi lại game được.")
        break;
    }
  };


  const toSelectGame = () => {
    if (!unitId || !gameType) {
      nav("/games/select", { replace: true });
      return;
    }

    // Dùng trực tiếp gameType để xây dựng route
    if (gameType === "vocab") {
      nav(`/learn/units/${unitId}/vocab/review`, { replace: true });
    } else if (gameType === "sentence") {
      nav(`/learn/units/${unitId}/sentence/review`, { replace: true });
    } else {
        // Xử lý các loại game khác hoặc fallback
        console.log("Có lỗi xảy ra đối với hiển thị màn hình chọn game .")
    }
};

  const toUnit = () => {
    // Điều hướng sang trang “Unit” của bạn (chỉnh theo route thật)
    if (unitId) nav(`/units/${unitId}`);
    else nav("/home");
  };

  return (
    <div className={`gr-wrap gr-${tier}`}>
      {/* confetti */}
      <button className="gr-exit-btn" onClick={() => nav(`/learn/units/${unitId}`)}>
        ×
      </button>
      <div className="gr-confetti" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <header className="gr-header">
        <h1 className="gr-title">{title}</h1>
        <p className="gr-subtitle">{subtitle}</p>
      </header>

      <section className="gr-main">
        {/* Vòng tròn phần trăm */}
        <div className="gr-score">
          <div className="gr-ring" style={{ ['--p' as any]: `${percent}%` }}>
            <div className="gr-ring-inner">
              <div className="gr-percent">{percent}%</div>
              <div className="gr-percent-sub">độ chính xác</div>
            </div>
          </div>

          <div className="gr-points">
            <div className="gr-points-value">+{points}</div>
            <div className="gr-points-label">điểm thưởng</div>
          </div>
        </div>

        {/* Huy hiệu */}
        <div className="gr-badge">
          <div className="gr-medal" aria-hidden>
            {tier === "gold" && "🏆"}
            {tier === "silver" && "🥈"}
            {tier === "bronze" && "🥉"}
            {tier === "starter" && "🎯"}
          </div>
          <div className="gr-badge-text">{badgeLabel}</div>
        </div>

        {/* Thanh tiến bộ nhỏ */}
        <div className="gr-progress">
          <div className="gr-progress-track">
            <div className="gr-progress-bar" style={{ width: `${percent}%` }} />
          </div>
          <div className="gr-progress-note">Tiến độ ôn tập</div>
        </div>

        {/* Gợi ý tiếp theo */}
        <div className="gr-next">
          {percent >= 80 ? (
            <p>Xuất sắc! Thử thách khó hơn đang chờ bạn 🌟</p>
          ) : percent >= 50 ? (
            <p>Rất khá! Luyện thêm một lượt nữa là “lên trình” ngay 🚀</p>
          ) : (
            <p>Đừng lo! Ôn thêm lần nữa để nhớ thật chắc nhé 💡</p>
          )}
        </div>
      </section>

      <footer className="gr-actions">
        <button className="gr-btn gr-btn-ghost" onClick={toSelectGame}>
          Về chọn game
        </button>
        <button className="gr-btn gr-btn-primary" onClick={playAgain}>
          Chơi lại
        </button>
        {/* <button className="gr-btn gr-btn-success" onClick={toUnit}>
          Học tiếp Unit
        </button> */}
      </footer>
    </div>
  );
}
