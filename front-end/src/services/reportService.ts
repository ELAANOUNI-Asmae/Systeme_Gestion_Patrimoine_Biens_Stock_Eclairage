import ExcelJS from "exceljs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import reportLogo from "../assets/images/LogoSGPBSE.png";
import { bienApiService, mapBackendDocuments, type BienApiListItem } from "./bienApiService";
import { lightingService } from "./lightingService";
import { stockService } from "./stockService";
import { userService } from "./userService";

import type {
  GenerateReportParams,
  ReportColumn,
  ReportData,
  ReportLabel,
  ReportMetric,
  ReportTableRow,
} from "../types/report";

type UnknownRecord = Record<string, unknown>;

const label = (fr: string, ar: string): ReportLabel => ({ fr, ar });

const asRecord = (value: unknown): UnknownRecord =>
  value !== null && typeof value === "object"
    ? (value as UnknownRecord)
    : {};

const field = (value: unknown, key: string): unknown => asRecord(value)[key];

const nested = (value: unknown, ...keys: string[]): unknown =>
  keys.reduce<unknown>((current, key) => field(current, key), value);

const text = (value: unknown, fallback = "-"): string => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const numberValue = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const boolValue = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  return fallback;
};

const arrayValue = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const dateOnly = (value: unknown): string => {
  const raw = text(value, "");
  if (!raw) return "";
  return raw.length >= 10 ? raw.slice(0, 10) : raw;
};

const inPeriod = (value: unknown, startDate: string, endDate: string): boolean => {
  const date = dateOnly(value);
  if (!date) return false;
  return date >= startDate && date <= endDate;
};

const money = (value: number): number => Math.round(value * 100) / 100;

const fullName = (user: unknown, arabic = false): string => {
  const first = arabic
    ? field(user, "firstnameAr") ?? field(user, "firstNameAr")
    : field(user, "firstname") ?? field(user, "firstName");
  const last = arabic
    ? field(user, "lastnameAr") ?? field(user, "lastNameAr")
    : field(user, "lastname") ?? field(user, "lastName");
  return `${text(first, "")} ${text(last, "")}`.trim() || "-";
};

const localizedText = (
  value: unknown,
  keyFr: string,
  keyAr: string,
  arabic: boolean,
): string =>
  text(
    arabic
      ? field(value, keyAr) ?? field(value, keyFr)
      : field(value, keyFr),
  );

const roleName = (user: unknown): string => text(nested(user, "role", "name"));

const assetStatus = (asset: unknown): string =>
  text(field(asset, "assetStatus") ?? field(asset, "status"));

const assetType = (asset: unknown): string => text(field(asset, "type"));

const assetDetails = (asset: unknown): string => {
  const type = assetType(asset);
  if (type === "VEHICLE") {
    const d = field(asset, "vehicleDetails");
    return [
      text(field(d, "brand"), ""),
      text(field(d, "model"), ""),
      text(field(d, "registrationNumber"), ""),
      text(field(d, "chassisNumber"), ""),
      field(d, "fiscalHorsepower") ? `${text(field(d, "fiscalHorsepower"))} CV` : "",
      text(field(d, "firstRegistrationDate"), ""),
    ]
      .filter(Boolean)
      .join(" | ") || "-";
  }
  if (type === "MACHINE") {
    const d = field(asset, "machineDetails");
    return [
      text(field(d, "brand"), ""),
      text(field(d, "model"), ""),
      text(field(d, "serialNumber"), ""),
      text(field(d, "technicalReference"), ""),
      field(d, "power") ? `${text(field(d, "power"))} W` : "",
    ]
      .filter(Boolean)
      .join(" | ") || "-";
  }
  if (type === "REAL_ESTATE") {
    const d = field(asset, "realEstateDetails");
    return [
      text(field(d, "address"), ""),
      field(d, "surface") ? `${text(field(d, "surface"))} m²` : "",
      text(field(d, "landTitleNumber"), ""),
      text(field(d, "propertyType"), ""),
      text(field(d, "cadastralReference"), ""),
    ]
      .filter(Boolean)
      .join(" | ") || "-";
  }
  return "-";
};

const lightLocation = (light: unknown, arabic = false): string => {
  const localisation = text(
    arabic
      ? field(light, "localisationAr") ?? field(light, "localisation")
      : field(light, "localisation"),
    "",
  );
  if (localisation) return localisation;
  return [
    text(arabic ? field(light, "zoneAr") ?? field(light, "zone") : field(light, "zone"), ""),
    text(arabic ? field(light, "addressAr") ?? field(light, "address") : field(light, "address"), ""),
  ]
    .filter(Boolean)
    .join(" — ") || "-";
};

const interventionTechnician = (intervention: unknown, arabic = false): string =>
  text(
    arabic
      ? field(intervention, "technicianNameAr") ?? field(intervention, "technicianName") ?? field(intervention, "technician")
      : field(intervention, "technicianName") ?? field(intervention, "technician"),
  );

const interventionLocation = (intervention: unknown): string =>
  text(field(intervention, "technicianLocalisation") ?? field(intervention, "technicianLocation"));

const docCount = (value: unknown): number => arrayValue(field(value, "documents")).length;

