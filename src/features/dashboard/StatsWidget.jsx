import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { calculateDailyCompensation } from "../../utils/compensationLogic";
import {
  PieChart,
  AlertTriangle,
  CalendarCheck,
  Clock,
  Info,
} from "lucide-react";

const StatsWidget = () => {
  const [stats, setStats] = useState({
    bagHours: 0, // Horas que SÍ cuentan para el tope de 40h
    weekendDays: 0, // Días completos ganados (fuera del tope)
    telTotal: 0,
    tcnTotal: 0,
  });

  useEffect(() => {
    fetchMonthlyStats();
  }, []);

  const fetchMonthlyStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Rango: Mes actual
    const date = new Date();
    const firstDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      1,
    ).toISOString();
    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).toISOString();

    const { data: records, error } = await supabase
      .from("daily_records")
      .select(
        `tel_hours, travel_hours, has_pernocte, is_weekend_holiday, missions!inner(user_id)`,
      )
      .eq("missions.user_id", user.id)
      .gte("date", firstDay)
      .lte("date", lastDay);

    if (error) return;

    let bagSum = 0;
    let weekendDaysSum = 0;
    let telSum = 0;
    let tcnSum = 0;

    records.forEach((rec) => {
      const calc = calculateDailyCompensation(
        rec.tel_hours,
        rec.travel_hours,
        rec.has_pernocte,
        rec.is_weekend_holiday,
      );

      // Estadísticas generales (informativo)
      telSum += calc.telCompensable;
      tcnSum += calc.tcnCompensable;

      // LÓGICA CRÍTICA
      if (calc.generatesFullDay) {
        // Si ganó día completo, sumamos DÍA y NO sumamos a la bolsa de horas
        weekendDaysSum += 1;
      } else {
        // Si NO ganó día completo (ej. Lunes-Viernes o Sábado < 4h), sumamos a la bolsa
        bagSum += calc.totalHours;
      }
    });

    setStats({
      bagHours: bagSum,
      weekendDays: weekendDaysSum,
      telTotal: telSum,
      tcnTotal: tcnSum,
    });
  };

  // CÁLCULOS FINALES
  const percentage = Math.min((stats.bagHours / 40) * 100, 100);

  // Días equivalentes provenientes SOLO de la bolsa de horas
  const daysFromBag = stats.bagHours / 8;

  // Total Definitivo (Suma de los dos mundos)
  const totalDaysAvailable = stats.weekendDays + daysFromBag;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* 1. BOLSA DE HORAS (Tope 40h - Excluye Fines de Semana Completos) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Bolsa Mensual (L-V)
              </p>
              <h3 className="text-2xl font-bold text-ecoan-blue mt-1 flex items-baseline gap-1">
                {stats.bagHours}h{" "}
                <span className="text-sm text-gray-400 font-normal">
                  / 40h máx
                </span>
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-ecoan-blue">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${percentage > 90 ? "bg-red-500" : "bg-ecoan-blue"}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="flex items-start gap-2 mt-2">
            <Info className="w-3 h-3 text-gray-400 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-tight">
              Los fines de semana trabajados (+4h) NO consumen esta bolsa.
            </p>
          </div>
        </div>

        {percentage >= 80 && (
          <p className="text-xs text-red-500 mt-3 flex items-center gap-1 font-medium bg-red-50 p-1.5 rounded">
            <AlertTriangle className="w-3 h-3" /> Tope mensual cerca
          </p>
        )}
      </div>

      {/* 2. TARJETA DE DÍAS TOTALES (Suma Inteligente) */}
      <div className="bg-ecoan-green text-white p-6 rounded-xl shadow-lg border border-green-800 relative overflow-hidden md:col-span-2">
        <CalendarCheck className="absolute -right-6 -bottom-6 w-36 h-36 text-white/10 rotate-12" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center h-full gap-6">
          <div>
            <p className="text-green-200 text-sm font-medium uppercase tracking-wider mb-1">
              Total Días Compensatorios
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight">
                {totalDaysAvailable % 1 === 0
                  ? totalDaysAvailable
                  : totalDaysAvailable.toFixed(2)}
              </span>
              <span className="text-xl text-green-100 opacity-90">días</span>
            </div>
            <p className="text-xs text-green-200 mt-2 opacity-80 max-w-xs">
              Disponibles para uso según coordinación con jefatura.
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm w-full md:w-auto min-w-[260px]">
            <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
              <span className="text-sm text-green-100">
                Fines de Semana (+4h)
              </span>
              <span className="font-bold text-lg text-white">
                {stats.weekendDays}{" "}
                <span className="text-xs font-normal opacity-70">días</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-100">
                Bolsa Horas ({stats.bagHours}÷8)
              </span>
              <span className="font-bold text-lg text-white">
                {daysFromBag % 1 === 0 ? daysFromBag : daysFromBag.toFixed(2)}{" "}
                <span className="text-xs font-normal opacity-70">días</span>
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-white/40 flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-white/80">
                Total
              </span>
              <span className="font-bold text-xl text-white">
                ={" "}
                {totalDaysAvailable % 1 === 0
                  ? totalDaysAvailable
                  : totalDaysAvailable.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsWidget;
