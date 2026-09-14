import 'dart:math';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../core/config/permissions.dart';
import '../models/app_document.dart';
import '../models/app_notification.dart';
import '../models/bien.dart';
import '../models/lighting.dart';
import '../models/stock.dart';
import '../models/user_models.dart';
import '../services/auth_api_service.dart';
import '../services/stock_api_service.dart';
import '../services/lighting_api_service.dart';
import '../services/notification_api_service.dart';
import '../services/user_api_service.dart';

class AppState extends ChangeNotifier {
  bool _disposed = false;

  void _notifySafely() {
    if (!_disposed) {
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }

  final StockApiService _stockApi = StockApiService();
  final LightingApiService _lightingApi = LightingApiService();
  final NotificationApiService _notificationApi = NotificationApiService();
  final UserApiService _userApi = UserApiService();
  bool stockLoading = false;
  String? stockError;
  bool lightingLoading = false;
  String? lightingError;

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
  final List<Technician> technicians = [];
  final List<AppNotification> _baseNotifications = [];

  bool get isAuthenticated => currentUser != null;
  bool get isArabic => locale.languageCode == 'ar';

  bool hasPermission(String permission) {
    final user = currentUser;
    return user != null && user.role.permissions.contains(permission);
  }

  List<Bien> get activeBiens => biens.where((item) => !item.archived).toList();
  List<Bien> get archivedBiens => biens
      .where((item) => item.archived && item.status == AssetStatus.disposed)
      .toList();
  List<StockArticle> get lowStockArticles =>
      articles.where((item) => item.isLowStock).toList();
  List<FailureReport> get unresolvedFailures =>
      failures.where((item) => item.status != FailureStatus.resolved).toList();

  List<AppNotification> get notifications {
    final result = List<AppNotification>.from(_baseNotifications);
    result.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return result;
  }

  int get unreadNotificationCount =>
      notifications.where((item) => !item.read).length;

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

  Future<bool> login(
    String email,
    String password,
  ) async {
    try {
      final authService = AuthApiService();

      final authenticated = await authService.login(
        email,
        password,
      );

      if (!authenticated) {
        currentUser = null;
        notifyListeners();
        return false;
      }

      final connectedUser = await authService.getCurrentUser();

      if (connectedUser == null) {
        currentUser = null;

        await authService.clearAuthentication();

        notifyListeners();

        return false;
      }

      currentUser = connectedUser;

      try {
        await loadNotifications();
      } catch (_) {
        // Notifications must never block authentication.
      }

      notifyListeners();

      return true;
    } catch (_) {
      currentUser = null;
      notifyListeners();

      return false;
    }
  }

  void logout() {
    currentUser = null;
    notifyListeners();

    AuthApiService().logout();
  }

  Future<void> updateProfile({
    required String firstName,
    required String lastName,
    required String firstNameAr,
    required String lastNameAr,
    required String phone,
  }) async {
    final updated = await _userApi.updateCurrentProfile(
      firstName: firstName,
      lastName: lastName,
      firstNameAr: firstNameAr,
      lastNameAr: lastNameAr,
      phone: phone,
    );
    currentUser = updated;
    notifyListeners();
  }

  Future<void> changePassword(
      String currentPassword, String nextPassword) async {
    await _userApi.changeCurrentPassword(
      currentPassword: currentPassword,
      newPassword: nextPassword,
    );
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
    final normalizedEmail = email.trim().toLowerCase();

    final duplicateEmail = users.any(
      (user) => user.id != id && user.email.toLowerCase() == normalizedEmail,
    );

    if (duplicateEmail) {
      throw StateError(
        'EMAIL_ALREADY_USED',
      );
    }

    if (id == null) {
      if (password == null || password.isEmpty) {
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
          firstName: firstName,
          lastName: lastName,
          firstNameAr: firstNameAr,
          lastNameAr: lastNameAr,
          email: normalizedEmail,
          gender: gender,
          phone: phone,
          cin: cin,
          role: role,
          password: password,
          isActive: true,
        ),
      );
    } else {
      final user = users.firstWhere(
        (item) => item.id == id,
      );

      user
        ..firstName = firstName
        ..lastName = lastName
        ..firstNameAr = firstNameAr
        ..lastNameAr = lastNameAr
        ..email = normalizedEmail
        ..gender = gender
        ..phone = phone
        ..cin = cin
        ..role = role;
    }

    notifyListeners();
  }

