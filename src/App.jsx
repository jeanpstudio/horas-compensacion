import { useState, useEffect } from "react";
import { supabase } from "./services/supabaseClient";
import Login from "./features/auth/Login";
import MissionForm from "./features/missions/MissionForm";
import MissionsList from "./features/missions/MissionsList";
import TeamApprovals from "./features/approvals/TeamApprovals"; // <--- Importamos nueva vista

// Iconos Lucide
import {
  LayoutDashboard,
  Plane,
  LogOut,
  UserCircle,
  Menu,
  Leaf,
  FileCheck,
} from "lucide-react";

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'worker', 'boss', 'hr'
  const [view, setView] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
    });

    // 2. Escuchar cambios
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setUserRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (data) setUserRole(data.role);
  };

  if (!session) return <Login />;

  return (
    <div className="flex min-h-screen bg-ecoan-cream text-ecoan-slate font-sans">
      {/* ASIDE */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"} transition-all duration-300 bg-ecoan-blue text-white flex flex-col shadow-2xl z-10`}
      >
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <Leaf className="text-green-400 w-6 h-6 shrink-0" />
          {isSidebarOpen && (
            <span className="ml-3 font-semibold text-lg tracking-wide text-gray-100">
              ECOAN Ops
            </span>
          )}
        </div>

        <nav className="flex-1 py-8 px-3 space-y-2">
          {/* Menú Común */}
          <button
            onClick={() => setView("dashboard")}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-all group ${view === "dashboard" ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {isSidebarOpen && (
              <span className="ml-3 text-sm font-medium">Dashboard</span>
            )}
          </button>

          <button
            onClick={() => setView("nueva-mision")}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-all group ${view === "nueva-mision" ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
          >
            <Plane className="w-5 h-5 shrink-0" />
            {isSidebarOpen && (
              <span className="ml-3 text-sm font-medium">Nuevo Viaje</span>
            )}
          </button>

          {/* Menú EXCLUSIVO JEFE/RRHH */}
          {(userRole === "boss" || userRole === "hr") && (
            <>
              <div className="my-4 border-t border-white/10"></div>
              {isSidebarOpen && (
                <p className="px-3 text-xs font-bold text-gray-500 uppercase mb-2">
                  Supervisión
                </p>
              )}

              <button
                onClick={() => setView("aprobaciones")}
                className={`w-full flex items-center px-3 py-3 rounded-lg transition-all group ${view === "aprobaciones" ? "bg-ecoan-green text-white shadow-lg" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
              >
                <FileCheck className="w-5 h-5 shrink-0" />
                {isSidebarOpen && (
                  <span className="ml-3 text-sm font-medium">Aprobaciones</span>
                )}
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center w-full text-gray-400 hover:text-red-300 transition-colors px-2 py-2"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && (
              <span className="ml-3 text-sm">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex justify-between items-center px-8 shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-400 hover:text-ecoan-blue"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="ml-4 text-xl font-bold text-ecoan-blue capitalize">
              {view === "dashboard"
                ? "Panel de Control"
                : view === "aprobaciones"
                  ? "Gestión de Equipo"
                  : "Registrar Misión"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-ecoan-blue">
                Rol: {userRole === "boss" ? "Jefe / Supervisor" : "Colaborador"}
              </p>
              <p className="text-xs text-ecoan-brown">{session.user.email}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded-full text-ecoan-blue">
              <UserCircle className="w-8 h-8" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {view === "dashboard" && <MissionsList />}
            {view === "nueva-mision" && (
              <MissionForm onMissionCreated={() => setView("dashboard")} />
            )}
            {view === "aprobaciones" && <TeamApprovals />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
