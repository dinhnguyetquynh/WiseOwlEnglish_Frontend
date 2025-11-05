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

// const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// function getAccessToken(): string | null {
//   return localStorage.getItem("accessToken");
// }

// export async function createLearnerProfileApi(
//   payload: LearnerProfileReq
// ): Promise<ProfileRes> {
//   const token = getAccessToken();
//   if (!token) throw new Error("Bạn chưa đăng nhập.");

//   const res = await fetch(`${BASE_URL}/api/learner-profiles/create-profile`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(payload),
//   });

//   if (!res.ok) {
//     let msg = "Tạo hồ sơ thất bại";
//     try {
//       const data = await res.json();
//       msg = data?.message ?? data?.error ?? msg;
//     } catch {}
//     throw new Error(msg);
//   }
//   return res.json();
// }

// export async function getListLearnerProfile(): Promise<LearnerProfileRes[]> {
//   const token = getAccessToken();
//   if(!token) throw new Error("Ban chua dang nhap");

//   const res = await fetch(`${BASE_URL}/api/learner-profiles/list-by-user`,{
//     method: "GET",
//     headers:{
//       "Content-Type":"application/json",
//       Authorization:`Bearer ${token}`,
//     }
//   });
//   const data = await res.json().catch(() => null);

//   if (!res.ok) {
//     const msg = data?.message ?? data?.error ?? "Lấy danh sách profile thất bại";
//     throw new Error(msg);
//   }

//   return data;

// }

// export async function uploadAvatarApi(file:File): Promise<string> {
//   const token = getAccessToken();
//   if(!token) throw new Error("You have not logged in");

//   const form = new FormData();
//   form.append("file",file);

//   const res = await fetch (`${BASE_URL}/api/uploads/avatar`,{
//     method: "POST",
//     headers:{
//       Authorization:`Bearer ${token}`,

//     },
//     body: form,
//   });

//   if(!res.ok){
//     let msg = "Upload anh that bai";
//     try {
//       const data = await res.json();
//       msg = data?.message ?? data?.error ?? msg;
//     }catch{}
//     throw new Error(msg);
//   }
//   const data = await res.json();
//   return data.url;
  
// }

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