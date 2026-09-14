import {
  Activity,
  CheckCircle2,
  History,
  Lightbulb,
  Plus,
  Search,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import FailureReportModal from "../../components/lighting/FailureReportModal";
import InterventionModal, {
  type InterventionData,
} from "../../components/lighting/InterventionModal";
import CompleteInterventionModal from "../../components/lighting/CompleteInterventionModal";
import LightingMap from "../../components/lighting/LightingMap";
import LightTable from "../../components/lighting/LightTable";
import PermissionGuard from "../../components/common/PermissionGuard";

import { PERMISSIONS } from "../../constants/permissions";
import { ROUTES } from "../../constants/routes";
import { lightingService } from "../../services/lightingService";
import { useAuth } from "../../hooks/useAuth";

import type { AppDocument } from "../../types/document";
import type {
  Failure,
  Intervention,
  InterventionCompletionData,
  Light,
  LightStatus,
  Technician,
} from "../../types/lighting";

function LightingPage() {
  const { user, hasPermission } = useAuth();
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [lights, setLights] = useState<Light[]>([]);
  const [failures, setFailures] = useState<Failure[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LightStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [failureLight, setFailureLight] = useState<Light | null>(null);
  const [interventionFailure, setInterventionFailure] =
    useState<Failure | null>(null);
  const [completionIntervention, setCompletionIntervention] =
    useState<Intervention | null>(null);

  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [lightData, failureData, interventionData, technicianData] =
        await Promise.all([
          lightingService.getLights(),
          lightingService.getFailures(),
          lightingService.getInterventions(),
          lightingService.getTechnicians(),
        ]);

      setLights(lightData);
      setFailures(failureData);
      setInterventions(interventionData);
      setTechnicians(technicianData);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : tr("Impossible de charger l’éclairage.", "تعذر تحميل الإنارة."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredLights = useMemo(() => {
    const query = search.trim().toLowerCase();

    return lights.filter((light) => {
      const matchSearch =
        !query ||
        light.reference.toLowerCase().includes(query) ||
        light.designation.toLowerCase().includes(query) ||
        light.designationAr.toLowerCase().includes(query) ||
        light.localisation.toLowerCase().includes(query);

      return matchSearch && (!statusFilter || light.status === statusFilter);
    });
  }, [lights, search, statusFilter]);

  const openFailureLightIds = useMemo(
    () =>
      new Set(
        failures
          .filter((failure) => failure.status !== "RESOLVED")
          .map((failure) => failure.lightId),
      ),
    [failures],
  );

  const activeCount =
    lights.filter((item) => item.status === "ACTIVE").length;
  const damagedCount =
    lights.filter((item) => item.status === "DAMAGED").length;
  const maintenanceCount =
    lights.filter((item) => item.status === "UNDER_MAINTENANCE").length;
  const unresolvedCount =
    failures.filter((item) => item.status !== "RESOLVED").length;

  const reportFailure = async (data: {
    description: string;
    documents?: AppDocument[];
  }) => {
    if (!failureLight) return;

    try {
      setBusy(true);
      await lightingService.createFailure({
        lightId: failureLight.id,
        description: data.description,
        reportedBy:
          user != null
            ? `${user.firstName} ${user.lastName}`
            : "PUBLIC",
        documents: data.documents,
      });
      setFailureLight(null);
      setNotice(tr("Panne déclarée avec succès.", "تم التبليغ عن العطل بنجاح."));
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tr("Erreur.", "خطأ."));
    } finally {
      setBusy(false);
    }
  };

  const planIntervention = async (data: InterventionData) => {
    if (!interventionFailure) return;

    try {
      setBusy(true);
      await lightingService.createIntervention({
        failureId: interventionFailure.id,
        technicianId: data.technicianId,
        interventionDate: data.interventionDate,
        description: data.description,
        documents: data.documents,
      });
      setInterventionFailure(null);
      setNotice(
        tr(
          "Intervention planifiée avec succès.",
          "تمت برمجة التدخل بنجاح.",
        ),
      );
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tr("Erreur.", "خطأ."));
    } finally {
      setBusy(false);
    }
  };

  const complete = async (data: InterventionCompletionData) => {
    if (!completionIntervention) return;

    try {
      setBusy(true);
      await lightingService.completeIntervention(
        completionIntervention.id,
        data,
      );
      setCompletionIntervention(null);
      setNotice(
        tr(
          "Intervention terminée. La panne est résolue et le point est actif.",
          "تم إنهاء التدخل وحل العطل وأصبحت نقطة الإنارة نشطة.",
        ),
      );
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tr("Erreur.", "خطأ."));
    } finally {
      setBusy(false);
    }
  };

  const deleteLight = async (light: Light) => {
    if (
      !window.confirm(
        tr(
          `Supprimer le point ${light.reference} ?`,
          `حذف نقطة الإنارة ${light.reference}؟`,
        ),
      )
    ) {
      return;
    }

    try {
      await lightingService.removeLight(light.id);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tr("Erreur.", "خطأ."));
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {tr("Gestion de l’éclairage public", "تدبير الإنارة العمومية")}
          </h1>
          <p className="mt-2 text-slate-500">
            {tr(
              "Points lumineux, pannes, techniciens et interventions.",
              "نقاط الإنارة والأعطاب والتقنيون والتدخلات.",
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={ROUTES.LIGHTING_HISTORY}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 font-semibold"
          >
            <History size={17} />
            {tr("Historique", "السجل")}
          </Link>

          <PermissionGuard permission={PERMISSIONS.CREATE_LIGHT_POINT}>
            <Link
              to={ROUTES.ADD_LIGHT}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 font-semibold text-white"
            >
              <Plus size={17} />
              {tr("Ajouter un point", "إضافة نقطة")}
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Activity size={20} />}
          label={tr("Actifs", "نشطة")}
          value={activeCount}
        />
        <StatCard
          icon={<TriangleAlert size={20} />}
          label={tr("Endommagés", "متضررة")}
          value={damagedCount}
        />
        <StatCard
          icon={<Wrench size={20} />}
          label={tr("En maintenance", "قيد الصيانة")}
          value={maintenanceCount}
        />
        <StatCard
          icon={<Lightbulb size={20} />}
          label={tr("Pannes ouvertes", "أعطاب مفتوحة")}
          value={unresolvedCount}
        />
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
              "Référence, désignation ou localisation",
              "المرجع أو التسمية أو الموقع",
            )}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-3 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as LightStatus | "")
          }
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
        >
          <option value="">{tr("Tous les statuts", "جميع الحالات")}</option>
          <option value="ACTIVE">{tr("Actif", "نشط")}</option>
          <option value="INACTIVE">{tr("Inactif", "غير نشط")}</option>
          <option value="DAMAGED">{tr("Endommagé", "متضرر")}</option>
          <option value="UNDER_MAINTENANCE">
            {tr("En maintenance", "قيد الصيانة")}
          </option>
        </select>
      </div>

      <LightTable
        lights={filteredLights}
        loading={loading}
        canEdit={hasPermission(PERMISSIONS.UPDATE_LIGHT_POINT)}
        canDelete={hasPermission(PERMISSIONS.DELETE_LIGHT_POINT)}
        canReportFailure={hasPermission(PERMISSIONS.REPORT_FAILURE)}
        openFailureLightIds={openFailureLightIds}
        onDelete={deleteLight}
        onReportFailure={setFailureLight}
      />

      <LightingMap lights={filteredLights} />

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-bold">
          {tr("Pannes et interventions", "الأعطاب والتدخلات")}
        </h2>

        <div className="mt-4 space-y-4">
          {failures.length === 0 && (
            <p className="text-sm text-slate-500">
              {tr("Aucune panne.", "لا توجد أعطاب.")}
            </p>
          )}

          {failures.map((failure) => {
            const linked = interventions.filter(
              (item) => item.failureId === failure.id,
            );
            const activeIntervention = linked.find((item) => !item.completed);

            return (
              <div
                key={failure.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">
                      {failure.lightReference} ·{" "}
                      {isArabic
                        ? failure.lightDesignationAr
                        : failure.lightDesignation}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {failure.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-700">
                    {failure.status}
                  </span>
                </div>

                {failure.status === "REPORTED" && (
                  <PermissionGuard permission={PERMISSIONS.SCHEDULE_INTERVENTION}>
                    <button
                      type="button"
                      onClick={() => setInterventionFailure(failure)}
                      className="mt-3 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {tr("Planifier une intervention", "برمجة تدخل")}
                    </button>
                  </PermissionGuard>
                )}

                {activeIntervention && (
                  <div className="mt-4 rounded-xl bg-orange-50 p-4 dark:bg-orange-950/20">
                    <p className="font-semibold">
                      {tr("Intervention planifiée", "تدخل مبرمج")}
                    </p>
                    <p className="mt-1 text-sm">
                      {isArabic
                        ? activeIntervention.technicianNameAr
                        : activeIntervention.technicianName}
                      {" · "}
                      {activeIntervention.interventionDate}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activeIntervention.technicianLocalisation}
                    </p>

                    <PermissionGuard permission={PERMISSIONS.COMPLETE_INTERVENTION}>
                      <button
                        type="button"
                        onClick={() =>
                          setCompletionIntervention(activeIntervention)
                        }
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        <CheckCircle2 size={16} />
                        {tr("Terminer l’intervention", "إنهاء التدخل")}
                      </button>
                    </PermissionGuard>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </article>

      <FailureReportModal
        open={failureLight != null}
        light={failureLight}
        loading={busy}
        onClose={() => setFailureLight(null)}
        onSubmit={reportFailure}
      />

      <InterventionModal
        open={interventionFailure != null}
        failure={interventionFailure}
        light={
          interventionFailure
            ? lights.find(
                (light) => light.id === interventionFailure.lightId,
              ) ?? null
            : null
        }
        technicians={technicians}
        loading={busy}
        onClose={() => setInterventionFailure(null)}
        onSubmit={planIntervention}
      />

      <CompleteInterventionModal
        open={completionIntervention != null}
        intervention={completionIntervention}
        loading={busy}
        onClose={() => setCompletionIntervention(null)}
        onSubmit={complete}
      />
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="text-orange-600">{icon}</div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </article>
  );
}

export default LightingPage;
