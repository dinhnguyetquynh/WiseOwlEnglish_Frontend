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

export function clearPrimaryGrade(){
  localStorage.removeItem("primary_grade");
}

export const KEY_IS_GUEST = "is_guest";

export function saveGuestMode(isGuest: boolean) {
  if (isGuest) {
    localStorage.setItem(KEY_IS_GUEST, "true");
  } else {
    localStorage.removeItem(KEY_IS_GUEST);
  }
}

export function isGuestMode(): boolean {
  return localStorage.getItem(KEY_IS_GUEST) === "true";
}

export function clearGuestMode() {
  localStorage.removeItem(KEY_IS_GUEST);
}

const KEY_CURRENT_VIEWING_GRADE = "ws_current_viewing_grade";

// Lưu lớp đang xem vào bộ nhớ
export const saveCurrentViewingGrade = (grade: number) => {
  localStorage.setItem(KEY_CURRENT_VIEWING_GRADE, grade.toString());
};

// Lấy lớp đang xem từ bộ nhớ
export const getCurrentViewingGrade = (): number | null => {
  const stored = localStorage.getItem(KEY_CURRENT_VIEWING_GRADE);
  return stored ? parseInt(stored, 10) : null;
};