import {
  Building2,
  FileText,
} from "lucide-react";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import Modal from "../common/Modal";

import type {
  Bien,
  PartyType,
  RentalOperation,
  SaleOperation,
} from "../../types/bien";

type OperationMode =
  | "RENT"
  | "SELL";

type AssetOperationModalProps = {
  open: boolean;

  mode: OperationMode;

  bien: Bien;

  loading?: boolean;

  onClose: () => void;

  onRent: (
    data: Omit<
      RentalOperation,
      "id" | "bienId" | "createdAt"
    >,
  ) => Promise<void> | void;

  onSell: (
    data: Omit<
      SaleOperation,
      "id" | "bienId" | "createdAt"
    >,
  ) => Promise<void> | void;
};

function AssetOperationModal({
  open,
  mode,
  bien,
  loading = false,
  onClose,
  onRent,
  onSell,
}: AssetOperationModalProps) {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const [partyType, setPartyType] =
    useState<PartyType>(
      "PERSON",
    );

  const [name, setName] =
    useState("");

  const [cin, setCin] =
    useState("");

  const [ice, setIce] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [
    monthlyAmount,
    setMonthlyAmount,
  ] = useState(0);

  const [saleDate, setSaleDate] =
    useState("");

  const [salePrice, setSalePrice] =
    useState(0);

  const [
    contractReference,
    setContractReference,
  ] = useState("");

  const [
    contractFileName,
    setContractFileName,
  ] = useState("");

  const [
    receiptFileName,
    setReceiptFileName,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setPartyType("PERSON");
    setName("");
    setCin("");
    setIce("");
    setPhone("");
    setAddress("");
    setStartDate("");
    setEndDate("");
    setMonthlyAmount(0);
    setSaleDate("");
    setSalePrice(0);
    setContractReference("");
    setContractFileName("");
    setReceiptFileName("");
    setNotes("");
    setError("");
  }, [open, mode]);

  const designation =
    isArabic
      ? bien.designationAr
      : bien.designation;

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        t(
          "biens.operations.required",
        ),
      );

      return;
    }

    if (
      partyType === "PERSON" &&
      !cin.trim()
    ) {
      setError(
        t(
          "biens.operations.required",
        ),
      );

      return;
    }

    if (
      partyType === "COMPANY" &&
      !ice.trim()
    ) {
      setError(
        t(
          "biens.operations.required",
        ),
      );

      return;
    }

    if (mode === "RENT") {
      if (
        !startDate ||
        monthlyAmount <= 0
      ) {
        setError(
          t(
            "biens.operations.required",
          ),
        );

        return;
      }

      await onRent({
        partyType,

        tenantName:
          name.trim(),

        cin:
          partyType ===
          "PERSON"
            ? cin.trim()
            : undefined,

        ice:
          partyType ===
          "COMPANY"
            ? ice.trim()
            : undefined,

        phone:
          phone.trim() ||
          undefined,

        address:
          address.trim() ||
          undefined,

        startDate,

        endDate:
          endDate ||
          undefined,

        monthlyAmount,

        contractReference:
          contractReference.trim() ||
          undefined,

        contractFileName:
          contractFileName ||
          undefined,

        notes:
          notes.trim() ||
          undefined,
      });

      return;
    }

    if (
      !saleDate ||
      salePrice <= 0
    ) {
      setError(
        t(
          "biens.operations.required",
        ),
      );

      return;
    }

    await onSell({
      partyType,

      buyerName:
        name.trim(),

      cin:
        partyType ===
        "PERSON"
          ? cin.trim()
          : undefined,

      ice:
        partyType ===
        "COMPANY"
          ? ice.trim()
          : undefined,

      phone:
        phone.trim() ||
        undefined,

      address:
        address.trim() ||
        undefined,

      saleDate,

      salePrice,

      contractReference:
        contractReference.trim() ||
        undefined,

      contractFileName:
        contractFileName ||
        undefined,

      receiptFileName:
        receiptFileName ||
        undefined,

      notes:
        notes.trim() ||
        undefined,
    });
  };

  return (
    <Modal
      open={open}
      title={
        mode === "RENT"
          ? t(
              "biens.operations.rentTitle",
            )
          : t(
              "biens.operations.sellTitle",
            )
      }
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 dark:bg-orange-500/10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            <Building2
              size={21}
            />
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "biens.operations.selectedAsset",
              )}
            </p>

            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {designation}
            </p>

            <p className="text-xs text-slate-500">
              {bien.inventoryId}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.operations.partyType",
            )}

            <select
              value={partyType}
              onChange={(event) =>
                setPartyType(
                  event.target
                    .value as PartyType,
                )
              }
              className={
                inputClassName
              }
            >
              <option value="PERSON">
                {t(
                  "biens.operations.person",
                )}
              </option>

              <option value="COMPANY">
                {t(
                  "biens.operations.company",
                )}
              </option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {mode === "RENT"
              ? t(
                  "biens.operations.tenantName",
                )
              : t(
                  "biens.operations.buyerName",
                )}

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />
          </label>

          {partyType ===
          "PERSON" ? (
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "biens.operations.cin",
              )}

              <input
                type="text"
                value={cin}
                onChange={(event) =>
                  setCin(
                    event.target
                      .value,
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>
          ) : (
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t(
                "biens.operations.ice",
              )}

              <input
                type="text"
                value={ice}
                onChange={(event) =>
                  setIce(
                    event.target
                      .value,
                  )
                }
                className={
                  inputClassName
                }
              />
            </label>
          )}

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t(
              "biens.operations.phone",
            )}

            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
            {t(
              "biens.operations.address",
            )}

            <input
              type="text"
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />
          </label>

          {mode === "RENT" ? (
            <>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t(
                  "biens.operations.startDate",
                )}

                <input
                  type="date"
                  value={
                    startDate
                  }
                  onChange={(
                    event,
                  ) =>
                    setStartDate(
                      event.target
                        .value,
                    )
                  }
                  className={
                    inputClassName
                  }
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t(
                  "biens.operations.endDate",
                )}

                <input
                  type="date"
                  value={endDate}
                  onChange={(
                    event,
                  ) =>
                    setEndDate(
                      event.target
                        .value,
                    )
                  }
                  className={
                    inputClassName
                  }
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
                {t(
                  "biens.operations.monthlyAmount",
                )}

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    monthlyAmount
                  }
                  onChange={(
                    event,
                  ) =>
                    setMonthlyAmount(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className={
                    inputClassName
                  }
                />
              </label>
            </>
          ) : (
            <>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t(
                  "biens.operations.saleDate",
                )}

                <input
                  type="date"
                  value={saleDate}
                  onChange={(
                    event,
                  ) =>
                    setSaleDate(
                      event.target
                        .value,
                    )
                  }
                  className={
                    inputClassName
                  }
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t(
                  "biens.operations.salePrice",
                )}

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={salePrice}
                  onChange={(
                    event,
                  ) =>
                    setSalePrice(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className={
                    inputClassName
                  }
                />
              </label>
            </>
          )}

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
            {t(
              "biens.operations.contractReference",
            )}

            <input
              type="text"
              value={
                contractReference
              }
              onChange={(event) =>
                setContractReference(
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="rounded-xl border border-dashed border-slate-300 p-4 text-sm dark:border-slate-600">
            <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
              <FileText
                size={18}
              />

              {t(
                "biens.operations.contract",
              )}
            </span>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(event) =>
                setContractFileName(
                  event.target
                    .files?.[0]
                    ?.name ?? "",
                )
              }
              className="mt-3 block w-full text-xs text-slate-500"
            />

            {contractFileName && (
              <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                {
                  contractFileName
                }
              </p>
            )}
          </label>

          {mode === "SELL" && (
            <label className="rounded-xl border border-dashed border-slate-300 p-4 text-sm dark:border-slate-600">
              <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <FileText
                  size={18}
                />

                {t(
                  "biens.operations.receipt",
                )}
              </span>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(
                  event,
                ) =>
                  setReceiptFileName(
                    event.target
                      .files?.[0]
                      ?.name ?? "",
                  )
                }
                className="mt-3 block w-full text-xs text-slate-500"
              />

              {receiptFileName && (
                <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                  {
                    receiptFileName
                  }
                </p>
              )}
            </label>
          )}
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t(
            "biens.operations.notes",
          )}

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            rows={3}
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        <div className="sticky -bottom-5 z-10 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800 sm:-mx-6 sm:px-6 sm:flex-row sm:justify-end rtl:sm:justify-start">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            {t(
              "biens.operations.cancel",
            )}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
          >
            {loading
              ? t(
                  "biens.operations.saving",
                )
              : mode === "RENT"
                ? t(
                    "biens.operations.confirmRent",
                  )
                : t(
                    "biens.operations.confirmSale",
                  )}
          </button>
        </div>
        
      </form>
    </Modal>
  );
}

export default AssetOperationModal;