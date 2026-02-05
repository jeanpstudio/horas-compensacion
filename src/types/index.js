export default  Mission {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'pending' | 'approved_boss' | 'approved_hr';
}

export default DailyRecord {
  id: string;
  mission_id: string;
  date: string;
  tel_hours: number;      // Tiempo Efectivo Laborado
  has_pernocte: boolean;  // Para el TCN (Tiempo Cautivo)
  is_weekend: boolean;
}