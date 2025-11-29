import type { TestQuestionRes } from "../../../type/test";
import TestPWM from "../../../components/learner/ui/TestPWM";
import TestSWM from "../../../components/learner/ui/TestSWM";
import type { JSX } from "react";
import type {SelValue} from "../ui/TestRunner"
import TestPWW from "../../../components/learner/ui/TestPWW";
import TestPSM from "../../../components/learner/ui/TestPSM";
import TestSHW from "../../../components/learner/ui/TestSHW";
import TestWTS from "../../../components/learner/ui/TestWTS";
import TestPMW from "../../../components/learner/ui/TestPMW";

export type TestHost = {
  getSelected: (qid: number) => SelValue | null; // ✅ trả về kiểu dữ liệu đầy đủ
  setSelected: (qid: number, value: SelValue) => void; // ✅ nhận kiểu dữ liệu đầy đủ
  disabled?: boolean;
};

export const TEST_QUESTION_REGISTRY: Record<
  string,
  (q: TestQuestionRes, host: TestHost) => JSX.Element
> = {
  
 PICTURE_WORD_MATCHING: (q, host) => {
    const sel = host.getSelected(q.id);
    const selectedId = sel?.type === "option" ? sel.value : null; // ✅ lấy đúng kiểu number | null

    return (
      <TestPWM
        q={q}
        selectedId={selectedId}
        onPick={(id) => host.setSelected(q.id, { type: "option", value: id })} // ✅ đúng kiểu SelValue
        disabled={host.disabled}
      />
    );
  },
  SOUND_WORD_MATCHING: (q, host) => {
    const sel = host.getSelected(q.id);
    const selectedId = sel?.type === "option" ? sel.value : null;

    return (
      <TestSWM
        q={q}
        selectedId={selectedId}
        onPick={(id) => host.setSelected(q.id, { type: "option", value: id })}
        disabled={host.disabled}
      />
    );
  },

  // 3. Nhìn hình chọn câu (MỚI)
  PICTURE_SENTENCE_MATCHING: (q, host) => {
    const sel = host.getSelected(q.id);
    const selectedId = sel?.type === "option" ? sel.value : null;
    return (
      <TestPSM
        q={q}
        selectedId={selectedId}
        onPick={(id) => host.setSelected(q.id, { type: "option", value: id })}
        disabled={host.disabled}
      />
    );
  },

  PICTURE_WORD_WRITING: (q, host) => {
  const sel = host.getSelected(q.id);
  
  // Lấy giá trị text hiện tại, nếu chưa có thì là chuỗi rỗng
  const currentValue = sel?.type === "text" ? sel.value : "";

  return (
   <TestPWW
        q={q}
        currentValue={currentValue}
        // Khi người dùng gõ, cập nhật state của TestRunner
        onWrite={(text) => host.setSelected(q.id, { type: "text", value: text })}
        disabled={host.disabled}
 />
 );
 },
 // 5. Điền từ còn thiếu (MỚI)
  SENTENCE_HIDDEN_WORD: (q, host) => {
    const sel = host.getSelected(q.id);
    const currentValue = sel?.type === "text" ? sel.value : "";
    return (
      <TestSHW
        q={q}
        currentValue={currentValue}
        onWrite={(text) => host.setSelected(q.id, { type: "text", value: text })}
        disabled={host.disabled}
      />
    );
  },
  // 6. Sắp xếp câu (MỚI)
  WORD_TO_SENTENCE: (q, host) => {
    const sel = host.getSelected(q.id);
    // Mặc định mảng rỗng nếu chưa chọn
    const sequence = sel?.type === "sequence" ? sel.value : [];
    return (
      <TestWTS
        q={q}
        sequence={sequence}
        onUpdate={(seq) => host.setSelected(q.id, { type: "sequence", value: seq })}
        disabled={host.disabled}
      />
    );
  },
  // 7. Nối hình và chữ (MỚI)
  PICTURE4_WORD4_MATCHING: (q, host) => {
    const sel = host.getSelected(q.id);
    // Mặc định mảng rỗng
    const pairs = sel?.type === "pairs" ? sel.value : [];
    return (
      <TestPMW
        q={q}
        pairs={pairs}
        onUpdate={(p) => host.setSelected(q.id, { type: "pairs", value: p })}
        disabled={host.disabled}
      />
    );
  },

  
};
