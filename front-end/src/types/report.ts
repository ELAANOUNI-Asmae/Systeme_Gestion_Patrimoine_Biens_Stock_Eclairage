export type ReportType =
  | "USERS"
  | "ASSETS"
  | "STOCK"
  | "LIGHTING";

export type ExportFormat = "PDF" | "EXCEL";

export type ReportCell = string | number | boolean;

export interface ReportLabel {
  fr: string;
  ar: string;
}

export interface ReportMetric {
  id: string;
  label: ReportLabel;
  value: number | string;
  unit?: string;
}

export interface ReportColumn {
  key: string;
  label: ReportLabel;
  width?: number;
}

export interface ReportTableRow {
  id: number | string;
  /** Date metier de la ligne quand la section est liee a une periode. */
  date?: string;
  values: Record<string, ReportCell>;
}

export interface ReportSection {
  id: string;
  title: ReportLabel;
  description?: ReportLabel;
  columns: ReportColumn[];
  rows: ReportTableRow[];
  /** true = evenements de la periode, false = photographie de l'etat actuel. */
  periodFiltered?: boolean;
}

export interface ReportData {
  type: ReportType;
  title: ReportLabel;
  startDate: string;
  endDate: string;
  generatedAt: string;
  generatedBy?: string;
  statistics: ReportMetric[];
  sections: ReportSection[];
}

export interface GenerateReportParams {
  type: ReportType;
  startDate: string;
  endDate: string;
  generatedBy?: string;
  language?: "fr" | "ar";
}
