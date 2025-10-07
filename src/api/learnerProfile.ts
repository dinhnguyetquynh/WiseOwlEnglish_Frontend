// Types
export type LearnerProfileReq = {
  fullName: string;
  nickName?: string;
  dateOfBirth?: string; // yyyy-MM-dd
};

export type LearnerProfileRes = {
  id: number;
  fullName: string;
  nickName?: string;
  dateOfBirth?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export async function createLearnerProfileApi(
  payload: LearnerProfileReq
): Promise<LearnerProfileRes> {
  const token = getAccessToken();
  if (!token) throw new Error("Bạn chưa đăng nhập.");

  const res = await fetch(`${BASE_URL}/api/learner-profiles/me`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = "Tạo hồ sơ thất bại";
    try {
      const data = await res.json();
      msg = data?.message ?? data?.error ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
