import 'dart:math';
import 'package:flutter/material.dart';
import '../core/config/permissions.dart';
import '../models/app_document.dart';
import '../models/app_notification.dart';
import '../models/bien.dart';
import '../models/lighting.dart';
import '../models/stock.dart';
import '../models/user_models.dart';

class AppState extends ChangeNotifier {
  AppState() {
    _seed();
  }

  Locale locale = const Locale('fr');
  ThemeMode themeMode = ThemeMode.light;
  String communeName = 'Commune d’Agadir';
  String communeCity = 'Agadir';

  AppUser? currentUser;

  final List<AppRole> roles = [];
  final List<AppUser> users = [];
  final List<Bien> biens = [];
  final List<StockArticle> articles = [];
  final List<StockMovement> movements = [];
  final List<SupplyRequest> supplyRequests = [];
  final List<RestockAlert> restockAlerts = [];
  final List<LightPoint> lights = [];
  final List<FailureReport> failures = [];
  final List<Intervention> interventions = [];
  final List<AppNotification> _baseNotifications = [];
  final Set<int> _dismissedAutomaticNotifications = {};
  final Map<int, bool> _automaticReadState = {};

  bool get isAuthenticated => currentUser != null;
  bool get isArabic => locale.languageCode == 'ar';

  bool hasPermission(String permission) {
    final user = currentUser;
    return user != null && user.role.permissions.contains(permission);
  }

  List<Bien> get activeBiens => biens.where((item) => !item.archived).toList();
  List<Bien> get archivedBiens => biens.where((item) => item.archived && item.status == AssetStatus.disposed).toList();
  List<StockArticle> get lowStockArticles => articles.where((item) => item.isLowStock).toList();
  List<FailureReport> get unresolvedFailures => failures.where((item) => item.status != FailureStatus.resolved).toList();

  List<AppNotification> get notifications {
    final all = <AppNotification>[
      ..._baseNotifications,
      ..._buildAutomaticDocumentNotifications(),
    ];

    final user = currentUser;

    final visible = all.where((notification) {
      if (
        notification.recipientUserId == null &&
        notification.recipientPermission == null
      ) {
        return true;
      }

      if (user == null) {
        return false;
      }

      if (
        notification.recipientUserId != null &&
        notification.recipientUserId != user.id
      ) {
        return false;
      }

      if (
        notification.recipientPermission != null &&
        !user.role.permissions.contains(
          notification.recipientPermission,
        )
      ) {
        return false;
      }

      return true;
    }).toList();

    visible.sort(
      (a, b) =>
          b.createdAt.compareTo(a.createdAt),
    );

    return visible;
  }

  int get unreadNotificationCount => notifications.where((item) => !item.read).length;

  void setLocale(Locale value) {
    locale = value;
    notifyListeners();
  }

  void setThemeMode(ThemeMode value) {
    themeMode = value;
    notifyListeners();
  }

  void updateSettings({
    required String name,
    required String city,
  }) {
    communeName = name.trim().isEmpty ? communeName : name.trim();
    communeCity = city.trim().isEmpty ? communeCity : city.trim();
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    await Future<void>.delayed(const Duration(milliseconds: 350));
    final normalized = email.trim().toLowerCase();

    AppUser? found;
    for (final user in users) {
      if (user.email.toLowerCase() == normalized &&
          user.password == password &&
          user.isActive) {
        found = user;
        break;
      }
    }

    currentUser = found;
    notifyListeners();
    return found != null;
  }

  void logout() {
    currentUser = null;
    notifyListeners();
  }

  bool emailExists(String email) => users.any((u) => u.email.toLowerCase() == email.trim().toLowerCase());

  bool resetPasswordForEmail(
    String email,
    String newPassword,
  ) {
    final normalized =
        email.trim().toLowerCase();

    for (final user in users) {
      if (user.email.toLowerCase() ==
          normalized) {
        user.password =
            newPassword;
        notifyListeners();
        return true;
      }
    }

    return false;
  }

  void updateProfile({
    required String firstName,
    required String lastName,
    required String phone,
  }) {
    final user = currentUser;
    if (user == null) return;
    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.phone = phone.trim();
    notifyListeners();
  }

  bool changePassword(String currentPassword, String nextPassword) {
    final user = currentUser;
    if (user == null || user.password != currentPassword) return false;
    user.password = nextPassword;
    notifyListeners();
    return true;
  }

  // USERS
  void saveUser({
    int? id,
    required String firstName,
    required String lastName,
    required String firstNameAr,
    required String lastNameAr,
    required String email,
    required String gender,
    required String phone,
    required String cin,
    required AppRole role,
    String? password,
  }) {
    final normalizedEmail =
        email.trim().toLowerCase();

    final duplicateEmail =
        users.any(
      (user) =>
          user.id != id &&
          user.email.toLowerCase() ==
              normalizedEmail,
    );

    if (duplicateEmail) {
      throw StateError(
        'EMAIL_ALREADY_USED',
      );
    }

    if (id == null) {
      if (password == null ||
          password.isEmpty) {
        throw StateError(
          'PASSWORD_REQUIRED',
        );
      }

      users.insert(
        0,
        AppUser(
          id: _nextId(
            users.map(
              (e) => e.id,
            ),
          ),
          firstName:
              firstName,
          lastName:
              lastName,
          firstNameAr:
              firstNameAr,
          lastNameAr:
              lastNameAr,
          email:
              normalizedEmail,
          gender:
              gender,
          phone:
              phone,
          cin:
              cin,
          role:
              role,
          password:
              password,
          isActive:
              true,
        ),
      );
    } else {
      final user =
          users.firstWhere(
        (item) =>
            item.id == id,
      );

      user
        ..firstName =
            firstName
        ..lastName =
            lastName
        ..firstNameAr =
            firstNameAr
        ..lastNameAr =
            lastNameAr
        ..email =
            normalizedEmail
        ..gender =
            gender
        ..phone =
            phone
        ..cin =
            cin
        ..role =
            role;
    }

    notifyListeners();
  }

  void setUserActive(
    int id,
    bool active,
  ) {
    if (
      currentUser?.id == id &&
      !active
    ) {
      throw StateError(
        'CANNOT_DEACTIVATE_SELF',
      );
    }

    final user =
        users.firstWhere(
      (item) =>
          item.id == id,
    );

    user.isActive =
        active;

    notifyListeners();
  }

  void deleteUser(
    int id,
  ) {
    if (
      currentUser?.id == id
    ) {
      throw StateError(
        'CANNOT_DELETE_SELF',
      );
    }

    users.removeWhere(
      (user) =>
          user.id == id,
    );

    notifyListeners();
  }

  // ROLES
  void saveRole({
    int? id,
    required String name,
    required Set<String> permissions,
  }) {
    final normalizedName =
        name.trim().toUpperCase();

    if (normalizedName.isEmpty ||
        permissions.isEmpty) {
      throw StateError(
        'INVALID_ROLE',
      );
    }

    final duplicate =
        roles.any(
      (role) =>
          role.id != id &&
          role.name.toUpperCase() ==
              normalizedName,
    );

    if (duplicate) {
      throw StateError(
        'ROLE_ALREADY_EXISTS',
      );
    }

    if (id == null) {
      roles.insert(
        0,
        AppRole(
          id: _nextId(
            roles.map(
              (role) => role.id,
            ),
          ),
          name: normalizedName,
          permissions: {
            ...permissions,
          },
        ),
      );
    } else {
      final role =
          roles.firstWhere(
        (item) =>
            item.id == id,
      );

      role
        ..name = normalizedName
        ..permissions = {
          ...permissions,
        };
    }

    notifyListeners();
  }

