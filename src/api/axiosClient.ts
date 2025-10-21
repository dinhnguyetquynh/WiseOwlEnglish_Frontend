import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { tokenService } from "../api/tokenService";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // nếu dùng cookie HttpOnly hãy bật true và BE cho phép CORS credentials
});

// --- Request Interceptor: tự gắn Authorization ---
axiosClient.interceptors.request.use((config) => {
   const url = config.url ?? "";

  //Không gắn Authorization cho các endpoint auth công khai
  const isAuthEndpoint =
    url.startsWith("/api/auth/") ||        
    url.includes("/api/auth/login") ||
    url.includes("/api/auth/register") ||
    url.includes("/api/auth/refresh") ||
    url.includes("/api/auth/verify-otp")||
    url.includes("/api/auth/resend-otp");


  if (!isAuthEndpoint) {
    const access = tokenService.getAccess();
    if (access) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${access}`;
    }
  }

  return config;
});

// --- Response Interceptor: tự refresh khi 401 ---
let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

async function refreshToken(): Promise<string> {
  const refresh = tokenService.getRefresh();
  if (!refresh) throw new Error("No refresh token");

  const res = await axiosClient.post("/api/auth/refresh", { refreshToken: refresh });
  const { accessToken, refreshToken: rt } = res.data as { accessToken: string; refreshToken?: string };
  // no-rotation: rt có thể không trả về, nên chỉ set access
  tokenService.setTokens(accessToken, rt);
  return accessToken;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Không có response (network error...) -> ném lỗi luôn
    const status = error.response?.status;
    if (!status || !original) return Promise.reject(error);

    // Chỉ xử lý 401 một lần cho mỗi request
    if (status === 401 && !original._retry) {
      original._retry = true;

      // Nếu đang refresh rồi: chờ token mới rồi retry
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((newToken: string) => {
            if (!original.headers) original.headers = {};
            original.headers.Authorization = `Bearer ${newToken}`;
            axiosClient.request(original).then(resolve).catch(reject);
          });
        });
      }

      // Bắt đầu refresh
      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        isRefreshing = false;
        onRefreshed(newToken);

        if (!original.headers) original.headers = {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient.request(original);
      } catch (e) {
        isRefreshing = false;
        tokenService.clear();
        // (tuỳ bạn) điều hướng về /login
        // window.location.href = "/login";
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
