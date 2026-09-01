
import type { AppDocument } from "./document";

export type AssetType =
  | "VEHICLE"
  | "MACHINE"
  | "REAL_ESTATE";

export type AssetStatus =
  | "AVAILABLE"
  | "IN_USE"
  | "RENTED"
  | "UNDER_MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "DAMAGED"
  | "DISPOSED";

export type PartyType =
  | "PERSON"
  | "COMPANY";

export type RealEstateDomain =
  | "PUBLIC"
  | "PRIVATE";

export interface RentalOperation {
  id: number;
  bienId: number;
  partyType: PartyType;
  tenantName: string;
  cin?: string;
  ice?: string;
  phone?: string;
  address?: string;
  startDate: string;
  endDate?: string;
  monthlyAmount: number;
  contractReference?: string;
  contractFileName?: string;
  notes?: string;
  createdAt: string;
}

export interface SaleOperation {
  id: number;
  bienId: number;
  partyType: PartyType;
  buyerName: string;
  cin?: string;
  ice?: string;
  phone?: string;
  address?: string;
  saleDate: string;
  salePrice: number;
  contractReference?: string;
  contractFileName?: string;
  receiptFileName?: string;
  notes?: string;
  createdAt: string;
}

export type ArchiveReason =
  | "DISPOSED";

export interface ArchiveInfo {
  archived: boolean;
  archivedAt?: string;
  reason?: ArchiveReason;
  reference?: string;
  documentFileName?: string;
  notes?: string;
}

export interface VehicleDetails {
  registrationNumber?: string;
  brand?: string;
  model?: string;
  year?: number;
  chassisNumber?: string;
  fiscalHorsepower?: number;
  firstRegistrationDate?: string;
}

export interface MachineDetails {
  brand?: string;
  model?: string;
  serialNumber?: string;
  technicalReference?: string;
  powerKw?: number;
}

export interface RealEstateDetails {
  address?: string;
  surface?: number;
  landTitleNumber?: string;
  propertyType?: string;
  cadastralReference?: string;
  domain?: RealEstateDomain;
}

export interface Bien {
  id: number;
  type: AssetType;
  designation: string;
  designationAr: string;
  assetStatus: AssetStatus;
  acquisitionDate: string;
  purchaseValue: number;
  assignment: string;
  assignmentAr: string;
  inventoryId: string;
  documents: AppDocument[];
  vehicleDetails?: VehicleDetails;
  machineDetails?: MachineDetails;
  realEstateDetails?: RealEstateDetails;
  rentalHistory: RentalOperation[];
  sale?: SaleOperation;
  archive: ArchiveInfo;
}

export interface BienFormData {
  type: AssetType;
  designation: string;
  designationAr: string;
  assetStatus: AssetStatus;
  acquisitionDate: string;
  purchaseValue: number;
  assignment: string;
  assignmentAr: string;
  inventoryId: string;
  documents: AppDocument[];
  vehicleDetails?: VehicleDetails;
  machineDetails?: MachineDetails;
  realEstateDetails?: RealEstateDetails;
}

export interface BienFilters {
  search: string;
  status: AssetStatus | "";
  type: AssetType | "";
}
