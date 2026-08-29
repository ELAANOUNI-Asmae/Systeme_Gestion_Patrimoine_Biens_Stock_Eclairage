import 'app_document.dart';

enum AssetType { vehicle, machine, realEstate }

enum AssetStatus {
  available,
  inUse,
  rented,
  underMaintenance,
  outOfService,
  damaged,
  disposed,
  sold,
  archived,
}

class RentalOperation {
  RentalOperation({
    required this.id,
    required this.tenantName,
    required this.startDate,
    required this.monthlyAmount,
    this.endDate,
    this.phone,
    this.notes,
  });

  final int id;
  final String tenantName;
  final DateTime startDate;
  final DateTime? endDate;
  final double monthlyAmount;
  final String? phone;
  final String? notes;
}

class SaleOperation {
  SaleOperation({
    required this.id,
    required this.buyerName,
    required this.saleDate,
    required this.salePrice,
    this.notes,
  });

  final int id;
  final String buyerName;
  final DateTime saleDate;
  final double salePrice;
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
    this.serialNumber,
    this.address,
    this.surface,
    this.archived = false,
    this.archiveReason,
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
  String? serialNumber;
  String? address;
  double? surface;
  bool archived;
  String? archiveReason;
  List<RentalOperation> rentals;
  SaleOperation? sale;
}
