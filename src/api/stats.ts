import axiosClient from "./axiosClient";

export interface GradeDistRes {
  gradeName: string;
  count: number;
}

export interface MonthlyNewLearnerRes {
  month: string;
  count: number;
}

export interface LearnerStatsRes {
  totalLearners: number;
  totalUserAccounts: number;
  monthlyGrowth: MonthlyNewLearnerRes[];
  gradeDistribution: GradeDistRes[];
}

export interface LessonStatsRes {
  lessonId: number;
  lessonName: string;
  totalLearners: number;
  completionRate: number;
  averageTestScore: number;
}

// Type mới cho response báo cáo
export interface GradeReportRes {
  totalStudentsInGrade: number;
  lessons: LessonStatsRes[];
}
export interface TotalDataRes {
  totalLessons: number;
  totalVocabularies: number;
  totalSentences: number;
  totalGameQuestions: number;
  totalTestQuestions: number;
}
export interface DailyStatRes {
  date: string;
  count: number;
}
export async function getLearnerStats(year: number): Promise<LearnerStatsRes> {
  const res = await axiosClient.get("/api/admin/stats/learners", {
    params: { year }
  });
  return res.data;
}

// Cập nhật hàm gọi API trả về GradeReportRes
export async function getGradeReport(gradeId: number): Promise<GradeReportRes> {
  const res = await axiosClient.get(`/api/admin/stats/lessons-by-grade/${gradeId}`);
  return res.data;
}

export async function getTotalData(): Promise<TotalDataRes> {
  const res = await axiosClient.get<TotalDataRes>("/api/admin/stats/total-data");
  return res.data;
}
// 👇 Thêm hàm gọi API (startDate, endDate dạng YYYY-MM-DD)
export async function getLearningActivity(startDate: string, endDate: string): Promise<DailyStatRes[]> {
  const res = await axiosClient.get<DailyStatRes[]>("/api/admin/stats/learning-activity", {
    params: { startDate, endDate }
  });
  return res.data;
}