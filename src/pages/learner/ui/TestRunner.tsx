import { useEffect, useMemo, useState } from "react";
import type { TestRes, TestQuestionRes } from "../../../type/test";
import { TEST_QUESTION_REGISTRY } from "../ui/Registry";
import "../css/TestRunner.css"
import { submitTest } from "../../../api/test";
import { getProfileId } from "../../../store/storage";
import { useNavigate } from "react-router-dom";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";

export type SelValue =
  | { type: "option"; value: number | null }                       // chọn 1
  | { type: "text"; value: string }                                // nhập chữ
  | { type: "pairs"; value: { leftOptionId: number; rightOptionId: number }[] } // nối
  | { type: "sequence"; value: number[] };                         // sắp xếp

type SelMap = Record<number, SelValue | null>; // qId -> optionId

export default function TestRunner({ test }: { test: TestRes }) {
  // sắp xếp câu theo position
  const questions = useMemo(
    () => test.questionRes.slice().sort((a, b) => a.position - b.position),
    [test.questionRes]
  );
  const [idx, setIdx] = useState(0);
  const q: TestQuestionRes = questions[idx];

  
  const navigate = useNavigate();

  const [selected, setSelected] = useState<SelMap>({});

  // timer (đếm lùi)
  const totalSec = (test.durationMin ?? 20) * 60;
  const [remain, setRemain] = useState(totalSec);

  const [startedAt] = useState(new Date().toISOString());

  useEffect(() => {
    const t = setInterval(() => setRemain((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (remain === 0) handleSubmit();
  }, [remain]);

  const host = useMemo(
    () => ({
      getSelected: (qid: number) => selected[qid] ?? null,
      setSelected: (qid: number, value: SelValue) =>
      setSelected((prev) => ({ ...prev, [qid]: value })),
      disabled: false,
    }),
    [selected]
  );

  function go(i: number) {
    setIdx(Math.min(Math.max(0, i), questions.length - 1));
  }
  const next = async () => {
        // Lấy câu hỏi *hiện tại* (TRƯỚC KHI TĂNG IDX)
        const currentQuestion = questions[idx];
        const currentAnswer = selected[currentQuestion.id];

        // 1. GỌI API (nếu đã trả lời)
        if (currentAnswer != null) {
                   const learnerProfileId = Number(getProfileId());
                   const myPayload: LessonProgressReq = {
                   learnerProfileId,
                   lessonId: Number(test.lessonId),
                   itemType: "TEST_QUESTION", // Phải là chuỗi khớp với Enum
                   itemRefId: Number(currentQuestion.id)
                   };
               
                   try {
                       await markItemAsCompleted(myPayload);
                       console.log("FE: Đã cập nhật thành công!");
                        // 2. CHUYỂN CÂU (ngay lập tức)
                        go(idx + 1);
                   } catch (error) {
                       console.error("Lỗi khi đang lưu tiến độ:", error);
                       if (error instanceof Error) {
                           console.error(error.message); 
                       } else {
                           console.error("Một lỗi không xác định đã xảy ra:", error);
                       }
                   }
              }else{
                  go(idx + 1);
              }

      
    };
  const prev = () => go(idx - 1);

async function handleSubmit() {
  const learnerId = getProfileId();
  if (learnerId == null) {
    // Handle missing profile explicitly instead of forcing a value
    alert("Vui lòng chọn hồ sơ học sinh trước khi nộp bài.");
    return;
  }
  const payload = {
    learnerId  ,
    startedAt,
    finishedAt: new Date().toISOString(),
    answers: questions.map((qq) => {
       const sel = selected[qq.id];
        switch (sel?.type) {
          case "option":
            return { questionId: qq.id, optionId: sel.value };
          case "text":
            return { questionId: qq.id, textInput: sel.value };
          case "pairs":
            return { questionId: qq.id, pairs: sel.value };
          case "sequence":
            return { questionId: qq.id, sequence: sel.value };
          default:
            return { questionId: qq.id };
        }
    }),
  };

  try {
    const res = await submitTest(test.id, payload);
    navigate("/learn/test-result", { state: res }); 
  } catch (err) {
    console.error("Lỗi khi nộp bài:", err);
    alert("Đã có lỗi khi nộp bài, vui lòng thử lại.");
  }

}

  const pad = (n: number) => n.toString().padStart(2, "0");

const hh = Math.floor(remain / 3600);
const mm = Math.floor((remain % 3600) / 60);
const ss = remain % 60;

const isLow = remain <= 60;

  const render =
    TEST_QUESTION_REGISTRY[q.questionType]?.(q, host) ?? ( // bị báo lỗi
      <div>Chưa hỗ trợ loại: {q.questionType}</div>
    );

  return (
    <div className="test-layout">
      {/* Thanh trên: số câu / timer */}
      <div className="test-bar">
        {/* <div className="test-timer">🕒 {pad(mm)}:{pad(ss)}</div> */}
        <div className={`test-timer ${isLow ? "is-low" : ""}`}>
          <span className="test-timer__icon">🕒</span>
          <span className="test-timer__hh">{pad(hh)}</span>
          <span className="test-timer__colon">:</span>
          <span className="test-timer__mm">{pad(mm)}</span>
          <span className="test-timer__colon">:</span>
          <span className="test-timer__ss">{pad(ss)}</span>
        </div>

      </div>

      <div className="test-body">
        {/* Sidebar danh sách câu */}
        <div className="sidenav">
        <div className="test-index">
          <p>{idx + 1}/{questions.length}</p>
        </div>
          <aside className="test-sidenav">
            {questions.map((qq, i) => {
            const done = selected[qq.id] != null;
            const cls = ["test-qbtn"];
            if (i === idx) cls.push("is-current");
            if (done) cls.push("is-answered");
            return (
              <button key={qq.id} className={cls.join(" ")} onClick={() => go(i)}>
                {i + 1}
              </button>
            );
          })}
        </aside>
        </div>
        {/* Câu hỏi */}
        <main className="test-main">
          <div className="test-card">{render}</div>

          <div className="test-actions">
            <button onClick={prev} disabled={idx === 0} className="pg-btn pg-btn--ghost">
              QUAY LẠI
            </button>
            {idx < questions.length - 1 ? (
              <button onClick={next} className="pg-btn pg-btn--primary">
                TIẾP THEO
              </button>
            ) : (
              <button onClick={handleSubmit} className="pg-btn pg-btn--success">
                NỘP BÀI
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
