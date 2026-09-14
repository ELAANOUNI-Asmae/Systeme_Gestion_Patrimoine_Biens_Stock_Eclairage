import {
  Archive,
  Building2,
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BienFilters from "../../components/biens/BienFilters";
import BienTable from "../../components/biens/BienTable";
import PermissionGuard from "../../components/common/PermissionGuard";
import Toast from "../../components/common/Toast";

import { PERMISSIONS } from "../../constants/permissions";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

import {
  bienApiService,
  type BienApiListItem,
} from "../../services/bienApiService";

import type {
  BienFilters as BienFiltersType,
} from "../../types/bien";

function BiensPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const tr = (
    fr: string,
    ar: string,
  ) => (isArabic ? ar : fr);

  const canViewArchives =
    user?.role.permissions.includes(
      PERMISSIONS.GET_ARCHIVED_ASSETS,
    ) ?? false;

  const [biens, setBiens] =
    useState<BienApiListItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<number | undefined>();

  const [toast, setToast] =
    useState<{
      open: boolean;
      message: string;
      type:
        | "success"
        | "error"
        | "info";
    }>({
      open: false,
      message: "",
      type: "success",
    });

  const [filters, setFilters] =
    useState<BienFiltersType>({
      search: "",
      status: "",
      type: "",
    });

  const loadBiens =
    async () => {
      try {
        setLoading(true);

        setBiens(
          await bienApiService.getAll(),
        );
      } catch (error) {
        console.error(
          "Load assets failed:",
          error,
        );

        setBiens([]);

        setToast({
          open: true,
          message: tr(
            "Impossible de charger les biens depuis le serveur.",
            "تعذر تحميل الممتلكات من الخادم.",
          ),
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadBiens();
  }, []);

  const filteredBiens =
    useMemo(() => {
      const search =
        filters.search
          .trim()
          .toLowerCase();

      return biens.filter(
        (bien) => {
          const matchesSearch =
            !search ||
            bien.designation
              .toLowerCase()
              .includes(search) ||
            bien.inventoryNumber
              .toLowerCase()
              .includes(search) ||
            (bien.assignment ?? "")
              .toLowerCase()
              .includes(search);

          const matchesStatus =
            !filters.status ||
            bien.assetStatus ===
              filters.status;

          const matchesType =
            !filters.type ||
            bien.type ===
              filters.type;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType
          );
        },
      );
    }, [biens, filters]);

  const handleDelete =
    async (
      bien: BienApiListItem,
    ) => {
      if (
        bien.id === undefined ||
        !bien.type
      ) {
        setToast({
          open: true,
          message: tr(
            "Impossible de déterminer l’identifiant ou le type de ce bien.",
            "تعذر تحديد معرّف أو نوع هذا الممتلك.",
          ),
          type: "error",
        });

        return;
      }

      const confirmed =
        window.confirm(
          tr(
            `Voulez-vous vraiment supprimer « ${bien.designation} » ?`,
            `هل تريد فعلاً حذف « ${bien.designation} »؟`,
          ),
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          bien.id,
        );

        await bienApiService.remove(
          bien.id,
          bien.type,
        );

        setBiens(
          (previous) =>
            previous.filter(
              (item) =>
                item.key !==
                bien.key,
            ),
        );

        setToast({
          open: true,
          message: tr(
            "Bien supprimé avec succès.",
            "تم حذف الممتلك بنجاح.",
          ),
          type: "success",
        });
      } catch (error) {
        console.error(
          "Delete asset failed:",
          error,
        );

        setToast({
          open: true,
          message: tr(
            "Impossible de supprimer ce bien.",
            "تعذر حذف هذا الممتلك.",
          ),
          type: "error",
        });
      } finally {
        setDeletingId(
          undefined,
        );
      }
    };

  return (
    <section className="space-y-6">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast(
            (previous) => ({
              ...previous,
              open: false,
            }),
          )
        }
      />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            <Building2 className="text-orange-600 dark:text-orange-400" />
            {t("biens.title")}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t("biens.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canViewArchives && (
            <Link
              to={
                ROUTES.BIENS_ARCHIVE
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <Archive size={18} />
              {tr(
                "Archives",
                "الأرشيف",
              )}
            </Link>
          )}

          <PermissionGuard
            permission={
              PERMISSIONS.CREATE_ASSET
            }
          >
            <Link
              to={ROUTES.ADD_BIEN}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              <Plus size={18} />
              {t("biens.add")}
            </Link>
          </PermissionGuard>

          <button
            type="button"
            onClick={() =>
              void loadBiens()
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {tr(
              "Actualiser",
              "تحديث",
            )}
          </button>
        </div>
      </div>

      <BienFilters
        filters={filters}
        onChange={setFilters}
      />

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {tr(
          `${filteredBiens.length} bien(s)`,
          `${filteredBiens.length} ممتلك`,
        )}
      </p>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {t("biens.loading")}
        </div>
      ) : (
        <BienTable
          biens={filteredBiens}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}

export default BiensPage;
