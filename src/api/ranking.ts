// src/api/ranking.ts
import axiosClient from "./axiosClient";

// 1. Định nghĩa Types (phải khớp với DTOs Backend)
export interface RankItem {
  profileId: number;
  nickName: string;
  avatarUrl: string;
  totalScore: number;
  rank: number;
}

export interface RankingRes {
  topRanks: RankItem[];
  currentUserRank: RankItem;
}

// 2. Hàm gọi API
export async function getGlobalRanking(
  profileId: number
): Promise<RankingRes> {
  try {
    const res = await axiosClient.get<RankingRes>(
      `/api/ranking/global`,
      {
        params: { profileId },
      }
    );
    return res.data;
  } catch (error: any) {
    let message = "Không tải được bảng xếp hạng";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
}