  void deleteRole(
    int id,
  ) {
    final role =
        roles.firstWhere(
      (item) =>
          item.id == id,
    );

    if (
      role.name == 'ADMIN'
    ) {
      throw StateError(
        'ADMIN_ROLE_PROTECTED',
      );
    }

    final used =
        users.any(
      (user) =>
          user.role.id == id,
    );

    if (used) {
      throw StateError(
        'ROLE_IN_USE',
      );
    }

    roles.removeWhere(
      (item) =>
          item.id == id,
    );

    notifyListeners();
  }

  // BIENS
  void saveBien(
    Bien value,
  ) {
    final duplicateInventory =
        biens.any(
      (item) =>
          item.id !=
              value.id &&
          item.inventoryId
                  .toUpperCase() ==
              value.inventoryId
                  .toUpperCase(),
    );

    if (duplicateInventory) {
      throw StateError(
        'INVENTORY_ALREADY_USED',
      );
    }

    if (value.status != AssetStatus.inUse) {
      value
        ..assignment = ''
        ..assignmentAr = '';
    }

    final index =
        biens.indexWhere(
      (item) =>
          item.id == value.id,
    );

    if (index == -1) {
      value
        ..status = AssetStatus.available
        ..assignment = ''
        ..assignmentAr = '';

      biens.insert(0, value);
    } else {
      biens[index] = value;
    }

    notifyListeners();
  }

  int nextBienId() =>
      _nextId(
        biens.map(
          (item) => item.id,
        ),
      );

  void deleteBien(
    int id,
  ) {
    biens.removeWhere(
      (item) => item.id == id,
    );

    notifyListeners();
  }

  void archiveBien({
    required int id,
    required DateTime archivedAt,
    String? reference,
    String? documentFileName,
    String? notes,
  }) {
    final bien =
        biens.firstWhere(
      (item) => item.id == id,
    );

    if (bien.archived) {
      throw StateError(
        'ASSET_ALREADY_ARCHIVED',
      );
    }

    bien
      ..archived = true
      ..archivedAt = archivedAt
      ..archiveReason = 'DISPOSED'
      ..archiveReference = reference
      ..archiveDocumentFileName =
          documentFileName
      ..archiveNotes = notes
      ..status = AssetStatus.disposed
      ..assignment = ''
      ..assignmentAr = '';

    notifyListeners();
  }

  void rentBien({
    required int id,
    required PartyType partyType,
    required String tenantName,
    String? cin,
    String? ice,
    String? phone,
    String? address,
    required DateTime startDate,
    DateTime? endDate,
    required double monthlyAmount,
    String? contractReference,
    String? contractFileName,
    String? notes,
  }) {
    final bien =
        biens.firstWhere(
      (item) => item.id == id,
    );

    if (bien.archived) {
      throw StateError(
        'ASSET_ARCHIVED',
      );
    }

    bien.rentals.insert(
      0,
      RentalOperation(
        id: _nextId(
          bien.rentals.map(
            (item) => item.id,
          ),
        ),
        partyType: partyType,
        tenantName: tenantName,
        cin: cin,
        ice: ice,
        phone: phone,
        address: address,
        startDate: startDate,
        endDate: endDate,
        monthlyAmount: monthlyAmount,
        contractReference:
            contractReference,
        contractFileName:
            contractFileName,
        notes: notes,
      ),
    );

    bien
      ..status = AssetStatus.rented
      ..assignment = ''
      ..assignmentAr = '';

    notifyListeners();
  }

  void sellBien({
    required int id,
    required PartyType partyType,
    required String buyerName,
    String? cin,
    String? ice,
    String? phone,
    String? address,
    required DateTime saleDate,
    required double salePrice,
    String? contractReference,
    String? contractFileName,
    String? receiptFileName,
    String? notes,
  }) {
    final bien =
        biens.firstWhere(
      (item) => item.id == id,
    );

    if (bien.archived) {
      throw StateError(
        'ASSET_ARCHIVED',
      );
    }

    final existingSaleIds =
        biens
            .where(
              (item) =>
                  item.sale != null,
            )
            .map(
              (item) =>
                  item.sale!.id,
            );

    bien
      ..sale = SaleOperation(
        id: _nextId(existingSaleIds),
        partyType: partyType,
        buyerName: buyerName,
        cin: cin,
        ice: ice,
        phone: phone,
        address: address,
        saleDate: saleDate,
        salePrice: salePrice,
        contractReference:
            contractReference,
        contractFileName:
            contractFileName,
        receiptFileName:
            receiptFileName,
        notes: notes,
      )
      ..status = AssetStatus.disposed
      ..archived = true
      ..archivedAt = saleDate
      ..archiveReason = 'DISPOSED'
      ..archiveReference =
          contractReference
      ..archiveDocumentFileName =
          contractFileName
      ..archiveNotes = notes
      ..assignment = ''
      ..assignmentAr = '';

    notifyListeners();
  }

  // STOCK
  int nextArticleId() =>
      _nextId(
        articles.map(
          (article) => article.id,
        ),
      );

  void saveArticle(
    StockArticle value,
  ) {
    if (value.reference.trim().isEmpty) {
      throw StateError(
        'REFERENCE_REQUIRED',
      );
    }

    if (value.barcode.trim().isEmpty) {
      throw StateError(
        'BARCODE_REQUIRED',
      );
    }

    if (value.brand.trim().isEmpty) {
      throw StateError(
        'BRAND_REQUIRED',
      );
    }

    if (
      value.quantity < 0 ||
      value.minimumQuantity < 0
    ) {
      throw StateError(
        'INVALID_QUANTITY',
      );
    }

    if (
      value.unitPriceHt <= 0 ||
      value.vatRate < 0 ||
      value.vatRate > 100
    ) {
      throw StateError(
        'INVALID_PRICE',
      );
    }

    final duplicateReference =
        articles.any(
      (article) =>
          article.id != value.id &&
          article.reference
                  .trim()
                  .toUpperCase() ==
              value.reference
                  .trim()
                  .toUpperCase(),
    );

    if (duplicateReference) {
      throw StateError(
        'REFERENCE_ALREADY_USED',
      );
    }

    final duplicateBarcode =
        articles.any(
      (article) =>
          article.id != value.id &&
          article.barcode.trim() ==
              value.barcode.trim(),
    );

    if (duplicateBarcode) {
      throw StateError(
        'BARCODE_ALREADY_USED',
      );
    }

    value
      ..reference =
          value.reference
              .trim()
              .toUpperCase()
      ..barcode =
          value.barcode.trim()
      ..brand =
          value.brand.trim()
      ..designation =
          value.designation.trim()
      ..designationAr =
          value.designationAr.trim()
      ..category =
          value.category.trim()
      ..categoryAr =
          value.categoryAr.trim()
      ..location =
          value.location.trim()
      ..locationAr =
          value.locationAr.trim()
      ..updatedAt =
          DateTime.now();

    final index =
        articles.indexWhere(
      (article) =>
          article.id == value.id,
    );

    if (index == -1) {
      articles.insert(
        0,
        value,
      );
    } else {
      articles[index] =
          value;
    }

    notifyListeners();
  }

