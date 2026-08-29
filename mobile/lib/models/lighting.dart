import 'app_document.dart';

enum LightStatus { active, inactive, damaged, underMaintenance }
enum FailureStatus { reported, inProgress, resolved }

class LightPoint {
  LightPoint({
    required this.id,
    required this.reference,
    required this.designation,
    required this.designationAr,
    required this.zone,
    required this.zoneAr,
    required this.address,
    required this.addressAr,
    required this.latitude,
    required this.longitude,
    required this.status,
    required this.installationDate,
    required this.power,
    required this.documents,
  });

  final int id;
  String reference;
  String designation;
  String designationAr;
  String zone;
  String zoneAr;
  String address;
  String addressAr;
  double latitude;
  double longitude;
  LightStatus status;
  DateTime installationDate;
  double power;
  List<AppDocument> documents;
}

class FailureReport {
  FailureReport({
    required this.id,
    required this.lightId,
    required this.lightReference,
    required this.lightDesignation,
    required this.lightDesignationAr,
    required this.description,
    required this.reportedBy,
    required this.reportedAt,
    required this.status,
    required this.documents,
  });

  final int id;
  final int lightId;
  final String lightReference;
  final String lightDesignation;
  final String lightDesignationAr;
  final String description;
  final String reportedBy;
  final DateTime reportedAt;
  FailureStatus status;
  final List<AppDocument> documents;
}

class Intervention {
  Intervention({
    required this.id,
    required this.failureId,
    required this.technician,
    required this.interventionDate,
    required this.description,
    required this.completed,
    required this.documents,
  });

  final int id;
  final int failureId;
  final String technician;
  final DateTime interventionDate;
  final String description;
  bool completed;
  final List<AppDocument> documents;
}
