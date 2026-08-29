import 'app_document.dart';

enum StockUnit { unite, boite, paquet, litre, kilogramme, metre }
enum MovementType { entry, exit }
enum SupplyRequestStatus { pending, approved, rejected }

class StockArticle {
  StockArticle({
    required this.id,
    required this.reference,
    required this.serialNumber,
    required this.barcode,
    required this.designation,
    required this.designationAr,
    required this.category,
    required this.categoryAr,
    required this.quantity,
    required this.minimumQuantity,
    required this.unit,
    required this.location,
    required this.locationAr,
    required this.updatedAt,
    required this.documents,
  });

  final int id;
  String reference;
  String serialNumber;
  String barcode;
  String designation;
  String designationAr;
  String category;
  String categoryAr;
  int quantity;
  int minimumQuantity;
  StockUnit unit;
  String location;
  String locationAr;
  DateTime updatedAt;
  List<AppDocument> documents;

  bool get isLowStock => quantity <= minimumQuantity;
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
    required this.documents,
    this.supplierOrBeneficiary,
    this.reference,
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
  final List<AppDocument> documents;
  final String? supplierOrBeneficiary;
  final String? reference;
}

class SupplyRequest {
  SupplyRequest({
    required this.id,
    required this.articleId,
    required this.articleDesignation,
    required this.articleDesignationAr,
    required this.requestedQuantity,
    required this.requester,
    required this.reason,
    required this.requestDate,
    required this.status,
    required this.documents,
  });

  final int id;
  final int articleId;
  final String articleDesignation;
  final String articleDesignationAr;
  final int requestedQuantity;
  final String requester;
  final String reason;
  final DateTime requestDate;
  SupplyRequestStatus status;
  final List<AppDocument> documents;
}
