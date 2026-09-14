import {
  BarChart3,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  Search,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { PERMISSIONS } from "../../constants/permissions";
import { useAuth } from "../../hooks/useAuth";
import { reportService } from "../../services/reportService";
import type {
  ReportLabel,
  ReportSection,
  ReportType,
} from "../../types/report";

type ReportOption = {
  type: ReportType;
  icon: typeof Users;
  title: ReportLabel;
  description: ReportLabel;
};

const options: ReportOption[] = [
  {
    type: "USERS",
    icon: Users,
    title: { fr: "Utilisateurs", ar: "المستخدمون" },
    description: {
      fr: "Comptes, identités, rôles et statuts.",
      ar: "الحسابات والهويات والأدوار والحالات.",
    },
  },
  {
    type: "ASSETS",
    icon: Package,
    title: { fr: "Patrimoine", ar: "الممتلكات" },
    description: {
      fr: "État actuel, acquisitions, locations et archives.",
      ar: "الحالة الحالية والاقتناءات والكراء والأرشيف.",
    },
  },
  {
    type: "STOCK",
    icon: Warehouse,
    title: { fr: "Stock", ar: "المخزون" },
    description: {
      fr: "Valorisation, mouvements, demandes et réapprovisionnement.",
      ar: "التقييم والحركات والطلبات وإعادة التموين.",
    },
  },
  {
    type: "LIGHTING",
    icon: Zap,
    title: { fr: "Éclairage public", ar: "الإنارة العمومية" },
    description: {
      fr: "Points lumineux, pannes, interventions, coûts et rapports.",
      ar: "نقاط الإنارة والأعطاب والتدخلات والتكاليف والتقارير.",
    },
  },
];

const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function ReportsPage() {
  const { i18n } = useTranslation();
  const { user, hasPermission } = useAuth();
  const isArabic = i18n.language.startsWith("ar");
  const language = isArabic ? "ar" : "fr";
  const tr = (value: ReportLabel) => (isArabic ? value.ar : value.fr);
  const txt = (fr: string, ar: string) => (isArabic ? ar : fr);

  const availableOptions = useMemo(
    () => options.filter((option) => {
      if (option.type === "USERS") return hasPermission(PERMISSIONS.GET_ALL_PROFILS);
      if (option.type === "ASSETS") return hasPermission(PERMISSIONS.GET_ALL_ASSETS);
      if (option.type === "STOCK") return hasPermission(PERMISSIONS.GET_ALL_ITEMS);
      if (option.type === "LIGHTING") return hasPermission(PERMISSIONS.GET_ALL_LIGHT_POINT);
      return false;
    }),
    [hasPermission],
  );

  const today = useMemo(() => new Date(), []);
  const [reportType, setReportType] = useState<ReportType>("ASSETS");
  const [startDate, setStartDate] = useState(
    toDateInput(new Date(today.getFullYear(), 0, 1)),
  );
  const [endDate, setEndDate] = useState(toDateInput(today));
  const [report, setReport] = useState<
    Awaited<ReturnType<typeof reportService.generate>> | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const selected = availableOptions.find((option) => option.type === reportType) ?? availableOptions[0] ?? options[0];
  const SelectedIcon = selected.icon ?? BarChart3;

  useEffect(() => {
    if (availableOptions.length > 0 && !availableOptions.some((option) => option.type === reportType)) {
      setReportType(availableOptions[0].type);
      setReport(null);
    }
  }, [availableOptions, reportType]);

  const filteredSections = useMemo<ReportSection[]>(() => {
    if (!report) return [];
    const q = search.trim().toLowerCase();
    if (!q) return report.sections;

    return report.sections.map((section) => ({
      ...section,
      rows: section.rows.filter((entry) =>
        Object.values(entry.values).some((value) =>
          String(value).toLowerCase().includes(q),
        ),
      ),
    }));
  }, [report, search]);

  const filteredRows = useMemo(
    () => filteredSections.reduce((sum, section) => sum + section.rows.length, 0),
    [filteredSections],
  );

  const generate = async () => {
    if (!startDate || !endDate) {
      setError(txt("Veuillez sélectionner les deux dates.", "يرجى اختيار تاريخ البداية والنهاية."));
      return;
    }
    if (startDate > endDate) {
      setError(txt("La date de début doit être antérieure ou égale à la date de fin.", "يجب أن يكون تاريخ البداية قبل أو يساوي تاريخ النهاية."));
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearch("");
      const generatedBy = user
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
        : undefined;
      const data = await reportService.generate({
        type: reportType,
        startDate,
        endDate,
        generatedBy,
        language,
      });
      setReport(data);
    } catch {
      setError(txt("Impossible de générer le rapport.", "تعذر إنشاء التقرير."));
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    if (!report) return;
    try {
      setExportingPdf(true);
      setError("");
      await reportService.exportPdf(report, language);
    } catch {
      setError(txt("Impossible d'exporter le PDF.", "تعذر تصدير ملف PDF."));
    } finally {
      setExportingPdf(false);
    }
  };

  const exportExcel = async () => {
    if (!report) return;
    try {
      setExportingExcel(true);
      setError("");
      await reportService.exportExcel(report, language);
    } catch {
      setError(txt("Impossible d'exporter le fichier Excel.", "تعذر تصدير ملف Excel."));
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          <BarChart3 className="text-orange-600 dark:text-orange-400" />
          {txt("Rapports", "التقارير")}
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
          {txt(
            "Générez des rapports complets à partir des données réelles de chaque module, consultez-les puis exportez-les en PDF ou Excel.",
            "أنشئ تقارير كاملة انطلاقاً من البيانات الفعلية لكل وحدة، ثم عاينها وصدّرها بصيغة PDF أو Excel.",
          )}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {availableOptions.map((option) => {
          const Icon = option.icon;
          const active = option.type === reportType;
          return (
            <button
              key={option.type}
              type="button"
              onClick={() => {
                setReportType(option.type);
                setReport(null);
                setSearch("");
              }}
              className={`rounded-2xl border p-4 text-start shadow-sm transition ${
                active
                  ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100 dark:bg-orange-500/10 dark:ring-orange-500/15"
                  : "border-slate-200 bg-white hover:border-orange-300 dark:border-slate-700 dark:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${active ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"}`}>
                  <Icon size={21} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{tr(option.title)}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{tr(option.description)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <SelectedIcon className="text-orange-600 dark:text-orange-400" />
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              {txt("Générer le rapport", "إنشاء التقرير")} — {tr(selected.title)}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {txt(
                "La période filtre les événements (mouvements, pannes, interventions, acquisitions...). Les sections « état actuel » restent une photographie complète du système.",
                "تقوم الفترة بتصفية الأحداث مثل الحركات والأعطاب والتدخلات والاقتناءات، بينما تعرض أقسام الحالة الحالية صورة كاملة للنظام.",
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 flex items-center gap-2"><CalendarDays size={16} />{txt("Date de début", "تاريخ البداية")}</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 flex items-center gap-2"><CalendarDays size={16} />{txt("Date de fin", "تاريخ النهاية")}</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </label>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <BarChart3 size={18} />}
            {loading ? txt("Génération...", "جارٍ الإنشاء...") : txt("Générer", "إنشاء")}
          </button>
        </div>
      </article>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-5">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">SGPBSE</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{tr(report.title)}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {txt("Période", "الفترة")}: {report.startDate} → {report.endDate}
                  {report.generatedBy ? ` · ${txt("Généré par", "أنشئ بواسطة")}: ${report.generatedBy}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => void exportPdf()}
                    disabled={exportingPdf}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {exportingPdf ? <Loader2 size={17} className="animate-spin" /> : <FileText size={17} />}
                    {txt("Exporter PDF", "تصدير PDF")}
                </button>

                <button
                    type="button"
                    onClick={() => void exportExcel()}
                    disabled={exportingExcel}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {exportingExcel ? <Loader2 size={17} className="animate-spin" /> : <FileSpreadsheet size={17} />}
                    {txt("Exporter Excel", "تصدير Excel")}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {report.statistics.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{tr(item.label)}</p>
                  <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {item.value}{item.unit ? <span className="ms-1 text-sm font-semibold text-slate-500">{item.unit}</span> : null}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full max-w-xl">
                <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={txt("Rechercher dans toutes les sections du rapport", "البحث في جميع أقسام التقرير")}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-3 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
                />
              </label>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Download size={16} />
                {filteredRows} {txt("ligne(s) affichée(s)", "سطر معروض")}
              </div>
            </div>
          </article>

          {filteredSections.map((section) => (
            <article key={section.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 p-5 dark:border-slate-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{tr(section.title)}</h3>
                    {section.description ? (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tr(section.description)}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    {section.periodFiltered
                      ? txt("Période sélectionnée", "الفترة المختارة")
                      : txt("État actuel", "الحالة الحالية")}
                    {` · ${section.rows.length}`}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900/60">
                    <tr>
                      {section.columns.map((column) => (
                        <th key={column.key} className="whitespace-nowrap px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {tr(column.label)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/70">
                    {section.rows.length === 0 ? (
                      <tr>
                        <td colSpan={section.columns.length} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                          {txt("Aucune donnée pour cette section.", "لا توجد بيانات في هذا القسم.")}
                        </td>
                      </tr>
                    ) : (
                      section.rows.map((entry) => (
                        <tr key={String(entry.id)} className="align-top hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                          {section.columns.map((column) => (
                            <td key={column.key} className="max-w-[28rem] whitespace-normal px-4 py-3 text-slate-700 dark:text-slate-200">
                              {String(entry.values[column.key] ?? "-")}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ReportsPage;