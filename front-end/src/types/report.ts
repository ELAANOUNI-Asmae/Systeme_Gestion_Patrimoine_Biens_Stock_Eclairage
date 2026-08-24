export type ReportType =
  | "USERS"
  | "ASSETS"
  | "STOCK"
  | "LIGHTING";

export type ExportFormat =
  | "PDF"
  | "EXCEL";

export type ReportCell =
  | string
  | number;

export interface ReportMetric {
  id: string;

  labelKey: string;

  value: number | string;

  unit?: string;
}

export interface ReportColumn {
  key: string;

  labelKey: string;

  width?: number;
}

export interface ReportTableRow {
  id: number;

  /*
   * Cette date est utilisée pour
   * filtrer le rapport selon la période.
   *
   * Elle ne doit pas forcément être
   * affichée dans le tableau.
   */
  filterDate: string;

  values: Record<
    string,
    ReportCell
  >;
}

export interface ReportSection {
  id: string;

  titleKey: string;

  columns: ReportColumn[];

  rows: ReportTableRow[];
}

export interface ReportData {
  type: ReportType;

  startDate: string;

  endDate: string;

  generatedAt: string;

  /*
   * Plusieurs indicateurs peuvent
   * maintenant être affichés dans
   * le rapport.
   */
  statistics: ReportMetric[];

  /*
   * Un rapport peut contenir
   * plusieurs tableaux.
   *
   * Exemple STOCK :
   * - état du stock
   * - mouvements
   * - demandes de fourniture
   */
  sections: ReportSection[];
}

export interface GenerateReportParams {
  type: ReportType;

  startDate: string;

  endDate: string;
}