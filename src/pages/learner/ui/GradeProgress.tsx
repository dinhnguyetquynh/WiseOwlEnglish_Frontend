import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";


import "../css/GradeProgress.css"; // Import file CSS mới
import { getGradeProgress, type GradeProgress } from "../../../api/gradeProgress";
import { getPrimaryGrade, getProfileId } from "../../../store/storage";
import FancyClassSelect from "../../../components/learner/ui/FancyClassSelect";
import { useLearnerLayoutContext } from "../../../layouts/LearnerLayout";

// --- COMPONENT CON: VÒNG TRÒN TIẾN ĐỘ ---
function CircularProgress({ percent }: { percent: number }) {
  // Thêm 'style' để cập nhật biến CSS --progress
  return (
    <div
      className="pr-circle-chart"
      style={{ "--progress": percent } as React.CSSProperties}
      role="progressbar"
      aria-valuenow={percent}
    >
      <div className="pr-circle-percent">{percent}%</div>
    </div>
  );
}

// --- COMPONENT CON: XẾP HẠNG SAO ---
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <div className="pr-stars" aria-label={`Đạt ${rating} trên 5 sao`}>
      {[...Array(fullStars)].map((_, i) => (
        <span key={`f-${i}`}>★</span>
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`e-${i}`} className="pr-star-empty">
          ★
        </span>
      ))}
    </div>
  );
}

// --- COMPONENT CHÍNH ---
export default function GradeProgress() {
  const [data, setData] = useState<GradeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Mặc định chọn lớp 1 (orderIndex = 1)
  // const [selectedGrade, setSelectedGrade] = useState(() => {
  //   const saved = getPrimaryGrade();
  //   return saved ?? 1;
  // });
  const { selectedGrade } = useLearnerLayoutContext();

  const profileId = getProfileId();


  // useEffect(() => {
  //   if (!profileId) {
  //     setError("Không tìm thấy hồ sơ người học. Vui lòng chọn lại hồ sơ.");
  //     setLoading(false);
  //     return;
  //   }

  //   let isMounted = true;
  //   (async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);
  //       const progressData = await getGradeProgress(selectedGrade, profileId);
  //       if (isMounted) {
  //         setData(progressData);
  //       }
  //     } catch (e: any) {
  //       if (isMounted) {
  //         setError(e.message || "Không thể tải dữ liệu tiến độ");
  //       }
  //     } finally {
  //       if (isMounted) {
  //         setLoading(false);
  //       }
  //     }
  //   })();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [profileId, selectedGrade]); 
  useEffect(() => {
    // Nếu chưa có profile hoặc chưa chọn lớp (từ layout), chưa tải
    if (!profileId) {
      setError("Không tìm thấy hồ sơ người học. Vui lòng chọn lại hồ sơ.");
      return;
    }

    if (!selectedGrade) {
       // Đợi Layout cập nhật selectedGrade (từ storage hoặc API)
       return; 
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Gọi API với grade lấy từ Layout context
        const progressData = await getGradeProgress(selectedGrade, profileId);
        if (isMounted) {
          setData(progressData);
        }
      } catch (e: any) {
        if (isMounted) {
          // Chỉ báo lỗi nếu thực sự lỗi API, còn lỗi do chưa có dữ liệu thì thôi
          console.error(e);
          setError(e.message || "Không thể tải dữ liệu tiến độ");
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
  }, [profileId, selectedGrade]); // 3. Trigger lại khi selectedGrade trên Layout thay đổi

  // Tính toán % tổng

  // Tính toán % tổng (theo gợi ý của bạn)
  const percentCompleteOfGrade = useMemo(() => {
    if (!data || !data.listLessons || data.listLessons.length === 0) {
      return 0;
    }
    const sumPercent = data.listLessons.reduce(
      (acc, l) => acc + l.lessonProgress,
      0
    );
    return Math.round(sumPercent / data.listLessons.length);
  }, [data]);

  const totalLessons = data?.listLessons?.length ?? 0;

  // --- Render UI ---
  return (
    <div className="pr-wrapper">
      <header className="pr-header">
        <h1 className="pr-title">Tiến độ học tập</h1>
        {/* <FancyClassSelect value={selectedGrade} onChange={setSelectedGrade} /> */}
      </header>

      {loading && <div>Đang tải dữ liệu tiến độ...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && !error && data && (
        <main className="pr-main-grid">
          {/* === CỘT BÊN TRÁI: TỔNG QUAN === */}
          <aside className="pr-overview-card">
            <h2 className="pr-section-title">Tiến độ tổng quan</h2>

            <CircularProgress percent={percentCompleteOfGrade} />

            <div className="pr-stats-grid">
              <div className="pr-stat-box green">
                <span className="pr-stat-icon">📚</span>
                <div>
                  <div className="pr-stat-label">Số bài đã học</div>
                  <div className="pr-stat-value">
                    {data.lessonsLearned} / {totalLessons}
                  </div>
                </div>
              </div>

              <div className="pr-stat-box purple">
                <span className="pr-stat-icon">💎</span>
                <div>
                  <div className="pr-stat-label">Tổng điểm thưởng</div>
                  <div className="pr-stat-value">{data.rewardScore} điểm</div>
                </div>
              </div>

              <div className="pr-stat-box yellow">
                <span className="pr-stat-icon">🏆</span>
                <div>
                  <div className="pr-stat-label">Sao thành tích</div>
                  <StarRating rating={data.starsArchived} />
                </div>
              </div>
            </div>
          </aside>

          {/* === CỘT BÊN PHẢI: CHI TIẾT === */}
          <section className="pr-detail-card">
            <h2 className="pr-section-title" style={{ padding: "24px" }}>
              Chi tiết bài học
            </h2>

            <div className="pr-table-header">
              <div className="pr-table-th">Tên bài học</div>
              <div className="pr-table-th">Mức độ hoàn thành</div>
              <div className="pr-table-th">Điểm kiểm tra gần nhất</div>
              <div className="pr-table-th">Hành động</div>
            </div>

            <div className="pr-table-body">
              {data.listLessons.map((lesson) => (
                <div className="pr-table-row" key={lesson.lessonId}>
                  {/* Tên bài học */}
                  <div>
                    <div className="pr-lesson-name">{lesson.lessonName}</div>
                    <div className="pr-lesson-unit">{lesson.unitName}</div>
                  </div>

                  {/* Mức độ hoàn thành */}
                  <div data-label={`Hoàn thành (${lesson.lessonProgress}%)`}
                  className="pr-progress-cell"
                  >
                    {/* THÊM: Text % (chỉ hiển thị trên desktop) */}
                    <span className="pr-progress-label-desktop">
                      {lesson.lessonProgress}%
                    </span>

                    <div className="pr-progress-track">
                      <div
                        className="pr-progress-fill"
                        style={{ width: `${lesson.lessonProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Điểm test */}
                  <div className="pr-score" data-label="Điểm test">
                    {/* Kiểm tra: nếu có giá trị (khác null/undefined) và điểm >= 0 */}
                    {(lesson.lastTestScore !== null && lesson.lastTestScore !== undefined && lesson.lastTestScore >= 0) ? (
                      <span>{lesson.lastTestScore.toFixed(1)} / 10</span>
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "#999", fontStyle: "italic" }}>
                        Chưa có điểm
                      </span>
                    )}
                  </div>

                  {/* Hành động */}
                  <Link
                    to={`/learn/progress/lesson/${lesson.lessonId}`}
                    className="pr-action-link"
                    data-label="Hành động"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}