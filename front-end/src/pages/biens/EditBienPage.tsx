import { ArrowLeft } from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useTranslation } from "react-i18next";

import BienForm from "../../components/biens/BienForm";

import { ROUTES } from "../../constants/routes";

import { bienService } from "../../services/bienService";

import type {
  Bien,
  BienFormData,
} from "../../types/bien";

function EditBienPage() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const { t } =
    useTranslation();

  const [bien, setBien] =
    useState<Bien | null>(
      null,
    );

  const [
    loadingPage,
    setLoadingPage,
  ] = useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadBien =
      async () => {
        try {
          const data =
            await bienService.getById(
              Number(id),
            );

          setBien(data);
        } catch {
          setError(
            t(
              "biens.pages.notFound",
            ),
          );
        } finally {
          setLoadingPage(
            false,
          );
        }
      };

    void loadBien();
  }, [id, t]);

  const handleSubmit = async (
    data: BienFormData,
  ) => {
    try {
      setSaving(true);
      setError("");

      await bienService.update(
        Number(id),
        data,
      );

      navigate(ROUTES.BIENS);
    } catch {
      setError(
        t(
          "biens.pages.genericError",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
        {t(
          "biens.pages.detailsLoading",
        )}
      </div>
    );
  }

  if (!bien) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        {error ||
          t(
            "biens.pages.notFound",
          )}
      </div>
    );
  }

  const initialValues: BienFormData =
    {
      type: bien.type,

      designation:
        bien.designation,

      designationAr:
        bien.designationAr,

      assetStatus:
        bien.assetStatus,

      acquisitionDate:
        bien.acquisitionDate,

      purchaseValue:
        bien.purchaseValue,

      assignment:
        bien.assignment,

      assignmentAr:
        bien.assignmentAr,

      inventoryId:
        bien.inventoryId,

      documents: [
        ...bien.documents,
      ],

      vehicleDetails:
        bien.vehicleDetails,

      machineDetails:
        bien.machineDetails,

      realEstateDetails:
        bien.realEstateDetails,
    };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <Link
        to={ROUTES.BIENS}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
      >
        <ArrowLeft
          size={18}
          className="rtl:rotate-180"
        />

        {t("biens.pages.back")}
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
        {t(
          "biens.pages.editTitle",
        )}
      </h1>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <BienForm
        initialValues={
          initialValues
        }
        submitLabel={t(
          "biens.pages.save",
        )}
        loading={saving}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default EditBienPage;