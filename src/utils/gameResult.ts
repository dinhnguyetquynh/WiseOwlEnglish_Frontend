// SDK chuẩn hóa dữ liệu kết quả cho mọi mini-game

import type { NavigateFunction } from "react-router-dom";

export type GameResultPayload = {
  /** Tên game để điều hướng chơi lại (vd: "sound-word", "picture-guessing") */
  from: string;
  unitId?: string | number;
  total: number;
  correct: number;
  points: number;
};

const STORAGE_KEY = "game_result";

/** Điều hướng tới trang kết quả + lưu sessionStorage để chống mất state khi F5 */
export function gotoResult(navigate: NavigateFunction, data: GameResultPayload) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
  navigate("/game-result", { state: data });
}

/** Lấy dữ liệu kết quả từ sessionStorage (dùng ở trang kết quả khi F5) */
export function loadSavedResult(): GameResultPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameResultPayload) : null;
  } catch {
    return null;
  }
}

/** Xóa dữ liệu để tránh bị “kẹt” state cũ */
export function clearSavedResult() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}