const statusLabel = (status: string, arabic = false): string => {
  const fr: Record<string, string> = {
    AVAILABLE: "Disponible", IN_USE: "En service", RENTED: "Loué",
    UNDER_MAINTENANCE: "En maintenance", OUT_OF_SERVICE: "Hors service",
    DAMAGED: "Endommagé", DISPOSED: "Cédé", ARCHIVED: "Archivé",
    ACTIVE: "Actif", INACTIVE: "Inactif", REPORTED: "Signalée",
    IN_PROGRESS: "En cours", RESOLVED: "Résolue", PENDING: "En attente",
    APPROVED: "Validée", REJECTED: "Refusée", RECEIVED: "Reçue",
    WAITING: "En attente de réapprovisionnement",
    READY_NOTIFIED: "Quantité disponible / demandeur notifié",
    ENTRY: "Entrée", EXIT: "Sortie",
    DESTROYED: "Détruit", TRANSFERRED: "Transféré", REFORMED: "Réformé", OTHER: "Autre",
    HOMME: "Homme", FEMME: "Femme",
  };
  const ar: Record<string, string> = {
    AVAILABLE: "متاح", IN_USE: "قيد الاستعمال", RENTED: "مؤجر",
    UNDER_MAINTENANCE: "قيد الصيانة", OUT_OF_SERVICE: "خارج الخدمة",
    DAMAGED: "متضرر", DISPOSED: "مفوّت", ARCHIVED: "مؤرشف",
    ACTIVE: "نشط", INACTIVE: "غير نشط", REPORTED: "مبلغ عنه",
    IN_PROGRESS: "قيد المعالجة", RESOLVED: "محلول", PENDING: "قيد الانتظار",
    APPROVED: "مقبول", REJECTED: "مرفوض", RECEIVED: "تم الاستلام",
    WAITING: "في انتظار إعادة التموين",
    READY_NOTIFIED: "الكمية متوفرة وتم إشعار الطالب",
    ENTRY: "دخول", EXIT: "خروج",
    DESTROYED: "متلف", TRANSFERRED: "محول", REFORMED: "مسحوب من الخدمة", OTHER: "أخرى",
    HOMME: "ذكر", FEMME: "أنثى",
  };
  return (arabic ? ar : fr)[status] ?? status;
};

const assetTypeLabel = (type: string, arabic = false): string => {
  const fr: Record<string, string> = { VEHICLE: "Véhicule", MACHINE: "Machine", REAL_ESTATE: "Immobilier" };
  const ar: Record<string, string> = { VEHICLE: "مركبة", MACHINE: "آلة", REAL_ESTATE: "عقار" };
  return (arabic ? ar : fr)[type] ?? type;
};

const unitLabel = (unit: string, arabic = false): string => {
  const fr: Record<string, string> = { UNITE: "Unité", PIECE: "Pièce", PAQUET: "Paquet", BOITE: "Boîte", KG: "Kg", LITRE: "Litre", METRE: "Mètre" };
  const ar: Record<string, string> = { UNITE: "وحدة", PIECE: "قطعة", PAQUET: "حزمة", BOITE: "علبة", KG: "كغ", LITRE: "لتر", METRE: "متر" };
  return (arabic ? ar : fr)[unit] ?? unit;
};

const col = (key: string, fr: string, ar: string, width?: number): ReportColumn => ({
  key,
  label: label(fr, ar),
  width,
});

const metric = (
  id: string,
  fr: string,
  ar: string,
  value: number | string,
  unit?: string,
): ReportMetric => ({ id, label: label(fr, ar), value, unit });

const row = (
  id: number | string,
  values: Record<string, string | number | boolean>,
  date?: string,
): ReportTableRow => ({ id, values, date });

const buildUsersReport = async (params: GenerateReportParams): Promise<ReportData> => {
  const arabic = params.language === "ar";
  const users = (await userService.getAll()) as unknown[];
  const active = users.filter((user) =>
    boolValue(field(user, "active"), boolValue(field(user, "isActive"), true)),
  ).length;
  const roleNames = new Set(users.map(roleName).filter((value) => value !== "-"));

  const sectionRows = users.map((user, index) =>
    row(numberValue(field(user, "id"), index + 1), {
      name: fullName(user),
      nameAr: fullName(user, true),
      email: text(field(user, "email")),
      phone: text(field(user, "phone")),
      cin: text(field(user, "cin")),
      gender: statusLabel(text(field(user, "gender")), arabic),
      role: roleName(user),
      status: boolValue(field(user, "active"), boolValue(field(user, "isActive"), true))
        ? (arabic ? "نشط" : "Actif")
        : (arabic ? "غير نشط" : "Inactif"),
    }),
  );

  return {
    type: "USERS",
    title: label("Rapport complet des utilisateurs", "التقرير الكامل للمستخدمين"),
    startDate: params.startDate,
    endDate: params.endDate,
    generatedAt: new Date().toISOString(),
    generatedBy: params.generatedBy,
    statistics: [
      metric("users-total", "Utilisateurs", "المستخدمون", users.length),
      metric("users-active", "Comptes actifs", "الحسابات النشطة", active),
      metric("users-inactive", "Comptes inactifs", "الحسابات غير النشطة", users.length - active),
      metric("users-roles", "Rôles distincts", "الأدوار المختلفة", roleNames.size),
    ],
    sections: [
      {
        id: "users",
        title: label("Annuaire des utilisateurs", "دليل المستخدمين"),
        description: label(
          "État actuel des comptes, identités et rôles.",
          "الحالة الحالية للحسابات والهويات والأدوار.",
        ),
        periodFiltered: false,
        columns: [
          col("name", "Nom complet", "الاسم الكامل", 24),
          col("nameAr", "Nom en arabe", "الاسم بالعربية", 24),
          col("email", "E-mail", "البريد الإلكتروني", 28),
          col("phone", "Téléphone", "الهاتف", 16),
          col("cin", "CIN", "CIN", 14),
          col("gender", "Genre", "الجنس", 12),
          col("role", "Rôle", "الدور", 20),
          col("status", "Statut du compte", "حالة الحساب", 18),
        ],
        rows: sectionRows,
      },
    ],
  };
};

