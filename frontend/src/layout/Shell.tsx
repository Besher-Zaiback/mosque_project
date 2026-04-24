import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { AuthState } from "../hooks/useAuth";
import { roleHome } from "../hooks/useAuth";
import { getRoleLabel } from "../utils/labels";

export function Shell({ auth }: { auth: AuthState }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!auth.user || !auth.token) return <Navigate to="/login" replace />;

  const homeRoute = roleHome(auth.user.role);

  return (
    <div className="layout" dir="rtl">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">{auth.user.fullName.charAt(0)}</div>
          <div className="user-info">
            <h3 className="user-name">{auth.user.fullName}</h3>
            <span className="user-role">{getRoleLabel(auth.user.role)}</span>
          </div>
        </div>
        <div className="mosque-name">
          <span className="mosque-icon">🕌</span>
          {auth.user.mosque?.name ?? "كل الجوامع"}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">القائمة</div>
            <button
              className={`nav-link ${location.pathname === homeRoute ? "active" : ""}`}
              onClick={() => navigate(homeRoute)}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-label">الرئيسية</span>
            </button>

            {auth.user.role === "SUPERVISOR" && (
              <>
                <button
                  className="nav-link"
                  onClick={() => document.querySelector(".card")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <span className="nav-icon">📝</span>
                  <span className="nav-label">تقييم طالب</span>
                </button>
                <button
                  className="nav-link"
                  onClick={() => document.querySelectorAll(".card")[1]?.scrollIntoView({ behavior: "smooth" })}
                >
                  <span className="nav-icon">👥</span>
                  <span className="nav-label">قائمة الطلاب</span>
                </button>
              </>
            )}

            {(auth.user.role === "MOSQUE_MANAGER" ||
              auth.user.role === "GENERAL_MANAGER") && (
              <>
                <button
                  className="nav-link"
                  onClick={() => document.querySelectorAll(".card")[0]?.scrollIntoView({ behavior: "smooth" })}
                >
                  <span className="nav-icon">📖</span>
                  <span className="nav-label">إدارة الحلقات</span>
                </button>
                <button
                  className="nav-link"
                  onClick={() => document.querySelectorAll(".card")[1]?.scrollIntoView({ behavior: "smooth" })}
                >
                  <span className="nav-icon">👥</span>
                  <span className="nav-label">إدارة الطلاب</span>
                </button>
                <button
                  className="nav-link"
                  onClick={() => document.querySelectorAll(".card")[2]?.scrollIntoView({ behavior: "smooth" })}
                >
                  <span className="nav-icon">➕</span>
                  <span className="nav-label">إنشاء الحسابات</span>
                </button>
              </>
            )}

            {auth.user.role === "GENERAL_MANAGER" && (
              <>
                <div className="nav-section-title">الإدارة العامة</div>
                <button className="nav-link" onClick={() => navigate(homeRoute)}>
                  <span className="nav-icon">🕌</span>
                  <span className="nav-label">إدارة الجوامع</span>
                </button>
                <button
                  className="nav-link"
                  onClick={() => document.querySelectorAll(".card")[1]?.scrollIntoView({ behavior: "smooth" })}
                >
                  <span className="nav-icon">📋</span>
                  <span className="nav-label">طلبات الاختبار</span>
                </button>
              </>
            )}

            {auth.user.role === "PARENT" && (
              <button
                className="nav-link"
                onClick={() => document.querySelector(".card")?.scrollIntoView({ behavior: "smooth" })}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-label">متابعة الابن</span>
              </button>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => auth.clear()}>
            <span className="nav-icon">🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
