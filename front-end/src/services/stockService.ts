
import {
  initialMockArticles,
  initialMockMovements,
  initialMockRestockAlerts,
  initialMockSupplyRequests,
} from "../mock/stock";

import type {
  RestockAlert,
  StockArticle,
  StockArticleFormData,
  StockMovement,
  StockMovementType,
  SupplyRequest,
  SupplyRequestStatus,
} from "../types/stock";

import type { AppDocument } from "../types/document";

let articles: StockArticle[] = initialMockArticles.map(cloneArticle);
let movements: StockMovement[] = initialMockMovements.map(cloneMovement);
let requests: SupplyRequest[] = initialMockSupplyRequests.map(cloneRequest);
let restockAlerts: RestockAlert[] = initialMockRestockAlerts.map((item) => ({
  ...item,
}));

const delay = (milliseconds = 200) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

const normalizeReference = (value: string) =>
  value.trim().toUpperCase();

const normalizeBarcode = (value: string) =>
  value.trim();

function cloneDocuments(
  documents: AppDocument[],
): AppDocument[] {
  return documents.map(
    (document) => ({
      ...document,
    }),
  );
}

function cloneArticle(article: StockArticle): StockArticle {
  return {
    ...article,
    documents: cloneDocuments(article.documents),
  };
}

function cloneMovement(movement: StockMovement): StockMovement {
  return {
    ...movement,
    documents: cloneDocuments(movement.documents),
  };
}

function cloneRequest(request: SupplyRequest): SupplyRequest {
  return {
    ...request,
    documents: cloneDocuments(request.documents),
  };
}

function assertValidPrice(
  unitPriceHt: number,
  vatRate: number,
) {
  if (!Number.isFinite(unitPriceHt) || unitPriceHt <= 0) {
    throw new Error("Le prix unitaire HT doit être supérieur à zéro.");
  }

  if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
    throw new Error("Le taux de TVA doit être compris entre 0 et 100.");
  }
}

function reservedQuantity(
  articleId: number,
  exceptRequestId?: number,
) {
  return requests
    .filter(
      (request) =>
        request.articleId === articleId &&
        request.status === "APPROVED" &&
        request.id !== exceptRequestId,
    )
    .reduce(
      (total, request) =>
        total + request.requestedQuantity,
      0,
    );
}

function availableForApproval(
  article: StockArticle,
  exceptRequestId?: number,
) {
  return Math.max(
    0,
    article.quantity -
      reservedQuantity(article.id, exceptRequestId),
  );
}

function createMovementInternal(data: {
  articleId: number;
  type: StockMovementType;
  quantity: number;
  reason: string;
  supplierOrBeneficiary?: string;
  reference?: string;
  performedBy: string;
  date?: string;
  documents?: AppDocument[];
  unitPriceHt?: number;
  vatRate?: number;
  supplyRequestId?: number;
}) {
  if (!Number.isFinite(data.quantity) || data.quantity <= 0) {
    throw new Error("La quantité doit être supérieure à zéro.");
  }

  if (!data.reason.trim()) {
    throw new Error("Le motif est obligatoire.");
  }

  const article = articles.find((item) => item.id === data.articleId);

  if (!article) {
    throw new Error("Article introuvable.");
  }

  if (data.type === "EXIT" && data.quantity > article.quantity) {
    throw new Error(`Stock insuffisant. Quantité disponible : ${article.quantity}.`);
  }

  const movementUnitPriceHt =
    data.type === "ENTRY"
      ? data.unitPriceHt ?? article.unitPriceHt
      : article.unitPriceHt;

  const movementVatRate =
    data.type === "ENTRY"
      ? data.vatRate ?? article.vatRate
      : article.vatRate;

  assertValidPrice(
    movementUnitPriceHt,
    movementVatRate,
  );

  article.quantity =
    data.type === "ENTRY"
      ? article.quantity + data.quantity
      : article.quantity - data.quantity;

  if (data.type === "ENTRY") {
    article.unitPriceHt = movementUnitPriceHt;
    article.vatRate = movementVatRate;
  }

  article.updatedAt =
    data.date ?? new Date().toISOString().slice(0, 10);

  const movement: StockMovement = {
    id:
      Math.max(0, ...movements.map((item) => item.id)) + 1,
    articleId: article.id,
    articleDesignation: article.designation,
    articleDesignationAr: article.designationAr,
    type: data.type,
    quantity: data.quantity,
    reason: data.reason.trim(),
    supplierOrBeneficiary:
      data.supplierOrBeneficiary?.trim() || undefined,
    reference:
      data.reference?.trim() || undefined,
    performedBy: data.performedBy.trim(),
    date:
      data.date ?? new Date().toISOString().slice(0, 10),
    unitPriceHt: movementUnitPriceHt,
    vatRate: movementVatRate,
    documents: cloneDocuments(data.documents ?? []),
    supplyRequestId: data.supplyRequestId,
  };

  movements = [movement, ...movements];

  return cloneMovement(movement);
}