const normalizeApiAsset = (item: BienApiListItem): UnknownRecord => {
  const raw = asRecord(item.raw);
  const rawDocuments =
    field(raw, "documentResponseDtoSet") ??
    field(raw, "documents") ??
    field(raw, "documentList");

  return {
    ...raw,
    id: item.id,
    type: item.type ?? field(raw, "type"),
    inventoryId: item.inventoryNumber,
    inventoryNumber: item.inventoryNumber,
    designation: item.designation,
    designationAr: field(raw, "designationAr") ?? field(raw, "designation_ar") ?? item.designation,
    assetStatus: item.assetStatus,
    assignment: item.assignment ?? field(raw, "assignment"),
    assignmentAr: field(raw, "assignmentAr") ?? field(raw, "assignment_ar") ?? item.assignment,
    acquisitionDate: item.acquisitionDate,
    purchaseValue: item.purchaseValue ?? field(raw, "purchaseValue") ?? field(raw, "acquisitionValue"),
    archivedAt: item.archivedAt ?? field(raw, "archivedAt"),
    archive: field(raw, "archive") ?? field(raw, "disposal"),
    rentals: field(raw, "rentals") ?? field(raw, "rentalList") ?? [],
    rentalHistory: field(raw, "rentalHistory") ?? field(raw, "rentalList") ?? [],
    documents: mapBackendDocuments(rawDocuments),
  };
};

const buildAssetsReport = async (params: GenerateReportParams): Promise<ReportData> => {
  const arabic = params.language === "ar";
  const [activeApiAssets, archivedApiAssets] = await Promise.all([
    bienApiService.getAll(),
    bienApiService.getArchived().catch(() => []),
  ]);
  const activeAssets = activeApiAssets.map(normalizeApiAsset);
  const archivedAssets = archivedApiAssets.map(normalizeApiAsset);

  const currentRows = activeAssets.map((asset, index) =>
    row(numberValue(field(asset, "id"), index + 1), {
      inventory: text(field(asset, "inventoryId")),
      designation: localizedText(asset, "designation", "designationAr", arabic),
      type: assetTypeLabel(assetType(asset), arabic),
      status: statusLabel(assetStatus(asset), arabic),
      assignment: localizedText(asset, "assignment", "assignmentAr", arabic),
      acquisitionDate: dateOnly(field(asset, "acquisitionDate")) || "-",
      value: money(numberValue(field(asset, "purchaseValue"))),
      details: assetDetails(asset),
      documents: docCount(asset),
    }),
  );

  const acquisitionRows = activeAssets
    .filter((asset) => inPeriod(field(asset, "acquisitionDate"), params.startDate, params.endDate))
    .map((asset, index) =>
      row(`acq-${numberValue(field(asset, "id"), index + 1)}`, {
        date: dateOnly(field(asset, "acquisitionDate")),
        inventory: text(field(asset, "inventoryId")),
        designation: localizedText(asset, "designation", "designationAr", arabic),
        type: assetTypeLabel(assetType(asset), arabic),
        assignment: localizedText(asset, "assignment", "assignmentAr", arabic),
        value: money(numberValue(field(asset, "purchaseValue"))),
      }, dateOnly(field(asset, "acquisitionDate"))),
    );

  const rentalRows: ReportTableRow[] = [];
  activeAssets.forEach((asset) => {
    arrayValue(field(asset, "rentalHistory") ?? field(asset, "rentals")).forEach((rental, index) => {
      const start = dateOnly(field(rental, "startDate"));
      if (!inPeriod(start, params.startDate, params.endDate)) return;
      rentalRows.push(
        row(`rent-${numberValue(field(asset, "id"))}-${index}`, {
          asset: localizedText(asset, "designation", "designationAr", arabic),
          inventory: text(field(asset, "inventoryId")),
          tenant: text(field(rental, "tenantName")),
          startDate: start,
          endDate: dateOnly(field(rental, "endDate")) || "-",
          monthlyAmount: money(numberValue(field(rental, "monthlyAmount"))),
          reference: text(field(rental, "contractReference")),
          notes: text(field(rental, "notes")),
        }, start),
      );
    });
  });

  const archiveRows = archivedAssets
    .filter((asset) => {
      const archive = field(asset, "archive");
      const archivedAt = field(archive, "archivedAt") ?? field(asset, "archivedAt");
      return inPeriod(archivedAt, params.startDate, params.endDate);
    })
    .map((asset, index) => {
      const archive = field(asset, "archive");
      const archivedAt = dateOnly(field(archive, "archivedAt") ?? field(asset, "archivedAt"));
      return row(`archive-${numberValue(field(asset, "id"), index + 1)}`, {
        date: archivedAt,
        inventory: text(field(asset, "inventoryId")),
        designation: localizedText(asset, "designation", "designationAr", arabic),
        type: assetTypeLabel(assetType(asset), arabic),
        reason: statusLabel(text(field(archive, "reason") ?? field(asset, "archiveReason")), arabic),
        reference: text(field(archive, "reference")),
        value: money(numberValue(field(asset, "purchaseValue"))),
        notes: text(field(archive, "notes")),
      }, archivedAt);
    });

  const totalValue = activeAssets.reduce<number>(
    (sum, asset) => sum + numberValue(field(asset, "purchaseValue")),
    0,
  );

  return {
    type: "ASSETS",
    title: label("Rapport complet du patrimoine", "التقرير الكامل للممتلكات"),
    startDate: params.startDate,
    endDate: params.endDate,
    generatedAt: new Date().toISOString(),
    generatedBy: params.generatedBy,
    statistics: [
      metric("assets-total", "Biens actifs", "الممتلكات النشطة", activeAssets.length),
      metric("assets-value", "Valeur d'acquisition totale", "إجمالي قيمة الاقتناء", money(totalValue), "DH"),
      metric(
        "assets-available",
        "Disponibles",
        "المتاحة",
        activeAssets.filter((asset) => assetStatus(asset) === "AVAILABLE").length,
      ),
      metric(
        "assets-in-use",
        "En service",
        "قيد الاستعمال",
        activeAssets.filter((asset) => assetStatus(asset) === "IN_USE").length,
      ),
      metric(
        "assets-maintenance",
        "En maintenance",
        "قيد الصيانة",
        activeAssets.filter((asset) => assetStatus(asset) === "UNDER_MAINTENANCE").length,
      ),
      metric("assets-archives", "Sorties / archives sur la période", "الخروج / الأرشيف خلال الفترة", archiveRows.length),
    ],
    sections: [
      {
        id: "assets-current",
        title: label("État actuel du patrimoine", "الحالة الحالية للممتلكات"),
        description: label("Inventaire actif et informations principales.", "الجرد النشط والمعلومات الرئيسية."),
        periodFiltered: false,
        columns: [
          col("inventory", "N° inventaire", "رقم الجرد", 18),
          col("designation", "Désignation", "التسمية", 26),
          col("type", "Type", "النوع", 16),
          col("status", "Statut", "الحالة", 18),
          col("assignment", "Affectation", "التخصيص", 22),
          col("acquisitionDate", "Acquisition", "تاريخ الاقتناء", 16),
          col("value", "Valeur (DH)", "القيمة (درهم)", 16),
          col("details", "Détails spécifiques", "تفاصيل خاصة", 40),
          col("documents", "Documents", "الوثائق", 12),
        ],
        rows: currentRows,
      },
      {
        id: "assets-acquisitions",
        title: label("Acquisitions de la période", "اقتناءات الفترة"),
        periodFiltered: true,
        columns: [
          col("date", "Date", "التاريخ", 16),
          col("inventory", "N° inventaire", "رقم الجرد", 18),
          col("designation", "Désignation", "التسمية", 28),
          col("type", "Type", "النوع", 16),
          col("assignment", "Affectation", "التخصيص", 24),
          col("value", "Valeur (DH)", "القيمة (درهم)", 16),
        ],
        rows: acquisitionRows,
      },
      {
        id: "assets-rentals",
        title: label("Locations enregistrées sur la période", "عمليات الكراء المسجلة خلال الفترة"),
        periodFiltered: true,
        columns: [
          col("asset", "Bien", "الممتلك", 26),
          col("inventory", "N° inventaire", "رقم الجرد", 18),
          col("tenant", "Locataire", "المكتري", 24),
          col("startDate", "Début", "البداية", 16),
          col("endDate", "Fin", "النهاية", 16),
          col("monthlyAmount", "Mensualité (DH)", "المبلغ الشهري (درهم)", 18),
          col("reference", "Référence contrat", "مرجع العقد", 20),
          col("notes", "Observations", "ملاحظات", 32),
        ],
        rows: rentalRows,
      },
      {
        id: "assets-archives",
        title: label("Sorties / cessions / archives de la période", "الخروج / التفويت / الأرشيف خلال الفترة"),
        periodFiltered: true,
        columns: [
          col("date", "Date", "التاريخ", 16),
          col("inventory", "N° inventaire", "رقم الجرد", 18),
          col("designation", "Désignation", "التسمية", 28),
          col("type", "Type", "النوع", 16),
          col("reason", "Motif", "السبب", 22),
          col("reference", "Référence", "المرجع", 20),
          col("value", "Valeur d'origine (DH)", "القيمة الأصلية (درهم)", 18),
          col("notes", "Observations", "ملاحظات", 32),
        ],
        rows: archiveRows,
      },
    ],
  };
};

