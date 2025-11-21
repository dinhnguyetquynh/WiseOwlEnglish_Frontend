// src/components/learner/ui/UserBadge.tsx
import { useEffect, useState } from "react";
import { getProfileId } from "../../../store/storage";
import { getProfile, type LearnerProfileRes } from "../../../api/learnerProfile";
import "../css/UserBadge.css";

const DEFAULT_AVATAR = "https://res.cloudinary.com/dxhhluk84/image/upload/v1759137636/unit1_color_noBG_awzhqe.png";

export default function UserBadge() {
  const [profile, setProfile] = useState<LearnerProfileRes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getProfileId();
    if (!id) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        // Gọi API lấy thông tin chi tiết profile
        const data = await getProfile(id);
        if (isMounted) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to load user badge:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Nếu đang tải, hiển thị skeleton nhẹ
  if (loading) {
    return <div className="user-badge__loading" />;
  }

  // Nếu không có profile (chưa chọn hồ sơ), có thể ẩn hoặc hiện nút nhắc
  if (!profile) {
    return null; 
  }

  return (
    <div className="user-badge">
      <img 
        className="user-badge__avatar" 
        src={profile.avatarUrl || DEFAULT_AVATAR} 
        alt="Avatar" 
      />
      <div className="user-badge__info">
        <span className="user-badge__name">{profile.nickName}</span>
        {/* <span className="user-badge__role">Học viên</span> */}
      </div>
    </div>
  );
}