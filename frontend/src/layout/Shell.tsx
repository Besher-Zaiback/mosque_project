import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { AuthState } from "../hooks/useAuth";
import { roleHome } from "../hooks/useAuth";
import { getRoleLabel } from "../utils/labels";

export function Shell({ auth }: { auth: AuthState }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!auth.user || !auth.token) return <Navigate to="/login" replace />;

  const homeRoute = roleHome(auth.user.role);
  const isParent = auth.user.role === "PARENT";
  const isActive = (path: string) =>
    path === "/parent"
      ? location.pathname === "/parent" || location.pathname.startsWith("/parent/")
      : location.pathname === path;

  return (
    <div className={`layout ${isParent ? "layout-parent" : ""}`} dir="rtl">
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
            {!isParent && (
              <button
                className={`nav-link ${isActive(homeRoute) ? "active" : ""}`}
                onClick={() => navigate(homeRoute)}
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-label">الرئيسية</span>
              </button>
            )}
            {isParent && (
              <button
                className={`nav-link ${isActive("/parent") ? "active" : ""}`}
                onClick={() => navigate("/parent")}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-label">متابعة الإبن</span>
              </button>
            )}

            {auth.user.role === "SUPERVISOR" && (
              <>
                <button
                  className={`nav-link ${isActive("/supervisor/evaluate") ? "active" : ""}`}
                  onClick={() => navigate("/supervisor/evaluate")}
                >
                  <span className="nav-icon">📝</span>
                  <span className="nav-label">تقييم طالب</span>
                </button>
                <button
                  className={`nav-link ${isActive("/supervisor/students") ? "active" : ""}`}
                  onClick={() => navigate("/supervisor/students")}
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
                  className={`nav-link ${isActive("/manager/circles") ? "active" : ""}`}
                  onClick={() => navigate("/manager/circles")}
                >
                  <span className="nav-icon">📖</span>
                  <span className="nav-label">إدارة الحلقات</span>
                </button>
                <button
                  className={`nav-link ${isActive("/manager/students") ? "active" : ""}`}
                  onClick={() => navigate("/manager/students")}
                >
                  <span className="nav-icon">👥</span>
                  <span className="nav-label">إدارة الطلاب</span>
                </button>
                <button
                  className={`nav-link ${isActive("/manager/accounts") ? "active" : ""}`}
                  onClick={() => navigate("/manager/accounts")}
                >
                  <span className="nav-icon">🧾</span>
                  <span className="nav-label">إدارة الحسابات</span>
                </button>
                <button
                  className={`nav-link ${isActive("/manager/create") ? "active" : ""}`}
                  onClick={() => navigate("/manager/create")}
                >
                  <span className="nav-icon">➕</span>
                  <span className="nav-label">إنشاء الحسابات</span>
                </button>
              </>
            )}

            {auth.user.role === "GENERAL_MANAGER" && (
              <>
                <div className="nav-section-title">الإدارة العامة</div>
                <button
                  className={`nav-link ${isActive("/general/mosques") ? "active" : ""}`}
                  onClick={() => navigate("/general/mosques")}
                >
                  <span className="nav-icon">🕌</span>
                  <span className="nav-label">إدارة الجوامع</span>
                </button>
                <button
                  className={`nav-link ${isActive("/general/exams") ? "active" : ""}`}
                  onClick={() => navigate("/general/exams")}
                >
                  <span className="nav-icon">📋</span>
                  <span className="nav-label">طلبات الاختبار</span>
                </button>
              </>
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
