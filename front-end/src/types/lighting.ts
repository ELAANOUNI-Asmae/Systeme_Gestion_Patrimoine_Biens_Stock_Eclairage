import type { AppDocument } from "./document";

export type LightStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "DAMAGED"
  | "UNDER_MAINTENANCE";

export type FailureStatus =
  | "REPORTED"
  | "IN_PROGRESS"
  | "RESOLVED";

export interface Technician {
  id: number;
  name: string;
  nameAr: string;
  phone: string;
  localisation: string;
  latitude: number;
  longitude: number;
  active: boolean;
}

export interface Light {
  id: number;
  reference: string;
  designation: string;
  designationAr: string;
  localisation: string;
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
  localisation: string;
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
  technicianId: number;
  technicianName: string;
  technicianNameAr: string;
  technicianLocalisation: string;
  interventionDate: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  report?: string;
  cost?: number;
  photos: AppDocument[];
  documents: AppDocument[];
}

export interface InterventionPlanData {
  failureId: number;
  technicianId: number;
  interventionDate: string;
  description: string;
  documents?: AppDocument[];
}

export interface InterventionCompletionData {
  report: string;
  cost: number;
  completedAt: string;
  photos: AppDocument[];
  documents?: AppDocument[];
}
