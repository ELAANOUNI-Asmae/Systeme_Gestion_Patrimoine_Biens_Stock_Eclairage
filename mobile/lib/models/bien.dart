
import 'app_document.dart';

enum AssetType {
  vehicle,
  machine,
  realEstate,
}

enum AssetStatus {
  available,
  inUse,
  rented,
  underMaintenance,
  outOfService,
  damaged,
  disposed,
}

enum PartyType {
  person,
  company,
}

enum RealEstateDomain {
  public,
  private,
}

class RentalOperation {
  RentalOperation({
    required this.id,
    required this.partyType,
    required this.tenantName,
    required this.startDate,
    required this.monthlyAmount,
    this.cin,
    this.ice,
    this.phone,
    this.address,
    this.endDate,
    this.contractReference,
    this.contractFileName,
    this.notes,
  });

  final int id;
  final PartyType partyType;
  final String tenantName;
  final String? cin;
  final String? ice;
  final String? phone;
  final String? address;
  final DateTime startDate;
  final DateTime? endDate;
  final double monthlyAmount;
  final String? contractReference;
  final String? contractFileName;
  final String? notes;
}

class SaleOperation {
  SaleOperation({
    required this.id,
    required this.partyType,
    required this.buyerName,
    required this.saleDate,
    required this.salePrice,
    this.cin,
    this.ice,
    this.phone,
    this.address,
    this.contractReference,
    this.contractFileName,
    this.receiptFileName,
    this.notes,
  });

  final int id;
  final PartyType partyType;
  final String buyerName;
  final String? cin;
  final String? ice;
  final String? phone;
  final String? address;
  final DateTime saleDate;
  final double salePrice;
  final String? contractReference;
  final String? contractFileName;
  final String? receiptFileName;
  final String? notes;
}

class Bien {
  Bien({
    required this.id,
    required this.type,
    required this.designation,
    required this.designationAr,
    required this.status,
    required this.acquisitionDate,
    required this.purchaseValue,
    required this.assignment,
    required this.assignmentAr,
    required this.inventoryId,
    required this.documents,
    this.registrationNumber,
    this.brand,
    this.model,
    this.year,
    this.chassisNumber,
    this.fiscalHorsepower,
    this.firstRegistrationDate,
    this.serialNumber,
    this.technicalReference,
    this.machinePowerKw,
    this.address,
    this.surface,
    this.landTitleNumber,
    this.propertyType,
    this.cadastralReference,
    this.domain,
    this.archived = false,
    this.archivedAt,
    this.archiveReason,
    this.archiveReference,
    this.archiveDocumentFileName,
    this.archiveNotes,
    List<RentalOperation>? rentals,
    this.sale,
  }) : rentals = rentals ?? <RentalOperation>[];

  final int id;

  AssetType type;
  String designation;
  String designationAr;
  AssetStatus status;
  DateTime acquisitionDate;
  double purchaseValue;

  String assignment;
  String assignmentAr;

  String inventoryId;
  List<AppDocument> documents;

  String? registrationNumber;
  String? brand;
  String? model;
  int? year;
  String? chassisNumber;
  double? fiscalHorsepower;
  DateTime? firstRegistrationDate;

  String? serialNumber;
  String? technicalReference;
  double? machinePowerKw;

  String? address;
  double? surface;
  String? landTitleNumber;
  String? propertyType;
  String? cadastralReference;
  RealEstateDomain? domain;

  bool archived;
  DateTime? archivedAt;
  String? archiveReason;
  String? archiveReference;
  String? archiveDocumentFileName;
  String? archiveNotes;

  List<RentalOperation> rentals;
  SaleOperation? sale;
}
