export type PWOption = { id: number; position: number; optionText: string; correct: boolean };
export type PWQuestion = { id: number; position: number; imageUrl?: string; reward?: number; options: PWOption[] };
export type PWMAnswer = { optionId: number | null };

export type SWOption = { id: number; position: number; optionText: string; correct: boolean };
export type SWQuestion = { id: number; position: number; audioUrl?: string; options: SWOption[] };
export type SWMAnswer = { optionId: number | null };

export type PictureMatchWordOptRes = {
  id: number;
  questionId: number;
  imgUrl?: string;
  isCorrect: boolean;
  side: "left" | "right";
  pairKey: string;
  position: number;
  answerText?: string;
};

export type PictureMatchWordRes = {
  id: number;
  gameId: number;
  position: number;
  rewardCore?: number;
  optRes: PictureMatchWordOptRes[];
};