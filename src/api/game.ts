import type { PictureMatchWordRes } from "../type/game";
import axiosClient from "./axiosClient";

export type PictureGuessingGameOptionRes = {
  id: number;
  optionText: string;
  correct: boolean;
  position: number;
};

export type PictureGuessingGameRes = {
  id: number;
  gameId: number;
  position: number;
  imageUrl: string;
  reward: number;
  options: PictureGuessingGameOptionRes[];
};

// ==== Types từ BE ====
export type SoundWordOptionRes = {
  id: number;
  gameQuestionId: number;
  optionText: string;
  isCorrect: boolean;
  position: number;
};

export type SoundWordQuestionRes = {
  id: number;
  position: number;
  urlSound: string;
  rewardPoint: number;
  options: SoundWordOptionRes[];
};

export type PictureSentenceOptRes = {
  id: number;
  questionId: number;
  sentenceAnswer: string;
  isCorrect: boolean;
  position: number;
};

export type PictureSentenceQuesRes = {
  id: number;
  gameId: number;
  position: number;
  sentenceQues: string;
  imageUrl: string;
  rewardPoint: number;
  options: PictureSentenceOptRes[];
};

export type SentenceHiddenRes={
  id: number;
  gameId: number;
  position : number;
  imgURL : string;
  questionText: string;
  hiddenWord: string;
  rewardCore: number;
  optRes: SentenceHiddenOptRes[];
}

export type SentenceHiddenOptRes ={
  id : number;
  questionId: number;
  isCorrect : boolean;
  position : number;
  answerText : string;
}

export type WordToSentenceRes={
  id: number;
  gameId: number;
  position: number;
  rewardCore : number;
  questionText : string;
  opts: WordToSentenceOptsRes[];
}

export type WordToSentenceOptsRes = {
  id : number;
  questionId: number;
  isCorrect : boolean;
  position : number;
  answerText : string;
}

export async function getWordToSentenceGames(lessonId:number): Promise <WordToSentenceRes[]>{
    console.log("LESSONID : "+lessonId);
  try {
        const res = await axiosClient.get<WordToSentenceRes[]>(
        `/api/games/word-to-sentence`,
        {params:{lessonId}}
        );
        return res.data;
    
  } catch (error:any) {
        let message = "Không lấy được danh sách câu hỏi của game";
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.response?.data?.error) {
          message = error.response.data.error;
        }
        throw new Error(message);
  }
    
  }

export async function getSentenceHiddenGames(lessonId:number): Promise <SentenceHiddenRes[]>{
    console.log("LESSONID : "+lessonId);
  try {
        const res = await axiosClient.get<SentenceHiddenRes[]>(
        `/api/games/sentence-hidden`,
        {params:{lessonId}}
        );
        return res.data;
    
  } catch (error:any) {
        let message = "Không lấy được danh sách câu hỏi của game";
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.response?.data?.error) {
          message = error.response.data.error;
        }
        throw new Error(message);
  }
    
  }


export async function getPictureGuessingGame(lessonId:number): Promise <PictureGuessingGameRes[]>{
    console.log("LESSONID : "+lessonId);
  try {
        const res = await axiosClient.get<PictureGuessingGameRes[]>(
        `/api/games/picture-guessing`,
        {params:{lessonId}}
        );
        return res.data;
    
  } catch (error:any) {
        let message = "Không lấy được danh sách câu hỏi của game";
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.response?.data?.error) {
          message = error.response.data.error;
        }
        throw new Error(message);
  }
    
  }

  export async function getSoundWordGames(lessonId: string | number) {
  const res = await axiosClient.get<SoundWordQuestionRes[]>(
    `/api/games/sound-word`,
    { params: { lessonId } }
  );
  return res.data;
  }


// src/api/game.ts
export type PictureWordOptRes = {
  id: number;
  questionId: number;
  answerText: string;
  position: number;
  isCorrect: boolean;
};

export type PictureWordRes = {
  id: number;
  gameId: number;
  position: number;
  imgURL: string;
  rewardCore: number;
  optsRes: PictureWordOptRes[];
};

  export async function getPictureSentenceGames(
  lessonId: number
  ): Promise<PictureSentenceQuesRes[]> {
  const res = await axiosClient.get("/api/games/picture-sentence", {
    params: { lessonId },
  });
  // đảm bảo sort theo position
  const data = (res.data as PictureSentenceQuesRes[]).slice().sort((a, b) => a.position - b.position);
  return data;
  }

export async function getPictureWordGames(lessonId: number): Promise<PictureWordRes[]> {
  // const url = `/api/games/picture-word?lessonId=${lessonId}`;
  // const res = await fetch(url);
  // if (!res.ok) {
  //   const txt = await res.text();
  //   throw new Error(txt || `HTTP ${res.status}`);
  // }
  // const data = (await res.json()) as PictureWordRes[];
  // return data;
  const res = await axiosClient.get("/api/games/picture-word",{params:{lessonId},});
  const data = res.data as PictureWordRes[];
  return data;
}

export async function getPictureMatchWordGames(lessonId: number): Promise<PictureMatchWordRes[]> {
  const resp = await axiosClient.get<PictureMatchWordRes[]>("/api/games/picture-match-word", {
    params: { lessonId },
  });
  return resp.data;
}


