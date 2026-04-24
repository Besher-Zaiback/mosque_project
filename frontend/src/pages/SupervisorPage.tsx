import { useEffect, useState } from "react";
import { useApi } from "../api/client";
import { Pagination } from "../components/Pagination";
import { StudentsTable } from "../components/StudentsTable";
import type { AuthState } from "../hooks/useAuth";
import type { Student } from "../types/models";
import { paginateItems } from "../utils/pagination";

export function SupervisorPage({ auth }: { auth: AuthState }) {
  const request = useApi(auth);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [rating, setRating] = useState("GOOD");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [studentsPage, setStudentsPage] = useState(1);

  const paginatedStudents = paginateItems(students, studentsPage, 8);

  useEffect(() => {
    void request("/supervisor/students").then((data) => {
      setStudents(data);
      if (data.length) setStudentId((current) => current || String(data[0].id));
    });
  }, [request]);

  const selectedStudent = students.find((student) => String(student.id) === studentId);
  const pageToEvaluate = selectedStudent?.currentPage ?? "";

  const save = async () => {
    if (!selectedStudent || pageToEvaluate === "") {
      setMsg("اختر الطالب أولاً");
      return;
    }
    await request(`/students/${studentId}/evaluate`, "post", {
      pageNumber: Number(pageToEvaluate),
      rating,
      note,
    });
    setMsg(
      rating === "REPEAT"
        ? "تم حفظ الإعادة، وسيعاد تقييم نفس الصفحة"
        : "تم حفظ التقييم والانتقال للصفحة التالية"
    );
    setNote("");
    setStudents(await request("/supervisor/students"));
  };

  return (
    <div className="page">
      <div className="pageHero">
        <div>
          <span className="eyebrow">لوحة المشرف</span>
          <h1>متابعة الحلقة والتقييم اليومي</h1>
          <p>اختر الطالب، قيّم الصفحة الحالية، وراجع مستوى التقدم من نفس الشاشة.</p>
        </div>
        <div className="heroStats">
          <div className="heroStat">
            <span>طلابك</span>
            <strong>{students.length}</strong>
          </div>
          <div className="heroStat">
            <span>التسميع الحالي</span>
            <strong>{selectedStudent?.currentPage ?? "-"}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>تقييم الطالب</h2>
        <div className="grid">
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">اختر الطالب</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName}
              </option>
            ))}
          </select>
          <input inputMode="numeric" value={pageToEvaluate} readOnly placeholder="الصفحة المطلوبة" />
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="REPEAT">إعادة</option>
            <option value="GOOD">جيد</option>
            <option value="VERY_GOOD">جيد جدا</option>
            <option value="EXCELLENT">ممتاز</option>
          </select>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="ملاحظة لولي الأمر" />
          <button onClick={() => void save()}>حفظ</button>
        </div>
        {msg && <p className="success">{msg}</p>}
      </div>

      <div className="card">
        <h2>طلاب الحلقات التابعة لك</h2>
        <StudentsTable students={paginatedStudents.items} />
        <Pagination
          page={paginatedStudents.safePage}
          totalPages={paginatedStudents.totalPages}
          totalItems={students.length}
          pageSize={8}
          onPageChange={setStudentsPage}
          label="الطلاب"
        />
      </div>
    </div>
  );
}