const buildStockReport = async (params: GenerateReportParams): Promise<ReportData> => {
  const arabic = params.language === "ar";
  const [articles, movements, requests] = (await Promise.all([
    stockService.getArticles(),
    stockService.getMovements(),
    stockService.getRequests(),
  ])) as unknown[][];

  const stockApi = stockService as unknown as { getRestockAlerts?: () => Promise<unknown[]> };
  const restockAlerts = stockApi.getRestockAlerts ? await stockApi.getRestockAlerts() : [];

  const articleRows = articles.map((article, index) => {
    const qty = numberValue(field(article, "quantity"));
    const unitHt = numberValue(field(article, "unitPriceHt"));
    const vat = numberValue(field(article, "vatRate"));
    const unitTtc = unitHt * (1 + vat / 100);
    return row(numberValue(field(article, "id"), index + 1), {
      reference: text(field(article, "reference")),
      barcode: text(field(article, "barcode")),
      brand: text(field(article, "brand")),
      designation: localizedText(article, "designation", "designationAr", arabic),
      category: localizedText(article, "category", "categoryAr", arabic),
      unit: unitLabel(text(field(article, "unit")), arabic),
      quantity: qty,
      minimum: numberValue(field(article, "minimumQuantity")),
      location: localizedText(article, "location", "locationAr", arabic),
      unitPriceHt: money(unitHt),
      vatRate: vat,
      unitPriceTtc: money(unitTtc),
      totalHt: money(qty * unitHt),
      totalTtc: money(qty * unitTtc),
      stockStatus: qty <= numberValue(field(article, "minimumQuantity"))
        ? (arabic ? "مخزون منخفض" : "Stock faible")
        : (arabic ? "عادي" : "Normal"),
      documents: docCount(article),
    });
  });

  const movementRows = movements
    .filter((movement) => inPeriod(field(movement, "date"), params.startDate, params.endDate))
    .map((movement, index) => {
      const qty = numberValue(field(movement, "quantity"));
      const unitHt = numberValue(field(movement, "unitPriceHt"));
      const vat = numberValue(field(movement, "vatRate"));
      return row(`mov-${numberValue(field(movement, "id"), index + 1)}`, {
        date: dateOnly(field(movement, "date")),
        type: statusLabel(text(field(movement, "type")), arabic),
        article: text(arabic ? field(movement, "articleDesignationAr") ?? field(movement, "articleDesignation") : field(movement, "articleDesignation")),
        referenceArticle: text(field(movement, "articleReference")),
        quantity: qty,
        unitPriceHt: money(unitHt),
        vatRate: vat,
        totalHt: money(qty * unitHt),
        totalTtc: money(qty * unitHt * (1 + vat / 100)),
        reason: text(field(movement, "reason")),
        supplierBeneficiary: text(field(movement, "supplierOrBeneficiary")),
        reference: text(field(movement, "reference")),
        performedBy: text(field(movement, "performedBy") ?? nested(movement, "createdBy", "name")),
        requestId: text(field(movement, "supplyRequestId")),
        documents: docCount(movement),
      }, dateOnly(field(movement, "date")));
    });

  const requestRows = requests
    .filter((request) => inPeriod(field(request, "requestDate") ?? field(request, "requestedAt"), params.startDate, params.endDate))
    .map((request, index) => {
      const requestDate = dateOnly(field(request, "requestDate") ?? field(request, "requestedAt"));
      return row(`req-${numberValue(field(request, "id"), index + 1)}`, {
        date: requestDate,
        article: text(arabic ? field(request, "articleDesignationAr") ?? field(request, "articleDesignation") : field(request, "articleDesignation")),
        quantity: numberValue(field(request, "requestedQuantity") ?? field(request, "quantity")),
        requester: text(field(request, "requester")),
        reason: text(field(request, "reason")),
        status: statusLabel(text(field(request, "status")), arabic),
        rejectionReason: text(field(request, "rejectionReason")),
        decisionDate: dateOnly(field(request, "decisionDate")) || "-",
        receivedAt: dateOnly(field(request, "receivedAt")) || "-",
        documents: docCount(request),
      }, requestDate);
    });

  const restockRows = restockAlerts
    .filter((alert) => inPeriod(field(alert, "createdAt"), params.startDate, params.endDate))
    .map((alert, index) => {
      const createdAt = dateOnly(field(alert, "createdAt"));
      return row(`restock-${numberValue(field(alert, "id"), index + 1)}`, {
        date: createdAt,
        article: text(arabic ? field(alert, "articleDesignationAr") ?? field(alert, "articleDesignation") : field(alert, "articleDesignation")),
        requested: numberValue(field(alert, "requestedQuantity")),
        availableAtRequest: numberValue(field(alert, "availableQuantityAtRequest")),
        requester: text(field(alert, "requester")),
        reason: text(field(alert, "reason")),
        status: statusLabel(text(field(alert, "status")), arabic),
        readyNotifiedAt: dateOnly(field(alert, "readyNotifiedAt")) || "-",
      }, createdAt);
    });

  const totalQty = articles.reduce<number>((sum, article) => sum + numberValue(field(article, "quantity")), 0);
  const totalTtc = articles.reduce<number>((sum, article) => {
    const qty = numberValue(field(article, "quantity"));
    const unitHt = numberValue(field(article, "unitPriceHt"));
    const vat = numberValue(field(article, "vatRate"));
    return sum + qty * unitHt * (1 + vat / 100);
  }, 0);
  const lowStock = articles.filter(
    (article) => numberValue(field(article, "quantity")) <= numberValue(field(article, "minimumQuantity")),
  ).length;
  const pending = requests.filter((request) => text(field(request, "status")) === "PENDING").length;

  return {
    type: "STOCK",
    title: label("Rapport complet du stock", "التقرير الكامل للمخزون"),
    startDate: params.startDate,
    endDate: params.endDate,
    generatedAt: new Date().toISOString(),
    generatedBy: params.generatedBy,
    statistics: [
      metric("stock-articles", "Articles", "المواد", articles.length),
      metric("stock-quantity", "Quantité totale", "الكمية الإجمالية", totalQty),
      metric("stock-value", "Valeur actuelle TTC", "القيمة الحالية شاملة الضريبة", money(totalTtc), "DH"),
      metric("stock-alerts", "Articles sous seuil", "مواد تحت الحد الأدنى", lowStock),
      metric("stock-movements", "Mouvements de la période", "حركات الفترة", movementRows.length),
      metric("stock-pending", "Demandes en attente", "طلبات قيد الانتظار", pending),
      metric("stock-restock", "Besoins de réapprovisionnement", "حاجيات إعادة التموين", restockRows.length),
    ],
    sections: [
      {
        id: "stock-state",
        title: label("État actuel du stock", "الحالة الحالية للمخزون"),
        description: label("Quantités, valorisation, seuils et localisation.", "الكميات والتقييم والحدود والموقع."),
        periodFiltered: false,
        columns: [
          col("reference", "Référence", "المرجع", 16),
          col("barcode", "Code-barres", "الباركود", 20),
          col("brand", "Marque", "العلامة", 18),
          col("designation", "Article", "المادة", 26),
          col("category", "Catégorie", "الفئة", 22),
          col("unit", "Unité", "الوحدة", 12),
          col("quantity", "Quantité", "الكمية", 12),
          col("minimum", "Seuil min.", "الحد الأدنى", 12),
          col("location", "Emplacement", "الموقع", 24),
          col("unitPriceHt", "PU HT (DH)", "ثمن الوحدة دون ضريبة", 14),
          col("vatRate", "TVA %", "الضريبة %", 12),
          col("unitPriceTtc", "PU TTC (DH)", "ثمن الوحدة شامل الضريبة", 15),
          col("totalHt", "Total HT (DH)", "المجموع دون ضريبة", 16),
          col("totalTtc", "Total TTC (DH)", "المجموع شامل الضريبة", 17),
          col("stockStatus", "Alerte", "التنبيه", 16),
          col("documents", "Documents", "الوثائق", 12),
        ],
        rows: articleRows,
      },
      {
        id: "stock-movements",
        title: label("Mouvements de stock de la période", "حركات المخزون خلال الفترة"),
        periodFiltered: true,
        columns: [
          col("date", "Date", "التاريخ", 14),
          col("type", "Type", "النوع", 12),
          col("article", "Article", "المادة", 24),
          col("referenceArticle", "Réf. article", "مرجع المادة", 16),
          col("quantity", "Quantité", "الكمية", 12),
          col("unitPriceHt", "PU HT", "ثمن الوحدة دون ضريبة", 14),
          col("vatRate", "TVA %", "الضريبة %", 12),
          col("totalHt", "Total HT", "المجموع دون ضريبة", 15),
          col("totalTtc", "Total TTC", "المجموع شامل الضريبة", 15),
          col("reason", "Motif", "السبب", 30),
          col("supplierBeneficiary", "Fournisseur / bénéficiaire", "المورد / المستفيد", 28),
          col("reference", "Pièce / Référence", "الوثيقة / المرجع", 20),
          col("performedBy", "Effectué par", "أنجزها", 22),
          col("requestId", "Demande liée", "الطلب المرتبط", 14),
          col("documents", "Documents", "الوثائق", 12),
        ],
        rows: movementRows,
      },
      {
        id: "stock-requests",
        title: label("Demandes de fourniture de la période", "طلبات التموين خلال الفترة"),
        periodFiltered: true,
        columns: [
          col("date", "Date", "التاريخ", 14),
          col("article", "Article", "المادة", 24),
          col("quantity", "Quantité demandée", "الكمية المطلوبة", 16),
          col("requester", "Demandeur", "الطالب", 22),
          col("reason", "Motif", "السبب", 30),
          col("status", "Statut", "الحالة", 18),
          col("rejectionReason", "Motif refus", "سبب الرفض", 28),
          col("decisionDate", "Décision", "تاريخ القرار", 14),
          col("receivedAt", "Réception", "تاريخ الاستلام", 14),
          col("documents", "Documents", "الوثائق", 12),
        ],
        rows: requestRows,
      },
      {
        id: "stock-restock",
        title: label("Besoins de réapprovisionnement", "حاجيات إعادة التموين"),
        periodFiltered: true,
        columns: [
          col("date", "Date", "التاريخ", 14),
          col("article", "Article", "المادة", 24),
          col("requested", "Quantité demandée", "الكمية المطلوبة", 16),
          col("availableAtRequest", "Disponible au moment du besoin", "المتاح عند الطلب", 18),
          col("requester", "Demandeur", "الطالب", 22),
          col("reason", "Motif", "السبب", 30),
          col("status", "Statut", "الحالة", 24),
          col("readyNotifiedAt", "Notification disponibilité", "إشعار التوفر", 18),
        ],
        rows: restockRows,
      },
    ],
  };
};

