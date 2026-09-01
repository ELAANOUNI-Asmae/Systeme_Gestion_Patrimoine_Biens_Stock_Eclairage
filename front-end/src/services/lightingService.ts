import {
  initialMockFailures,
  initialMockInterventions,
  initialMockLights,
  initialMockTechnicians,
} from "../mock/lighting";

import type { AppDocument } from "../types/document";
import type {
  Failure,
  FailureStatus,
  Intervention,
  InterventionCompletionData,
  InterventionPlanData,
  Light,
  LightFormData,
  Technician,
} from "../types/lighting";

const delay = (milliseconds = 150) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

const cloneDocuments = (documents: AppDocument[] = []) =>
  documents.map((document) => ({ ...document }));

const cloneLight = (light: Light): Light => ({
  ...light,
  documents: cloneDocuments(light.documents),
});

const cloneFailure = (failure: Failure): Failure => ({
  ...failure,
  documents: cloneDocuments(failure.documents),
});

const cloneIntervention = (intervention: Intervention): Intervention => ({
  ...intervention,
  photos: cloneDocuments(intervention.photos),
  documents: cloneDocuments(intervention.documents),
});

let lights: Light[] = initialMockLights.map(cloneLight);
let failures: Failure[] = initialMockFailures.map(cloneFailure);
let interventions: Intervention[] =
  initialMockInterventions.map(cloneIntervention);
const technicians: Technician[] =
  initialMockTechnicians.map((item) => ({ ...item }));

const getLightOrThrow = (id: number) => {
  const light = lights.find((item) => item.id === id);
  if (!light) throw new Error("Point lumineux introuvable.");
  return light;
};

const getFailureOrThrow = (id: number) => {
  const failure = failures.find((item) => item.id === id);
  if (!failure) throw new Error("Panne introuvable.");
  return failure;
};

const synchronizeLightStatus = (lightId: number) => {
  const light = lights.find((item) => item.id === lightId);
  if (!light) return;

  const unresolved = failures.filter(
    (failure) =>
      failure.lightId === lightId &&
      failure.status !== "RESOLVED",
  );

  if (unresolved.length === 0) {
    if (
      light.status === "DAMAGED" ||
      light.status === "UNDER_MAINTENANCE"
    ) {
      light.status = "ACTIVE";
    }
    return;
  }

  const hasActiveIntervention = unresolved.some((failure) =>
    interventions.some(
      (intervention) =>
        intervention.failureId === failure.id &&
        !intervention.completed,
    ),
  );

  light.status = hasActiveIntervention
    ? "UNDER_MAINTENANCE"
    : "DAMAGED";
};

