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
