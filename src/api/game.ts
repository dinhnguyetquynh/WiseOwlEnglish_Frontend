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
   gameId: number;
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


export type GameResByLesson = {
  id: number;
  title: string;
  gameType: string; // Tên của enum, vd "PICTURE_WORD_MATCHING"
  difficulty: number;
};

export async function getGamesForReview(
  lessonId: number, 
  category: "vocab" | "sentence"
): Promise<GameResByLesson[]> {
    try {
        const res = await axiosClient.get<GameResByLesson[]>(
            `/api/games/review-list`,
            { params: { lessonId, category } }
        );
        // Sắp xếp theo độ khó (hoặc tiêu đề) nếu cần
        res.data.sort((a, b) => a.difficulty - b.difficulty || a.title.localeCompare(b.title));
        return res.data;
    } catch (error: any) {
        let message = "Không tải được danh sách game ôn tập";
        if (error.response?.data?.message) {
          message = error.response.data.message;
        }
        throw new Error(message);
    }
}

// 1. DTO Gửi lên BE
export type GameAnswerReq = {
  profileId: number;
  gameId: number;
  gameQuestionId: number;
  optionId?: number | null; // Cho game chọn 1
  textInput?: string;       // Cho game điền từ
  pairs?: { leftOptionId: number; rightOptionId: number }[]; // Cho game nối
  sequence?: number[];      // Cho game sắp xếp
};

// 2. DTO Nhận về từ BE
export type GameAnswerRes = {
  isCorrect: boolean;
  correctAnswerText: string;
  rewardEarned: number;
};

// ... (Các hàm API cũ: getGamesForReview, getPictureGuessingGame, ...)

// 👇 --- THÊM HÀM API MỚI --- 👇
export async function submitGameAnswer(payload: GameAnswerReq): Promise<GameAnswerRes> {
    try {
        const res = await axiosClient.post<GameAnswerRes>(
            `/api/games/submit-answer`,
            payload
        );
        return res.data;
    } catch (error: any) {
        let message = "Không nộp được câu trả lời";
        if (error.response?.data?.message) {
          message = error.response.data.message;
        }
        throw new Error(message);
    }
}

// ... (các import và type cũ)

// 1. DTO Nhận về từ BE (thêm type mới)
export type PronounceGradeResponse = {
  grade: "ACCURATE" | "ALMOST" | "INACCURATE";
  score: number;
  feedback: string;
};
export async function gradePronunciationApi(
  audioBlob: Blob,
  correctText: string
): Promise<PronounceGradeResponse> {
  
  // Phải dùng FormData để gửi file
  const formData = new FormData();
  
  // Tên file có thể tùy ý, nhưng nên có định dạng, ví dụ .webm
  formData.append("audio", audioBlob, "pronunciation.webm"); 
  formData.append("correctText", correctText);

  try {
    const res = await axiosClient.post<PronounceGradeResponse>(
      `/api/pronounce/grade`,
      formData,
      {
        // Báo cho axios biết đây là multipart/form-data
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    let message = "Không thể chấm điểm phát âm";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
}