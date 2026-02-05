import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateDailyCompensation } from "./compensationLogic";

export const generateFJO = (mission, dailyRecords = [], userName) => {
  const doc = new jsPDF();

  // Encabezado
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 95);
  doc.text("FICHA DE JORNADA OPERATIVA (FJO)", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Anexo II - Política de Compensaciones v1.0", 105, 20, {
    align: "center",
  });

  // 🔴 TRUCO: Forzamos String() en cada campo para evitar vacíos
  const colaborador = String(userName || "---");
  const proyecto = String(mission.title || "---");
  const destino = String(mission.destination || "---");
  const fechas = `${mission.start_date} al ${mission.end_date}`;

  // Tabla Datos Generales
  autoTable(doc, {
    startY: 30,
    head: [["DATOS DEL COLABORADOR Y MISIÓN"]],
    body: [
      ["Colaborador:", colaborador],
      ["Proyecto/Actividad:", proyecto],
      ["Lugar/Destino:", destino],
      ["Fechas:", fechas],
    ],
    theme: "grid",
    headStyles: { fillColor: [47, 94, 61] },
    columnStyles: { 0: { fontStyle: "bold", width: 40 } }, // Negrita a la etiqueta
  });

  // Tabla Registros
  const tableRows = dailyRecords.map((rec) => {
    const calc = calculateDailyCompensation(
      rec.tel_hours,
      rec.travel_hours,
      rec.has_pernocte,
      rec.is_weekend_holiday,
    );
    return [
      rec.date,
      rec.is_weekend_holiday ? "Sí" : "No",
      `${rec.tel_hours}h`,
      `${rec.travel_hours || 0}h`,
      rec.has_pernocte ? "Sí" : "-",
      calc.generatesFullDay ? "1 DÍA LIBRE" : `${calc.totalHours}h`,
    ];
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Fecha", "Finde?", "TEL", "Viaje", "Pernocte", "Ganado"]],
    body: tableRows.length ? tableRows : [["-", "-", "-", "-", "-", "-"]],
    theme: "striped",
    headStyles: { fillColor: [30, 58, 95] },
    styles: { halign: "center" },
  });

  // Resumen
  let totalBolsa = 0;
  let totalDias = 0;
  dailyRecords.forEach((rec) => {
    const calc = calculateDailyCompensation(
      rec.tel_hours,
      rec.travel_hours,
      rec.has_pernocte,
      rec.is_weekend_holiday,
    );
    if (calc.generatesFullDay) totalDias++;
    else totalBolsa += calc.totalHours;
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["RESUMEN DE COMPENSACIÓN", "CANTIDAD"]],
    body: [
      ["Total Horas Compensables (Bolsa)", `${totalBolsa.toFixed(1)} horas`],
      ["Total Días Libres", `${totalDias} días`],
    ],
    theme: "grid",
    headStyles: { fillColor: [220, 220, 220], textColor: 20 },
    columnStyles: { 1: { fontStyle: "bold", halign: "right" } },
    tableWidth: 100,
    margin: { left: 105 },
  });

  // Firmas
  const pageHeight = doc.internal.pageSize.height;
  doc.line(20, pageHeight - 30, 80, pageHeight - 30);
  doc.text("Firma Colaborador", 50, pageHeight - 25, { align: "center" });
  doc.line(130, pageHeight - 30, 190, pageHeight - 30);
  doc.text("Visto Bueno Jefe", 160, pageHeight - 25, { align: "center" });

  doc.save(`FJO_Reporte.pdf`);
};
