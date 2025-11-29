export type TestRes = {
  id: number;
  lessonId: number;
  title: string;
  type: string;
  description?: string;
  durationMin?: number;
  active?: boolean;
  questionRes: TestQuestionRes[];
};

export type TestQuestionRes = {
  id: number;
  questionType: string; // "PICTURE_WORD_MATCHING" | "SOUND_WORD_MATCHING" | ...
  mediaUrl?: string;    // ảnh hoặc audio tùy loại
  questionContent?: string;
  difficult: number;
  maxScore: number;
  position: number;
  options: TestOptionRes[];
};

export type TestOptionRes = {
  id: number;
  optionText?: string;
  imgUrl?: string;
  isCorrect: boolean; // đã @JsonProperty("isCorrect")
  position: number;
  side?: string;
  pairKey?: string;
};

export type AnswerReq = {
  questionId: number;
  optionId?: number | null; // nhìn hình chọn chữ, nghe âm thanh chọn hình, nhìn hình chọn câu
  optionIds?: number[];
  sequence?: number[]; // sắp xếp từ thành câu 
  pairs?: { leftOptionId: number; rightOptionId: number }[];//nối hình với chữ
  textInput?: string;//nhìn hình và viết từ vựng, nhìn hình và điền từ còn thiếu
  numericInput?: string;
};

export type SubmitTestReq = {
  learnerId : number;
  startedAt: string; // ISO string
  finishedAt: string;
  answers: AnswerReq[];
};

export type QuestionResultRes = {
  questionId: number;
  questionType: string;
  correct: boolean;
  earnedScore: number;
  maxScore: number;
  selectedOptionId?: number | null;
  selectedOptionIds?: number[] | null;
  correctOptionIds: number[];
};

export type SubmitTestRes = {
  attemptId: number;
  testId: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  questionCount: number;
  durationSec: number;
  questionResults: QuestionResultRes[];
};

export type TestResByLesson = {
  id: number;
  lessonId: number;
  title: string;
  type: string;
  description?: string | null;
  durationMin?: number | null;
  active?: boolean | null;
};