  void deleteArticle(
    int id,
  ) {
    articles.removeWhere(
      (article) =>
          article.id == id,
    );

    notifyListeners();
  }

  int availableForSupplyRequest(
    int articleId, {
    int? exceptRequestId,
  }) {
    final article =
        articles.firstWhere(
      (item) =>
          item.id == articleId,
    );

    final reserved =
        supplyRequests
            .where(
              (request) =>
                  request.articleId ==
                      articleId &&
                  request.status ==
                      SupplyRequestStatus
                          .approved &&
                  request.id !=
                      exceptRequestId,
            )
            .fold<int>(
              0,
              (
                total,
                request,
              ) =>
                  total +
                  request
                      .requestedQuantity,
            );

    return max(
      0,
      article.quantity -
          reserved,
    );
  }

  void addStockMovement({
    required int articleId,
    required MovementType type,
    required int quantity,
    required String reason,
    required String partner,
    required String reference,
    required List<AppDocument> documents,
    double? unitPriceHt,
    double? vatRate,
    int? supplyRequestId,
  }) {
    if (quantity <= 0) {
      throw StateError(
        'INVALID_QUANTITY',
      );
    }

    if (reason.trim().isEmpty) {
      throw StateError(
        'REASON_REQUIRED',
      );
    }

    final article =
        articles.firstWhere(
      (article) =>
          article.id ==
          articleId,
    );

    if (
      type ==
          MovementType.exit &&
      article.quantity <
          quantity
    ) {
      throw StateError(
        'INSUFFICIENT_STOCK:${article.quantity}',
      );
    }

    final movementUnitPriceHt =
        type ==
                MovementType
                    .entry
            ? unitPriceHt ??
                article
                    .unitPriceHt
            : article
                .unitPriceHt;

    final movementVatRate =
        type ==
                MovementType
                    .entry
            ? vatRate ??
                article.vatRate
            : article.vatRate;

    if (
      movementUnitPriceHt <= 0 ||
      movementVatRate < 0 ||
      movementVatRate > 100
    ) {
      throw StateError(
        'INVALID_PRICE',
      );
    }

    article.quantity +=
        type ==
                MovementType
                    .entry
            ? quantity
            : -quantity;

    if (
      type ==
      MovementType.entry
    ) {
      article
        ..unitPriceHt =
            movementUnitPriceHt
        ..vatRate =
            movementVatRate;
    }

    article.updatedAt =
        DateTime.now();

    movements.insert(
      0,
      StockMovement(
        id: _nextId(
          movements.map(
            (movement) =>
                movement.id,
          ),
        ),
        articleId:
            article.id,
        articleDesignation:
            article.designation,
        articleDesignationAr:
            article
                .designationAr,
        type:
            type,
        quantity:
            quantity,
        reason:
            reason.trim(),
        performedBy:
            currentUser
                    ?.fullName ??
                'Agent',
        date:
            DateTime.now(),
        unitPriceHt:
            movementUnitPriceHt,
        vatRate:
            movementVatRate,
        documents:
            documents,
        supplierOrBeneficiary:
            partner.trim().isEmpty
                ? null
                : partner.trim(),
        reference:
            reference.trim().isEmpty
                ? null
                : reference.trim(),
        supplyRequestId:
            supplyRequestId,
      ),
    );

    notifyListeners();
  }

  void createSupplyRequest({
    required int articleId,
    required int quantity,
    required String reason,
    required List<AppDocument> documents,
  }) {
    final user =
        currentUser;

    if (user == null) {
      throw StateError(
        'AUTH_REQUIRED',
      );
    }

    final article =
        articles.firstWhere(
      (article) =>
          article.id ==
          articleId,
    );

    if (quantity <= 0) {
      throw StateError(
        'INVALID_QUANTITY',
      );
    }

    if (
      quantity >
      article.quantity
    ) {
      throw StateError(
        'INSUFFICIENT_STOCK:${article.quantity}',
      );
    }

    if (reason.trim().isEmpty) {
      throw StateError(
        'REASON_REQUIRED',
      );
    }

    final request =
        SupplyRequest(
      id: _nextId(
        supplyRequests.map(
          (request) =>
              request.id,
        ),
      ),
      articleId:
          article.id,
      articleDesignation:
          article.designation,
      articleDesignationAr:
          article.designationAr,
      requestedQuantity:
          quantity,
      requesterId:
          user.id,
      requester:
          user.fullName,
      reason:
          reason.trim(),
      requestDate:
          DateTime.now(),
      status:
          SupplyRequestStatus
              .pending,
      documents:
          documents,
    );

    supplyRequests.insert(
      0,
      request,
    );

    _pushStockNotification(
      title:
          'Nouvelle demande de fourniture',
      titleAr:
          'طلب تموين جديد',
      message:
          '${request.requester} demande ${request.requestedQuantity} unité(s) de ${request.articleDesignation}.',
      messageAr:
          '${request.requester} يطلب ${request.requestedQuantity} من ${request.articleDesignationAr}.',
      kind:
          NotificationKind.info,
      recipientPermission:
          Permissions
              .validateSupplyRequest,
      target:
          'stock',
    );

    notifyListeners();
  }

  void createRestockAlert({
    required int articleId,
    required int quantity,
    required String reason,
  }) {
    final user =
        currentUser;

    if (user == null) {
      throw StateError(
        'AUTH_REQUIRED',
      );
    }

    final article =
        articles.firstWhere(
      (item) =>
          item.id ==
          articleId,
    );

    if (
      quantity <=
      article.quantity
    ) {
      throw StateError(
        'STOCK_ALREADY_AVAILABLE',
      );
    }

    if (
      quantity <= 0 ||
      reason.trim().isEmpty
    ) {
      throw StateError(
        'INVALID_RESTOCK_ALERT',
      );
    }

    final alert =
        RestockAlert(
      id: _nextId(
        restockAlerts.map(
          (item) => item.id,
        ),
      ),
      articleId:
          article.id,
      articleDesignation:
          article.designation,
      articleDesignationAr:
          article.designationAr,
      requestedQuantity:
          quantity,
      availableQuantityAtRequest:
          article.quantity,
      requesterId:
          user.id,
      requester:
          user.fullName,
      reason:
          reason.trim(),
      createdAt:
          DateTime.now(),
      status:
          RestockAlertStatus
              .waiting,
    );

    restockAlerts.insert(
      0,
      alert,
    );

    _pushStockNotification(
      title:
          'Réapprovisionnement nécessaire',
      titleAr:
          'الحاجة إلى إعادة تزويد المخزون',
      message:
          '${alert.requester} a besoin de ${alert.requestedQuantity} unité(s) de ${alert.articleDesignation}, mais le stock actuel est ${alert.availableQuantityAtRequest}.',
      messageAr:
          '${alert.requester} يحتاج ${alert.requestedQuantity} من ${alert.articleDesignationAr}، بينما المتوفر هو ${alert.availableQuantityAtRequest}.',
      kind:
          NotificationKind.warning,
      recipientPermission:
          Permissions
              .validateSupplyRequest,
      target:
          'stock',
    );

    notifyListeners();
  }

