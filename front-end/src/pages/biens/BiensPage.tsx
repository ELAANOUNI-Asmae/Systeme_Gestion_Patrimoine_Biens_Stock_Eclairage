import {
  Building2,
  Archive,
  Plus,
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

import {
  PERMISSIONS,
} from "../../constants/permissions";

import {
  ROUTES,
} from "../../constants/routes";

import {
  bienService,
} from "../../services/bienService";

import type {
  Bien,
  BienFilters as BienFiltersType,
} from "../../types/bien";



function BiensPage() {
  const { t } =
    useTranslation();

  const [biens, setBiens] =
    useState<Bien[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [toast, setToast] =
    useState({
      open: false,
      message: "",
      type:
        "success" as
          | "success"
          | "error"
          | "info",
    });

  const [filters, setFilters] =
    useState<BienFiltersType>({
      search: "",
      status: "",
      type: "",
    });

  const loadBiens = async () => {
    try {
      setLoading(true);

      const data =
        await bienService.getAll();

      setBiens(data);
    } catch {
      setToast({
        open: true,
        message: t(
          "biens.loadError",
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
            bien.designationAr
              .toLowerCase()
              .includes(search) ||
            bien.inventoryId
              .toLowerCase()
              .includes(search) ||
            bien.assignment
              .toLowerCase()
              .includes(search) ||
            bien.assignmentAr
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
            {t(
              "biens.description",
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={ROUTES.BIENS_ARCHIVE}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
          >
            <Archive size={19} />

            {t(
              "biens.archive.button",
            )}
          </Link>

          <PermissionGuard
            permission={
              PERMISSIONS.CREATE_ASSET
            }
          >
            <Link
              to={ROUTES.ADD_BIEN}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              <Plus size={19} />

              {t("biens.add")}
            </Link>
          </PermissionGuard>
        </div>
      </div>

      <BienFilters
        filters={filters}
        onChange={setFilters}
      />

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t("biens.count", {
          count:
            filteredBiens.length,
        })}
      </p>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {t("biens.loading")}
        </div>
      ) : (
        <BienTable
          biens={filteredBiens}
          onDelete={() => {
            /*
             * On ne supprime plus définitivement
             * un bien ici.
             * La sortie du patrimoine passera
             * par Vente / Archive.
             */
          }}
        />
      )}
    </section>
  );
}

export default BiensPage;