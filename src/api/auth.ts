export type LoginRequest = { email: string; password: string };
export type TokenResponse = { accessToken: string; refreshToken: string };

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function loginApi(payload: LoginRequest): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = "Đăng nhập thất bại";
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}
