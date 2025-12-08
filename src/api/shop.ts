import axiosClient from "./axiosClient";

export type StickerItem = {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  rarity: "COMMON" | "RARE" | "EPIC";
};

export type CategoryGroup = {
  id: number;
  name: string;
  stickers: StickerItem[];
};

export type ShopDataRes = {
  currentBalance: number;
  categories: CategoryGroup[];
  ownedStickerIds: number[];
};

export type StickerRes ={
  id : number;
  name : string;
  imgUrl : string;
  price : number;
  rarity : string;
  category : string;
  
}

export async function getShopData(profileId: number): Promise<ShopDataRes> {
  const res = await axiosClient.get<ShopDataRes>(`/api/shop/${profileId}`);
  return res.data;
}

export async function buySticker(profileId: number, stickerId: number): Promise<void> {
  await axiosClient.post(`/api/shop/buy`, null, {
    params: { learnerId: profileId, stickerId },
  });
}

export async function equipSticker(profileId: number, stickerId: number): Promise<void> {
  await axiosClient.post(`/api/shop/equip`, null, {
    params: { learnerId: profileId, stickerId },
  });
}



export const claimEpicRewardApi = async (learnerId: number):Promise<StickerRes> => {
  const response = await axiosClient.post(`/api/shop/reward-epic?learnerId=${learnerId}`);
  return response.data; // Trả về thông tin Sticker
};