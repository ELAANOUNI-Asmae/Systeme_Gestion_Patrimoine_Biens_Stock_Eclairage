
import 'app_document.dart';

enum StockUnit {
  unite,
  boite,
  paquet,
  litre,
  kilogramme,
  metre,
}

enum MovementType {
  entry,
  exit,
}

enum SupplyRequestStatus {
  pending,
  approved,
  rejected,
  received,
}

enum RestockAlertStatus {
  waiting,
  readyNotified,
}

class StockArticle {
  StockArticle({
    required this.id,
    required this.reference,
    required this.barcode,
    required this.brand,
    required this.designation,
    required this.designationAr,
    required this.category,
    required this.categoryAr,
    required this.quantity,
    required this.minimumQuantity,
    required this.unit,
    required this.location,
    required this.locationAr,
    required this.unitPriceHt,
    required this.vatRate,
    required this.updatedAt,
    required this.documents,
  });

  final int id;

  String reference;
  String barcode;
  String brand;

  String designation;
  String designationAr;

  String category;
  String categoryAr;

  int quantity;
  int minimumQuantity;

  StockUnit unit;

  String location;
  String locationAr;

  double unitPriceHt;
  double vatRate;

  DateTime updatedAt;

  List<AppDocument> documents;

  bool get isLowStock =>
      quantity <= minimumQuantity;

  double get unitPriceTtc =>
      unitPriceHt *
      (1 + vatRate / 100);

  double get totalHt =>
      quantity * unitPriceHt;

  double get totalTtc =>
      quantity * unitPriceTtc;
}

class StockMovement {
  StockMovement({
    required this.id,
    required this.articleId,
    required this.articleDesignation,
    required this.articleDesignationAr,
    required this.type,
    required this.quantity,
    required this.reason,
    required this.performedBy,
    required this.date,
    required this.unitPriceHt,
    required this.vatRate,
    required this.documents,
    this.supplierOrBeneficiary,
    this.reference,
    this.supplyRequestId,
  });

  final int id;
  final int articleId;

  final String articleDesignation;
  final String articleDesignationAr;

  final MovementType type;
  final int quantity;

  final String reason;
  final String performedBy;

  final DateTime date;

  final double unitPriceHt;
  final double vatRate;

  final List<AppDocument> documents;

  final String? supplierOrBeneficiary;
  final String? reference;
  final int? supplyRequestId;

  double get unitPriceTtc =>
      unitPriceHt *
      (1 + vatRate / 100);

  double get totalHt =>
      quantity * unitPriceHt;

  double get totalTtc =>
      quantity * unitPriceTtc;
}

class SupplyRequest {
  SupplyRequest({
    required this.id,
    required this.articleId,
    required this.articleDesignation,
    required this.articleDesignationAr,
    required this.requestedQuantity,
    required this.requesterId,
    required this.requester,
    required this.reason,
    required this.requestDate,
    required this.status,
    required this.documents,
    this.rejectionReason,
    this.decisionDate,
    this.receivedAt,
  });

  final int id;

  final int articleId;
  final String articleDesignation;
  final String articleDesignationAr;

  final int requestedQuantity;

  final int requesterId;
  final String requester;

  final String reason;
  final DateTime requestDate;

  SupplyRequestStatus status;

  String? rejectionReason;
  DateTime? decisionDate;
  DateTime? receivedAt;

  final List<AppDocument> documents;
}

class RestockAlert {
  RestockAlert({
    required this.id,
    required this.articleId,
    required this.articleDesignation,
    required this.articleDesignationAr,
    required this.requestedQuantity,
    required this.availableQuantityAtRequest,
    required this.requesterId,
    required this.requester,
    required this.reason,
    required this.createdAt,
    required this.status,
    this.readyNotifiedAt,
  });

  final int id;

  final int articleId;
  final String articleDesignation;
  final String articleDesignationAr;

  final int requestedQuantity;
  final int availableQuantityAtRequest;

  final int requesterId;
  final String requester;

  final String reason;
  final DateTime createdAt;

  RestockAlertStatus status;
  DateTime? readyNotifiedAt;
}
