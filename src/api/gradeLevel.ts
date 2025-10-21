import axiosClient from "./axiosClient";

// api/gradeLevel.ts
export type GradeLevelDTO = {
  id: number;
  gradeName: string;
  orderIndex: number;
};

// const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// function authHeaders() {
//   const access = localStorage.getItem("accessToken") ?? "";
//   return {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${access}`,
//   };
// }

// export async function getAllGradeLevels(): Promise<GradeLevelDTO[]> {
//   const res = await fetch(`${BASE_URL}/api/grade-levels`, {
//     method: "GET",
//     headers: authHeaders(),
//   });
//   if (!res.ok) {
//     let msg = "Không lấy được danh sách khối/lớp";
//     try {
//       const data = await res.json();
//       msg = data?.message ?? msg;
//     } catch {}
//     throw new Error(msg);
//   }
//   const data: GradeLevelDTO[] = await res.json();
//   // (tuỳ chọn) sắp xếp theo orderIndex tăng dần
//   return [...data].sort((a, b) => a.orderIndex - b.orderIndex);
// }

export async function getAllGradeLevels() : Promise<GradeLevelDTO[]>{
  try {
    const res = await axiosClient.get<GradeLevelDTO[]>("/api/grade-levels/get-all");
    return res.data;
  } catch (error:any) {
    console.error("❌ Lỗi khi lấy danh sách grade level:", error);

    // Nếu server có trả về message cụ thể
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Nếu là lỗi network
    if (error.request) {
      throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
    }

    // Lỗi khác
    throw new Error("Đã xảy ra lỗi không xác định khi lấy danh sách grade level.");
  }
    
  }
