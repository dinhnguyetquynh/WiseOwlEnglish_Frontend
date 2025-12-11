// src/utils/storage.ts
export function saveProfileId(id: number) {
  localStorage.setItem("profileId", id.toString());
}

export function getProfileId(): number | null {
  const value = localStorage.getItem("profileId");
  return value ? Number(value) : null;
}

export function clearProfile() {
  localStorage.removeItem("profileId");
}
// --- THÊM CÁC HÀM MỚI DƯỚI ĐÂY ---

export function saveRole(role: string) {
  localStorage.setItem("role", role);
}

export function getRole(): string | null {
  return localStorage.getItem("role");
}

export function clearRole() {
  localStorage.removeItem("role");
}

const KEY_PRIMARY_GRADE = "primary_grade";

export const savePrimaryGrade = (grade: number) => {
  localStorage.setItem(KEY_PRIMARY_GRADE, String(grade));
};

export const getPrimaryGrade = (): number | null => {
  const val = localStorage.getItem(KEY_PRIMARY_GRADE);
  return val ? Number(val) : null;
};