  void setSupplyRequestStatus(
    int id,
    SupplyRequestStatus status, {
    String? rejectionReason,
  }) {
    final request =
        supplyRequests.firstWhere(
      (request) =>
          request.id == id,
    );

    if (
      request.status !=
      SupplyRequestStatus.pending
    ) {
      throw StateError(
        'REQUEST_ALREADY_PROCESSED',
      );
    }

    if (
      status ==
      SupplyRequestStatus.rejected
    ) {
      if (
        rejectionReason ==
            null ||
        rejectionReason
            .trim()
            .isEmpty
      ) {
        throw StateError(
          'REJECTION_REASON_REQUIRED',
        );
      }

      request
        ..status =
            SupplyRequestStatus
                .rejected
        ..rejectionReason =
            rejectionReason
                .trim()
        ..decisionDate =
            DateTime.now();

      _pushStockNotification(
        title:
            'Demande refusée',
        titleAr:
            'تم رفض الطلب',
        message:
            'Votre demande de ${request.articleDesignation} a été refusée. Motif : ${request.rejectionReason}',
        messageAr:
            'تم رفض طلب ${request.articleDesignationAr}. السبب: ${request.rejectionReason}',
        kind:
            NotificationKind.error,
        recipientUserId:
            request.requesterId,
        target:
            'stock',
      );

      notifyListeners();
      return;
    }

    if (
      status !=
      SupplyRequestStatus.approved
    ) {
      throw StateError(
        'INVALID_REQUEST_STATUS',
      );
    }

    final available =
        availableForSupplyRequest(
      request.articleId,
      exceptRequestId:
          request.id,
    );

    if (
      request
              .requestedQuantity >
          available
    ) {
      throw StateError(
        'INSUFFICIENT_STOCK:$available',
      );
    }

    request
      ..status =
          SupplyRequestStatus
              .approved
      ..decisionDate =
          DateTime.now();

    _pushStockNotification(
      title:
          'Demande acceptée',
      titleAr:
          'تم قبول الطلب',
      message:
          'Votre demande de ${request.requestedQuantity} unité(s) de ${request.articleDesignation} est acceptée. Après récupération, appuyez sur « Reçu ».',
      messageAr:
          'تم قبول طلبك لـ ${request.requestedQuantity} من ${request.articleDesignationAr}. بعد الاستلام اضغط « تم الاستلام ».',
      kind:
          NotificationKind.success,
      recipientUserId:
          request.requesterId,
      target:
          'stock',
    );

    notifyListeners();
  }

  void confirmSupplyRequestReceived(
    int id,
  ) {
    final request =
        supplyRequests.firstWhere(
      (request) =>
          request.id == id,
    );

    final user =
        currentUser;

    if (user == null) {
      throw StateError(
        'AUTH_REQUIRED',
      );
    }

    if (
      request.requesterId !=
      user.id
    ) {
      throw StateError(
        'REQUEST_NOT_OWNED',
      );
    }

    if (
      request.status !=
      SupplyRequestStatus
          .approved
    ) {
      throw StateError(
        'REQUEST_NOT_APPROVED',
      );
    }

    final article =
        articles.firstWhere(
      (article) =>
          article.id ==
          request.articleId,
    );

    if (
      article.quantity <
      request
          .requestedQuantity
    ) {
      throw StateError(
        'INSUFFICIENT_STOCK:${article.quantity}',
      );
    }

    addStockMovement(
      articleId:
          article.id,
      type:
          MovementType.exit,
      quantity:
          request
              .requestedQuantity,
      reason:
          'Demande de fourniture #${request.id} reçue',
      partner:
          request.requester,
      reference:
          'REQ-${request.id.toString().padLeft(4, '0')}',
      documents:
          const [],
      supplyRequestId:
          request.id,
    );

    request
      ..status =
          SupplyRequestStatus
              .received
      ..receivedAt =
          DateTime.now();

    _pushStockNotification(
      title:
          'Sortie enregistrée',
      titleAr:
          'تم تسجيل خروج الكمية',
      message:
          '${request.requester} a confirmé la réception de ${request.requestedQuantity} unité(s) de ${request.articleDesignation}.',
      messageAr:
          '${request.requester} أكد استلام ${request.requestedQuantity} من ${request.articleDesignationAr}.',
      kind:
          NotificationKind.info,
      recipientPermission:
          Permissions
              .validateSupplyRequest,
      target:
          'stock',
    );

    notifyListeners();
  }

  void notifyRestockReady(
    int id,
  ) {
    final alert =
        restockAlerts.firstWhere(
      (item) =>
          item.id == id,
    );

    final article =
        articles.firstWhere(
      (item) =>
          item.id ==
          alert.articleId,
    );

    if (
      article.quantity <
      alert.requestedQuantity
    ) {
      throw StateError(
        'INSUFFICIENT_STOCK:${article.quantity}',
      );
    }

    alert
      ..status =
          RestockAlertStatus
              .readyNotified
      ..readyNotifiedAt =
          DateTime.now();

    _pushStockNotification(
      title:
          'Quantité disponible',
      titleAr:
          'الكمية أصبحت متوفرة',
      message:
          '${alert.requestedQuantity} unité(s) de ${alert.articleDesignation} sont maintenant disponibles. Vous pouvez créer votre demande.',
      messageAr:
          'أصبحت ${alert.requestedQuantity} من ${alert.articleDesignationAr} متوفرة الآن. يمكنك إنشاء طلبك.',
      kind:
          NotificationKind.success,
      recipientUserId:
          alert.requesterId,
      target:
          'stock',
    );

    notifyListeners();
  }

  void _pushStockNotification({
    required String title,
    required String titleAr,
    required String message,
    required String messageAr,
    required NotificationKind kind,
    int? recipientUserId,
    String? recipientPermission,
    String target = 'stock',
  }) {
    _baseNotifications.insert(
      0,
      AppNotification(
        id: _nextId(
          _baseNotifications.map(
            (notification) =>
                notification.id,
          ),
        ),
        title:
            title,
        titleAr:
            titleAr,
        message:
            message,
        messageAr:
            messageAr,
        kind:
            kind,
        module:
            NotificationModule.stock,
        createdAt:
            DateTime.now(),
        read:
            false,
        target:
            target,
        recipientUserId:
            recipientUserId,
        recipientPermission:
            recipientPermission,
      ),
    );
  }

  // LIGHTING
  int nextLightId() =>
      _nextId(
        lights.map(
          (item) => item.id,
        ),
      );

  void saveLight(
    LightPoint value,
  ) {
    final index =
        lights.indexWhere(
      (light) =>
          light.id == value.id,
    );

    if (index == -1) {
      // Règle métier : tout nouveau point lumineux est actif.
      value.status =
          LightStatus.active;
      lights.insert(
        0,
        value,
      );
    } else {
      lights[index] =
          value;
      _synchronizeLightStatus(
        value.id,
      );
    }

    notifyListeners();
  }

  void deleteLight(
    int id,
  ) {
    final failureIds =
        failures
            .where(
              (failure) =>
                  failure.lightId ==
                  id,
            )
            .map(
              (failure) =>
                  failure.id,
            )
            .toSet();

    interventions.removeWhere(
      (intervention) =>
          failureIds.contains(
        intervention.failureId,
      ),
    );

    failures.removeWhere(
      (failure) =>
          failure.lightId == id,
    );

    lights.removeWhere(
      (light) =>
          light.id == id,
    );

    notifyListeners();
  }