  void setUserActive(
    int id,
    bool active,
  ) {
    if (currentUser?.id == id && !active) {
      throw StateError(
        'CANNOT_DEACTIVATE_SELF',
      );
    }

    final user = users.firstWhere(
      (item) => item.id == id,
    );

    user.isActive = active;

    notifyListeners();
  }

  void deleteUser(
    int id,
  ) {
    if (currentUser?.id == id) {
      throw StateError(
        'CANNOT_DELETE_SELF',
      );
    }

    users.removeWhere(
      (user) => user.id == id,
    );

    notifyListeners();
  }

  // ROLES
  void saveRole({
    int? id,
    required String name,
    required Set<String> permissions,
  }) {
    final normalizedName = name.trim().toUpperCase();

    if (normalizedName.isEmpty || permissions.isEmpty) {
      throw StateError(
        'INVALID_ROLE',
      );
    }

    final duplicate = roles.any(
      (role) => role.id != id && role.name.toUpperCase() == normalizedName,
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
      final role = roles.firstWhere(
        (item) => item.id == id,
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
    final role = roles.firstWhere(
      (item) => item.id == id,
    );

    if (role.name == 'ADMIN') {
      throw StateError(
        'ADMIN_ROLE_PROTECTED',
      );
    }

    final used = users.any(
      (user) => user.role.id == id,
    );

    if (used) {
      throw StateError(
        'ROLE_IN_USE',
      );
    }

    roles.removeWhere(
      (item) => item.id == id,
    );

    notifyListeners();
  }

  // BIENS
  void saveBien(
    Bien value,
  ) {
    final duplicateInventory = biens.any(
      (item) =>
          item.id != value.id &&
          item.inventoryId.toUpperCase() == value.inventoryId.toUpperCase(),
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

    final index = biens.indexWhere(
      (item) => item.id == value.id,
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

  int nextBienId() => _nextId(
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
    final bien = biens.firstWhere(
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
      ..archiveDocumentFileName = documentFileName
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
    final bien = biens.firstWhere(
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
        contractReference: contractReference,
        contractFileName: contractFileName,
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
    final bien = biens.firstWhere(
      (item) => item.id == id,
    );

    if (bien.archived) {
      throw StateError(
        'ASSET_ARCHIVED',
      );
    }

    final existingSaleIds = biens
        .where(
          (item) => item.sale != null,
        )
        .map(
          (item) => item.sale!.id,
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
        contractReference: contractReference,
        contractFileName: contractFileName,
        receiptFileName: receiptFileName,
        notes: notes,
      )
      ..status = AssetStatus.disposed
      ..archived = true
      ..archivedAt = saleDate
      ..archiveReason = 'DISPOSED'
      ..archiveReference = contractReference
      ..archiveDocumentFileName = contractFileName
      ..archiveNotes = notes
      ..assignment = ''
      ..assignmentAr = '';

    notifyListeners();
  }

  // STOCK - données réelles Backend
  int nextArticleId() => _nextId(articles.map((article) => article.id));

  Future<void> loadStockData() async {
    stockLoading = true;
    stockError = null;
    notifyListeners();
    try {
      final results = await Future.wait<dynamic>([
        _stockApi.getArticles(),
        _stockApi.getMovements(),
        _stockApi.getRequests(),
        _stockApi.getRestockAlerts(),
      ]);
      articles
        ..clear()
        ..addAll(results[0] as List<StockArticle>);
      movements
        ..clear()
        ..addAll(results[1] as List<StockMovement>);
      supplyRequests
        ..clear()
        ..addAll(results[2] as List<SupplyRequest>);
      restockAlerts
        ..clear()
        ..addAll(results[3] as List<RestockAlert>);
    } on StockApiException catch (e) {
      stockError = e.message;
    } catch (e) {
      stockError = e.toString();
    } finally {
      stockLoading = false;
      notifyListeners();
    }
  }

  Future<void> saveArticle(StockArticle value) async {
    _validateArticle(value);
    final existingIndex = articles.indexWhere((a) => a.id == value.id);
    try {
      if (existingIndex == -1) {
        await _stockApi.createArticle(value);
      } else {
        final previous =
            List<AppDocument>.from(articles[existingIndex].documents);
        await _stockApi.updateArticle(value, previous);
      }
      await loadStockData();
    } on StockApiException catch (e) {
      throw StateError(e.message);
    }
  }

  void _validateArticle(StockArticle value) {
    if (value.reference.trim().isEmpty) throw StateError('REFERENCE_REQUIRED');
    if (value.barcode.trim().isEmpty) throw StateError('BARCODE_REQUIRED');
    if (value.brand.trim().isEmpty) throw StateError('BRAND_REQUIRED');
    if (value.quantity < 0 || value.minimumQuantity < 0)
      throw StateError('INVALID_QUANTITY');
    if (value.unitPriceHt <= 0 || value.vatRate < 0 || value.vatRate > 100)
      throw StateError('INVALID_PRICE');
  }

  Future<void> deleteArticle(int id) async {
    try {
      await _stockApi.deleteArticle(id);
      await loadStockData();
    } on StockApiException catch (e) {
      throw StateError(e.message);
    }
  }

  int availableForSupplyRequest(int articleId, {int? exceptRequestId}) {
    final article = articles.firstWhere((item) => item.id == articleId);
    final reserved = supplyRequests
        .where((request) =>
            request.articleId == articleId &&
            request.status == SupplyRequestStatus.approved &&
            request.id != exceptRequestId)
        .fold<int>(0, (total, request) => total + request.requestedQuantity);
    return max(0, article.quantity - reserved);
  }

  Future<void> addStockMovement({
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
  }) async {
    final article = articles.firstWhere((a) => a.id == articleId);
    if (quantity <= 0) throw StateError('INVALID_QUANTITY');
    if (reason.trim().isEmpty) throw StateError('REASON_REQUIRED');
    if (type == MovementType.exit && article.quantity < quantity)
      throw StateError('INSUFFICIENT_STOCK:${article.quantity}');
    try {
      await _stockApi.createMovement(
        article: article,
        type: type,
        quantity: quantity,
        reason: reason.trim(),
        partner: partner.trim(),
        reference: reference.trim(),
        documents: documents,
        unitPriceHt: unitPriceHt,
        vatRate: vatRate,
      );
      await loadStockData();
    } on StockApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<void> createSupplyRequest({
    required int articleId,
    required int quantity,
    required String reason,
    required List<AppDocument> documents,
  }) async {
    final user = currentUser;
    if (user == null) throw StateError('AUTH_REQUIRED');
    final article = articles.firstWhere((a) => a.id == articleId);
    if (quantity <= 0) throw StateError('INVALID_QUANTITY');
    if (quantity > article.quantity)
      throw StateError('INSUFFICIENT_STOCK:${article.quantity}');
    if (reason.trim().isEmpty) throw StateError('REASON_REQUIRED');
    try {
      await _stockApi.createRequest(
          articleId: articleId,
          requesterId: user.id,
          quantity: quantity,
          reason: reason.trim(),
          documents: documents);
      await loadStockData();
    } on StockApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<void> createRestockAlert(
      {required int articleId,
      required int quantity,
      required String reason}) async {
    final article = articles.firstWhere((a) => a.id == articleId);
    if (quantity <= article.quantity)
      throw StateError('STOCK_ALREADY_AVAILABLE');
    if (quantity <= 0 || reason.trim().isEmpty)
      throw StateError('INVALID_RESTOCK_ALERT');
    try {
      await _stockApi.createRestockAlert(
          articleId: articleId, quantity: quantity, reason: reason.trim());
      await loadStockData();
    } on StockApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<void> setSupplyRequestStatus(int id, SupplyRequestStatus status,
      {String? rejectionReason}) async {
    try {
      if (status == SupplyRequestStatus.approved) {
        await _stockApi.approveRequest(id);
      } else if (status == SupplyRequestStatus.rejected) {
        if (rejectionReason == null || rejectionReason.trim().isEmpty)
          throw StateError('REJECTION_REASON_REQUIRED');
        await _stockApi.rejectRequest(id, rejectionReason.trim());
      } else {
        throw StateError('INVALID_REQUEST_STATUS');
      }
      await loadStockData();
    } on StockApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<void> confirmSupplyRequestReceived(int id) async {
    try {
      await _stockApi.confirmRequest(id);
      await loadStockData();
    } on StockApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<void> notifyRestockReady(int id) async {
    try {
      await _stockApi.markRestockReady(id);
      await loadStockData();
    } on StockApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<Uint8List> loadStockDocument(AppDocument document) =>
      _stockApi.downloadDocument(document);

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
            (notification) => notification.id,
          ),
        ),
        title: title,
        titleAr: titleAr,
        message: message,
        messageAr: messageAr,
        kind: kind,
        module: NotificationModule.stock,
        createdAt: DateTime.now(),
        read: false,
        target: target,
        recipientUserId: recipientUserId,
        recipientPermission: recipientPermission,
      ),
    );
  }

  // LIGHTING - données réelles Backend
  int nextLightId() => _nextId(lights.map((item) => item.id));

  Future<void> loadLightingData() async {
    lightingLoading = true;
    lightingError = null;
    _notifySafely();
    try {
      final lightData = await _lightingApi.getLights();
      final failureData = hasPermission(Permissions.getAllFailure)
          ? await _lightingApi.getFailures()
          : <FailureReport>[];
      final interventionData = (hasPermission(Permissions.getIntervention) ||
              hasPermission(Permissions.searchInterventions))
          ? await _lightingApi.getInterventions()
          : <Intervention>[];
      final technicianData = hasPermission(Permissions.scheduleIntervention)
          ? await _lightingApi.getTechnicians()
          : <Technician>[];
      lights
        ..clear()
        ..addAll(lightData);
      failures
        ..clear()
        ..addAll(failureData);
      interventions
        ..clear()
        ..addAll(interventionData);
      technicians
        ..clear()
        ..addAll(technicianData);
    } on LightingApiException catch (e) {
      lightingError = e.message;
    } catch (e) {
      lightingError = e.toString();
    } finally {
      lightingLoading = false;
      _notifySafely();
    }
  }

  Future<void> loadPublicLightingData() async {
    lightingLoading = true;
    lightingError = null;
    _notifySafely();
    try {
      final results = await Future.wait<dynamic>([
        _lightingApi.getPublicLights(),
        _lightingApi.getPublicOpenFailures()
      ]);
      lights
        ..clear()
        ..addAll(results[0] as List<LightPoint>);
      failures
        ..clear()
        ..addAll(results[1] as List<FailureReport>);
    } on LightingApiException catch (e) {
      lightingError = e.message;
    } catch (e) {
      lightingError = e.toString();
    } finally {
      lightingLoading = false;
      _notifySafely();
    }
  }

  Future<void> saveLight(LightPoint value) async {
    final index = lights.indexWhere((x) => x.id == value.id);
    try {
      if (index == -1)
        await _lightingApi.createLight(value);
      else
        await _lightingApi.updateLight(
            value, List<AppDocument>.from(lights[index].documents));
      await loadLightingData();
    } on LightingApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<void> deleteLight(int id) async {
    try {
      await _lightingApi.deleteLight(id);
      await loadLightingData();
    } on LightingApiException catch (e) {
      throw StateError(e.message);
    }
  }

  List<Technician> techniciansForLight(int lightId) {
    final light = lights.firstWhere((x) => x.id == lightId);
    final result = technicians.where((x) => x.active).toList();
    result.sort((a, b) {
      if (!a.latitude.isFinite || !a.longitude.isFinite) return 1;
      if (!b.latitude.isFinite || !b.longitude.isFinite) return -1;
      return _lightingDistanceKm(
              light.latitude, light.longitude, a.latitude, a.longitude)
          .compareTo(_lightingDistanceKm(
              light.latitude, light.longitude, b.latitude, b.longitude));
    });
    return result;
  }

  double _lightingDistanceKm(
      double lat1, double lon1, double lat2, double lon2) {
    const r = 6371.0;
    final dLat = (lat2 - lat1) * pi / 180, dLon = (lon2 - lon1) * pi / 180;
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * pi / 180) *
            cos(lat2 * pi / 180) *
            sin(dLon / 2) *
            sin(dLon / 2);
    return r * 2 * atan2(sqrt(a), sqrt(1 - a));
  }

  Future<FailureReport> createFailure(
      {required int lightId,
      required String description,
      required String reportedBy,
      required List<AppDocument> documents}) async {
    try {
      final result = await _lightingApi.createFailure(
          lightId: lightId,
          description: description,
          reportedBy: reportedBy,
          documents: documents);
      await loadLightingData();
      return result;
    } on LightingApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<FailureReport> createPublicFailure(
      {required int lightId,
      required String description,
      required List<AppDocument> documents}) async {
    try {
      final result = await _lightingApi.createPublicFailure(
          lightId: lightId, description: description, documents: documents);
      await loadPublicLightingData();
      return result;
    } on LightingApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<void> createIntervention(
      {required int failureId,
      required int technicianId,
      required DateTime date,
      required String description,
      required List<AppDocument> documents}) async {
    try {
      await _lightingApi.createIntervention(
          failureId: failureId,
          technicianId: technicianId,
          date: date,
          description: description,
          documents: documents);
      await loadLightingData();
    } on LightingApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<void> completeIntervention(int id,
      {required String report,
      required double cost,
      required List<AppDocument> photos,
      required List<AppDocument> documents,
      DateTime? completedAt}) async {
    try {
      await _lightingApi.completeIntervention(
          id: id,
          report: report,
          cost: cost,
          completedAt: completedAt ?? DateTime.now(),
          photos: photos,
          documents: documents);
      await loadLightingData();
    } on LightingApiException catch (e) {
      throw StateError(e.message);
    }
  }

  Future<Uint8List> loadLightingDocument(AppDocument document) =>
      _lightingApi.downloadDocument(document);

  // NOTIFICATIONS - données réelles Backend
  Future<void> loadNotifications() async {
    final data = await _notificationApi.getAll();
    _baseNotifications
      ..clear()
      ..addAll(data);
    notifyListeners();
  }

  Future<void> markNotificationRead(int id) async {
    await _notificationApi.markRead(id);
    await loadNotifications();
  }

  Future<void> markAllNotificationsRead() async {
    await _notificationApi.markAllRead();
    await loadNotifications();
  }

  Future<void> deleteNotification(int id) async {
    await _notificationApi.delete(id);
    await loadNotifications();
  }

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
    final nearExpiry =
        DateTime(now.year, now.month, now.day).add(const Duration(days: 5));

    biens.addAll([
      Bien(
        id: 1,
        type: AssetType.vehicle,
        designation: 'Véhicule utilitaire Renault',
        designationAr: 'سيارة نفعية رونو',
        status: AssetStatus.underMaintenance,
        acquisitionDate: DateTime(2022, 5, 10),
        purchaseValue: 185000,
        assignment: '',
        assignmentAr: '',
        inventoryId: 'INV-2022-012',
        registrationNumber: '12345-A-33',
        brand: 'Renault',
        model: 'Kangoo',
        year: 2022,
        chassisNumber: 'VF1EXAMPLE2022',
        fiscalHorsepower: 6,
        firstRegistrationDate: DateTime(2022, 6, 1),
        documents: [
          AppDocument(
            id: 1,
            name: 'Assurance véhicule',
            type: DocumentType.insurance,
            fileName: 'assurance-renault.pdf',
            uploadDate: now,
            category: DocumentCategory.official,
            expirationDate: nearExpiry,
            reminderDaysBefore: 7,
          ),
        ],
      ),
      Bien(
        id: 2,
        type: AssetType.machine,
        designation: 'Groupe électrogène',
        designationAr: 'مولد كهربائي',
        status: AssetStatus.available,
        acquisitionDate: DateTime(2024, 11, 20),
        purchaseValue: 72000,
        assignment: '',
        assignmentAr: '',
        inventoryId: 'INV-2024-045',
        brand: 'Honda',
        model: 'EU70',
        serialNumber: 'SN-2024-001',
        technicalReference: 'GEN-HONDA-70',
        machinePowerKw: 5.5,
        documents: [],
      ),
      Bien(
        id: 3,
        type: AssetType.realEstate,
        designation: 'Local administratif',
        designationAr: 'مقر إداري',
        status: AssetStatus.inUse,
        acquisitionDate: DateTime(2020, 3, 5),
        purchaseValue: 850000,
        assignment: 'Direction générale',
        assignmentAr: 'الإدارة العامة',
        inventoryId: 'INV-2020-021',
        address: 'Centre-ville, Agadir',
        surface: 180,
        landTitleNumber: 'TF-AG-2020-884',
        propertyType: 'Local administratif',
        cadastralReference: 'CAD-AG-2020-021',
        domain: RealEstateDomain.public,
        documents: [],
      ),
      Bien(
        id: 4,
        type: AssetType.vehicle,
        designation: 'Véhicule de liaison Dacia',
        designationAr: 'سيارة مصلحة داسيا',
        status: AssetStatus.available,
        acquisitionDate: DateTime(2025, 1, 15),
        purchaseValue: 165000,
        assignment: '',
        assignmentAr: '',
        inventoryId: 'INV-2025-010',
        registrationNumber: '67890-C-33',
        brand: 'Dacia',
        model: 'Logan',
        year: 2025,
        chassisNumber: 'DACIA2025EXAMPLE',
        fiscalHorsepower: 6,
        firstRegistrationDate: DateTime(2025, 2, 3),
        documents: [],
      ),
      Bien(
        id: 5,
        type: AssetType.vehicle,
        designation: 'Ancien véhicule de service',
        designationAr: 'سيارة مصلحة قديمة',
        status: AssetStatus.disposed,
        acquisitionDate: DateTime(2015, 1, 10),
        purchaseValue: 120000,
        assignment: '',
        assignmentAr: '',
        inventoryId: 'INV-2015-004',
        registrationNumber: '54321-B-33',
        brand: 'Dacia',
        model: 'Logan',
        year: 2015,
        fiscalHorsepower: 6,
        firstRegistrationDate: DateTime(2015, 2, 2),
        archived: true,
        archivedAt: DateTime(2026, 6, 15),
        archiveReason: 'DISPOSED',
        archiveReference: 'CESSION-2026-001',
        archiveNotes: 'Bien cédé après décision administrative.',
        sale: SaleOperation(
          id: 1,
          partyType: PartyType.person,
          buyerName: 'Ahmed El Mansouri',
          cin: 'AB123456',
          phone: '0611223344',
          saleDate: DateTime(2026, 6, 15),
          salePrice: 45000,
          contractReference: 'CESSION-2026-001',
          contractFileName: 'contrat-cession-vehicule.pdf',
          receiptFileName: 'recu-cession-vehicule.pdf',
        ),
        documents: [],
      ),
    ]);

    // Stock is loaded from the Backend when StockScreen opens.

    // Lighting is loaded from the Backend (public or authenticated).
  }
}
