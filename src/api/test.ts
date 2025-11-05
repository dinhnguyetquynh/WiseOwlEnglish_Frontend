import axiosClient from "./axiosClient"; // dùng instance hiện có
import type { SubmitTestReq, SubmitTestRes, TestRes, TestResByLesson } from "../type/test";

export async function getTestById(id: number): Promise<TestRes> {
  const res = await axiosClient.get<TestRes>(`/api/test/get-test/${id}`);
  return res.data;
}

export async function submitTest(testId: number, payload: SubmitTestReq): Promise<SubmitTestRes> {
  const res = await axiosClient.post(`/api/test/${testId}/submit`, payload);
  return res.data;
}

export async function getTestsByLesson(lessonId: number): Promise<TestResByLesson[]> {
  const res = await axiosClient.get<TestResByLesson[]>(`/api/test/get-list/${lessonId}`);
  return res.data;
}