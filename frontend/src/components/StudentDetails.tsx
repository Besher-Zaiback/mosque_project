import type { StudentOverview } from "../types/models";
import { formatDate, getRatingLabel } from "../utils/labels";

export function StudentDetails({ overview }: { overview: StudentOverview }) {
  const { student, evaluations = [], lastExam } = overview;
  return (
    <div className="detailsPanel">
      <div className="detailsHeader">
        <div>
          <h3>{student.fullName}</h3>
          <p>{student.email ?? "لا يوجد بريد مسجل"}</p>
        </div>
        <span className="softBadge">{student.mosque?.name ?? "بدون جامع"}</span>
      </div>
      <div className="metricsGrid">
        <div className="metric">
          <span>الحلقة</span>
          <strong>{student.circle?.name ?? "-"}</strong>
        </div>
        <div className="metric">
          <span>الصفحة الحالية</span>
          <strong>{student.currentPage ?? "-"}</strong>
        </div>
        <div className="metric">
          <span>المتبقي</span>
          <strong>{student.remainingPages ?? "-"}</strong>
        </div>
        <div className="metric">
          <span>الإنجاز</span>
          <strong>{student.progressPercent ?? 0}%</strong>
        </div>
      </div>
      {lastExam && (
        <div className="noticeLine">
          آخر اختبار: {lastExam.score}/100 -{" "}
          {lastExam.passed ? "ناجح" : "يحتاج مراجعة"}
        </div>
      )}
      <div className="sectionHead">
        <h3>آخر التقييمات</h3>
      </div>
      {evaluations.length === 0 ? (
        <p className="hint">لا توجد تقييمات بعد</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>الصفحة</th>
              <th>التقييم</th>
              <th>الملاحظة</th>
              <th>المشرف</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((evaluation, index) => (
              <tr key={evaluation.id ?? index}>
                <td>{evaluation.pageNumber}</td>
                <td>
                  <span
                    className={`rating-badge ${evaluation.rating.toLowerCase()}`}
                  >
                    {getRatingLabel(evaluation.rating)}
                  </span>
                </td>
                <td>{evaluation.note || "-"}</td>
                <td>{evaluation.evaluator?.fullName ?? "-"}</td>
                <td>{formatDate(evaluation.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
