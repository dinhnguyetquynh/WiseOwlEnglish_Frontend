
import type { RoleAccount } from "../hooks/useHome";
import { clearGuestMode } from "../store/storage";
import axiosClient from "./axiosClient";
import { tokenService } from "./tokenService";

export type LoginRequest = { email: string; password: string };
export type LoginRes = { accessToken: string; refreshToken: string; hasProfiles: boolean; profileCount: number, roleAccount: RoleAccount };

export async function loginApi(payload: LoginRequest): Promise<LoginRes> {
  tokenService.clear();
  try {
    const res = await axiosClient.post<LoginRes>("/api/auth/login", payload);

    const data = res.data;

    //  Lưu lại token vào localStorage qua tokenService
    tokenService.setTokens(data.accessToken, data.refreshToken);
    clearGuestMode();

    return data;
  } catch (error: any) {
    // Bắt lỗi trả về từ BE
    let message = "Đăng nhập thất bại";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
}

// Logout (chỉ xóa token FE)
export async function logoutApi() {
  tokenService.clear();
  clearGuestMode();
  window.location.href = "/login";
}
export type RegisterRequest = { email: string; password: string };
export type RegisterRes = {
  id: number | string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};
// ✅ Hàm Register mới
export async function registerApi(payload: RegisterRequest): Promise<RegisterRes> {
  try {
    // Gọi axios, endpoint chỉ cần ghi phần đuôi vì axiosClient đã có base URL
    const res = await axiosClient.post<RegisterRes>("/api/auth/register", payload);
    return res.data;
  } catch (error: any) {
    // Xử lý lỗi chuẩn để bên giao diện hiển thị
    let message = "Đăng ký thất bại. Vui lòng thử lại.";
    
    // Kiểm tra các trường lỗi thường gặp từ Backend trả về
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.error) {
      message = error.response.data.error;
    }
    
    throw new Error(message);
  }
}



