import { useState } from "react";
import { calculateDailyCompensation } from "../../utils/compensationLogic";

const DailyReportForm = ({ missionId, onReportSaved }) => {
  const [data, setData] = useState({
    date: new Date().toISOString().split("T")[0],
    tel_hours: 0,
    has_pernocte: false,
    is_weekend: false,
  });

  // Cálculo en tiempo real para que el usuario vea su beneficio
  const result = calculateDailyCompensation(
    data.tel_hours,
    data.has_pernocte,
    data.is_weekend,
  );

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-bold text-green-800 mb-3">
        Reporte Diario de Jornada
      </h3>

      <div className="space-y-3">
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={data.date}
          onChange={(e) => setData({ ...data, date: e.target.value })}
        />

        <div>
          <label className="block text-sm">Horas Efectivas (TEL):</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setData({ ...data, tel_hours: parseFloat(e.target.value) || 0 })
            }
          />
          <p className="text-xs text-gray-500">Máximo compensable: 4h/día</p>
        </div>

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            onChange={(e) =>
              setData({ ...data, has_pernocte: e.target.checked })
            }
          />
          <span>¿Pernoctó fuera de su sede? (+1h comp.)</span>
        </label>

        {/* Resumen dinámico */}
        <div className="mt-4 p-3 bg-green-100 rounded-md border border-green-200 text-green-900 text-sm">
          <strong>Resumen calculado:</strong>
          <p>Compensación TEL: {result.telCompensable}h</p>
          <p>Compensación TCN: {result.tcnCompensable}h</p>
          <p className="font-bold">Total del día: {result.totalHours}h</p>
          {result.generatesFullDay && (
            <p className="text-blue-700 font-bold">
              ⭐ ¡Ganaste 1 día compensatorio!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyReportForm;
