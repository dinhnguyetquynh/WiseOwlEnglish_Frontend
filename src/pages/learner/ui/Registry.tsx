import type { TestQuestionRes } from "../../../type/test";
import TestPWM from "../../../components/learner/ui/TestPWM";
import TestSWM from "../../../components/learner/ui/TestSWM";
import type { JSX } from "react";
import type {SelValue} from "../ui/TestRunner"
import TestPWW from "../../../components/learner/ui/TestPWW";

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

  
};
