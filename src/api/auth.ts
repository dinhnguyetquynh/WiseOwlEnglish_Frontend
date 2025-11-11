
import type { RoleAccount } from "../hooks/useHome";
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
  window.location.href = "/login";
}