const buildLightingReport = async (params: GenerateReportParams): Promise<ReportData> => {
  const arabic = params.language === "ar";
  const [lights, failures, interventions] = (await Promise.all([
    lightingService.getLights(),
    lightingService.getFailures(),
    lightingService.getInterventions(),
  ])) as unknown[][];

  const failureById = new Map<number, unknown>();
  failures.forEach((failure) => failureById.set(numberValue(field(failure, "id")), failure));

  const lightRows = lights.map((light, index) =>
    row(numberValue(field(light, "id"), index + 1), {
      reference: text(field(light, "reference")),
      designation: localizedText(light, "designation", "designationAr", arabic),
      localisation: lightLocation(light, arabic),
      gps: `${numberValue(field(light, "latitude"))}, ${numberValue(field(light, "longitude"))}`,
      power: numberValue(field(light, "power")),
      status: statusLabel(text(field(light, "status")), arabic),
      installationDate: dateOnly(field(light, "installationDate")) || "-",
      documents: docCount(light),
    }),
  );

  const failureRows = failures
    .filter((failure) => inPeriod(field(failure, "reportedAt"), params.startDate, params.endDate))
    .map((failure, index) => {
      const reportedAt = dateOnly(field(failure, "reportedAt"));
      return row(`failure-${numberValue(field(failure, "id"), index + 1)}`, {
        date: reportedAt,
        reference: text(field(failure, "lightReference")),
        light: text(arabic ? field(failure, "lightDesignationAr") ?? field(failure, "lightDesignation") : field(failure, "lightDesignation")),
        description: text(field(failure, "description")),
        reportedBy: text(field(failure, "reportedBy")),
        status: statusLabel(text(field(failure, "status")), arabic),
        documents: docCount(failure),
      }, reportedAt);
    });

  const interventionRows = interventions
    .filter((intervention) =>
      inPeriod(field(intervention, "interventionDate"), params.startDate, params.endDate) ||
      inPeriod(field(intervention, "completedAt"), params.startDate, params.endDate),
    )
    .map((intervention, index) => {
      const failure = failureById.get(numberValue(field(intervention, "failureId")));
      const date = dateOnly(field(intervention, "interventionDate"));
      const photos = arrayValue(field(intervention, "photos"));
      return row(`intervention-${numberValue(field(intervention, "id"), index + 1)}`, {
        date,
        light: text(arabic ? field(failure, "lightDesignationAr") ?? field(failure, "lightDesignation") : field(failure, "lightDesignation")),
        reference: text(field(failure, "lightReference")),
        technician: interventionTechnician(intervention, arabic),
        technicianLocation: interventionLocation(intervention),
        description: text(field(intervention, "description")),
        status: boolValue(field(intervention, "completed"))
          ? (arabic ? "مكتمل" : "Terminée")
          : (arabic ? "مبرمج" : "Planifiée"),
        completedAt: dateOnly(field(intervention, "completedAt")) || "-",
        report: text(field(intervention, "report")),
        cost: money(numberValue(field(intervention, "cost"))),
        photos: photos.length,
        documents: docCount(intervention),
      }, date);
    });

  const totalCost = interventions.reduce<number>(
    (sum, intervention) => sum + numberValue(field(intervention, "cost")),
    0,
  );

  return {
    type: "LIGHTING",
    title: label("Rapport complet de l'éclairage public", "التقرير الكامل للإنارة العمومية"),
    startDate: params.startDate,
    endDate: params.endDate,
    generatedAt: new Date().toISOString(),
    generatedBy: params.generatedBy,
    statistics: [
      metric("lights-total", "Points lumineux", "نقاط الإنارة", lights.length),
      metric("lights-active", "Actifs", "النشطة", lights.filter((light) => text(field(light, "status")) === "ACTIVE").length),
      metric("lights-damaged", "Endommagés", "المعطلة", lights.filter((light) => text(field(light, "status")) === "DAMAGED").length),
      metric(
        "lights-maintenance",
        "En maintenance",
        "قيد الصيانة",
        lights.filter((light) => text(field(light, "status")) === "UNDER_MAINTENANCE").length,
      ),
      metric("lights-failures", "Pannes de la période", "أعطاب الفترة", failureRows.length),
      metric("lights-interventions", "Interventions de la période", "تدخلات الفترة", interventionRows.length),
      metric(
        "lights-completed",
        "Interventions terminées",
        "التدخلات المنجزة",
        interventions.filter((intervention) => boolValue(field(intervention, "completed"))).length,
      ),
      metric("lights-cost", "Coût cumulé des interventions", "التكلفة الإجمالية للتدخلات", money(totalCost), "DH"),
    ],
    sections: [
      {
        id: "lighting-state",
        title: label("État actuel des points lumineux", "الحالة الحالية لنقاط الإنارة"),
        periodFiltered: false,
        columns: [
          col("reference", "Référence", "المرجع", 16),
          col("designation", "Désignation", "التسمية", 26),
          col("localisation", "Localisation", "الموقع", 30),
          col("gps", "Coordonnées GPS", "إحداثيات GPS", 22),
          col("power", "Puissance (W)", "القدرة (واط)", 14),
          col("status", "Statut", "الحالة", 18),
          col("installationDate", "Date d'installation", "تاريخ التركيب", 18),
          col("documents", "Documents", "الوثائق", 12),
        ],
        rows: lightRows,
      },
      {
        id: "lighting-failures",
        title: label("Pannes signalées sur la période", "الأعطاب المبلغ عنها خلال الفترة"),
        periodFiltered: true,
        columns: [
          col("date", "Date", "التاريخ", 14),
          col("reference", "Référence", "المرجع", 16),
          col("light", "Point lumineux", "نقطة الإنارة", 24),
          col("description", "Description", "الوصف", 40),
          col("reportedBy", "Déclaré par", "المبلغ", 22),
          col("status", "Statut", "الحالة", 16),
          col("documents", "Documents", "الوثائق", 12),
        ],
        rows: failureRows,
      },
      {
        id: "lighting-interventions",
        title: label("Interventions sur la période", "التدخلات خلال الفترة"),
        periodFiltered: true,
        columns: [
          col("date", "Date prévue", "التاريخ المبرمج", 14),
          col("light", "Point lumineux", "نقطة الإنارة", 24),
          col("reference", "Référence", "المرجع", 16),
          col("technician", "Technicien", "التقني", 22),
          col("technicianLocation", "Localisation technicien", "موقع التقني", 24),
          col("description", "Travaux prévus", "الأشغال المبرمجة", 34),
          col("status", "Statut", "الحالة", 16),
          col("completedAt", "Fin", "تاريخ الانتهاء", 14),
          col("report", "Rapport de fin", "تقرير الإنجاز", 40),
          col("cost", "Coût (DH)", "التكلفة (درهم)", 14),
          col("photos", "Photos", "الصور", 10),
          col("documents", "Documents", "الوثائق", 12),
        ],
        rows: interventionRows,
      },
    ],
  };
};

