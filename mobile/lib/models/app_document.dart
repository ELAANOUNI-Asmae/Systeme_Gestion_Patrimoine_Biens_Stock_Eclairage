enum DocumentCategory { official, attachment }

enum DocumentType {
  invoice,
  receipt,
  contract,
  registration,
  insurance,
  certificate,
  deliveryNote,
  exitVoucher,
  technicalSheet,
  warranty,
  report,
  photo,
  other,
}

class AppDocument {
  AppDocument({
    required this.id,
    required this.name,
    required this.type,
    required this.fileName,
    required this.uploadDate,
    required this.category,
    this.expirationDate,
    this.reminderDaysBefore,
  });

  final int id;
  final String name;
  final DocumentType type;
  final String fileName;
  final DateTime uploadDate;
  final DocumentCategory category;
  final DateTime? expirationDate;
  final int? reminderDaysBefore;

  bool get isOfficial => category == DocumentCategory.official;

  AppDocument copyWith({
    int? id,
    String? name,
    DocumentType? type,
    String? fileName,
    DateTime? uploadDate,
    DocumentCategory? category,
    DateTime? expirationDate,
    int? reminderDaysBefore,
  }) {
    return AppDocument(
      id: id ?? this.id,
      name: name ?? this.name,
      type: type ?? this.type,
      fileName: fileName ?? this.fileName,
      uploadDate: uploadDate ?? this.uploadDate,
      category: category ?? this.category,
      expirationDate: expirationDate ?? this.expirationDate,
      reminderDaysBefore: reminderDaysBefore ?? this.reminderDaysBefore,
    );
  }
}