  List<Technician>
      techniciansForLight(
    int lightId,
  ) {
    final light =
        lights.firstWhere(
      (item) =>
          item.id ==
          lightId,
    );

    final result =
        demoTechnicians
            .where(
              (technician) =>
                  technician.active,
            )
            .toList();

    result.sort(
      (
        first,
        second,
      ) {
        final firstDistance =
            _lightingDistanceKm(
          light.latitude,
          light.longitude,
          first.latitude,
          first.longitude,
        );

        final secondDistance =
            _lightingDistanceKm(
          light.latitude,
          light.longitude,
          second.latitude,
          second.longitude,
        );

        return firstDistance
            .compareTo(
          secondDistance,
        );
      },
    );

    return result;
  }

  double _lightingDistanceKm(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const earthRadius =
        6371.0;

    final dLat =
        (lat2 - lat1) *
            pi /
            180;

    final dLon =
        (lon2 - lon1) *
            pi /
            180;

    final firstLat =
        lat1 * pi / 180;

    final secondLat =
        lat2 * pi / 180;

    final a =
        sin(dLat / 2) *
                sin(dLat / 2) +
            cos(firstLat) *
                cos(secondLat) *
                sin(dLon / 2) *
                sin(dLon / 2);

    return earthRadius *
        2 *
        atan2(
          sqrt(a),
          sqrt(1 - a),
        );
  }

  FailureReport createFailure({
    required int lightId,
    required String description,
    required String reportedBy,
    required List<AppDocument>
        documents,
  }) {
    final hasOpen =
        failures.any(
      (failure) =>
          failure.lightId ==
              lightId &&
          failure.status !=
              FailureStatus
                  .resolved,
    );

    if (hasOpen) {
      throw StateError(
        'FAILURE_EXISTS',
      );
    }

    final light =
        lights.firstWhere(
      (item) =>
          item.id ==
          lightId,
    );

    final normalizedReporter =
        reportedBy
            .trim();

    final failure =
        FailureReport(
      id: _nextId(
        failures.map(
          (item) => item.id,
        ),
      ),
      lightId: light.id,
      lightReference:
          light.reference,
      lightDesignation:
          light.designation,
      lightDesignationAr:
          light.designationAr,
      description:
          description.trim(),
      reportedBy:
          normalizedReporter
                  .isEmpty
              ? 'PUBLIC'
              : normalizedReporter,
      reportedAt:
          DateTime.now(),
      status:
          FailureStatus
              .reported,
      documents:
          documents,
    );

    failures.insert(
      0,
      failure,
    );

    light.status =
        LightStatus.damaged;

    _baseNotifications.insert(
      0,
      AppNotification(
        id: _nextId(
          _baseNotifications
              .map(
                (item) =>
                    item.id,
              ),
        ),
        title:
            'Nouvelle panne signalée',
        titleAr:
            'تم التبليغ عن عطل جديد',
        message:
            'Une panne a été déclarée sur le point ${light.reference}.',
        messageAr:
            'تم التبليغ عن عطل في نقطة الإنارة ${light.reference}.',
        kind:
            NotificationKind.error,
        module:
            NotificationModule
                .lighting,
        createdAt:
            DateTime.now(),
        read: false,
        target:
            'lighting',
      ),
    );

    notifyListeners();

    return failure;
  }

  void createIntervention({
    required int failureId,
    required int technicianId,
    required DateTime date,
    required String description,
    required List<AppDocument>
        documents,
  }) {
    final failure =
        failures.firstWhere(
      (item) =>
          item.id ==
          failureId,
    );

    if (failure.status ==
        FailureStatus.resolved) {
      throw StateError(
        'FAILURE_RESOLVED',
      );
    }

    final active =
        interventions.any(
      (intervention) =>
          intervention.failureId ==
              failureId &&
          !intervention
              .completed,
    );

    if (active) {
      throw StateError(
        'INTERVENTION_EXISTS',
      );
    }

    Technician?
        technician;

    for (final candidate
        in demoTechnicians) {
      if (candidate.id ==
              technicianId &&
          candidate.active) {
        technician =
            candidate;
        break;
      }
    }

    if (technician ==
        null) {
      throw StateError(
        'TECHNICIAN_NOT_FOUND',
      );
    }

    interventions.insert(
      0,
      Intervention(
        id: _nextId(
          interventions.map(
            (item) =>
                item.id,
          ),
        ),
        failureId:
            failureId,
        technicianId:
            technician.id,
        technicianName:
            technician.name,
        technicianNameAr:
            technician.nameAr,
        technicianLocalisation:
            technician
                .localisation,
        interventionDate:
            date,
        description:
            description.trim(),
        completed:
            false,
        photos:
            <AppDocument>[],
        documents:
            documents,
      ),
    );

    failure.status =
        FailureStatus
            .inProgress;

    lights
        .firstWhere(
          (light) =>
              light.id ==
              failure.lightId,
        )
        .status =
        LightStatus
            .underMaintenance;

    _baseNotifications.insert(
      0,
      AppNotification(
        id: _nextId(
          _baseNotifications
              .map(
                (item) =>
                    item.id,
              ),
        ),
        title:
            'Intervention planifiée',
        titleAr:
            'تمت برمجة تدخل',
        message:
            'Une intervention sur ${failure.lightReference} a été affectée à ${technician.name}.',
        messageAr:
            'تمت برمجة تدخل على ${failure.lightReference} وإسناده إلى ${technician.nameAr}.',
        kind:
            NotificationKind.info,
        module:
            NotificationModule
                .lighting,
        createdAt:
            DateTime.now(),
        read: false,
        target:
            'lighting',
      ),
    );

    notifyListeners();
  }

  void completeIntervention(
    int id, {
    required String report,
    required double cost,
    required List<AppDocument>
        photos,
    required List<AppDocument>
        documents,
    DateTime? completedAt,
  }) {
    final intervention =
        interventions.firstWhere(
      (item) =>
          item.id == id,
    );

    if (intervention
        .completed) {
      throw StateError(
        'INTERVENTION_ALREADY_COMPLETED',
      );
    }

    if (report
        .trim()
        .isEmpty) {
      throw StateError(
        'REPORT_REQUIRED',
      );
    }

    if (cost < 0) {
      throw StateError(
        'INVALID_COST',
      );
    }

    if (photos.isEmpty) {
      throw StateError(
        'PHOTO_REQUIRED',
      );
    }

    intervention.completed =
        true;

    intervention.completedAt =
        completedAt ??
        DateTime.now();

    intervention.report =
        report.trim();

    intervention.cost =
        cost;

    intervention.photos
      ..clear()
      ..addAll(
        photos,
      );

    intervention.documents
        .addAll(
      documents,
    );

    final failure =
        failures.firstWhere(
      (item) =>
          item.id ==
          intervention.failureId,
    );

    failure.status =
        FailureStatus
            .resolved;

    final light =
        lights.firstWhere(
      (item) =>
          item.id ==
          failure.lightId,
    );

    light.status =
        LightStatus.active;

    _baseNotifications.insert(
      0,
      AppNotification(
        id: _nextId(
          _baseNotifications
              .map(
                (item) =>
                    item.id,
              ),
        ),
        title:
            'Intervention terminée',
        titleAr:
            'تم إنهاء التدخل',
        message:
            'L’intervention sur ${failure.lightReference} est terminée. Le point est de nouveau actif.',
        messageAr:
            'تم إنهاء التدخل على ${failure.lightReference} وأصبحت نقطة الإنارة نشطة من جديد.',
        kind:
            NotificationKind
                .success,
        module:
            NotificationModule
                .lighting,
        createdAt:
            DateTime.now(),
        read: false,
        target:
            'lighting',
      ),
    );

    notifyListeners();
  }

