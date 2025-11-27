// SelectProfilePage.tsx
import { useEffect, useState } from "react";
import "../css/SelectProfilePage.css";
import { getListLearnerProfile, type LearnerProfileRes } from "../../../api/learnerProfile";
import { useNavigate } from "react-router-dom";
import { saveProfileId } from "../../../store/storage";

type Profile = { id: number; name: string; avatar: string; color: string };
 const DEFAULT_AVATAR ="https://res.cloudinary.com/demo/image/upload/v1699999999/default_avatar.png";

 function pastelById(id:number):string{
  const colors =["#C5F6FA", "#F8D7DA", "#D6EAF8", "#E8F8F5", "#FFF3BF", "#EAE6FF"];
  return colors[id % colors.length];
 }
export default function SelectProfilePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();
  
  useEffect(()=>{
    let mounted = true;

    (async () => {
      try {
        const list: LearnerProfileRes[] = await getListLearnerProfile();

        // 👉 Chỉ lấy 3 field: id, nickName, avatarUrl
        const mapped: Profile[] = list.map((p) => ({
          id: p.id,
          name: p.nickName ?? "(Chưa đặt biệt danh)",     // ưu tiên nickName
          avatar: p.avatarUrl ?? DEFAULT_AVATAR,          // fallback avatar
          color: pastelById(p.id),                        // tự tạo màu nền
        }));

        if (mounted) setProfiles(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Không tải được hồ sơ học tập");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  },[]);

  return (
    <div className="sp-container">
      <h2 className="sp-title">CHỌN HỒ SƠ HỌC TẬP</h2>

      <div className="sp-list">
        {profiles.map((p) => (
          <ProfileCard
            key={p.id}
            profile={p}
            selected={selectedId === p.id}
            onSelect={() => setSelectedId(p.id)}
          />
        ))}
        <AddCard onClick={() => navigate(`/create-profile`)} />
      </div>

      <button className="sp-btn" 
        disabled={!selectedId}
        onClick={()=>{
          if(selectedId){
            saveProfileId(selectedId);
            navigate(`/learn`);
          }
        }}
        >
        Tiếp tục
      </button>
    </div>
  );
}

/* ==== Local components: chỉ dùng cho trang này, không export ==== */

function ProfileCard({
  profile,
  selected,
  onSelect,
}: {
  profile: Profile;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`sp-card ${selected ? "selected" : ""}`}
      style={{ backgroundColor: profile.color }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
    >
      <img className="sp-avatar" src={profile.avatar} alt={profile.name} />
      <p className="sp-name">{profile.name}</p>
    </div>
  );
}

function AddCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="sp-card add-card" onClick={onClick} role="button" tabIndex={0}>
      <span className="sp-plus">+</span>
    </div>
  );
}
