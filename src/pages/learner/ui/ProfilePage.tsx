import { useEffect, useState } from "react";

import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Cake as CakeIcon,
  EmojiEvents as TrophyIcon
} from "@mui/icons-material";

import "../css/ProfilePage.css";
import { getProfileByLearnerApi, type ProfileByLearnerRes } from "../../../api/learnerProfile";
import { getProfileId } from "../../../store/storage";

const formatDate = (isoDate: string) => {
  if (!isoDate) return "N/A";
  try {
    const d = new Date(isoDate);
    return isNaN(d.getTime()) ? isoDate : d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
};

const DEFAULT_AVATAR = "https://res.cloudinary.com/dxhhluk84/image/upload/v1759137636/unit1_color_noBG_awzhqe.png";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileByLearnerRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileId = getProfileId();

  useEffect(() => {
    if (!profileId) {
      setError("Không tìm thấy hồ sơ. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getProfileByLearnerApi(profileId);
        if (isMounted) setProfile(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Lỗi tải hồ sơ");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [profileId]);

  if (loading) return <div className="pp-loading">Đang tải hồ sơ...</div>;
  if (error) return <div className="pp-error">{error}</div>;
  if (!profile) return null;

  return (
    <div className="pp-page">
      {/* Header gradient full-width */}
      <div className="pp-page-header"></div>

      {/* Main content */}
      <div className="pp-page-content">
        <div className="pp-avatar-wrapper">
          <div className="pp-avatar-circle">
            <div className="pp-avatar-inner">
              <img
                src={profile.avatarUrl || DEFAULT_AVATAR}
                alt="Avatar"
                className="pp-avatar-img"
              />
            </div>
          </div>
        </div>

        <div className="pp-title-section">
          <h1 className="pp-title">HỒ SƠ HỌC TẬP</h1>
          <div className="pp-divider"></div>
        </div>

        <div className="pp-grid-wrapper">
          <div className="pp-info-card">
            <div className="pp-icon-box">
              <PersonIcon />
            </div>
            <div className="pp-info-content">
              <span className="pp-label">Họ tên</span>
              <span className="pp-value">{profile.fullName}</span>
            </div>
          </div>

          <div className="pp-info-card">
            <div className="pp-icon-box">
              <CalendarIcon />
            </div>
            <div className="pp-info-content">
              <span className="pp-label">Ngày bắt đầu</span>
              <span className="pp-value">{formatDate(profile.createdAt)}</span>
            </div>
          </div>

          <div className="pp-info-card">
            <div className="pp-icon-box">
              <StarIcon sx={{ color: "#8b5cf6" }} />
            </div>
            <div className="pp-info-content">
              <span className="pp-label">Biệt danh</span>
              <span className="pp-value">{profile.nickName}</span>
            </div>
          </div>

          <div className="pp-info-card">
            <div className="pp-icon-box">
              <CakeIcon sx={{ color: "#ec4899" }} />
            </div>
            <div className="pp-info-content">
              <span className="pp-label">Sinh nhật</span>
              <span className="pp-value">{formatDate(profile.dateOfBirth)}</span>
            </div>
          </div>
        </div>

        <div className="pp-footer-badge">
          <TrophyIcon />
          <span>Đã học được {profile.numberDayStudied} ngày</span>
        </div>
      </div>
    </div>
  );
}
