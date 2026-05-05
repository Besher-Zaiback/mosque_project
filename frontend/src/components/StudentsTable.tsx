import type { Student } from "../types/models";

type StudentsTableProps = {
  students: Student[];
  onOpen?: (id: number) => void;
  onExam?: (id: number) => void;
  onRemove?: (id: number) => void;
  emptyText?: string;
};

export function StudentsTable({
  students,
  onOpen,
  onExam,
  onRemove,
  emptyText = "لا توجد نتائج",
}: StudentsTableProps) {
  const hasActions = Boolean(onOpen || onExam || onRemove);
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>الرقم</th>
            <th>الاسم</th>
            <th>الحلقة</th>
            <th>وصل إلى</th>
            <th>المتبقي</th>
            <th>النسبة</th>
            {hasActions && <th>إجراءات</th>}
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={hasActions ? 7 : 6} className="emptyCell">
                {emptyText}
              </td>
            </tr>
          ) : students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.fullName}</td>
              <td>{student.circle?.name ?? "-"}</td>
              <td>{student.currentPage ?? "-"}</td>
              <td>{student.remainingPages ?? "-"}</td>
              <td>
                <span className="progressChip">{student.progressPercent ?? 0}%</span>
              </td>
              {hasActions && (
                <td className="inline">
                  {onOpen && (
                    <button onClick={() => onOpen(student.id)}>تفاصيل</button>
                  )}
                  {onExam && (
                    <button onClick={() => onExam(student.id)}>طلب اختبار</button>
                  )}
                  {onRemove && (
                    <button
                      className="dangerButton"
                      onClick={() => onRemove(student.id)}
                    >
                      حذف
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