export const stockService = {
  async getArticles(): Promise<StockArticle[]> {
    await delay();
    return articles.map(cloneArticle);
  },

  async getArticleById(
    id: number,
  ): Promise<StockArticle> {
    await delay();

    const article = articles.find((item) => item.id === id);

    if (!article) {
      throw new Error("Article introuvable.");
    }

    return cloneArticle(article);
  },

  async createArticle(
    data: StockArticleFormData,
  ): Promise<StockArticle> {
    await delay();

    const reference = normalizeReference(data.reference);
    const barcode = normalizeBarcode(data.barcode);

    if (!barcode) {
      throw new Error("Le code-barres est obligatoire.");
    }

    assertValidPrice(data.unitPriceHt, data.vatRate);

    if (
      articles.some(
        (article) =>
          normalizeReference(article.reference) === reference,
      )
    ) {
      throw new Error("Cette référence existe déjà.");
    }

    if (
      articles.some(
        (article) =>
          normalizeBarcode(article.barcode) === barcode,
      )
    ) {
      throw new Error("Ce code-barres existe déjà.");
    }

    const article: StockArticle = {
      id:
        Math.max(0, ...articles.map((item) => item.id)) + 1,
      ...data,
      reference,
      barcode,
      brand: data.brand.trim(),
      designation: data.designation.trim(),
      designationAr: data.designationAr.trim(),
      category: data.category.trim(),
      categoryAr: data.categoryAr.trim(),
      location: data.location.trim(),
      locationAr: data.locationAr.trim(),
      documents: cloneDocuments(data.documents),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    articles = [article, ...articles];

    return cloneArticle(article);
  },

  async updateArticle(
    id: number,
    data: StockArticleFormData,
  ): Promise<StockArticle> {
    await delay();

    const index = articles.findIndex((article) => article.id === id);

    if (index === -1) {
      throw new Error("Article introuvable.");
    }

    const reference = normalizeReference(data.reference);
    const barcode = normalizeBarcode(data.barcode);

    if (!barcode) {
      throw new Error("Le code-barres est obligatoire.");
    }

    assertValidPrice(data.unitPriceHt, data.vatRate);

    if (
      articles.some(
        (article) =>
          article.id !== id &&
          normalizeReference(article.reference) === reference,
      )
    ) {
      throw new Error("Cette référence existe déjà.");
    }

    if (
      articles.some(
        (article) =>
          article.id !== id &&
          normalizeBarcode(article.barcode) === barcode,
      )
    ) {
      throw new Error("Ce code-barres existe déjà.");
    }

    const updated: StockArticle = {
      ...articles[index],
      ...data,
      id,
      reference,
      barcode,
      brand: data.brand.trim(),
      designation: data.designation.trim(),
      designationAr: data.designationAr.trim(),
      category: data.category.trim(),
      categoryAr: data.categoryAr.trim(),
      location: data.location.trim(),
      locationAr: data.locationAr.trim(),
      documents: cloneDocuments(data.documents),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    articles[index] = updated;

    return cloneArticle(updated);
  },

  async removeArticle(id: number): Promise<void> {
    await delay();

    if (!articles.some((article) => article.id === id)) {
      throw new Error("Article introuvable.");
    }

    articles = articles.filter((article) => article.id !== id);
  },

  async getMovements(): Promise<StockMovement[]> {
    await delay();
    return movements.map(cloneMovement);
  },

  async getMovementsByArticleId(
    articleId: number,
  ): Promise<StockMovement[]> {
    await delay();

    return movements
      .filter((movement) => movement.articleId === articleId)
      .map(cloneMovement);
  },

  async createMovement(
    data: {
      articleId: number;
      type: StockMovementType;
      quantity: number;
      reason: string;
      supplierOrBeneficiary?: string;
      reference?: string;
      performedBy: string;
      date?: string;
      documents?: AppDocument[];
      unitPriceHt?: number;
      vatRate?: number;
    },
  ): Promise<StockMovement> {
    await delay();
    return createMovementInternal(data);
  },

  async getRequests(): Promise<SupplyRequest[]> {
    await delay();
    return requests.map(cloneRequest);
  },

  async createRequest(data: {
    articleId: number;
    requestedQuantity: number;
    requesterId: number;
    requester: string;
    reason: string;
    documents?: AppDocument[];
  }): Promise<SupplyRequest> {
    await delay();

    const article = articles.find((item) => item.id === data.articleId);

    if (!article) {
      throw new Error("Article introuvable.");
    }

    if (
      !Number.isFinite(data.requestedQuantity) ||
      data.requestedQuantity <= 0
    ) {
      throw new Error("La quantité demandée doit être supérieure à zéro.");
    }

    if (data.requestedQuantity > article.quantity) {
      throw new Error(
        `Stock insuffisant. Quantité disponible : ${article.quantity}.`,
      );
    }

    if (!data.reason.trim()) {
      throw new Error("Le motif est obligatoire.");
    }

    const request: SupplyRequest = {
      id:
        Math.max(0, ...requests.map((item) => item.id)) + 1,
      articleId: article.id,
      articleDesignation: article.designation,
      articleDesignationAr: article.designationAr,
      requestedQuantity: data.requestedQuantity,
      requesterId: data.requesterId,
      requester: data.requester.trim(),
      reason: data.reason.trim(),
      requestDate: new Date().toISOString().slice(0, 10),
      status: "PENDING",
      documents: cloneDocuments(data.documents ?? []),
    };

    requests = [request, ...requests];

    return cloneRequest(request);
  },

  async updateRequestStatus(
    id: number,
    status: Extract<SupplyRequestStatus, "APPROVED" | "REJECTED">,
    rejectionReason?: string,
  ): Promise<SupplyRequest> {
    await delay();

    const request = requests.find((item) => item.id === id);

    if (!request) {
      throw new Error("Demande introuvable.");
    }

    if (request.status !== "PENDING") {
      throw new Error("Cette demande a déjà été traitée.");
    }

    if (status === "REJECTED") {
      if (!rejectionReason?.trim()) {
        throw new Error("Le motif du refus est obligatoire.");
      }

      request.status = "REJECTED";
      request.rejectionReason = rejectionReason.trim();
      request.decisionDate = new Date().toISOString().slice(0, 10);

      return cloneRequest(request);
    }

    const article = articles.find(
      (item) => item.id === request.articleId,
    );

    if (!article) {
      throw new Error("Article introuvable.");
    }

    const available = availableForApproval(article, request.id);

    if (request.requestedQuantity > available) {
      throw new Error(
        `Stock insuffisant pour accepter cette demande. Quantité disponible non réservée : ${available}.`,
      );
    }

    request.status = "APPROVED";
    request.decisionDate = new Date().toISOString().slice(0, 10);

    return cloneRequest(request);
  },

  async confirmRequestReceipt(
    id: number,
    requesterId: number,
    performedBy: string,
  ): Promise<SupplyRequest> {
    await delay();

    const request = requests.find((item) => item.id === id);

    if (!request) {
      throw new Error("Demande introuvable.");
    }

    if (request.requesterId !== requesterId) {
      throw new Error(
        "Seul le demandeur peut confirmer la réception.",
      );
    }

    if (request.status !== "APPROVED") {
      throw new Error("La demande doit être acceptée avant de confirmer la réception.");
    }

    const article = articles.find(
      (item) => item.id === request.articleId,
    );

    if (!article) {
      throw new Error("Article introuvable.");
    }

    if (request.requestedQuantity > article.quantity) {
      throw new Error(
        `Stock insuffisant. Quantité disponible : ${article.quantity}.`,
      );
    }

    createMovementInternal({
      articleId: article.id,
      type: "EXIT",
      quantity: request.requestedQuantity,
      reason: `Demande de fourniture #${request.id} reçue`,
      supplierOrBeneficiary: request.requester,
      reference: `REQ-${String(request.id).padStart(4, "0")}`,
      performedBy,
      date: new Date().toISOString().slice(0, 10),
      documents: [],
      supplyRequestId: request.id,
    });

    request.status = "RECEIVED";
    request.receivedAt = new Date().toISOString().slice(0, 10);

    return cloneRequest(request);
  },

  async getRestockAlerts(): Promise<RestockAlert[]> {
    await delay();
    return restockAlerts.map((item) => ({ ...item }));
  },

  async createRestockAlert(data: {
    articleId: number;
    requestedQuantity: number;
    requesterId: number;
    requester: string;
    reason: string;
  }): Promise<RestockAlert> {
    await delay();

    const article = articles.find((item) => item.id === data.articleId);

    if (!article) {
      throw new Error("Article introuvable.");
    }

    if (data.requestedQuantity <= article.quantity) {
      throw new Error("Le stock actuel suffit pour créer une demande normale.");
    }

    const alert: RestockAlert = {
      id:
        Math.max(0, ...restockAlerts.map((item) => item.id)) + 1,
      articleId: article.id,
      articleDesignation: article.designation,
      articleDesignationAr: article.designationAr,
      requestedQuantity: data.requestedQuantity,
      availableQuantityAtRequest: article.quantity,
      requesterId: data.requesterId,
      requester: data.requester.trim(),
      reason: data.reason.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      status: "WAITING",
    };

    restockAlerts = [alert, ...restockAlerts];

    return { ...alert };
  },

  async markRestockReady(
    id: number,
  ): Promise<RestockAlert> {
    await delay();

    const alert = restockAlerts.find((item) => item.id === id);

    if (!alert) {
      throw new Error("Alerte de réapprovisionnement introuvable.");
    }

    const article = articles.find(
      (item) => item.id === alert.articleId,
    );

    if (!article) {
      throw new Error("Article introuvable.");
    }

    if (article.quantity < alert.requestedQuantity) {
      throw new Error(
        `Quantité encore insuffisante. Stock actuel : ${article.quantity}.`,
      );
    }

    alert.status = "READY_NOTIFIED";
    alert.readyNotifiedAt = new Date().toISOString().slice(0, 10);

    return { ...alert };
  },
};
