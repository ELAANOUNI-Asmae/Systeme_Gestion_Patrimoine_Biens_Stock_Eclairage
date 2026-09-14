
enum NotificationKind {
  info,
  warning,
  success,
  error,
}

enum NotificationModule {
  users,
  assets,
  stock,
  lighting,
  system,
}

class AppNotification {
  AppNotification({
    required this.id,
    required this.title,
    required this.titleAr,
    required this.message,
    required this.messageAr,
    required this.kind,
    required this.module,
    required this.createdAt,
    required this.read,
    this.target,
    this.automatic = false,
    this.recipientUserId,
    this.recipientPermission,
  });

  final int id;

  final String title;
  final String titleAr;

  final String message;
  final String messageAr;

  final NotificationKind kind;
  final NotificationModule module;

  final DateTime createdAt;

  bool read;

  final String? target;

  final bool automatic;

  final int? recipientUserId;
  final String? recipientPermission;
}