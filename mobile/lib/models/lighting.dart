import 'app_document.dart';

enum LightStatus {
  active,
  inactive,
  damaged,
  underMaintenance,
}

enum FailureStatus {
  reported,
  inProgress,
  resolved,
}

class Technician {
  const Technician({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.phone,
    required this.localisation,
    required this.latitude,
    required this.longitude,
    this.active = true,
  });

  final int id;
  final String name;
  final String nameAr;
  final String phone;
  final String localisation;
  final double latitude;
  final double longitude;
  final bool active;
}

class LightPoint {
  LightPoint({
    required this.id,
    required this.reference,
    required this.designation,
    required this.designationAr,
    String? localisation,
    String? zone,
    String? zoneAr,
    String? address,
    String? addressAr,
    required this.latitude,
    required this.longitude,
    required this.status,
    required this.installationDate,
    required this.power,
    required this.documents,
  }) : localisation = (
          localisation ??
          address ??
          addressAr ??
          zone ??
          zoneAr ??
          ''
        ).trim();

  final int id;
  String reference;
  String designation;
  String designationAr;
  String localisation;
  double latitude;
  double longitude;
  LightStatus status;
  DateTime installationDate;
  double power;
  List<AppDocument> documents;

  @Deprecated('Use localisation')
  String get zone => localisation;
  @Deprecated('Use localisation')
  String get zoneAr => localisation;
  @Deprecated('Use localisation')
  String get address => localisation;
  @Deprecated('Use localisation')
  String get addressAr => localisation;
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
    int? technicianId,
    String? technicianName,
    String? technicianNameAr,
    String? technicianLocalisation,
    String? technician,
    required this.interventionDate,
    required this.description,
    required this.completed,
    required this.documents,
    List<AppDocument>? photos,
    this.completedAt,
    this.report,
    this.cost,
  })  : technicianId = technicianId ?? 0,
        technicianName = technicianName ?? technician ?? '',
        technicianNameAr =
            technicianNameAr ?? technicianName ?? technician ?? '',
        technicianLocalisation = technicianLocalisation ?? '',
        photos = photos ?? <AppDocument>[];

  final int id;
  final int failureId;
  final int technicianId;
  final String technicianName;
  final String technicianNameAr;
  final String technicianLocalisation;
  final DateTime interventionDate;
  final String description;
  bool completed;
  DateTime? completedAt;
  String? report;
  double? cost;
  final List<AppDocument> photos;
  final List<AppDocument> documents;

  @Deprecated('Use technicianName')
  String get technician => technicianName;
}
