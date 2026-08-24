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

let lights: Light[] = [
  ...initialMockLights,
];

let failures: Failure[] = [
  ...initialMockFailures,
];

let interventions: Intervention[] = [
  ...initialMockInterventions,
];

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

export const lightingService = {
  async getLights(): Promise<
    Light[]
  > {
    await delay();

    return lights.map(
      (light) => ({
        ...light,
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
        "Équipement d’éclairage introuvable.",
      );
    }

    return {
      ...light,
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
    };

    lights = [
      newLight,
      ...lights,
    ];

    return {
      ...newLight,
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
        "Équipement d’éclairage introuvable.",
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
        data.status,

      installationDate:
        data.installationDate,

      power:
        data.power,
    };

    lights[index] =
      updatedLight;

    return {
      ...updatedLight,
    };
  },

  async removeLight(
    id: number,
  ): Promise<void> {
    await delay();

    lights =
      lights.filter(
        (light) =>
          light.id !== id,
      );

    failures =
      failures.filter(
        (failure) =>
          failure.lightId !==
          id,
      );
  },

  async getFailures(): Promise<
    Failure[]
  > {
    await delay();

    return failures.map(
      (failure) => ({
        ...failure,
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
        }),
      );
  },

  async createFailure(
    data: {
      lightId: number;

      description: string;

      reportedBy: string;
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
        "Équipement d’éclairage introuvable.",
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
    };

    failures = [
      newFailure,
      ...failures,
    ];

    light.status =
      "DAMAGED";

    return {
      ...newFailure,
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
    };
  },

  async getInterventions(): Promise<
    Intervention[]
  > {
    await delay();

    return interventions.map(
      (intervention) => ({
        ...intervention,
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
        }),
      );
  },

  async createIntervention(
    data: {
      failureId: number;

      technician: string;

      interventionDate: string;

      description: string;
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
    };
  },
};