  void _synchronizeLightStatus(
    int lightId,
  ) {
    final light =
        lights.firstWhere(
      (item) =>
          item.id ==
          lightId,
    );

    final unresolved =
        failures.where(
      (failure) =>
          failure.lightId ==
              lightId &&
          failure.status !=
              FailureStatus
                  .resolved,
    );

    if (unresolved
        .isEmpty) {
      if (light.status ==
              LightStatus
                  .damaged ||
          light.status ==
              LightStatus
                  .underMaintenance) {
        light.status =
            LightStatus
                .active;
      }

      return;
    }

    final failureIds =
        unresolved
            .map(
              (item) =>
                  item.id,
            )
            .toSet();

    final hasActiveIntervention =
        interventions.any(
      (intervention) =>
          failureIds.contains(
            intervention
                .failureId,
          ) &&
          !intervention
              .completed,
    );

    light.status =
        hasActiveIntervention
            ? LightStatus
                .underMaintenance
            : LightStatus
                .damaged;
  }


  // NOTIFICATIONS
  void markNotificationRead(int id) {
    final base = _baseNotifications.where((n) => n.id == id);
    if (base.isNotEmpty) {
      base.first.read = true;
    } else {
      _automaticReadState[id] = true;
    }
    notifyListeners();
  }

  void markAllNotificationsRead() {
    final visibleIds =
        notifications.map((item) => item.id).toSet();

    for (final item in _baseNotifications) {
      if (visibleIds.contains(item.id)) {
        item.read = true;
      }
    }

    for (final item in _buildAutomaticDocumentNotifications()) {
      if (visibleIds.contains(item.id)) {
        _automaticReadState[item.id] = true;
      }
    }

    notifyListeners();
  }

  void deleteNotification(int id) {
    final removed = _baseNotifications.where((n) => n.id == id).isNotEmpty;
    if (removed) {
      _baseNotifications.removeWhere((n) => n.id == id);
    } else {
      _dismissedAutomaticNotifications.add(id);
    }
    notifyListeners();
  }

  List<AppNotification> _buildAutomaticDocumentNotifications() {
    final refs = <_DocumentRef>[];

    void addDocs(NotificationModule module, int resourceId, String fr, String ar, String target, List<AppDocument> docs) {
      for (final doc in docs) {
        refs.add(_DocumentRef(module, resourceId, fr, ar, target, doc));
      }
    }

    for (final b in biens) {
      addDocs(NotificationModule.assets, b.id, b.designation, b.designationAr, 'biens', b.documents);
    }
    for (final a in articles) {
      addDocs(NotificationModule.stock, a.id, a.designation, a.designationAr, 'stock', a.documents);
    }
    for (final m in movements) {
      addDocs(NotificationModule.stock, 100000 + m.id, 'mouvement ${m.articleDesignation}', 'حركة ${m.articleDesignationAr}', 'stock', m.documents);
    }
    for (final r in supplyRequests) {
      addDocs(NotificationModule.stock, 200000 + r.id, 'demande ${r.articleDesignation}', 'طلب ${r.articleDesignationAr}', 'stock', r.documents);
    }
    for (final l in lights) {
      addDocs(NotificationModule.lighting, l.id, l.designation, l.designationAr, 'lighting', l.documents);
    }
    for (final f in failures) {
      addDocs(NotificationModule.lighting, 100000 + f.id, 'panne ${f.lightDesignation}', 'عطل ${f.lightDesignationAr}', 'lighting', f.documents);
    }
    for (final i in interventions) {
      addDocs(NotificationModule.lighting, 200000 + i.id, 'intervention #${i.id}', 'التدخل رقم ${i.id}', 'lighting', i.documents);
    }

    final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    final result = <AppNotification>[];

    for (final ref in refs) {
      final doc = ref.document;
      if (!doc.isOfficial || doc.expirationDate == null) continue;
      final exp = DateTime(doc.expirationDate!.year, doc.expirationDate!.month, doc.expirationDate!.day);
      final reminder = max(0, doc.reminderDaysBefore ?? 0);
      final start = exp.subtract(Duration(days: reminder));
      if (today.isBefore(start)) continue;
      final id = _stableNegativeId('${ref.module.name}:${ref.resourceId}:${doc.id}');
      if (_dismissedAutomaticNotifications.contains(id)) continue;
      final days = exp.difference(today).inDays;
      final expired = days < 0;
      final todayExpiry = days == 0;
      final title = expired
          ? 'Document expiré'
          : todayExpiry
              ? 'Document expirant aujourd’hui'
              : 'Document proche de l’expiration';
      final titleAr = expired
          ? 'وثيقة منتهية الصلاحية'
          : todayExpiry
              ? 'وثيقة تنتهي صلاحيتها اليوم'
              : 'وثيقة تقترب من انتهاء الصلاحية';
      final message = expired
          ? 'Le document « ${doc.name} » associé à ${ref.labelFr} a expiré le ${_date(exp)}.'
          : todayExpiry
              ? 'Le document « ${doc.name} » associé à ${ref.labelFr} expire aujourd’hui.'
              : days == 1
                  ? 'Le document « ${doc.name} » associé à ${ref.labelFr} expire demain.'
                  : 'Le document « ${doc.name} » associé à ${ref.labelFr} expire dans $days jours.';
      final messageAr = expired
          ? 'انتهت صلاحية الوثيقة « ${doc.name} » المرتبطة بـ ${ref.labelAr} بتاريخ ${_date(exp)}.'
          : todayExpiry
              ? 'تنتهي صلاحية الوثيقة « ${doc.name} » المرتبطة بـ ${ref.labelAr} اليوم.'
              : days == 1
                  ? 'تنتهي صلاحية الوثيقة « ${doc.name} » المرتبطة بـ ${ref.labelAr} غداً.'
                  : 'ستنتهي صلاحية الوثيقة « ${doc.name} » المرتبطة بـ ${ref.labelAr} بعد $days يوم.';
      result.add(
        AppNotification(
          id: id,
          title: title,
          titleAr: titleAr,
          message: message,
          messageAr: messageAr,
          kind: expired || todayExpiry ? NotificationKind.error : NotificationKind.warning,
          module: ref.module,
          createdAt: start,
          read: _automaticReadState[id] ?? false,
          target: ref.target,
          automatic: true,
        ),
      );
    }
    return result;
  }

  int _stableNegativeId(String input) {
    var hash = 0;
    for (final unit in input.codeUnits) {
      hash = ((hash * 31) + unit) & 0x7fffffff;
    }
    return -(hash == 0 ? 1 : hash);
  }

  String _date(DateTime value) => '${value.year.toString().padLeft(4, '0')}-${value.month.toString().padLeft(2, '0')}-${value.day.toString().padLeft(2, '0')}';

  int _nextId(Iterable<int> ids) => ids.isEmpty ? 1 : ids.reduce(max) + 1;

