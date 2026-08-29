import type {
  AppDocument,
} from "./document";

export type LightStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "DAMAGED"
  | "UNDER_MAINTENANCE";

export type FailureStatus =
  | "REPORTED"
  | "IN_PROGRESS"
  | "RESOLVED";

export interface Light {
  id: number;
  reference: string;

  designation: string;
  designationAr: string;

  zone: string;
  zoneAr: string;

  address: string;
  addressAr: string;

  latitude: number;
  longitude: number;

  status: LightStatus;
  installationDate: string;
  power: number;

  documents: AppDocument[];
}

export interface LightFormData {
  reference: string;

  designation: string;
  designationAr: string;

  zone: string;
  zoneAr: string;

  address: string;
  addressAr: string;

  latitude: number;
  longitude: number;

  status: LightStatus;
  installationDate: string;
  power: number;

  documents: AppDocument[];
}

export interface Failure {
  id: number;

  lightId: number;
  lightReference: string;

  lightDesignation: string;
  lightDesignationAr: string;

  description: string;

  reportedBy: string;
  reportedAt: string;

  status: FailureStatus;

  documents: AppDocument[];
}

export interface Intervention {
  id: number;

  failureId: number;

  technician: string;
  interventionDate: string;
  description: string;

  completed: boolean;

  documents: AppDocument[];
}
