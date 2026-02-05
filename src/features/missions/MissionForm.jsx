import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import {
  Plane,
  MapPin,
  Calendar,
  FileText,
  Save,
  ArrowLeft,
} from "lucide-react";

const MissionForm = ({ onMissionCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    start_date: "",
    end_date: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("missions")
      .insert([{ ...formData, user_id: user.id, status: "pending" }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      // Limpiar formulario y notificar éxito
      setFormData({ title: "", destination: "", start_date: "", end_date: "" });
      if (onMissionCreated) onMissionCreated();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Botón Volver (Solo visual si se usa en contexto de navegación) */}
      <button
        onClick={onMissionCreated}
        className="mb-6 flex items-center text-sm text-gray-500 hover:text-ecoan-blue transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver al Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Encabezado Visual */}
        <div className="bg-ecoan-blue p-8 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Plane className="w-6 h-6 text-ecoan-green" />
              Nueva Misión Operativa
            </h2>
            <p className="text-ecoan-cream/70 mt-2 text-sm max-w-md">
              Complete los detalles del despliegue. Esta información servirá
              para validar sus jornadas y compensaciones.
            </p>
          </div>
          {/* Elemento decorativo de fondo */}
          <Plane className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 rotate-12" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Sección 1: Detalles Generales */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-ecoan-brown uppercase tracking-wider border-b border-gray-100 pb-2">
              Detalles del Proyecto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proyecto / Actividad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ej. Monitoreo Acción Andina - Fase 2"
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-ecoan-green focus:border-transparent outline-none transition-all"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar de Destino
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ej. Comunidad de Huilloc"
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-ecoan-green focus:border-transparent outline-none transition-all"
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Cronograma */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-ecoan-brown uppercase tracking-wider border-b border-gray-100 pb-2">
              Cronograma de Viaje
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-ecoan-green focus:border-transparent outline-none transition-all"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Retorno
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-ecoan-green focus:border-transparent outline-none transition-all"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Guardado */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-ecoan-green hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              {loading ? (
                "Procesando..."
              ) : (
                <>
                  <Save className="w-5 h-5" /> Registrar Misión
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MissionForm;
