import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ROUTES } from "../../constants/routes";
import { lightingService } from "../../services/lightingService";
import type {
  Failure,
  FailureStatus,
  Intervention,
} from "../../types/lighting";

function LightingHistoryPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [failures, setFailures] = useState<Failure[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FailureStatus | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [failureData, interventionData] = await Promise.all([
        lightingService.getFailures(),
        lightingService.getInterventions(),
      ]);
      setFailures(failureData);
      setInterventions(interventionData);
      setLoading(false);
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return failures.filter((failure) => {
      const linked = interventions.filter(
        (intervention) => intervention.failureId === failure.id,
      );

      const matchesSearch =
        !query ||
        failure.lightReference.toLowerCase().includes(query) ||
        failure.lightDesignation.toLowerCase().includes(query) ||
        failure.lightDesignationAr.toLowerCase().includes(query) ||
        failure.description.toLowerCase().includes(query) ||
        linked.some(
          (intervention) =>
            intervention.technicianName.toLowerCase().includes(query) ||
            intervention.technicianNameAr.toLowerCase().includes(query) ||
            intervention.technicianLocalisation.toLowerCase().includes(query),
        );

      return matchesSearch && (!status || failure.status === status);
    });
  }, [failures, interventions, search, status]);

  return (
    <section className="space-y-6">
      <div>
        <Link
          to={ROUTES.LIGHTING}
          className="inline-flex items-center gap-2 text-sm text-slate-600"
        >
          <ArrowLeft size={18} className={isArabic ? "rotate-180" : ""} />
          {tr("Retour à l’éclairage", "العودة إلى الإنارة")}
        </Link>
        <h1 className="mt-4 text-3xl font-bold">
          {tr("Historique de l’éclairage", "سجل الإنارة العمومية")}
        </h1>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute start-3 top-3.5 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tr(
              "Référence, point lumineux ou technicien",
              "المرجع أو نقطة الإنارة أو التقني",
            )}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-3 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as FailureStatus | "")
          }
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
        >
          <option value="">{tr("Tous les statuts", "جميع الحالات")}</option>
          <option value="REPORTED">{tr("Signalée", "مبلغ عنها")}</option>
          <option value="IN_PROGRESS">{tr("En cours", "قيد المعالجة")}</option>
          <option value="RESOLVED">{tr("Résolue", "محلولة")}</option>
        </select>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          {tr("Chargement...", "جارٍ التحميل...")}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((failure) => {
            const linked = interventions.filter(
              (intervention) => intervention.failureId === failure.id,
            );

            return (
              <article
                key={failure.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="p-5">
                  <h2 className="font-bold">
                    {failure.lightReference} ·{" "}
                    {isArabic
                      ? failure.lightDesignationAr
                      : failure.lightDesignation}
                  </h2>
                  <p className="mt-2 text-sm">{failure.description}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {tr("Déclarée le", "تم التبليغ في")} {failure.reportedAt} ·{" "}
                    {failure.reportedBy === "PUBLIC"
                      ? tr("Signalement public", "تبليغ عمومي")
                      : failure.reportedBy}
                  </p>
                </div>

                <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/50">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <Wrench size={17} className="text-orange-600" />
                    {tr("Interventions associées", "التدخلات المرتبطة")}
                  </h3>

                  <div className="mt-3 space-y-3">
                    {linked.map((intervention) => (
                      <div
                        key={intervention.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="flex flex-wrap justify-between gap-2">
                          <p className="font-semibold">
                            {tr("Intervention", "التدخل")} #{intervention.id}
                          </p>
                          <span>
                            {intervention.completed
                              ? tr("Terminée", "مكتملة")
                              : tr("Planifiée", "مبرمجة")}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                          <p className="flex items-center gap-2">
                            <UserRound size={15} />
                            {isArabic
                              ? intervention.technicianNameAr
                              : intervention.technicianName}
                          </p>
                          <p>{intervention.technicianLocalisation}</p>
                          <p>
                            {tr("Date prévue", "التاريخ المبرمج")}:{" "}
                            {intervention.interventionDate}
                          </p>
                          {intervention.completedAt && (
                            <p className="flex items-center gap-1 text-green-700">
                              <CheckCircle2 size={15} />
                              {tr("Terminée le", "انتهت في")}:{" "}
                              {intervention.completedAt}
                            </p>
                          )}
                        </div>

                        <p className="mt-3 text-sm">{intervention.description}</p>

                        {intervention.completed && (
                          <div className="mt-4 rounded-xl bg-green-50 p-4 dark:bg-green-950/20">
                            <p className="font-semibold">
                              {tr("Rapport", "التقرير")}
                            </p>
                            <p className="mt-1 text-sm">{intervention.report}</p>
                            <p className="mt-3 text-sm font-semibold">
                              {tr("Coût", "التكلفة")}:{" "}
                              {(intervention.cost ?? 0).toFixed(2)} DH
                            </p>

                            {intervention.photos.length > 0 && (
                              <div className="mt-3">
                                <p className="flex items-center gap-2 text-sm font-semibold">
                                  <Camera size={16} />
                                  {tr("Photos", "الصور")}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {intervention.photos.map((photo) => (
                                    <span
                                      key={photo.id}
                                      className="rounded-lg border border-green-200 bg-white px-2.5 py-1.5 text-xs"
                                    >
                                      {photo.fileName}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {intervention.documents.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {intervention.documents.map((document) => (
                              <span
                                key={document.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                              >
                                <FileText size={13} />
                                {document.fileName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {linked.length === 0 && (
                      <p className="text-sm text-slate-500">
                        {tr("Aucune intervention.", "لا يوجد تدخل.")}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default LightingHistoryPage;
