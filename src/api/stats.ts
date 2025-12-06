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