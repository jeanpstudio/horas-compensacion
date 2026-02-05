import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { calculateDailyCompensation } from "../../utils/compensationLogic";
import {
  X,
  Save,
  Clock,
  Moon,
  Trash2,
  Pencil,
  RefreshCw,
  Plane,
  AlertCircle,
  FileDown,
} from "lucide-react";
import { generateFJO } from "../../utils/pdfGenerator"; // <--- Importamos el generador

// AHORA RECIBIMOS LA PROP "onSaved"
const DailyReportModal = ({ mission, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    tel_hours: 0,
    travel_hours: 0,
    has_pernocte: false,
    is_weekend: false,
  });

  useEffect(() => {
    fetchHistory();
  }, [mission]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("daily_records")
      .select("*")
      .eq("mission_id", mission.id)
      .order("date", { ascending: false });
    if (data) setHistory(data);
  };

  useEffect(() => {
    const dateObj = new Date(formData.date);
    const isWe = dateObj.getDay() === 5 || dateObj.getDay() === 6;
    setFormData((prev) => ({ ...prev, is_weekend: isWe }));
  }, [formData.date]);

  const result = calculateDailyCompensation(
    formData.tel_hours,
    formData.travel_hours,
    formData.has_pernocte,
    formData.is_weekend,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      mission_id: mission.id,
      date: formData.date,
      tel_hours: formData.tel_hours,
      travel_hours: formData.travel_hours,
      has_pernocte: formData.has_pernocte,
      is_weekend_holiday: formData.is_weekend,
    };

    let error;
    if (editingId) {
      const { error: err } = await supabase
        .from("daily_records")
        .update(payload)
        .eq("id", editingId);
      error = err;
    } else {
      const { error: err } = await supabase
        .from("daily_records")
        .insert([payload]);
      error = err;
    }

    setLoading(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      fetchHistory();
      resetForm();
      // ¡AVISAMOS AL PADRE QUE SE ACTUALICE!
      if (onSaved) onSaved();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar registro?")) return;
    const { error } = await supabase
      .from("daily_records")
      .delete()
      .eq("id", id);
    if (!error) {
      fetchHistory();
      if (onSaved) onSaved(); // También actualizamos al borrar
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setFormData({
      date: record.date,
      tel_hours: record.tel_hours,
      travel_hours: record.travel_hours || 0,
      has_pernocte: record.has_pernocte,
      is_weekend: record.is_weekend_holiday,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      tel_hours: 0,
      travel_hours: 0,
      has_pernocte: false,
      is_weekend: false,
    });
  };
  const handleDownloadPDF = async () => {
    // Necesitamos el nombre del usuario para el PDF
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // Opcional: Podrías buscar el nombre real en 'profiles', aquí usaremos el email por rapidez
    generateFJO(mission, history, user.email);
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-ecoan-blue p-4 flex justify-between items-center text-white shrink-0">
          <div>
            <h3 className="font-bold text-lg">
              {editingId ? "✏️ Editando" : "Gestionar Jornada"}
            </h3>
            <p className="text-xs text-gray-300 opacity-80">{mission.title}</p>
          </div>
          {/* BOTÓN PDF NUEVO */}
          <button
            onClick={handleDownloadPDF}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
            title="Descargar Ficha Oficial"
          >
            <FileDown className="w-4 h-4" /> Exportar FJO
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          <form
            onSubmit={handleSubmit}
            className={`bg-white p-5 rounded-xl border shadow-sm space-y-4 ${editingId ? "border-yellow-400 ring-2 ring-yellow-50" : "border-gray-200"}`}
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h4
                className={`text-sm font-bold uppercase tracking-wider ${editingId ? "text-yellow-600" : "text-ecoan-green"}`}
              >
                {editingId ? "Modificar Registro" : "Nuevo Reporte"}
              </h4>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-red-500 flex gap-1"
                >
                  <X className="w-3 h-3" /> Cancelar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border rounded-lg"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ecoan-blue uppercase mb-1 block">
                  Trabajo Efectivo
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-ecoan-blue"
                    value={formData.tel_hours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tel_hours: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <Clock className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">
                  Informes, reuniones, campo.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-ecoan-green uppercase mb-1 block">
                  Horas Viaje
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-ecoan-green"
                    value={formData.travel_hours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        travel_hours: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <Plane className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">
                  Traslados (50%).
                </p>
              </div>

              <div className="flex items-end">
                <div
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer w-full h-[42px]"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      has_pernocte: !formData.has_pernocte,
                    })
                  }
                >
                  <div className="flex items-center gap-2">
                    <Moon
                      className={`w-4 h-4 ${formData.has_pernocte ? "text-indigo-600" : "text-gray-400"}`}
                    />
                    <span className="text-xs font-medium">Pernocte?</span>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-all ${formData.has_pernocte ? "bg-ecoan-green justify-end" : "bg-gray-300 justify-start"}`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* RESUMEN MATEMÁTICO */}
            <div
              className={`rounded-lg p-3 text-xs border transition-colors ${result.generatesFullDay ? "bg-orange-50 border-orange-200" : "bg-ecoan-cream border-ecoan-brown/10"}`}
            >
              {result.generatesFullDay ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    ¡1 DÍA COMPLETO GANADO!
                  </div>
                  <p className="text-orange-600/80 leading-tight">
                    Estas horas generan un día libre y{" "}
                    <strong>NO suman a la bolsa de 40h.</strong>
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">
                      TEL ({formData.tel_hours}h × 1):
                    </span>
                    <span className="font-bold">{result.telCompensable}h</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">
                      Viaje ({formData.travel_hours}h ÷ 2):
                    </span>
                    <span className="font-bold">
                      {result.travelCompensable}h
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                    <span className="font-bold text-ecoan-blue">
                      SUMA A BOLSA MENSUAL:
                    </span>
                    <span className="font-bold text-xl text-ecoan-green">
                      {result.totalHours}h
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-ecoan-green text-white rounded-lg font-bold hover:bg-green-800 transition"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <div className="flex justify-center items-center gap-2">
                  <Save className="w-4 h-4" /> Guardar
                </div>
              )}
            </button>
          </form>

          {/* TABLA HISTORIAL CORREGIDA */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-center">Detalle</th>
                  <th className="p-3 text-right">Ganado</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((rec) => {
                  const calc = calculateDailyCompensation(
                    rec.tel_hours,
                    rec.travel_hours,
                    rec.has_pernocte,
                    rec.is_weekend_holiday,
                  );
                  return (
                    <tr
                      key={rec.id}
                      className={rec.id === editingId ? "bg-yellow-50" : ""}
                    >
                      <td className="p-3">{rec.date}</td>
                      <td className="p-3 text-center text-gray-500 text-xs">
                        {rec.tel_hours > 0 && (
                          <span>
                            TEL: {rec.tel_hours}h<br />
                          </span>
                        )}
                        {rec.travel_hours > 0 && (
                          <span>
                            Viaje: {rec.travel_hours}h<br />
                          </span>
                        )}
                        {rec.has_pernocte && (
                          <span className="text-indigo-600">Con Pernocte</span>
                        )}
                      </td>

                      {/* LÓGICA VISUAL CORREGIDA */}
                      <td className="p-3 text-right font-bold text-ecoan-green">
                        {calc.generatesFullDay ? (
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs border border-orange-200">
                            1 DÍA LIBRE
                          </span>
                        ) : (
                          <span>+{calc.totalHours}h</span>
                        )}
                      </td>

                      <td className="p-3 text-center flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(rec)}
                          className="text-blue-500"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReportModal;
