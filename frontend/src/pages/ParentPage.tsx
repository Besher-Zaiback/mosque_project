import { useEffect, useState } from "react";
import { useApi } from "../api/client";
import { Pagination } from "../components/Pagination";
import type { AuthState } from "../hooks/useAuth";
import type { Evaluation } from "../types/models";
import { formatDate, getErrorMessage, getRatingLabel } from "../utils/labels";
import { paginateItems } from "../utils/pagination";

export function ParentPage({ auth }: { auth: AuthState }) {
  const request = useApi(auth);
  const [data, setData] = useState<{
    student?: {
      fullName: string;
      currentPage: number;
      progressPercent: number;
      circle?: { name: string } | null;
    };
    evaluations?: Evaluation[];
    lastExam?: { score: number; passed: boolean } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [evaluationsPage, setEvaluationsPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError("");
    request("/parent/dashboard")
      .then(setData)
      .catch((err) => {
        setError(getErrorMessage(err));
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [request]);

  if (loading) {
    return (
      <div className="page centered">
        <div className="loading">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="card">
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  if (!data?.student) {
    return (
      <div className="page">
        <div className="card">
          <p className="error">لا توجد بيانات متعلقة بابنك</p>
        </div>
      </div>
    );
  }

  const { student, evaluations = [], lastExam } = data;
  const paginatedEvaluations = paginateItems(evaluations, evaluationsPage, 8);

  return (
    <div className="page">
      <div className="card student-card">
        <div className="student-header">
          <div className="student-avatar">{student.fullName.charAt(0)}</div>
          <div className="student-info">
            <h2>{student.fullName}</h2>
            <span className="student-circle">{student.circle?.name ?? "بدون حلقة"}</span>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-card">
            <span className="progress-label">الصفحة الحالية</span>
            <span className="progress-value">{student.currentPage}</span>
          </div>
          <div className="progress-card">
            <span className="progress-label">نسبة الإنجاز</span>
            <span className="progress-value">{student.progressPercent}%</span>
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${student.progressPercent}%` }} />
        </div>
      </div>

      {lastExam && (
        <div className="card">
          <h2>آخر اختبار</h2>
          <div className="exam-result">
            <div className="exam-score">
              <span className="score-value">{lastExam.score}</span>
              <span className="score-label">/ 100</span>
            </div>
            <div className={`exam-status ${lastExam.passed ? "passed" : "failed"}`}>
              {lastExam.passed ? "نجح" : "يحتاج مراجعة"}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>سجل التقييمات</h2>
        {evaluations.length === 0 ? (
          <p className="hint">لا توجد تقييمات سابقة</p>
        ) : (
          <>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>الصفحة</th>
                    <th>التقييم</th>
                    <th>ملاحظة المشرف</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvaluations.items.map((evaluation, index) => (
                    <tr key={evaluation.id ?? index}>
                      <td>{evaluation.pageNumber}</td>
                      <td>
                        <span className={`rating-badge ${evaluation.rating.toLowerCase()}`}>
                          {getRatingLabel(evaluation.rating)}
                        </span>
                      </td>
                      <td>{evaluation.note || "-"}</td>
                      <td>{formatDate(evaluation.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={paginatedEvaluations.safePage}
              totalPages={paginatedEvaluations.totalPages}
              totalItems={evaluations.length}
              pageSize={8}
              onPageChange={setEvaluationsPage}
              label="التقييمات"
            />
          </>
        )}
      </div>
    </div>
  );
}
