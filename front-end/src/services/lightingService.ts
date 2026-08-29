import {
  initialMockFailures,
  initialMockInterventions,
  initialMockLights,
} from "../mock/lighting";

import type {
  Failure,
  FailureStatus,
  Intervention,
  Light,
  LightFormData,
} from "../types/lighting";

import type {
  AppDocument,
} from "../types/document";

let lights: Light[] =
  initialMockLights.map(
    (light) => ({
      ...light,
      documents: light.documents.map(
        (document) => ({
          ...document,
        }),
      ),
    }),
  );

let failures: Failure[] =
  initialMockFailures.map(
    (failure) => ({
      ...failure,
      documents: failure.documents.map(
        (document) => ({
          ...document,
        }),
      ),
    }),
  );

let interventions: Intervention[] =
  initialMockInterventions.map(
    (intervention) => ({
      ...intervention,
      documents:
        intervention.documents.map(
          (document) => ({
            ...document,
          }),
        ),
    }),
  );

const delay = (
  milliseconds = 200,
) =>
  new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      );
    },
  );

const cloneDocuments = (
  documents: AppDocument[],
) =>
  documents.map(
    (document) => ({
      ...document,
    }),
  );

export const lightingService = {
  async getLights(): Promise<
    Light[]
  > {
    await delay();

    return lights.map(
      (light) => ({
        ...light,
        documents:
          cloneDocuments(
            light.documents,
          ),
      }),
    );
  },

  async getLightById(
    id: number,
  ): Promise<Light> {
    await delay();

    const light =
      lights.find(
        (item) =>
          item.id === id,
      );

    if (!light) {
      throw new Error(
        "Point lumineux introuvable.",
      );
    }

    return {
      ...light,
      documents:
        cloneDocuments(
          light.documents,
        ),
    };
  },

  async createLight(
    data: LightFormData,
  ): Promise<Light> {
    await delay();

    const exists =
      lights.some(
        (light) =>
          light.reference
            .toLowerCase() ===
          data.reference
            .trim()
            .toLowerCase(),
      );

    if (exists) {
      throw new Error(
        "Cette référence existe déjà.",
      );
    }

    const newLight: Light = {
      id:
        Math.max(
          0,
          ...lights.map(
            (light) =>
              light.id,
          ),
        ) + 1,

      reference:
        data.reference
          .trim()
          .toUpperCase(),

      designation:
        data.designation.trim(),

      designationAr:
        data.designationAr.trim(),

      zone:
        data.zone.trim(),

      zoneAr:
        data.zoneAr.trim(),

      address:
        data.address.trim(),

      addressAr:
        data.addressAr.trim(),

      latitude:
        data.latitude,

      longitude:
        data.longitude,

      status:
        data.status,

      installationDate:
        data.installationDate,

      power:
        data.power,

      documents:
        cloneDocuments(
          data.documents ?? [],
        ),
    };

    lights = [
      newLight,
      ...lights,
    ];

    return {
      ...newLight,
      documents:
        cloneDocuments(
          newLight.documents,
        ),
    };
  },

  async updateLight(
    id: number,
    data: LightFormData,
  ): Promise<Light> {
    await delay();

    const index =
      lights.findIndex(
        (light) =>
          light.id === id,
      );

    if (index === -1) {
      throw new Error(
        "Point lumineux introuvable.",
      );
    }

    const referenceExists =
      lights.some(
        (light) =>
          light.id !== id &&
          light.reference
            .toLowerCase() ===
            data.reference
              .trim()
              .toLowerCase(),
      );

    if (referenceExists) {
      throw new Error(
        "Cette référence existe déjà.",
      );
    }

    const activeFailure =
      failures.find(
        (failure) =>
          failure.lightId === id &&
          failure.status !==
            "RESOLVED",
      );

    const synchronizedStatus =
      activeFailure
        ? activeFailure.status ===
          "IN_PROGRESS"
          ? "UNDER_MAINTENANCE"
          : "DAMAGED"
        : data.status;

    const updatedLight: Light = {
      id,

      reference:
        data.reference
          .trim()
          .toUpperCase(),

      designation:
        data.designation.trim(),

      designationAr:
        data.designationAr.trim(),

      zone:
        data.zone.trim(),

      zoneAr:
        data.zoneAr.trim(),

      address:
        data.address.trim(),

      addressAr:
        data.addressAr.trim(),

      latitude:
        data.latitude,

      longitude:
        data.longitude,

      status:
        synchronizedStatus,

      installationDate:
        data.installationDate,

      power:
        data.power,

      documents:
        cloneDocuments(
          data.documents ?? [],
        ),
    };

    lights[index] =
      updatedLight;

    return {
      ...updatedLight,
      documents:
        cloneDocuments(
          updatedLight.documents,
        ),
    };
  },

  async removeLight(
    id: number,
  ): Promise<void> {
    await delay();

    const relatedFailureIds =
      failures
        .filter(
          (failure) =>
            failure.lightId ===
            id,
        )
        .map(
          (failure) =>
            failure.id,
        );

    interventions =
      interventions.filter(
        (intervention) =>
          !relatedFailureIds.includes(
            intervention.failureId,
          ),
      );

    failures =
      failures.filter(
        (failure) =>
          failure.lightId !==
          id,
      );

    lights =
      lights.filter(
        (light) =>
          light.id !== id,
      );
  },

  async getFailures(): Promise<
    Failure[]
  > {
    await delay();

    return failures.map(
      (failure) => ({
        ...failure,
        documents:
          cloneDocuments(
            failure.documents,
          ),
      }),
    );
  },

  async getFailuresByLightId(
    lightId: number,
  ): Promise<Failure[]> {
    await delay();

    return failures
      .filter(
        (failure) =>
          failure.lightId ===
          lightId,
      )
      .map(
        (failure) => ({
          ...failure,
          documents:
            cloneDocuments(
              failure.documents,
            ),
        }),
      );
  },

  async createFailure(
    data: {
      lightId: number;
      description: string;
      reportedBy: string;
      documents?: AppDocument[];
    },
  ): Promise<Failure> {
    await delay();

    const light =
      lights.find(
        (item) =>
          item.id ===
          data.lightId,
      );

    if (!light) {
      throw new Error(
        "Point lumineux introuvable.",
      );
    }

    const activeFailure =
      failures.find(
        (failure) =>
          failure.lightId ===
            light.id &&
          failure.status !==
            "RESOLVED",
      );

    if (activeFailure) {
      throw new Error(
        "Une panne non résolue existe déjà pour ce point lumineux.",
      );
    }

    const newFailure: Failure = {
      id:
        Math.max(
          0,
          ...failures.map(
            (failure) =>
              failure.id,
          ),
        ) + 1,

      lightId:
        light.id,

      lightReference:
        light.reference,

      lightDesignation:
        light.designation,

      lightDesignationAr:
        light.designationAr,

      description:
        data.description.trim(),

      reportedBy:
        data.reportedBy.trim(),

      reportedAt:
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          ),

      status:
        "REPORTED",

      documents:
        cloneDocuments(
          data.documents ?? [],
        ),
    };

    failures = [
      newFailure,
      ...failures,
    ];

    light.status =
      "DAMAGED";

    return {
      ...newFailure,
      documents:
        cloneDocuments(
          newFailure.documents,
        ),
    };
  },

  async updateFailureStatus(
    id: number,
    status: FailureStatus,
  ): Promise<Failure> {
    await delay();

    const failure =
      failures.find(
        (item) =>
          item.id === id,
      );

    if (!failure) {
      throw new Error(
        "Panne introuvable.",
      );
    }

    failure.status =
      status;

    const light =
      lights.find(
        (item) =>
          item.id ===
          failure.lightId,
      );

    if (light) {
      if (
        status === "REPORTED"
      ) {
        light.status =
          "DAMAGED";
      }

      if (
        status ===
        "IN_PROGRESS"
      ) {
        light.status =
          "UNDER_MAINTENANCE";
      }

      if (
        status ===
        "RESOLVED"
      ) {
        light.status =
          "ACTIVE";
      }
    }

    return {
      ...failure,
      documents:
        cloneDocuments(
          failure.documents,
        ),
    };
  },

  async getInterventions(): Promise<
    Intervention[]
  > {
    await delay();

    return interventions.map(
      (intervention) => ({
        ...intervention,
        documents:
          cloneDocuments(
            intervention.documents,
          ),
      }),
    );
  },

  async getInterventionsByFailureId(
    failureId: number,
  ): Promise<Intervention[]> {
    await delay();

    return interventions
      .filter(
        (intervention) =>
          intervention.failureId ===
          failureId,
      )
      .map(
        (intervention) => ({
          ...intervention,
          documents:
            cloneDocuments(
              intervention.documents,
            ),
        }),
      );
  },

  async createIntervention(
    data: {
      failureId: number;
      technician: string;
      interventionDate: string;
      description: string;
      documents?: AppDocument[];
    },
  ): Promise<Intervention> {
    await delay();

    const failure =
      failures.find(
        (item) =>
          item.id ===
          data.failureId,
      );

    if (!failure) {
      throw new Error(
        "Panne introuvable.",
      );
    }

    if (
      failure.status ===
      "RESOLVED"
    ) {
      throw new Error(
        "Impossible d’ajouter une intervention à une panne déjà résolue.",
      );
    }

    const activeIntervention =
      interventions.find(
        (intervention) =>
          intervention.failureId ===
            failure.id &&
          !intervention.completed,
      );

    if (activeIntervention) {
      throw new Error(
        "Une intervention est déjà en cours pour cette panne.",
      );
    }

    const intervention: Intervention = {
      id:
        Math.max(
          0,
          ...interventions.map(
            (item) =>
              item.id,
          ),
        ) + 1,

      failureId:
        failure.id,

      technician:
        data.technician.trim(),

      interventionDate:
        data.interventionDate,

      description:
        data.description.trim(),

      completed:
        false,

      documents:
        cloneDocuments(
          data.documents ?? [],
        ),
    };

    interventions = [
      intervention,
      ...interventions,
    ];

    failure.status =
      "IN_PROGRESS";

    const light =
      lights.find(
        (item) =>
          item.id ===
          failure.lightId,
      );

    if (light) {
      light.status =
        "UNDER_MAINTENANCE";
    }

    return {
      ...intervention,
      documents:
        cloneDocuments(
          intervention.documents,
        ),
    };
  },

  async completeIntervention(
    id: number,
  ): Promise<Intervention> {
    await delay();

    const intervention =
      interventions.find(
        (item) =>
          item.id === id,
      );

    if (!intervention) {
      throw new Error(
        "Intervention introuvable.",
      );
    }

    intervention.completed =
      true;

    const failure =
      failures.find(
        (item) =>
          item.id ===
          intervention.failureId,
      );

    if (failure) {
      failure.status =
        "RESOLVED";

      const light =
        lights.find(
          (item) =>
            item.id ===
            failure.lightId,
        );

      if (light) {
        light.status =
          "ACTIVE";
      }
    }

    return {
      ...intervention,
      documents:
        cloneDocuments(
          intervention.documents,
        ),
    };
  },
};
