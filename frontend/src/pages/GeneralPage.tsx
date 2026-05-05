import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "../api/client";
import { Pagination } from "../components/Pagination";
import type { AuthState } from "../hooks/useAuth";
import type { Circle, Mosque } from "../types/models";
import { getErrorMessage } from "../utils/labels";
import { paginateItems } from "../utils/pagination";
import { filterAndRankSearch } from "../utils/search";

export function GeneralPage({ auth }: { auth: AuthState }) {
  const request = useApi(auth);
  const location = useLocation();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mosqueName, setMosqueName] = useState("");
  const [reqId, setReqId] = useState("");
  const [score, setScore] = useState("");
  const [nextCircleId, setNextCircleId] = useState("");
  const [requests, setRequests] = useState<Array<{ id: number; student: { fullName: string }; status: string }>>([]);
  const [mosqueSearch, setMosqueSearch] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [mosquesPage, setMosquesPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);

  const filteredMosques = filterAndRankSearch(mosques, mosqueSearch, (mosque) => [
    mosque.id,
    mosque.name,
  ]);
  const filteredRequests = filterAndRankSearch(requests, requestSearch, (requestItem) => [
      requestItem.id,
      requestItem.student.fullName,
      requestItem.status,
    ]);
  const paginatedMosques = paginateItems(filteredMosques, mosquesPage, 6);
  const paginatedRequests = paginateItems(filteredRequests, requestsPage, 6);
  const activeView = location.pathname.endsWith("/mosques")
    ? "mosques"
    : location.pathname.endsWith("/exams")
      ? "exams"
      : "overview";
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const [mosquesData, requestsData, circlesData] = await Promise.all([
      request("/general/mosques"),
      request("/general/exam-requests"),
      request("/manager/circles"),
    ]);
    setMosques(mosquesData);
    setRequests(requestsData);
    setCircles(circlesData);
  }, [request]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return (
    <div className="page">
      <div className="pageHero">
        <div>
          <span className="eyebrow">الإدارة العامة</span>
          <h1>إدارة الجوامع والاختبارات</h1>
          <p>نظرة أوسع على الجوامع، الحسابات، وطلبات الاختبار من مكان واحد.</p>
        </div>
        <div className="heroStats">
          <div className="heroStat">
            <span>الجوامع</span>
            <strong>{mosques.length}</strong>
          </div>
          <div className="heroStat">
            <span>طلبات الاختبار</span>
            <strong>{requests.length}</strong>
          </div>
        </div>
      </div>

      {(msg || error) && (
        <div className="statusStack">
          {msg && <p className="success">{msg}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {activeView === "mosques" && (
      <div className="card">
        <h2>إدارة الجوامع</h2>
        <div className="inline searchRow">
          <input
            value={mosqueSearch}
            onChange={(e) => {
              setMosqueSearch(e.target.value);
              setMosquesPage(1);
            }}
            placeholder="بحث باسم الجامع أو رقمه"
          />
          {mosqueSearch && (
            <button className="secondaryButton" onClick={() => setMosqueSearch("")}>
              مسح
            </button>
          )}
        </div>
        <div className="inline">
          <input value={mosqueName} onChange={(e) => setMosqueName(e.target.value)} placeholder="اسم الجامع" />
          <button
            onClick={async () => {
              setError("");
              setMsg("");
              if (!mosqueName.trim()) {
                setError("اسم الجامع مطلوب");
                return;
              }
              try {
                await request("/general/mosques", "post", { name: mosqueName });
                setMsg("تم إضافة الجامع بنجاح");
                setMosqueName("");
                await refresh();
              } catch (err) {
                setError(getErrorMessage(err));
              }
            }}
          >
            إضافة جامع
          </button>
        </div>
        <div className="listGrid">
          {paginatedMosques.items.length === 0 ? (
            <p className="hint">لا توجد جوامع مطابقة للبحث</p>
          ) : paginatedMosques.items.map((mosque: Mosque) => (
            <div key={mosque.id} className="listItemCard">
              <strong>{mosque.name}</strong>
              <span>جامع رقم {mosque.id}</span>
            </div>
          ))}
        </div>
        <Pagination
          page={paginatedMosques.safePage}
          totalPages={paginatedMosques.totalPages}
          totalItems={filteredMosques.length}
          pageSize={6}
          onPageChange={setMosquesPage}
          label="الجوامع"
        />
      </div>
      )}

      {activeView === "exams" && (
      <div className="card">
        <h2>طلبات الاختبار</h2>
        <div className="inline searchRow">
          <input
            value={requestSearch}
            onChange={(e) => {
              setRequestSearch(e.target.value);
              setRequestsPage(1);
            }}
            placeholder="بحث برقم الطلب أو الطالب أو الحالة"
          />
          {requestSearch && (
            <button className="secondaryButton" onClick={() => setRequestSearch("")}>
              مسح
            </button>
          )}
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>الطالب</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="emptyCell">لا توجد طلبات مطابقة للبحث</td>
                </tr>
              ) : paginatedRequests.items.map((requestItem: typeof requests[0]) => (
                <tr key={requestItem.id}>
                  <td>{requestItem.id}</td>
                  <td>{requestItem.student.fullName}</td>
                  <td>
                    <span className="statusBadge">{requestItem.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={paginatedRequests.safePage}
          totalPages={paginatedRequests.totalPages}
          totalItems={filteredRequests.length}
          pageSize={6}
          onPageChange={setRequestsPage}
          label="طلبات الاختبار"
        />
        <div className="inline">
          <input inputMode="numeric" value={reqId} onChange={(e) => setReqId(e.target.value)} placeholder="رقم الطلب" />
          <input inputMode="numeric" value={score} onChange={(e) => setScore(e.target.value)} placeholder="النتيجة /100" />
          <select value={nextCircleId} onChange={(e) => setNextCircleId(e.target.value)}>
            <option value="">النقل التلقائي أو البقاء</option>
            {circles.map((circle) => (
              <option key={circle.id} value={circle.id}>
                {circle.name} - {circle.mosque?.name ?? ""}
              </option>
            ))}
          </select>
          <button
            onClick={async () => {
              setError("");
              setMsg("");
              if (!reqId || !score) {
                setError("رقم الطلب والنتيجة مطلوبة");
                return;
              }
              try {
                await request(`/general/exam-requests/${reqId}/score`, "post", {
                  score: Number(score),
                  nextCircleId: nextCircleId ? Number(nextCircleId) : undefined,
                });
                setMsg("تم اعتماد النتيجة بنجاح");
                setReqId("");
                setScore("");
                setNextCircleId("");
                await refresh();
              } catch (err) {
                setError(getErrorMessage(err));
              }
            }}
          >
            اعتماد
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