export const lightingService = {
  async getLights(): Promise<Light[]> {
    await delay();
    return lights.map(cloneLight);
  },

  async getLightById(id: number): Promise<Light> {
    await delay();
    return cloneLight(getLightOrThrow(id));
  },

  async getTechnicians(): Promise<Technician[]> {
    await delay(80);
    return technicians
      .filter((item) => item.active)
      .map((item) => ({ ...item }));
  },

  async createLight(data: LightFormData): Promise<Light> {
    await delay();

    const reference = data.reference.trim().toUpperCase();

    if (
      lights.some(
        (light) =>
          light.reference.toUpperCase() === reference,
      )
    ) {
      throw new Error("Cette référence existe déjà.");
    }

    const light: Light = {
      id: Math.max(0, ...lights.map((item) => item.id)) + 1,
      reference,
      designation: data.designation.trim(),
      designationAr: data.designationAr.trim(),
      localisation: data.localisation.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      status: "ACTIVE",
      installationDate: data.installationDate,
      power: data.power,
      documents: cloneDocuments(data.documents),
    };

    lights = [light, ...lights];
    return cloneLight(light);
  },

  async updateLight(id: number, data: LightFormData): Promise<Light> {
    await delay();

    const index = lights.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Point lumineux introuvable.");

    const reference = data.reference.trim().toUpperCase();

    if (
      lights.some(
        (item) =>
          item.id !== id &&
          item.reference.toUpperCase() === reference,
      )
    ) {
      throw new Error("Cette référence existe déjà.");
    }

    lights[index] = {
      ...lights[index],
      reference,
      designation: data.designation.trim(),
      designationAr: data.designationAr.trim(),
      localisation: data.localisation.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status,
      installationDate: data.installationDate,
      power: data.power,
      documents: cloneDocuments(data.documents),
    };

    synchronizeLightStatus(id);
    return cloneLight(lights[index]);
  },

  async removeLight(id: number): Promise<void> {
    await delay();

    const failureIds = failures
      .filter((failure) => failure.lightId === id)
      .map((failure) => failure.id);

    interventions = interventions.filter(
      (intervention) =>
        !failureIds.includes(intervention.failureId),
    );
    failures = failures.filter(
      (failure) => failure.lightId !== id,
    );
    lights = lights.filter((light) => light.id !== id);
  },

  async getFailures(): Promise<Failure[]> {
    await delay();
    return failures.map(cloneFailure);
  },

  async getFailuresByLightId(lightId: number): Promise<Failure[]> {
    await delay();
    return failures
      .filter((failure) => failure.lightId === lightId)
      .map(cloneFailure);
  },

  async createFailure(data: {
    lightId: number;
    description: string;
    reportedBy: string;
    documents?: AppDocument[];
  }): Promise<Failure> {
    await delay();

    const light = getLightOrThrow(data.lightId);

    if (
      failures.some(
        (failure) =>
          failure.lightId === light.id &&
          failure.status !== "RESOLVED",
      )
    ) {
      throw new Error(
        "Une panne non résolue existe déjà pour ce point lumineux.",
      );
    }

    const failure: Failure = {
      id: Math.max(0, ...failures.map((item) => item.id)) + 1,
      lightId: light.id,
      lightReference: light.reference,
      lightDesignation: light.designation,
      lightDesignationAr: light.designationAr,
      description: data.description.trim(),
      reportedBy: data.reportedBy.trim() || "PUBLIC",
      reportedAt: new Date().toISOString().slice(0, 10),
      status: "REPORTED",
      documents: cloneDocuments(data.documents ?? []),
    };

    failures = [failure, ...failures];
    light.status = "DAMAGED";

    return cloneFailure(failure);
  },

  async updateFailureStatus(
    id: number,
    status: FailureStatus,
  ): Promise<Failure> {
    await delay();
    const failure = getFailureOrThrow(id);
    failure.status = status;
    synchronizeLightStatus(failure.lightId);
    return cloneFailure(failure);
  },

  async getInterventions(): Promise<Intervention[]> {
    await delay();
    return interventions.map(cloneIntervention);
  },

  async getInterventionsByFailureId(
    failureId: number,
  ): Promise<Intervention[]> {
    await delay();
    return interventions
      .filter((item) => item.failureId === failureId)
      .map(cloneIntervention);
  },

  async createIntervention(
    data: InterventionPlanData,
  ): Promise<Intervention> {
    await delay();

    const failure = getFailureOrThrow(data.failureId);

    if (failure.status === "RESOLVED") {
      throw new Error(
        "Impossible de planifier une intervention pour une panne résolue.",
      );
    }

    if (
      interventions.some(
        (item) =>
          item.failureId === failure.id &&
          !item.completed,
      )
    ) {
      throw new Error(
        "Une intervention active existe déjà pour cette panne.",
      );
    }

    const technician = technicians.find(
      (item) =>
        item.id === data.technicianId &&
        item.active,
    );

    if (!technician) {
      throw new Error("Technicien introuvable ou inactif.");
    }

    const intervention: Intervention = {
      id:
        Math.max(
          0,
          ...interventions.map((item) => item.id),
        ) + 1,
      failureId: failure.id,
      technicianId: technician.id,
      technicianName: technician.name,
      technicianNameAr: technician.nameAr,
      technicianLocalisation: technician.localisation,
      interventionDate: data.interventionDate,
      description: data.description.trim(),
      completed: false,
      photos: [],
      documents: cloneDocuments(data.documents ?? []),
    };

    interventions = [intervention, ...interventions];
    failure.status = "IN_PROGRESS";
    getLightOrThrow(failure.lightId).status =
      "UNDER_MAINTENANCE";

    return cloneIntervention(intervention);
  },

  async completeIntervention(
    id: number,
    data: InterventionCompletionData,
  ): Promise<Intervention> {
    await delay();

    const intervention =
      interventions.find((item) => item.id === id);

    if (!intervention) {
      throw new Error("Intervention introuvable.");
    }
    if (intervention.completed) {
      throw new Error("Cette intervention est déjà terminée.");
    }
    if (!data.report.trim()) {
      throw new Error(
        "Le rapport d’intervention est obligatoire.",
      );
    }
    if (!Number.isFinite(data.cost) || data.cost < 0) {
      throw new Error(
        "Le coût doit être supérieur ou égal à 0.",
      );
    }
    if (data.photos.length < 1) {
      throw new Error(
        "Ajoutez au moins une photo de l’intervention.",
      );
    }

    intervention.completed = true;
    intervention.completedAt =
      data.completedAt ||
      new Date().toISOString().slice(0, 10);
    intervention.report = data.report.trim();
    intervention.cost = data.cost;
    intervention.photos = cloneDocuments(data.photos);
    intervention.documents = [
      ...intervention.documents,
      ...cloneDocuments(data.documents ?? []),
    ];

    const failure =
      getFailureOrThrow(intervention.failureId);
    failure.status = "RESOLVED";
    getLightOrThrow(failure.lightId).status = "ACTIVE";

    return cloneIntervention(intervention);
  },
};
