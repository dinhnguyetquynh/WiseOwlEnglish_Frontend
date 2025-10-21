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

