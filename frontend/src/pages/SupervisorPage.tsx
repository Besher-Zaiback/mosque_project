import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "../api/client";
import { Pagination } from "../components/Pagination";
import { StudentDetails } from "../components/StudentDetails";
import { StudentsTable } from "../components/StudentsTable";
import type { AuthState } from "../hooks/useAuth";
import type { Student, StudentOverview } from "../types/models";
import { getErrorMessage } from "../utils/labels";
import { paginateItems } from "../utils/pagination";
import { filterAndRankSearch } from "../utils/search";

export function SupervisorPage({ auth }: { auth: AuthState }) {
  const request = useApi(auth);
  const location = useLocation();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [rating, setRating] = useState("GOOD");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<StudentOverview | null>(null);
  const [studentsPage, setStudentsPage] = useState(1);

  const filteredStudents = filterAndRankSearch(students, search, (student) => [
    student.id,
    student.fullName,
    student.email,
    student.circle?.name,
    student.mosque?.name,
    student.currentPage,
    `صفحة ${student.currentPage ?? ""}`,
    student.remainingPages,
    student.progressPercent,
    `${student.progressPercent ?? 0}%`,
  ]);
  const paginatedStudents = paginateItems(filteredStudents, studentsPage, 8);

  useEffect(() => {
    void request("/supervisor/students").then((data) => {
      setStudents(data);
      if (data.length) setStudentId((current) => current || String(data[0].id));
    });
  }, [request]);

  const selectedStudent = students.find((student) => String(student.id) === studentId);
  const pageToEvaluate = selectedStudent?.currentPage ?? "";
  const activeView = location.pathname.endsWith("/students")
    ? "students"
    : location.pathname.endsWith("/evaluate")
      ? "evaluate"
      : "students";

  const openStudentDetails = async (id: number) => {
    setError("");
    setMsg("");
    try {
      setDetail(await request(`/students/${id}`));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

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

      {(msg || error) && (
        <div className="statusStack">
          {msg && <p className="success">{msg}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {activeView === "evaluate" && (
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
      </div>
      )}

      {activeView === "students" && (
      <div className="card">
        <div className="sectionHead">
          <div>
            <h2>طلاب الحلقات التابعة لك</h2>
            <span className="resultMeta">
              {search.trim()
                ? `${filteredStudents.length} نتيجة من ${students.length}`
                : `${students.length} طالب`}
            </span>
          </div>
        </div>
        <div className="searchPanel">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setStudentsPage(1);
            }}
            placeholder="ابحث بالاسم، رقم الطالب، الحلقة، الصفحة، أو النسبة"
            aria-label="بحث في الطلاب"
          />
          {search && (
            <button
              className="secondaryButton"
              onClick={() => {
                setSearch("");
                setStudentsPage(1);
              }}
            >
              مسح
            </button>
          )}
        </div>
        <StudentsTable
          students={paginatedStudents.items}
          onOpen={(id) => void openStudentDetails(id)}
          emptyText="لا يوجد طلاب مطابقون للبحث"
        />
        <Pagination
          page={paginatedStudents.safePage}
          totalPages={paginatedStudents.totalPages}
          totalItems={filteredStudents.length}
          pageSize={8}
          onPageChange={setStudentsPage}
          label="الطلاب"
        />
      </div>
      )}

      {activeView === "students" && detail && (
        <div className="card">
          <h2>تفاصيل الطالب</h2>
          <StudentDetails overview={detail} />
        </div>
      )}
    </div>
  );
}
