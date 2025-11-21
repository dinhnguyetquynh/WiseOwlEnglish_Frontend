import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTestById } from "../../../api/test";
import type { TestRes } from "../../../type/test";
import TestRunner from "../ui/TestRunner";
import "../css/TestPage.css";
export default function TestPage() {
  const { testId = "" } = useParams();
  const [data, setData] = useState<TestRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getTestById(Number(testId));
        if (!alive) return;
        // sắp xếp câu hỏi sẵn
        res.questionRes.sort((a, b) => a.position - b.position);
        setData(res);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "Lỗi tải bài kiểm tra");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [testId]);

  if (loading) return <div>Đang tải bài kiểm tra…</div>;
  if (err) return <div className="pg-text-error">{err}</div>;
  if (!data) return null;

  return(
    <div className="test-page">
      <div className="test-container">
        {/* <div>
          <p>Trang chủ &gt; Menu Bài học &gt; Kiểm tra &gt; Test 1  </p>
        </div> */}
        <TestRunner test={data} />
      </div>
    </div>
  ) ;
}
