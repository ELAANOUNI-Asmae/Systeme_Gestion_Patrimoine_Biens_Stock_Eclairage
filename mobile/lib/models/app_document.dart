import 'dart:typed_data';

enum DocumentCategory {
  official,
  attachment,
}

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
    this.backendId,
    this.expirationDate,
    this.reminderDaysBefore,
    this.fileBytes,
  });

  /// Identifiant local utilisé par l'UI.
  final int id;

  /// Identifiant réel du document dans le Backend.
  /// Null uniquement pour un nouveau fichier pas encore envoyé.
  final int? backendId;

  final String name;
  final DocumentType type;
  final String fileName;
  final DateTime uploadDate;
  final DocumentCategory category;
  final DateTime? expirationDate;
  final int? reminderDaysBefore;
  final Uint8List? fileBytes;

  bool get isOfficial =>
      category ==
      DocumentCategory.official;

  AppDocument copyWith({
    int? id,
    int? backendId,
    String? name,
    DocumentType? type,
    String? fileName,
    DateTime? uploadDate,
    DocumentCategory? category,
    DateTime? expirationDate,
    int? reminderDaysBefore,
    Uint8List? fileBytes,
  }) {
    return AppDocument(
      id:
          id ??
          this.id,

      backendId:
          backendId ??
          this.backendId,

      name:
          name ??
          this.name,

      type:
          type ??
          this.type,

      fileName:
          fileName ??
          this.fileName,

      uploadDate:
          uploadDate ??
          this.uploadDate,

      category:
          category ??
          this.category,

      expirationDate:
          expirationDate ??
          this.expirationDate,

      reminderDaysBefore:
          reminderDaysBefore ??
          this.reminderDaysBefore,

      fileBytes:
          fileBytes ??
          this.fileBytes,
    );
  }
}