  void _seed() {
    final adminRole = AppRole(
      id: 1,
      name: 'ADMIN',
      permissions: {
        ...Permissions.all,
      },
    );

    final managerRole = AppRole(
      id: 2,
      name: 'GESTIONNAIRE',
      permissions: {
        Permissions.getAllAssets,
        Permissions.getAssetInfos,
        Permissions.createAsset,
        Permissions.updateAsset,
        Permissions.assignAsset,
        Permissions.getAllArticles,
        Permissions.createArticle,
        Permissions.updateArticle,
        Permissions.createStockEntry,
        Permissions.createStockExit,
        Permissions.createSupplyRequest,
        Permissions.getStockHistory,
        Permissions.getStockAlerts,
        Permissions.getAllLights,
        Permissions.createLight,
        Permissions.updateLight,
        Permissions.reportFailure,
        Permissions.createIntervention,
        Permissions.updateIntervention,
        Permissions.generateReport,
        Permissions.exportPdf,
        Permissions.exportExcel,
        Permissions.updateProfile,
        Permissions.changePassword,
      },
    );

    final responsibleRole = AppRole(
      id: 3,
      name: 'RESPONSABLE',
      permissions: {
        Permissions.getAllUsers,
        Permissions.getUserInfos,
        Permissions.getAllAssets,
        Permissions.getAssetInfos,
        Permissions.getAllArticles,
        Permissions.validateSupplyRequest,
        Permissions.rejectSupplyRequest,
        Permissions.getStockHistory,
        Permissions.getStockAlerts,
        Permissions.getAllLights,
        Permissions.generateReport,
        Permissions.exportPdf,
        Permissions.exportExcel,
        Permissions.updateProfile,
        Permissions.changePassword,
      },
    );

    final userRole = AppRole(
      id: 4,
      name: 'UTILISATEUR',
      permissions: {
        Permissions.getAllAssets,
        Permissions.getAssetInfos,
        Permissions.getAllArticles,
        Permissions.getStockHistory,
        Permissions.getAllLights,
        Permissions.reportFailure,
        Permissions.generateReport,
        Permissions.updateProfile,
        Permissions.changePassword,
      },
    );

    roles.addAll([
      adminRole,
      managerRole,
      responsibleRole,
      userRole,
    ]);

    users.addAll([
      AppUser(
        id: 1,
        firstName: 'Mohamed',
        lastName: 'Alaoui',
        firstNameAr: 'محمد',
        lastNameAr: 'العلوي',
        email: 'admin@sgpbse.ma',
        gender: 'HOMME',
        phone: '0612345678',
        cin: 'AA123456',
        role: adminRole,
        password: 'Admin@123',
      ),
      AppUser(
        id: 2,
        firstName: 'Agent',
        lastName: 'Communal',
        firstNameAr: 'عون',
        lastNameAr: 'جماعي',
        email: 'agent@sgpbse.ma',
        gender: 'FEMME',
        phone: '0623456789',
        cin: 'AB234567',
        role: managerRole,
        password: 'Agent@123',
      ),
    ]);

    final now = DateTime.now();
    final nearExpiry = DateTime(now.year, now.month, now.day).add(const Duration(days: 5));

    biens.addAll([
      Bien(
        id: 1,
        type: AssetType.vehicle,
        designation:
            'Véhicule utilitaire Renault',
        designationAr:
            'سيارة نفعية رونو',
        status:
            AssetStatus.underMaintenance,
        acquisitionDate:
            DateTime(2022, 5, 10),
        purchaseValue:
            185000,
        assignment:
            '',
        assignmentAr:
            '',
        inventoryId:
            'INV-2022-012',
        registrationNumber:
            '12345-A-33',
        brand:
            'Renault',
        model:
            'Kangoo',
        year:
            2022,
        chassisNumber:
            'VF1EXAMPLE2022',
        fiscalHorsepower:
            6,
        firstRegistrationDate:
            DateTime(2022, 6, 1),
        documents: [
          AppDocument(
            id: 1,
            name:
                'Assurance véhicule',
            type:
                DocumentType.insurance,
            fileName:
                'assurance-renault.pdf',
            uploadDate:
                now,
            category:
                DocumentCategory.official,
            expirationDate:
                nearExpiry,
            reminderDaysBefore:
                7,
          ),
        ],
      ),
      Bien(
        id: 2,
        type:
            AssetType.machine,
        designation:
            'Groupe électrogène',
        designationAr:
            'مولد كهربائي',
        status:
            AssetStatus.available,
        acquisitionDate:
            DateTime(2024, 11, 20),
        purchaseValue:
            72000,
        assignment:
            '',
        assignmentAr:
            '',
        inventoryId:
            'INV-2024-045',
        brand:
            'Honda',
        model:
            'EU70',
        serialNumber:
            'SN-2024-001',
        technicalReference:
            'GEN-HONDA-70',
        machinePowerKw:
            5.5,
        documents:
            [],
      ),
      Bien(
        id: 3,
        type:
            AssetType.realEstate,
        designation:
            'Local administratif',
        designationAr:
            'مقر إداري',
        status:
            AssetStatus.inUse,
        acquisitionDate:
            DateTime(2020, 3, 5),
        purchaseValue:
            850000,
        assignment:
            'Direction générale',
        assignmentAr:
            'الإدارة العامة',
        inventoryId:
            'INV-2020-021',
        address:
            'Centre-ville, Agadir',
        surface:
            180,
        landTitleNumber:
            'TF-AG-2020-884',
        propertyType:
            'Local administratif',
        cadastralReference:
            'CAD-AG-2020-021',
        domain:
            RealEstateDomain.public,
        documents:
            [],
      ),
      Bien(
        id: 4,
        type:
            AssetType.vehicle,
        designation:
            'Véhicule de liaison Dacia',
        designationAr:
            'سيارة مصلحة داسيا',
        status:
            AssetStatus.available,
        acquisitionDate:
            DateTime(2025, 1, 15),
        purchaseValue:
            165000,
        assignment:
            '',
        assignmentAr:
            '',
        inventoryId:
            'INV-2025-010',
        registrationNumber:
            '67890-C-33',
        brand:
            'Dacia',
        model:
            'Logan',
        year:
            2025,
        chassisNumber:
            'DACIA2025EXAMPLE',
        fiscalHorsepower:
            6,
        firstRegistrationDate:
            DateTime(2025, 2, 3),
        documents:
            [],
      ),
      Bien(
        id: 5,
        type:
            AssetType.vehicle,
        designation:
            'Ancien véhicule de service',
        designationAr:
            'سيارة مصلحة قديمة',
        status:
            AssetStatus.disposed,
        acquisitionDate:
            DateTime(2015, 1, 10),
        purchaseValue:
            120000,
        assignment:
            '',
        assignmentAr:
            '',
        inventoryId:
            'INV-2015-004',
        registrationNumber:
            '54321-B-33',
        brand:
            'Dacia',
        model:
            'Logan',
        year:
            2015,
        fiscalHorsepower:
            6,
        firstRegistrationDate:
            DateTime(2015, 2, 2),
        archived:
            true,
        archivedAt:
            DateTime(2026, 6, 15),
        archiveReason:
            'DISPOSED',
        archiveReference:
            'CESSION-2026-001',
        archiveNotes:
            'Bien cédé après décision administrative.',
        sale:
            SaleOperation(
          id: 1,
          partyType:
              PartyType.person,
          buyerName:
              'Ahmed El Mansouri',
          cin:
              'AB123456',
          phone:
              '0611223344',
          saleDate:
              DateTime(2026, 6, 15),
          salePrice:
              45000,
          contractReference:
              'CESSION-2026-001',
          contractFileName:
              'contrat-cession-vehicule.pdf',
          receiptFileName:
              'recu-cession-vehicule.pdf',
        ),
        documents:
            [],
      ),
    ]);

    articles.addAll([
      StockArticle(
        id: 1,
        reference: 'ART-001',
        barcode: '6110000000011',
        brand: 'Double A',
        designation: 'Ramette papier A4',
        designationAr: 'رزمة ورق A4',
        category: 'Fournitures de bureau',
        categoryAr: 'لوازم مكتبية',
        quantity: 120,
        minimumQuantity: 30,
        unit: StockUnit.paquet,
        location: 'Magasin A - Étagère 1',
        locationAr: 'المستودع A - الرف 1',
        unitPriceHt: 48,
        vatRate: 20,
        updatedAt: now,
        documents: [],
      ),
      StockArticle(
        id: 2,
        reference: 'ART-002',
        barcode: '6110000000028',
        brand: 'HP',
        designation: 'Cartouche imprimante noire',
        designationAr: 'خرطوشة طابعة سوداء',
        category: 'Informatique',
        categoryAr: 'معلوميات',
        quantity: 8,
        minimumQuantity: 10,
        unit: StockUnit.unite,
        location: 'Magasin A - Étagère 3',
        locationAr: 'المستودع A - الرف 3',
        unitPriceHt: 310,
        vatRate: 20,
        updatedAt: now,
        documents: [],
      ),
      StockArticle(
        id: 3,
        reference: 'ART-003',
        barcode: '6110000000035',
        brand: 'Philips',
        designation: 'Ampoule LED 50W',
        designationAr: 'مصباح LED 50W',
        category: 'Électricité',
        categoryAr: 'كهرباء',
        quantity: 45,
        minimumQuantity: 20,
        unit: StockUnit.unite,
        location: 'Magasin B - Étagère 2',
        locationAr: 'المستودع B - الرف 2',
        unitPriceHt: 75,
        vatRate: 20,
        updatedAt: now,
        documents: [],
      ),
      StockArticle(
        id: 4,
        reference: 'ART-004',
        barcode: '6110000000042',
        brand: 'Nexans',
        designation: 'Câble électrique',
        designationAr: 'سلك كهربائي',
        category: 'Électricité',
        categoryAr: 'كهرباء',
        quantity: 15,
        minimumQuantity: 25,
        unit: StockUnit.metre,
        location: 'Magasin B - Zone 1',
        locationAr: 'المستودع B - المنطقة 1',
        unitPriceHt: 18.5,
        vatRate: 20,
        updatedAt: now,
        documents: [],
      ),
    ]);

    movements.add(
      StockMovement(
        id: 1,
        articleId: 1,
        articleDesignation: 'Ramette papier A4',
        articleDesignationAr: 'رزمة ورق A4',
        type: MovementType.entry,
        quantity: 50,
        reason: 'Réception fournisseur',
        performedBy: 'Mohamed Alaoui',
        date: now.subtract(const Duration(days: 2)),
        unitPriceHt: 48,
        vatRate: 20,
        documents: [],
        supplierOrBeneficiary: 'Fournisseur Atlas',
        reference: 'ENT-2026-001',
      ),
    );

    supplyRequests.add(
      SupplyRequest(
        id: 1,
        articleId: 1,
        articleDesignation: 'Ramette papier A4',
        articleDesignationAr: 'رزمة ورق A4',
        requestedQuantity: 20,
        requesterId: 2,
        requester: 'Agent Communal',
        reason: 'Besoins mensuels',
        requestDate: now.subtract(const Duration(days: 1)),
        status: SupplyRequestStatus.approved,
        decisionDate: now.subtract(const Duration(hours: 12)),
        documents: [],
      ),
    );

    lights.addAll([
      LightPoint(id: 1, reference: 'LMP-001', designation: 'Lampadaire Avenue Hassan II', designationAr: 'مصباح شارع الحسن الثاني', zone: 'Centre-ville', zoneAr: 'وسط المدينة', address: 'Avenue Hassan II, Agadir', addressAr: 'شارع الحسن الثاني، أكادير', latitude: 30.4207, longitude: -9.5981, status: LightStatus.active, installationDate: DateTime(2024, 2, 1), power: 100, documents: []),
      LightPoint(id: 2, reference: 'LMP-002', designation: 'Lampadaire Quartier Dakhla', designationAr: 'مصباح حي الداخلة', zone: 'Dakhla', zoneAr: 'الداخلة', address: 'Quartier Dakhla, Agadir', addressAr: 'حي الداخلة، أكادير', latitude: 30.4066, longitude: -9.5625, status: LightStatus.underMaintenance, installationDate: DateTime(2023, 9, 15), power: 80, documents: []),
      LightPoint(id: 3, reference: 'LMP-003', designation: 'Lampadaire Hay Mohammadi', designationAr: 'مصباح الحي المحمدي', zone: 'Hay Mohammadi', zoneAr: 'الحي المحمدي', address: 'Hay Mohammadi, Agadir', addressAr: 'الحي المحمدي، أكادير', latitude: 30.4457, longitude: -9.5555, status: LightStatus.active, installationDate: DateTime(2025, 1, 12), power: 100, documents: []),
    ]);

    failures.add(
      FailureReport(id: 1, lightId: 2, lightReference: 'LMP-002', lightDesignation: 'Lampadaire Quartier Dakhla', lightDesignationAr: 'مصباح حي الداخلة', description: 'Lampe éteinte depuis hier.', reportedBy: 'PUBLIC', reportedAt: now.subtract(const Duration(days: 1)), status: FailureStatus.inProgress, documents: []),
    );
    interventions.add(
      Intervention(id: 1, failureId: 1, technician: 'Technicien communal', interventionDate: now, description: 'Diagnostic et remplacement programmé.', completed: false, documents: []),
    );

    _baseNotifications.addAll([
      AppNotification(id: 1, title: 'Stock faible', titleAr: 'مخزون منخفض', message: 'La quantité de la cartouche imprimante noire est inférieure au seuil minimum.', messageAr: 'كمية خرطوشة الطابعة السوداء أقل من الحد الأدنى.', kind: NotificationKind.warning, module: NotificationModule.stock, createdAt: now.subtract(const Duration(hours: 3)), read: false, target: 'stock'),
      AppNotification(id: 2, title: 'Nouvelle panne signalée', titleAr: 'تم التبليغ عن عطل جديد', message: 'Une panne a été déclarée sur le lampadaire LMP-002.', messageAr: 'تم التبليغ عن عطل في نقطة الإنارة LMP-002.', kind: NotificationKind.error, module: NotificationModule.lighting, createdAt: now.subtract(const Duration(hours: 5)), read: false, target: 'lighting'),
      AppNotification(id: 3, title: 'Information système', titleAr: 'معلومة حول النظام', message: 'La version mobile fonctionne actuellement avec des données de démonstration.', messageAr: 'تعمل النسخة المحمولة حالياً ببيانات تجريبية.', kind: NotificationKind.info, module: NotificationModule.system, createdAt: now.subtract(const Duration(days: 1)), read: true, target: 'settings'),
    ]);
  }
}

class _DocumentRef {
  _DocumentRef(this.module, this.resourceId, this.labelFr, this.labelAr, this.target, this.document);
  final NotificationModule module;
  final int resourceId;
  final String labelFr;
  final String labelAr;
  final String target;
  final AppDocument document;
}
