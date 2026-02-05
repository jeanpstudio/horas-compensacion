import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import {
  CheckCircle,
  RotateCcw,
  User,
  MapPin,
  Calendar,
  FileText,
  Filter,
} from "lucide-react";
import DailyReportModal from "../fjo-records/DailyReportModal";

const TeamApprovals = () => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'approved'

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Traemos PENDIENTES y APROBADAS POR JEFE
    const { data, error } = await supabase
      .from("missions")
      .select(`*, profiles:user_id (email)`)
      .neq("user_id", user.id)
      .in("status", ["pending", "approved_boss"]) // <--- Traemos ambos estados
      .order("created_at", { ascending: false });

    if (!error) setMissions(data);
  };

  const handleStatusChange = async (missionId, newStatus) => {
    const action =
      newStatus === "approved_boss" ? "Aprobar" : "Revertir a Pendiente";
    if (!confirm(`¿Estás seguro de ${action} esta misión?`)) return;

    const { error } = await supabase
      .from("missions")
      .update({ status: newStatus })
      .eq("id", missionId);

    if (!error) {
      fetchMissions(); // Recargar lista
    } else {
      alert("Error: " + error.message);
    }
  };

  // Filtrado visual
  const displayedMissions = missions.filter((m) => {
    if (filter === "pending") return m.status === "pending";
    if (filter === "approved") return m.status === "approved_boss";
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Cabecera y Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-ecoan-blue flex items-center gap-2">
          <FileText className="w-6 h-6 text-ecoan-green" />
          Supervisión de Jornadas
        </h2>

        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === "all" ? "bg-ecoan-blue text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === "pending" ? "bg-yellow-100 text-yellow-700" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === "approved" ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Aprobados
          </button>
        </div>
      </div>

      {displayedMissions.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl border border-gray-200 border-dashed">
          <p className="text-gray-400">
            No se encontraron misiones con este filtro.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayedMissions.map((m) => {
            const isApproved = m.status === "approved_boss";

            return (
              <div
                key={m.id}
                className={`border rounded-xl p-5 transition-all ${
                  isApproved
                    ? "bg-gray-50 border-gray-200 opacity-75 hover:opacity-100" // Estilo "Historial"
                    : "bg-white border-yellow-200 shadow-sm hover:shadow-md" // Estilo "Activo"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Info del Viaje */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 ${
                          isApproved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Filter className="w-3 h-3" />
                        )}
                        {isApproved ? "Aprobado por Ti" : "Requiere Revisión"}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <User className="w-3 h-3" /> {m.profiles?.email}
                      </span>
                    </div>

                    <h3
                      className={`font-bold text-lg ${isApproved ? "text-gray-600" : "text-gray-800"}`}
                    >
                      {m.title}
                    </h3>

                    <div className="flex gap-4 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {m.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {m.start_date}
                      </span>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-3 border-l pl-4 border-gray-200/50">
                    <button
                      onClick={() => setSelectedMission(m)}
                      className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-ecoan-blue hover:bg-white rounded-lg transition"
                    >
                      Ver Detalle
                    </button>

                    {isApproved ? (
                      // BOTÓN REVERTIR (Si ya estaba aprobado)
                      <button
                        onClick={() => handleStatusChange(m.id, "pending")}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                        title="Devolver a pendientes"
                      >
                        <RotateCcw className="w-4 h-4" /> Deshacer
                      </button>
                    ) : (
                      // BOTÓN APROBAR (Si está pendiente)
                      <button
                        onClick={() =>
                          handleStatusChange(m.id, "approved_boss")
                        }
                        className="px-4 py-2 bg-ecoan-green text-white text-sm font-bold rounded-lg hover:bg-green-800 transition flex items-center gap-2 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Aprobar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedMission && (
        <DailyReportModal
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </div>
  );
};

export default TeamApprovals;