const generateReport = async (params: GenerateReportParams): Promise<ReportData> => {
  if (!params.startDate || !params.endDate) throw new Error("DATES_REQUIRED");
  if (params.startDate > params.endDate) throw new Error("INVALID_PERIOD");

  switch (params.type) {
    case "USERS":
      return buildUsersReport(params);
    case "ASSETS":
      return buildAssetsReport(params);
    case "STOCK":
      return buildStockReport(params);
    case "LIGHTING":
      return buildLightingReport(params);
  }
};

const selectLabel = (value: ReportLabel, language = "fr") =>
  language.startsWith("ar") ? value.ar : value.fr;

const formatDate = (value: string, language = "fr") => {
  if (!value) return "-";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language.startsWith("ar") ? "ar-MA" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value: string, language = "fr") => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language.startsWith("ar") ? "ar-MA" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const exportPdf = async (report: ReportData, language = "fr"): Promise<void> => {
  const rtl = language.startsWith("ar");
  const container = document.createElement("div");
  container.dir = rtl ? "rtl" : "ltr";
  container.style.cssText = `position:fixed;left:-100000px;top:0;width:1500px;background:#fff;color:#0f172a;padding:36px;font-family:Arial,sans-serif;`;

  const metricsHtml = report.statistics
    .map(
      (item) => `<div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;min-width:180px;">
        <div style="font-size:12px;color:#64748b;">${escapeHtml(selectLabel(item.label, language))}</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px;">${escapeHtml(item.value)}${item.unit ? ` ${escapeHtml(item.unit)}` : ""}</div>
      </div>`,
    )
    .join("");

  const sectionsHtml = report.sections
    .map((section) => {
      const head = section.columns
        .map((column) => `<th style="border:1px solid #cbd5e1;background:#f1f5f9;padding:7px;font-size:10px;text-align:${rtl ? "right" : "left"};">${escapeHtml(selectLabel(column.label, language))}</th>`)
        .join("");
      const body = section.rows.length
        ? section.rows
            .map(
              (entry) => `<tr>${section.columns
                .map((column) => `<td style="border:1px solid #e2e8f0;padding:6px;font-size:9px;vertical-align:top;">${escapeHtml(entry.values[column.key] ?? "-")}</td>`)
                .join("")}</tr>`,
            )
            .join("")
        : `<tr><td colspan="${section.columns.length}" style="border:1px solid #e2e8f0;padding:12px;text-align:center;color:#64748b;">${rtl ? "لا توجد بيانات" : "Aucune donnée"}</td></tr>`;

      return `<section style="margin-top:24px;page-break-inside:avoid;">
        <h2 style="font-size:17px;margin:0 0 4px;">${escapeHtml(selectLabel(section.title, language))}</h2>
        ${section.description ? `<div style="font-size:11px;color:#64748b;margin-bottom:8px;">${escapeHtml(selectLabel(section.description, language))}</div>` : ""}
        <div style="font-size:10px;color:#64748b;margin-bottom:6px;">${section.rows.length} ${rtl ? "سطر" : "ligne(s)"}</div>
        <table style="width:100%;border-collapse:collapse;table-layout:auto;"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      </section>`;
    })
    .join("");

  container.innerHTML = `
    <header style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #ea580c;padding-bottom:16px;gap:24px;">
      <div style="display:flex;align-items:center;gap:16px;">
        <img src="${reportLogo}" style="width:74px;height:74px;object-fit:contain;" />
        <div>
          <div style="font-size:12px;color:#64748b;">SGPBSE — Système de gestion du patrimoine communal</div>
          <h1 style="font-size:25px;margin:4px 0;">${escapeHtml(selectLabel(report.title, language))}</h1>
          <div style="font-size:12px;color:#475569;">${rtl ? "الفترة" : "Période"}: ${escapeHtml(formatDate(report.startDate, language))} — ${escapeHtml(formatDate(report.endDate, language))}</div>
        </div>
      </div>
      <div style="font-size:11px;color:#64748b;text-align:${rtl ? "left" : "right"};">
        <div>${rtl ? "تم الإنشاء" : "Généré le"}: ${escapeHtml(formatDateTime(report.generatedAt, language))}</div>
        ${report.generatedBy ? `<div style="margin-top:4px;">${rtl ? "بواسطة" : "Par"}: ${escapeHtml(report.generatedBy)}</div>` : ""}
      </div>
    </header>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:18px;">${metricsHtml}</div>
    ${sectionsHtml}
  `;

  document.body.appendChild(container);
  try {
    const canvas = await html2canvas(container, {
      scale: 1.4,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    const pdf = new jsPDF("landscape", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const imageWidth = pageWidth - margin * 2;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;
    const printableHeight = pageHeight - margin * 2 - 7;
    const imageData = canvas.toDataURL("image/png");

    let position = margin;
    let remaining = imageHeight;
    pdf.addImage(imageData, "PNG", margin, position, imageWidth, imageHeight);
    remaining -= printableHeight;

    while (remaining > 0) {
      pdf.addPage();
      position -= printableHeight;
      pdf.addImage(imageData, "PNG", margin, position, imageWidth, imageHeight);
      remaining -= printableHeight;
    }

    const pages = pdf.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      pdf.setPage(page);
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(`SGPBSE — ${page}/${pages}`, pageWidth - margin, pageHeight - 4, { align: "right" });
    }

    pdf.save(`SGPBSE_${report.type}_${report.startDate}_${report.endDate}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
};

const safeSheetName = (value: string, index: number) => {
  const cleaned = value.replace(/[\\/*?:\[\]]/g, " ").trim();
  return (cleaned || `Section ${index + 1}`).slice(0, 31);
};

const exportExcel = async (report: ReportData, language = "fr"): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SGPBSE";
  workbook.created = new Date();

  const summary = workbook.addWorksheet(language.startsWith("ar") ? "ملخص" : "Synthèse");
  summary.addRow([selectLabel(report.title, language)]);
  summary.addRow([language.startsWith("ar") ? "الفترة" : "Période", report.startDate, report.endDate]);
  summary.addRow([language.startsWith("ar") ? "تاريخ الإنشاء" : "Généré le", formatDateTime(report.generatedAt, language)]);
  if (report.generatedBy) summary.addRow([language.startsWith("ar") ? "بواسطة" : "Par", report.generatedBy]);
  summary.addRow([]);
  summary.addRow([language.startsWith("ar") ? "المؤشر" : "Indicateur", language.startsWith("ar") ? "القيمة" : "Valeur"]);
  report.statistics.forEach((item) => {
    summary.addRow([selectLabel(item.label, language), `${item.value}${item.unit ? ` ${item.unit}` : ""}`]);
  });
  summary.getColumn(1).width = 38;
  summary.getColumn(2).width = 24;
  summary.getRow(1).font = { bold: true, size: 16 };
  summary.getRow(report.generatedBy ? 6 : 5).font = { bold: true };

  report.sections.forEach((section, index) => {
    const worksheet = workbook.addWorksheet(safeSheetName(selectLabel(section.title, language), index));
    worksheet.addRow(section.columns.map((column) => selectLabel(column.label, language)));
    section.rows.forEach((entry) => {
      worksheet.addRow(section.columns.map((column) => entry.values[column.key] ?? "-"));
    });
    worksheet.getRow(1).font = { bold: true };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    section.columns.forEach((column, columnIndex) => {
      worksheet.getColumn(columnIndex + 1).width = Math.max(12, Math.min(column.width ?? 20, 45));
    });
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: Math.max(1, section.columns.length) },
    };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `SGPBSE_${report.type}_${report.startDate}_${report.endDate}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const reportService = {
  async generate(params: GenerateReportParams): Promise<ReportData> {
    return generateReport(params);
  },

  async exportPdf(report: ReportData, language = "fr"): Promise<void> {
    await exportPdf(report, language);
  },

  async exportExcel(report: ReportData, language = "fr"): Promise<void> {
    await exportExcel(report, language);
  },
};