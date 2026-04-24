import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { AuthState } from "../hooks/useAuth";
import { roleHome } from "../hooks/useAuth";

export function LoginPage({ auth }: { auth: AuthState }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("manager@example.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  if (auth.user) return <Navigate to={roleHome(auth.user.role)} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      setError("");
      const { data } = await api.post("/auth/login", { email, password });
      auth.save(data.token, data.user);
      navigate(roleHome(data.user.role), { replace: true });
    } catch {
      setError("بيانات الدخول غير صحيحة");
    }
  }

  return (
    <div className="page centered" dir="rtl">
      <form className="card authCard" onSubmit={submit}>
        <h1>منصة إدارة حلقات التحفيظ</h1>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="كلمة المرور"
        />
        <button type="submit">تسجيل الدخول</button>
        <p className="hint">حسابات تجريبية: general, manager, supervisor, parent + @example.com</p>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
