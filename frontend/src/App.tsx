import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./layout/Shell";
import { useAuth } from "./hooks/useAuth";
import { roleHome } from "./hooks/useAuth";
import { GeneralPage } from "./pages/GeneralPage";
import { LoginPage } from "./pages/LoginPage";
import { ManagerPage } from "./pages/ManagerPage";
import { ParentPage } from "./pages/ParentPage";
import { SupervisorPage } from "./pages/SupervisorPage";
import "./App.css";

function App() {
  const auth = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage auth={auth} />} />
      <Route element={<Shell auth={auth} />}>
        <Route path="/supervisor" element={<SupervisorPage auth={auth} />} />
        <Route path="/supervisor/evaluate" element={<SupervisorPage auth={auth} />} />
        <Route path="/supervisor/students" element={<SupervisorPage auth={auth} />} />
        <Route path="/manager" element={<ManagerPage auth={auth} />} />
        <Route path="/manager/circles" element={<ManagerPage auth={auth} />} />
        <Route path="/manager/students" element={<ManagerPage auth={auth} />} />
        <Route path="/manager/accounts" element={<ManagerPage auth={auth} />} />
        <Route path="/manager/create" element={<ManagerPage auth={auth} />} />
        <Route path="/general" element={<GeneralPage auth={auth} />} />
        <Route path="/general/mosques" element={<GeneralPage auth={auth} />} />
        <Route path="/general/exams" element={<GeneralPage auth={auth} />} />
        <Route path="/parent" element={<ParentPage auth={auth} />} />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={auth.user ? roleHome(auth.user.role) : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
