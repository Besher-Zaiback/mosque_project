import { useEffect, useState } from "react";
import { useApi } from "../api/client";
import { Pagination } from "../components/Pagination";
import type { AuthState } from "../hooks/useAuth";
import type { Circle, Mosque } from "../types/models";
import { paginateItems } from "../utils/pagination";
import { ManagerPage } from "./ManagerPage";

export function GeneralPage({ auth }: { auth: AuthState }) {
  const request = useApi(auth);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mosqueName, setMosqueName] = useState("");
  const [reqId, setReqId] = useState("");
  const [score, setScore] = useState("");
  const [nextCircleId, setNextCircleId] = useState("");
  const [requests, setRequests] = useState<Array<{ id: number; student: { fullName: string }; status: string }>>([]);
  const [mosquesPage, setMosquesPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);

  const paginatedMosques = paginateItems(mosques, mosquesPage, 6);
  const paginatedRequests = paginateItems(requests, requestsPage, 6);

  useEffect(() => {
    void Promise.all([
      request("/general/mosques").then(setMosques),
      request("/general/exam-requests").then(setRequests),
      request("/manager/circles").then(setCircles),
    ]);
  }, [request]);

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

      <div className="card">
        <h2>إدارة الجوامع</h2>
        <div className="inline">
          <input value={mosqueName} onChange={(e) => setMosqueName(e.target.value)} placeholder="اسم الجامع" />
          <button
            onClick={() =>
              void request("/general/mosques", "post", { name: mosqueName }).then(async () =>
                setMosques(await request("/general/mosques"))
              )
            }
          >
            إضافة جامع
          </button>
        </div>
        <div className="listGrid">
          {paginatedMosques.items.map((mosque) => (
            <div key={mosque.id} className="listItemCard">
              <strong>{mosque.name}</strong>
              <span>جامع رقم {mosque.id}</span>
            </div>
          ))}
        </div>
        <Pagination
          page={paginatedMosques.safePage}
          totalPages={paginatedMosques.totalPages}
          totalItems={mosques.length}
          pageSize={6}
          onPageChange={setMosquesPage}
          label="الجوامع"
        />
      </div>

      <div className="card">
        <h2>طلبات الاختبار</h2>
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
              {paginatedRequests.items.map((requestItem) => (
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
          totalItems={requests.length}
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
            onClick={() =>
              void request(`/general/exam-requests/${reqId}/score`, "post", {
                score: Number(score),
                nextCircleId: nextCircleId ? Number(nextCircleId) : undefined,
              })
            }
          >
            اعتماد
          </button>
        </div>
      </div>

      <ManagerPage auth={auth} />
    </div>
  );
}
