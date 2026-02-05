import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import DailyReportModal from "../fjo-records/DailyReportModal";
import StatsWidget from "../dashboard/StatsWidget";
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const MissionsList = () => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);

  // ESTADO PARA FORZAR REFRESCO DEL WIDGET
  const [lastUpdate, setLastUpdate] = useState(0);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setMissions(data);
    }
    setLoading(false);
  };

  // Función que llamará el modal cuando guarde algo
  const handleDataChanged = () => {
    // Incrementamos el contador para que el StatsWidget detecte un cambio
    setLastUpdate((prev) => prev + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-lg font-bold text-ecoan-blue mb-4 flex items-center gap-2">
          Resumen del Mes
        </h2>
        {/* LA KEY MÁGICA: Si cambia lastUpdate, el componente se recarga */}
        <StatsWidget key={lastUpdate} />
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-ecoan-blue flex items-center gap-2">
            <MapPin className="w-5 h-5 text-ecoan-green" />
            Mis Misiones Activas
          </h2>
        </div>

        {loading ? (
          <div className="text-center p-10 text-gray-400">
            Cargando viajes...
          </div>
        ) : missions.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
            <h3 className="text-gray-900 font-medium">
              No hay misiones registradas
            </h3>
          </div>
        ) : (
          <div className="grid gap-4">
            {missions.map((m) => (
              <div
                key={m.id}
                className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all p-5 relative overflow-hidden"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${m.status === "approved_hr" ? "bg-ecoan-blue" : "bg-yellow-400"}`}
                ></div>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pl-2">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-ecoan-green transition-colors">
                        {m.title}
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${m.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-100" : "bg-blue-50 text-blue-700"}`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {m.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {m.start_date}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMission(m)}
                    className="bg-white border border-ecoan-green text-ecoan-green px-5 py-2 rounded-lg font-medium hover:bg-ecoan-green hover:text-white transition-all flex gap-2"
                  >
                    <Clock className="w-4 h-4" /> Reportar Horas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedMission && (
        <DailyReportModal
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
          onSaved={handleDataChanged} // <--- Pasamos el cable
        />
      )}
    </div>
  );
};

export default MissionsList;
