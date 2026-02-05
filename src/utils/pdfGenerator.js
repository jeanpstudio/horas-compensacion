import jsPDF from "jspdf";
import "jspdf-autotable";
import { calculateDailyCompensation } from "./compensationLogic";

export const generateFJO = (mission, dailyRecords, userName) => {
  const doc = new jsPDF();

  // --- ENCABEZADO ---
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 95); // Azul ECOAN
  doc.text("FICHA DE JORNADA OPERATIVA (FJO)", 105, 15, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Anexo II - Política de Compensaciones v1.0", 105, 20, {
    align: "center",
  });

  // --- DATOS GENERALES ---
  doc.autoTable({
    startY: 30,
    head: [["DATOS DEL COLLABORADOR Y MISIÓN"]],
    body: [
      ["Colaborador:", userName],
      ["Proyecto/Actividad:", mission.title],
      ["Lugar/Destino:", mission.destination],
      ["Fechas:", `${mission.start_date} al ${mission.end_date}`],
    ],
    theme: "grid",
    headStyles: { fillColor: [47, 94, 61] }, // Verde ECOAN
    styles: { fontSize: 9, cellPadding: 2 },
  });

  // --- TABLA DE REGISTROS ---
  // Preparamos los datos
  let totalTel = 0;
  let totalTcn = 0;
  let totalDaysOff = 0;

  const tableRows = dailyRecords.map((rec) => {
    const calc = calculateDailyCompensation(
      rec.tel_hours,
      rec.travel_hours,
      rec.has_pernocte,
      rec.is_weekend_holiday,
    );

    // Acumuladores
    totalTel += calc.telCompensable;
    totalTcn += calc.tcnCompensable;
    if (calc.generatesFullDay) totalDaysOff += 1;

    return [
      rec.date,
      rec.is_weekend_holiday ? "Sí" : "No",
      `${rec.tel_hours}h`,
      `${rec.travel_hours || 0}h`,
      rec.has_pernocte ? "Sí" : "-",
      calc.generatesFullDay ? "1 DÍA LIBRE" : `${calc.totalHours}h`,
    ];
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [
      [
        "Fecha",
        "Finde?",
        "TEL (Real)",
        "Viaje (Real)",
        "Pernocte",
        "Compensación Ganada",
      ],
    ],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [30, 58, 95] }, // Azul ECOAN
    styles: { fontSize: 8, halign: "center" },
    columnStyles: { 5: { fontStyle: "bold", textColor: [47, 94, 61] } },
  });

  // --- RESUMEN FINAL ---
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["RESUMEN DE COMPENSACIÓN", "CANTIDAD"]],
    body: [
      [
        "Total Horas Compensables (Bolsa)",
        `${(totalTel + totalTcn).toFixed(1)} horas`,
      ],
      ["Total Días Libres (Fines de Semana)", `${totalDaysOff} días`],
    ],
    theme: "grid",
    headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
    columnStyles: { 1: { fontStyle: "bold" } },
    tableWidth: 100,
    margin: { left: 105 }, // Alinear a la derecha
  });

  // --- FIRMAS ---
  const pageHeight = doc.internal.pageSize.height;
  doc.line(20, pageHeight - 40, 80, pageHeight - 40); // Línea firma 1
  doc.text("Firma del Colaborador", 50, pageHeight - 35, { align: "center" });

  doc.line(130, pageHeight - 40, 190, pageHeight - 40); // Línea firma 2
  doc.text("Visto Bueno (Jefe Inmediato)", 160, pageHeight - 35, {
    align: "center",
  });

  // Guardar archivo
  doc.save(`FJO_${mission.title}_${mission.start_date}.pdf`);
};
