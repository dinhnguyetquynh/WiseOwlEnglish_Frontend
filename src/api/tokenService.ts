export const tokenService = {
  getAccess() {
    return localStorage.getItem("accessToken") || "";
  },
  getRefresh() {
    return localStorage.getItem("refreshToken") || "";
  },
  setTokens(access: string, refresh?: string) {
    localStorage.setItem("accessToken", access);
    if (refresh) {
      // no-rotation: vẫn set lại refresh nếu BE trả cùng cái cũ (không bắt buộc)
      localStorage.setItem("refreshToken", refresh);
    }
  },
  clear() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};
