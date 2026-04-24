import { useCallback, useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import { Pagination } from "../components/Pagination";
import { useApi } from "../api/client";
import { StudentDetails } from "../components/StudentDetails";
import { StudentsTable } from "../components/StudentsTable";
import type { AuthState } from "../hooks/useAuth";
import type { Circle, ManagedAccount, Mosque, Student, StudentOverview } from "../types/models";
import { getErrorMessage, getRoleLabel } from "../utils/labels";
import { paginateItems } from "../utils/pagination";

export function ManagerPage({ auth }: { auth: AuthState }) {
  const request = useApi(auth);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [supervisors, setSupervisors] = useState<Array<{ id: number; fullName: string }>>([]);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [mosqueId, setMosqueId] = useState("");
  const [circleName, setCircleName] = useState("");
  const [circleLevel, setCircleLevel] = useState("");
  const [circleStart, setCircleStart] = useState("");
  const [circleEnd, setCircleEnd] = useState("");
  const [circleSupervisorId, setCircleSupervisorId] = useState("");
  const [editingCircleId, setEditingCircleId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<StudentOverview | null>(null);
  const [accountTab, setAccountTab] = useState(1);
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [selectedCircleId, setSelectedCircleId] = useState("");
  const [linkedStudentId, setLinkedStudentId] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);
  const [circleModalOpen, setCircleModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    action: () => Promise<void> | void;
  } | null>(null);
  const [circlesPage, setCirclesPage] = useState(1);
  const [studentsPage, setStudentsPage] = useState(1);
  const [accountsPage, setAccountsPage] = useState(1);

  const myCircles = auth.user?.mosque?.id
    ? circles.filter((circle) => circle.mosque?.id === auth.user?.mosque?.id)
    : circles;
  const accountCircles =
    auth.user?.role === "GENERAL_MANAGER" && mosqueId
      ? circles.filter((circle) => String(circle.mosque?.id) === mosqueId)
      : myCircles;
  const totalStudents = students.length;
  const totalAccounts = accounts.length;
  const averageProgress = totalStudents
    ? Math.round(
        students.reduce((sum, student) => sum + (student.progressPercent ?? 0), 0) /
          totalStudents
      )
    : 0;
  const paginatedCircles = paginateItems(myCircles, circlesPage, 6);
  const paginatedStudents = paginateItems(students, studentsPage, 8);
  const paginatedAccounts = paginateItems(accounts, accountsPage, 8);

  const refresh = useCallback(async () => {
    const loaders = [
      request("/manager/circles"),
      request("/manager/students"),
      request("/manager/supervisors"),
      request("/manager/accounts"),
    ] as const;
    if (auth.user?.role === "GENERAL_MANAGER") {
      const [circlesData, studentsData, supervisorsData, accountsData, mosquesData] = await Promise.all([
        ...loaders,
        request("/general/mosques"),
      ]);
      setCircles(circlesData);
      setStudents(studentsData);
      setSupervisors(supervisorsData);
      setAccounts(accountsData);
      setMosques(mosquesData);
      if (!mosqueId && mosquesData.length) setMosqueId(String(mosquesData[0].id));
      return;
    }
    const [circlesData, studentsData, supervisorsData, accountsData] = await Promise.all(loaders);
    setCircles(circlesData);
    setStudents(studentsData);
    setSupervisors(supervisorsData);
    setAccounts(accountsData);
  }, [auth.user?.role, mosqueId, request]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const doSearch = async () => {
    setStudents(
      search
        ? await request(`/manager/students/search/${encodeURIComponent(search)}`)
        : await request("/manager/students")
    );
  };

  const resetCircleEditor = () => {
    setCircleModalOpen(false);
    setEditingCircleId(null);
    setCircleName("");
    setCircleLevel("");
    setCircleStart("");
    setCircleEnd("");
    setCircleSupervisorId("");
  };

  const resetAccountEditor = () => {
    setAccountModalOpen(false);
    setEditingAccountId(null);
    setAccountName("");
    setAccountEmail("");
    setAccountPassword("");
    setSelectedCircleId("");
    setLinkedStudentId("");
  };

  const saveCircle = async () => {
    setError("");
    const payload: Record<string, unknown> = {
      name: circleName,
      levelOrder: Number(circleLevel),
      startPage: Number(circleStart),
      endPage: Number(circleEnd),
      supervisorId: circleSupervisorId ? Number(circleSupervisorId) : undefined,
      mosqueId: mosqueId ? Number(mosqueId) : undefined,
    };

    try {
      if (editingCircleId) {
        await request(`/manager/circles/${editingCircleId}/update`, "post", {
          ...payload,
          supervisorId: payload.supervisorId ?? 0,
        });
        setMsg("تم تعديل الحلقة");
      } else {
        await request("/manager/circles", "post", payload);
        setMsg("تم إنشاء الحلقة");
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return;
    }

    resetCircleEditor();
    await refresh();
  };

  const editCircle = (circle: Circle) => {
    setEditingCircleId(circle.id);
    setCircleName(circle.name);
    setCircleLevel(String(circle.levelOrder));
    setCircleStart(String(circle.startPage));
    setCircleEnd(String(circle.endPage));
    setCircleSupervisorId(circle.supervisor?.id ? String(circle.supervisor.id) : "");
    if (circle.mosque?.id) setMosqueId(String(circle.mosque.id));
    setCircleModalOpen(true);
  };

  const createAccount = async () => {
    setError("");
    const role =
      accountTab === 1 ? "STUDENT" : accountTab === 2 ? "PARENT" : accountTab === 3 ? "SUPERVISOR" : "MOSQUE_MANAGER";
    const payload: Record<string, unknown> = {
      fullName: accountName,
      email: accountEmail,
      password: accountPassword,
      role,
    };

    if (accountTab === 1) {
      payload.circleId = Number(selectedCircleId);
    } else if (accountTab === 2) {
      payload.linkedStudentId = Number(linkedStudentId);
    } else if (accountTab === 4) {
      payload.mosqueId = Number(mosqueId);
    }

    if (auth.user?.role === "GENERAL_MANAGER" && mosqueId) {
      payload.mosqueId = Number(mosqueId);
    }

    try {
      if (editingAccountId) {
        await request(`/manager/accounts/${editingAccountId}/update`, "post", payload);
        setMsg("تم تعديل الحساب");
      } else {
        await request("/manager/accounts", "post", payload);
        setMsg("تم إنشاء الحساب");
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return;
    }

    resetAccountEditor();
    await refresh();
  };

  const deleteCircle = async (circle: Circle) => {
    setError("");
    if (circle.studentsCount) {
      setError("لا يمكن حذف حلقة تحتوي على طلاب. انقل أو احذف الطلاب أولاً.");
      return;
    }
    try {
      await request(`/manager/circles/${circle.id}/delete`, "post");
      setMsg("تم حذف الحلقة");
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const removeStudent = async (id: number) => {
    setError("");
    try {
      await request(`/manager/students/${id}/remove`, "post");
      setMsg("تم حذف الطالب");
      setStudents(await request("/manager/students"));
      if (detail?.student.id === id) setDetail(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEditAccount = (account: ManagedAccount) => {
    setEditingAccountId(account.id);
    setAccountName(account.fullName);
    setAccountEmail(account.email);
    setAccountPassword("");
    setMosqueId(account.mosque?.id ? String(account.mosque.id) : "");
    setSelectedCircleId(account.circle?.id ? String(account.circle.id) : "");
    setLinkedStudentId(account.linkedStudentId ? String(account.linkedStudentId) : "");
    if (account.role === "STUDENT") setAccountTab(1);
    else if (account.role === "PARENT") setAccountTab(2);
    else if (account.role === "SUPERVISOR") setAccountTab(3);
    else setAccountTab(4);
    setAccountModalOpen(true);
  };

  const deleteAccount = async (account: ManagedAccount) => {
    setError("");
    try {
      await request(`/manager/accounts/${account.id}/delete`, "post");
      setMsg("تم حذف الحساب");
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const requestStudentExam = async (id: number) => {
    setError("");
    try {
      await request(`/manager/exam-request/${id}`, "post");
      setMsg("تم إرسال طلب اختبار");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="page">
      <div className="pageHero">
        <div>
          <span className="eyebrow">
            {auth.user?.role === "GENERAL_MANAGER" ? "لوحة الإدارة" : "لوحة مدير الجامع"}
          </span>
          <h1>إدارة الحلقات والحسابات والطلاب</h1>
          <p>واجهة أوضح لإدارة البيانات الكثيرة بدون زحمة، مع تقسيم القوائم إلى صفحات.</p>
        </div>
        <div className="heroStats">
          <div className="heroStat">
            <span>الحلقات</span>
            <strong>{myCircles.length}</strong>
          </div>
          <div className="heroStat">
            <span>الطلاب</span>
            <strong>{students.length}</strong>
          </div>
          <div className="heroStat">
            <span>الحسابات</span>
            <strong>{accounts.length}</strong>
          </div>
        </div>
      </div>

      {(msg || error) && (
        <div className="statusStack">
          {msg && <p className="success">{msg}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      )}

      <div className="summaryGrid">
        <div className="summaryCard">
          <span>عدد الحلقات</span>
          <strong>{myCircles.length}</strong>
        </div>
        <div className="summaryCard">
          <span>عدد الطلاب</span>
          <strong>{totalStudents}</strong>
        </div>
        <div className="summaryCard">
          <span>عدد الحسابات</span>
          <strong>{totalAccounts}</strong>
        </div>
        <div className="summaryCard">
          <span>متوسط الإنجاز</span>
          <strong>{averageProgress}%</strong>
        </div>
      </div>

      <div className="card">
        <h2>إدارة الحلقات</h2>
        <div className="grid">
          <input value={circleName} onChange={(e) => setCircleName(e.target.value)} placeholder="اسم الحلقة" />
          <input inputMode="numeric" value={circleLevel} onChange={(e) => setCircleLevel(e.target.value)} placeholder="ترتيب المستوى" />
          <input inputMode="numeric" value={circleStart} onChange={(e) => setCircleStart(e.target.value)} placeholder="من صفحة" />
          <input inputMode="numeric" value={circleEnd} onChange={(e) => setCircleEnd(e.target.value)} placeholder="إلى صفحة" />
          <select value={circleSupervisorId} onChange={(e) => setCircleSupervisorId(e.target.value)}>
            <option value="">بدون مشرف</option>
            {supervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.fullName}
              </option>
            ))}
          </select>
          {auth.user?.role === "GENERAL_MANAGER" && (
            <select value={mosqueId} onChange={(e) => setMosqueId(e.target.value)}>
              <option value="">اختر الجامع</option>
              {mosques.map((mosque) => (
                <option key={mosque.id} value={mosque.id}>
                  {mosque.name}
                </option>
              ))}
            </select>
          )}
          <button onClick={() => void saveCircle()}>
            {editingCircleId ? "حفظ التعديل" : "إضافة حلقة"}
          </button>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>المستوى</th>
                <th>الحلقة</th>
                <th>الجامع</th>
                <th>المشرف</th>
                <th>صفحات</th>
                <th>تعديل</th>
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCircles.items.map((circle) => (
                <tr key={circle.id}>
                  <td>{circle.levelOrder}</td>
                  <td>{circle.name}</td>
                  <td>{circle.mosque?.name ?? "-"}</td>
                  <td>{circle.supervisor?.fullName ?? "-"}</td>
                  <td>{circle.startPage}-{circle.endPage}</td>
                  <td>
                    <button onClick={() => editCircle(circle)}>تعديل</button>
                  </td>
                  <td>
                    <button
                      className="dangerButton"
                      onClick={() =>
                        setConfirmState({
                          title: "تأكيد حذف الحلقة",
                          message: `سيتم حذف الحلقة "${circle.name}" إذا كانت خالية من الطلاب.`,
                          action: async () => {
                            await deleteCircle(circle);
                            setConfirmState(null);
                          },
                        })
                      }
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={paginatedCircles.safePage}
          totalPages={paginatedCircles.totalPages}
          totalItems={myCircles.length}
          pageSize={6}
          onPageChange={setCirclesPage}
          label="الحلقات"
        />
      </div>

      <div className="card">
        <h2>إدارة الطلاب والبحث</h2>
        <div className="inline">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الرقم" />
          <button onClick={() => void doSearch()}>بحث</button>
        </div>
        <StudentsTable
          students={paginatedStudents.items}
          onOpen={(id) => void request(`/students/${id}`).then(setDetail)}
          onExam={(id) => void requestStudentExam(id)}
          onRemove={(id) =>
            setConfirmState({
              title: "تأكيد حذف الطالب",
              message: "سيتم حذف الطالب وكل التقييمات وطلبات الاختبار المرتبطة به.",
              action: async () => {
                await removeStudent(id);
                setConfirmState(null);
              },
            })
          }
        />
        <Pagination
          page={paginatedStudents.safePage}
          totalPages={paginatedStudents.totalPages}
          totalItems={students.length}
          pageSize={8}
          onPageChange={setStudentsPage}
          label="الطلاب"
        />
      </div>

      <div className="card">
        <h2>إدارة الحسابات</h2>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الدور</th>
                <th>البريد</th>
                <th>الجامع</th>
                <th>الحلقة</th>
                <th>مرتبط/الحالي</th>
                <th>تعديل</th>
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.items.map((account) => (
                <tr key={account.id}>
                  <td>{account.fullName}</td>
                  <td>{getRoleLabel(account.role)}</td>
                  <td>{account.email}</td>
                  <td>{account.mosque?.name ?? "-"}</td>
                  <td>{account.circle?.name ?? "-"}</td>
                  <td>{account.linkedStudentId ?? account.currentPage ?? "-"}</td>
                  <td>
                    <button onClick={() => startEditAccount(account)}>تعديل</button>
                  </td>
                  <td>
                    <button
                      className="dangerButton"
                      onClick={() =>
                        setConfirmState({
                          title: "تأكيد الحذف",
                          message: `سيتم حذف الحساب "${account.fullName}" نهائياً.`,
                          action: async () => {
                            await deleteAccount(account);
                            setConfirmState(null);
                          },
                        })
                      }
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={paginatedAccounts.safePage}
          totalPages={paginatedAccounts.totalPages}
          totalItems={accounts.length}
          pageSize={8}
          onPageChange={setAccountsPage}
          label="الحسابات"
        />
      </div>

      <div className="card">
        <h2>إنشاء حسابات جديدة</h2>
        <div className="tabs">
          <button className={`tab ${accountTab === 1 ? "active" : ""}`} onClick={() => setAccountTab(1)}>إضافة طالب</button>
          <button className={`tab ${accountTab === 2 ? "active" : ""}`} onClick={() => setAccountTab(2)}>إضافة ولي أمر</button>
          <button className={`tab ${accountTab === 3 ? "active" : ""}`} onClick={() => setAccountTab(3)}>إضافة مشرف</button>
          {auth.user?.role === "GENERAL_MANAGER" && (
            <button className={`tab ${accountTab === 4 ? "active" : ""}`} onClick={() => setAccountTab(4)}>إضافة مدير جامع</button>
          )}
        </div>

        {(accountTab === 1 || accountTab === 2 || accountTab === 3) && (
          <div className="tab-content">
            <div className="grid">
              <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder={accountTab === 1 ? "اسم الطالب بالكامل" : accountTab === 2 ? "اسم ولي الأمر" : "اسم المشرف"} />
              <input value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} placeholder="البريد الإلكتروني" />
              <input value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} type="password" placeholder="كلمة المرور" />
              {accountTab === 1 && (
                <select value={selectedCircleId} onChange={(e) => setSelectedCircleId(e.target.value)}>
                  <option value="">اختر الحلقة</option>
                  {accountCircles.map((circle) => (
                    <option key={circle.id} value={circle.id}>
                      {circle.name} - {circle.mosque?.name ?? ""}
                    </option>
                  ))}
                </select>
              )}
              {accountTab === 2 && (
                <input inputMode="numeric" value={linkedStudentId} onChange={(e) => setLinkedStudentId(e.target.value)} placeholder="رقم الطالب المرتبط" />
              )}
              {auth.user?.role === "GENERAL_MANAGER" && (
                <select value={mosqueId} onChange={(e) => setMosqueId(e.target.value)}>
                  <option value="">اختر الجامع</option>
                  {mosques.map((mosque) => (
                    <option key={mosque.id} value={mosque.id}>
                      {mosque.name}
                    </option>
                  ))}
                </select>
              )}
              <button onClick={() => void createAccount()}>
                {editingAccountId
                  ? "حفظ تعديل الحساب"
                  : accountTab === 1
                    ? "إنشاء حساب طالب"
                    : accountTab === 2
                      ? "إنشاء حساب ولي أمر"
                      : "إنشاء حساب مشرف"}
              </button>
            </div>
          </div>
        )}

        {accountTab === 4 && auth.user?.role === "GENERAL_MANAGER" && (
          <div className="tab-content">
            <div className="grid">
              <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="اسم مدير الجامع" />
              <input value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} placeholder="البريد الإلكتروني" />
              <input value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} type="password" placeholder="كلمة المرور" />
              <select value={mosqueId} onChange={(e) => setMosqueId(e.target.value)}>
                <option value="">اختر الجامع</option>
                {mosques.map((mosque) => (
                  <option key={mosque.id} value={mosque.id}>
                    {mosque.name}
                  </option>
                ))}
              </select>
              <button onClick={() => void createAccount()}>
                {editingAccountId ? "حفظ تعديل الحساب" : "إنشاء مدير جامع"}
              </button>
            </div>
          </div>
        )}
      </div>

      {detail && (
        <div className="card">
          <h2>تفاصيل الطالب</h2>
          <StudentDetails overview={detail} />
        </div>
      )}

      <Modal
        open={circleModalOpen}
        title="تعديل الحلقة"
        onClose={resetCircleEditor}
        actions={
          <>
            <button className="secondaryButton" onClick={resetCircleEditor}>
              إلغاء
            </button>
            <button
              onClick={() =>
                setConfirmState({
                  title: "تأكيد التعديل",
                  message: "سيتم حفظ التعديلات على الحلقة الحالية.",
                  action: async () => {
                    await saveCircle();
                    setConfirmState(null);
                  },
                })
              }
            >
              حفظ التعديل
            </button>
          </>
        }
      >
        <div className="grid">
          <input value={circleName} onChange={(e) => setCircleName(e.target.value)} placeholder="اسم الحلقة" />
          <input inputMode="numeric" value={circleLevel} onChange={(e) => setCircleLevel(e.target.value)} placeholder="ترتيب المستوى" />
          <input inputMode="numeric" value={circleStart} onChange={(e) => setCircleStart(e.target.value)} placeholder="من صفحة" />
          <input inputMode="numeric" value={circleEnd} onChange={(e) => setCircleEnd(e.target.value)} placeholder="إلى صفحة" />
          <select value={circleSupervisorId} onChange={(e) => setCircleSupervisorId(e.target.value)}>
            <option value="">بدون مشرف</option>
            {supervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.fullName}
              </option>
            ))}
          </select>
          {auth.user?.role === "GENERAL_MANAGER" && (
            <select value={mosqueId} onChange={(e) => setMosqueId(e.target.value)}>
              <option value="">اختر الجامع</option>
              {mosques.map((mosque) => (
                <option key={mosque.id} value={mosque.id}>
                  {mosque.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </Modal>

      <Modal
        open={accountModalOpen}
        title="تعديل الحساب"
        onClose={resetAccountEditor}
        actions={
          <>
            <button className="secondaryButton" onClick={resetAccountEditor}>
              إلغاء
            </button>
            <button
              onClick={() =>
                setConfirmState({
                  title: "تأكيد التعديل",
                  message: "سيتم حفظ التعديلات على الحساب الحالي.",
                  action: async () => {
                    await createAccount();
                    setConfirmState(null);
                  },
                })
              }
            >
              حفظ التعديل
            </button>
          </>
        }
      >
        <div className="grid">
          <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="الاسم الكامل" />
          <input value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} placeholder="البريد الإلكتروني" />
          <input value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} type="password" placeholder="كلمة مرور جديدة اختيارية" />
          {accountTab === 1 && (
            <select value={selectedCircleId} onChange={(e) => setSelectedCircleId(e.target.value)}>
              <option value="">اختر الحلقة</option>
              {accountCircles.map((circle) => (
                <option key={circle.id} value={circle.id}>
                  {circle.name} - {circle.mosque?.name ?? ""}
                </option>
              ))}
            </select>
          )}
          {accountTab === 2 && (
            <input inputMode="numeric" value={linkedStudentId} onChange={(e) => setLinkedStudentId(e.target.value)} placeholder="رقم الطالب المرتبط" />
          )}
          {(accountTab === 3 || accountTab === 4) && auth.user?.role === "GENERAL_MANAGER" && (
            <select value={mosqueId} onChange={(e) => setMosqueId(e.target.value)}>
              <option value="">اختر الجامع</option>
              {mosques.map((mosque) => (
                <option key={mosque.id} value={mosque.id}>
                  {mosque.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(confirmState)}
        title={confirmState?.title ?? ""}
        onClose={() => setConfirmState(null)}
        actions={
          <>
            <button className="secondaryButton" onClick={() => setConfirmState(null)}>
              رجوع
            </button>
            <button className="dangerButton" onClick={() => void confirmState?.action()}>
              تأكيد
            </button>
          </>
        }
      >
        <p className="modalMessage">{confirmState?.message}</p>
      </Modal>
    </div>
  );
}
