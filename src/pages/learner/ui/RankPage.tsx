// src/pages/learner/RankPage.tsx
import { useEffect, useState } from "react";
// import { getProfileId } from "../../store/storage";
// import { getGlobalRanking, type RankingRes, type RankItem } from "../../api/ranking";
import "../css/RankPage.css"; // 👈 Import CSS mới
import { getGlobalRanking, type RankingRes, type RankItem } from "../../../api/ranking";
import { getProfileId } from "../../../store/storage";

const DEFAULT_AVATAR = "https://res.cloudinary.com/dxhhluk84/image/upload/v1759137636/unit1_color_noBG_awzhqe.png";

// Component con để render mỗi item
function RankItemCard({ item, isCurrentUser }: { item: RankItem, isCurrentUser: boolean }) {
  const rankClass = `rank-item ${isCurrentUser ? "rank-item--user" : ""} ${
    item.rank <= 3 ? `rank-${item.rank}` : ""
  }`.trim();

  return (
    <div className={rankClass}>
      <span className="rank-position">{item.rank > 3 ? item.rank : ""}</span>
      <img
        className="rank-avatar"
        src={item.avatarUrl || DEFAULT_AVATAR}
        alt={item.nickName}
      />
      <span className="rank-name">{item.nickName}</span>
      <span className="rank-score">{item.totalScore} KN</span>
    </div>
  );
}

// Component chính
export default function RankPage() {
  const [rankingData, setRankingData] = useState<RankingRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileId = getProfileId();

  useEffect(() => {
    if (!profileId) {
      setError("Không tìm thấy hồ sơ người học. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGlobalRanking(profileId);
        if (isMounted) {
          setRankingData(data);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || "Không thể tải bảng xếp hạng");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const currentUser = rankingData?.currentUserRank;
  const topRanks = rankingData?.topRanks ?? [];

  // Kiểm tra xem user hiện tại có trong top N không
  const isUserInTopList = currentUser ? topRanks.some(
    (item) => item.profileId === currentUser.profileId
  ) : false;

  return (
    <div className="rank-wrapper">
      {/* Header */}
      <header className="rank-header">
        <img
          src="https://res.cloudinary.com/dxhhluk84/image/upload/v1763521406/top_hqudo4.png"
          alt="Trophy"
          className="rank-trophy-icon"
        />
        <h1 className="rank-title">XẾP HẠNG</h1>
        <p className="rank-subtitle">
          Tiến lên nào! Tiếp tục học để luôn nằm trong top 3 nhé
        </p>
      </header>

      {/* Hồ sơ user (góc trên phải) */}
      {/* {currentUser && (
        <div className="rank-user-profile">
          <img
            className="rank-user-profile__avatar"
            src={currentUser.avatarUrl || DEFAULT_AVATAR}
            alt="user"
          />
          <span className="rank-user-profile__name">{currentUser.nickName}</span>
        </div>
      )} */}

      {/* States */}
      {loading && <div className="rank-loading">Đang tải bảng xếp hạng...</div>}
      {error && <div className="rank-error">{error}</div>}

      {/* Danh sách */}
      {!loading && !error && rankingData && (
        <main className="rank-list">
          {topRanks.map((item) => (
            <RankItemCard
              key={item.profileId}
              item={item}
              isCurrentUser={item.profileId === currentUser?.profileId}
            />
          ))}

          {/* Nếu user không nằm trong Top N, hiển thị họ ở cuối */}
          {currentUser && !isUserInTopList && currentUser.rank > 0 && (
            <RankItemCard item={currentUser} isCurrentUser={true} />
          )}
        </main>
      )}
    </div>
  );
}