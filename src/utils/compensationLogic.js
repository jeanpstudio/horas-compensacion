export const calculateDailyCompensation = (
  telHours,
  travelHours,
  hasPernocte,
  isWeekend,
) => {
  // 1. TEL (Trabajo Efectivo): 1h = 1h compensable (Tope 4h diario)
  const telCompensable = Math.min(telHours || 0, 4);

  // 2. Viaje (Tiempo Cautivo): 2h viaje = 1h compensable
  const travelCompensable = (travelHours || 0) / 2;

  // 3. Pernocte: Bono fijo de 1h compensable
  const pernocteBonus = hasPernocte ? 1 : 0;

  // Total matemático de horas generadas hoy
  const totalCompensableHours =
    telCompensable + travelCompensable + pernocteBonus;

  // 4. LÓGICA DE FIN DE SEMANA
  // "El trabajo en sábado, domingo... genera 1 día completo solo si se realizó al menos 4 horas TEL"
  const generatesFullDay = isWeekend && telHours >= 4;

  // 5. REGLA DE EXCLUSIÓN
  // "Estos días no computan dentro del tope mensual de 40 horas"
  // Si genera día completo, NO consume bolsa. Si son < 4h, SÍ consume bolsa.
  const consumesMonthlyBag = !generatesFullDay;

  return {
    telCompensable,
    travelCompensable,
    tcnCompensable: travelCompensable + pernocteBonus,
    totalHours: totalCompensableHours,
    generatesFullDay,
    consumesMonthlyBag, // <--- Nueva bandera para el Widget
  };
};
