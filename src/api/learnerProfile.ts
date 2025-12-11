import axiosClient from "./axiosClient";

// Types
export type LearnerProfileReq = {
  fullName: string;
  nickName?: string;
  dateOfBirth?: string; // yyyy-MM-dd

  avatarUrl?: string;
  initialGradeLevelId: number;
};

export type LearnerProfileRes = {
  id: number;
  fullName: string;
  nickName?: string;
  dateOfBirth?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  avatarUrl?:string;
};

export type GradeProgressItem ={
  gradeLevelId:number;
  gradeName: string;
  orderIndex : number;
  status: string;
  startedAt : string;
  completedAt : string;
}

export type ProfileRes ={
  id: number;
  fullName: string;
  nickName: string;
  age: number;
  avatarUrl?: string;
  gradeProgresses: GradeProgressItem[];

}



// Helper lấy message lỗi từ BE
function getErrMsg(e: any, fallback: string) {
  return e?.response?.data?.message ?? e?.response?.data?.error ?? fallback;
}

// Tạo hồ sơ học tập
export async function createLearnerProfileApi(payload: LearnerProfileReq): Promise<ProfileRes> {
  try {
    const res = await axiosClient.post<ProfileRes>("/api/learner-profiles/create-profile", payload);
    return res.data;
  } catch (e: any) {
    throw new Error(getErrMsg(e, "Tạo hồ sơ thất bại"));
  }
}

// Lấy danh sách hồ sơ theo user đang đăng nhập
export async function getListLearnerProfile(): Promise<LearnerProfileRes[]> {
  try {
    const res = await axiosClient.get<LearnerProfileRes[]>("/api/learner-profiles/list-by-user");
    return res.data;
  } catch (e: any) {
    throw new Error(getErrMsg(e, "Lấy danh sách profile thất bại"));
  }
}

// Upload avatar (multipart/form-data)
export async function uploadAvatarApi(file: File): Promise<string> {
  try {
    const form = new FormData();
    form.append("file", file);

    // Không set "Content-Type" để browser tự thêm boundary
    const res = await axiosClient.post<{ url: string }>("/api/uploads/avatar", form);
    return res.data.url;
  } catch (e: any) {
    throw new Error(getErrMsg(e, "Upload ảnh thất bại"));
  }
}

//Get Learner By profileId
export async function getProfile(profileId:Number):Promise<LearnerProfileRes> {
  try {
    const res = await axiosClient.get<LearnerProfileRes>(`/api/learner-profiles/get-profile/${profileId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error;
  }
  
}
// src/api/learnerProfile.ts
// ... (giữ nguyên các code cũ) ...

// 1. Thêm Type mới khớp với BE DTO
export type ProfileByLearnerRes = {
  learnerId: number;
  fullName: string;
  nickName: string;
  dateOfBirth: string; // "yyyy-MM-dd"
  avatarUrl: string;
  createdAt: string;   // ISO LocalDateTime
  numberDayStudied: number;
};

// 2. Thêm hàm gọi API mới
export async function getProfileByLearnerApi(learnerId: number): Promise<ProfileByLearnerRes> {
  try {
    // Giả sử endpoint của bạn nằm trong LearnerProfileController
    // Nếu controller của bạn có @RequestMapping("/api/learner-profiles"), url sẽ là như dưới.
    // Bạn hãy chỉnh lại đường dẫn nếu endpoint thực tế khác.
    const res = await axiosClient.get<ProfileByLearnerRes>(`/api/learner-profiles/${learnerId}`);
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch learner profile:", error);
    let message = "Không tải được thông tin hồ sơ";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }

  
}
// 1. Thêm Interface cho response điểm số
export interface LearnerPointsRes {
  pointBalance: number;
  totalRewardCount: number;
}

// ... các hàm cũ ...

// 2. Thêm hàm lấy điểm số
export const getLearnerPoints = async (id: number | string): Promise<LearnerPointsRes> => {
  const url = `/api/learner-profiles/${id}/points`;
  const response = await axiosClient.get(url);
  return response.data;
};