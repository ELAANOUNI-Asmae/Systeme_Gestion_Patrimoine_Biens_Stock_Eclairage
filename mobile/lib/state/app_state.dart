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
  bool notificationsEnabled = true;
  String communeName = 'Commune d’Agadir';
  String communeCity = 'Agadir';

  AppUser? currentUser;

  final List<AppRole> roles = [];
  final List<AppUser> users = [];
  final List<Bien> biens = [];
  final List<StockArticle> articles = [];
  final List<StockMovement> movements = [];
  final List<SupplyRequest> supplyRequests = [];
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
  List<Bien> get archivedBiens => biens.where((item) => item.archived).toList();
  List<StockArticle> get lowStockArticles => articles.where((item) => item.isLowStock).toList();
  List<FailureReport> get unresolvedFailures => failures.where((item) => item.status != FailureStatus.resolved).toList();

  List<AppNotification> get notifications {
    final all = <AppNotification>[
      ..._baseNotifications,
      ..._buildAutomaticDocumentNotifications(),
    ];
    all.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return all;
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
    required bool enabled,
  }) {
    communeName = name.trim().isEmpty ? communeName : name.trim();
    communeCity = city.trim().isEmpty ? communeCity : city.trim();
    notificationsEnabled = enabled;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    await Future<void>.delayed(const Duration(milliseconds: 350));
    final normalized = email.trim().toLowerCase();

    AppUser? found;
    for (final user in users) {
      if (user.email.toLowerCase() == normalized && user.password == password) {
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
    if (id == null) {
      users.insert(
        0,
        AppUser(
          id: _nextId(users.map((e) => e.id)),
          firstName: firstName,
          lastName: lastName,
          firstNameAr: firstNameAr,
          lastNameAr: lastNameAr,
          email: email,
          gender: gender,
          phone: phone,
          cin: cin,
          role: role,
          password: password?.isNotEmpty == true ? password! : '12345678',
        ),
      );
    } else {
      final user = users.firstWhere((u) => u.id == id);
      user
        ..firstName = firstName
        ..lastName = lastName
        ..firstNameAr = firstNameAr
        ..lastNameAr = lastNameAr
        ..email = email
        ..gender = gender
        ..phone = phone
        ..cin = cin
        ..role = role;
      if (password?.isNotEmpty == true) user.password = password!;
    }
    notifyListeners();
  }

  void deleteUser(int id) {
    users.removeWhere((u) => u.id == id);
    notifyListeners();
  }

  // ROLES
  void saveRole({int? id, required String name, required Set<String> permissions}) {
    if (id == null) {
      roles.add(AppRole(id: _nextId(roles.map((e) => e.id)), name: name.toUpperCase(), permissions: {...permissions}));
    } else {
      final role = roles.firstWhere((r) => r.id == id);
      role
        ..name = name.toUpperCase()
        ..permissions = {...permissions};
    }
    notifyListeners();
  }

  void deleteRole(int id) {
    final used = users.any((u) => u.role.id == id);
    if (used) throw StateError('ROLE_IN_USE');
    roles.removeWhere((r) => r.id == id);
    notifyListeners();
  }

  // BIENS
  void saveBien(Bien value) {
    final index = biens.indexWhere((b) => b.id == value.id);
    if (index == -1) {
      biens.insert(0, value);
    } else {
      biens[index] = value;
    }
    notifyListeners();
  }

  int nextBienId() => _nextId(biens.map((e) => e.id));

  void deleteBien(int id) {
    biens.removeWhere((b) => b.id == id);
    notifyListeners();
  }

  void archiveBien(int id, String reason) {
    final bien = biens.firstWhere((b) => b.id == id);
    bien
      ..archived = true
      ..archiveReason = reason
      ..status = AssetStatus.archived;
    notifyListeners();
  }

  void rentBien(int id, String tenant, DateTime startDate, double amount) {
    final bien = biens.firstWhere((b) => b.id == id);
    bien.rentals.insert(
      0,
      RentalOperation(
        id: _nextId(bien.rentals.map((e) => e.id)),
        tenantName: tenant,
        startDate: startDate,
        monthlyAmount: amount,
      ),
    );
    bien.status = AssetStatus.rented;
    notifyListeners();
  }

  void sellBien(int id, String buyer, DateTime saleDate, double price) {
    final bien = biens.firstWhere((b) => b.id == id);
    bien
      ..sale = SaleOperation(
        id: 1,
        buyerName: buyer,
        saleDate: saleDate,
        salePrice: price,
      )
      ..status = AssetStatus.sold
      ..archived = true
      ..archiveReason = 'SOLD';
    notifyListeners();
  }

  // STOCK
  int nextArticleId() => _nextId(articles.map((e) => e.id));

  void saveArticle(StockArticle value) {
    final index = articles.indexWhere((a) => a.id == value.id);
    if (index == -1) {
      articles.insert(0, value);
    } else {
      articles[index] = value;
    }
    notifyListeners();
  }

  void deleteArticle(int id) {
    articles.removeWhere((a) => a.id == id);
    notifyListeners();
  }

  void addStockMovement({
    required int articleId,
    required MovementType type,
    required int quantity,
    required String reason,
    required String partner,
    required String reference,
    required List<AppDocument> documents,
  }) {
    final article = articles.firstWhere((a) => a.id == articleId);
    if (type == MovementType.exit && article.quantity < quantity) {
      throw StateError('INSUFFICIENT_STOCK');
    }
    article.quantity += type == MovementType.entry ? quantity : -quantity;
    article.updatedAt = DateTime.now();
    movements.insert(
      0,
      StockMovement(
        id: _nextId(movements.map((e) => e.id)),
        articleId: article.id,
        articleDesignation: article.designation,
        articleDesignationAr: article.designationAr,
        type: type,
        quantity: quantity,
        reason: reason,
        performedBy: currentUser?.fullName ?? 'Agent',
        date: DateTime.now(),
        documents: documents,
        supplierOrBeneficiary: partner,
        reference: reference,
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
    final article = articles.firstWhere((a) => a.id == articleId);
    supplyRequests.insert(
      0,
      SupplyRequest(
        id: _nextId(supplyRequests.map((e) => e.id)),
        articleId: article.id,
        articleDesignation: article.designation,
        articleDesignationAr: article.designationAr,
        requestedQuantity: quantity,
        requester: currentUser?.fullName ?? 'Agent',
        reason: reason,
        requestDate: DateTime.now(),
        status: SupplyRequestStatus.pending,
        documents: documents,
      ),
    );
    notifyListeners();
  }

  void setSupplyRequestStatus(int id, SupplyRequestStatus status) {
    supplyRequests.firstWhere((r) => r.id == id).status = status;
    notifyListeners();
  }

  // LIGHTING
  int nextLightId() => _nextId(lights.map((e) => e.id));

  void saveLight(LightPoint value) {
    final index = lights.indexWhere((l) => l.id == value.id);
    if (index == -1) {
      lights.insert(0, value);
    } else {
      lights[index] = value;
    }
    notifyListeners();
  }

  void deleteLight(int id) {
    final failureIds = failures.where((f) => f.lightId == id).map((f) => f.id).toSet();
    interventions.removeWhere((i) => failureIds.contains(i.failureId));
    failures.removeWhere((f) => f.lightId == id);
    lights.removeWhere((l) => l.id == id);
    notifyListeners();
  }

  FailureReport createFailure({
    required int lightId,
    required String description,
    required String reportedBy,
    required List<AppDocument> documents,
  }) {
    final hasOpen = failures.any((f) => f.lightId == lightId && f.status != FailureStatus.resolved);
    if (hasOpen) throw StateError('FAILURE_EXISTS');
    final light = lights.firstWhere((l) => l.id == lightId);
    final failure = FailureReport(
      id: _nextId(failures.map((e) => e.id)),
      lightId: light.id,
      lightReference: light.reference,
      lightDesignation: light.designation,
      lightDesignationAr: light.designationAr,
      description: description,
      reportedBy: reportedBy,
      reportedAt: DateTime.now(),
      status: FailureStatus.reported,
      documents: documents,
    );
    failures.insert(0, failure);
    light.status = LightStatus.damaged;
    _baseNotifications.insert(
      0,
      AppNotification(
        id: _nextId(_baseNotifications.map((e) => e.id)),
        title: 'Nouvelle panne signalée',
        titleAr: 'تم التبليغ عن عطل جديد',
        message: 'Une panne a été déclarée sur ${light.reference}.',
        messageAr: 'تم التبليغ عن عطل في نقطة الإنارة ${light.reference}.',
        kind: NotificationKind.error,
        module: NotificationModule.lighting,
        createdAt: DateTime.now(),
        read: false,
        target: 'lighting',
      ),
    );
    notifyListeners();
    return failure;
  }

  void createIntervention({
    required int failureId,
    required String technician,
    required DateTime date,
    required String description,
    required List<AppDocument> documents,
  }) {
    final failure = failures.firstWhere((f) => f.id == failureId);
    if (failure.status == FailureStatus.resolved) throw StateError('FAILURE_RESOLVED');
    final active = interventions.any((i) => i.failureId == failureId && !i.completed);
    if (active) throw StateError('INTERVENTION_EXISTS');
    interventions.insert(
      0,
      Intervention(
        id: _nextId(interventions.map((e) => e.id)),
        failureId: failureId,
        technician: technician,
        interventionDate: date,
        description: description,
        completed: false,
        documents: documents,
      ),
    );
    failure.status = FailureStatus.inProgress;
    lights.firstWhere((l) => l.id == failure.lightId).status = LightStatus.underMaintenance;
    notifyListeners();
  }

  void completeIntervention(int id) {
    final intervention = interventions.firstWhere((i) => i.id == id);
    intervention.completed = true;
    final failure = failures.firstWhere((f) => f.id == intervention.failureId);
    failure.status = FailureStatus.resolved;
    lights.firstWhere((l) => l.id == failure.lightId).status = LightStatus.active;
    notifyListeners();
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
    for (final item in _baseNotifications) {
      item.read = true;
    }
    for (final item in _buildAutomaticDocumentNotifications()) {
      _automaticReadState[item.id] = true;
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
    if (!notificationsEnabled) return [];
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
    final adminRole = AppRole(id: 1, name: 'ADMIN', permissions: {...Permissions.all});
    final agentRole = AppRole(
      id: 2,
      name: 'AGENT',
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
        Permissions.reportFailure,
        Permissions.createIntervention,
        Permissions.generateReport,
        Permissions.exportPdf,
        Permissions.exportExcel,
        Permissions.updateProfile,
        Permissions.changePassword,
      },
    );
    roles.addAll([adminRole, agentRole]);

    users.addAll([
      AppUser(id: 1, firstName: 'Admin', lastName: 'SGPBSE', firstNameAr: 'مدير', lastNameAr: 'النظام', email: 'admin@sgpbse.ma', gender: 'HOMME', phone: '0612345678', cin: 'AA123456', role: adminRole, password: 'Admin@123'),
      AppUser(id: 2, firstName: 'Agent', lastName: 'Communal', firstNameAr: 'عون', lastNameAr: 'جماعي', email: 'agent@sgpbse.ma', gender: 'FEMME', phone: '0623456789', cin: 'AB234567', role: agentRole, password: 'Agent@123'),
    ]);

    final now = DateTime.now();
    final nearExpiry = DateTime(now.year, now.month, now.day).add(const Duration(days: 5));

    biens.addAll([
      Bien(
        id: 1,
        type: AssetType.vehicle,
        designation: 'Véhicule communal Renault',
        designationAr: 'سيارة جماعية رونو',
        status: AssetStatus.inUse,
        acquisitionDate: DateTime(2023, 3, 10),
        purchaseValue: 210000,
        assignment: 'Service technique',
        assignmentAr: 'المصلحة التقنية',
        inventoryId: 'BIEN-001',
        registrationNumber: '12345-A-33',
        brand: 'Renault',
        model: 'Express',
        documents: [
          AppDocument(id: 1, name: 'Assurance véhicule', type: DocumentType.insurance, fileName: 'assurance-renault.pdf', uploadDate: now, category: DocumentCategory.official, expirationDate: nearExpiry, reminderDaysBefore: 7),
        ],
      ),
      Bien(
        id: 2,
        type: AssetType.machine,
        designation: 'Groupe électrogène',
        designationAr: 'مولد كهربائي',
        status: AssetStatus.available,
        acquisitionDate: DateTime(2022, 7, 20),
        purchaseValue: 85000,
        assignment: 'Magasin communal',
        assignmentAr: 'المستودع الجماعي',
        inventoryId: 'BIEN-002',
        brand: 'Kipor',
        serialNumber: 'GEN-99881',
        documents: [],
      ),
      Bien(
        id: 3,
        type: AssetType.realEstate,
        designation: 'Dépôt communal',
        designationAr: 'مستودع جماعي',
        status: AssetStatus.inUse,
        acquisitionDate: DateTime(2018, 1, 1),
        purchaseValue: 935000,
        assignment: 'Patrimoine communal',
        assignmentAr: 'الممتلكات الجماعية',
        inventoryId: 'BIEN-003',
        address: 'Agadir',
        surface: 640,
        documents: [],
      ),
    ]);

    articles.addAll([
      StockArticle(id: 1, reference: 'ART-001', serialNumber: 'SN-PAPER-001', barcode: '6110000000011', designation: 'Ramette papier A4', designationAr: 'رزمة ورق A4', category: 'Fournitures de bureau', categoryAr: 'لوازم مكتبية', quantity: 120, minimumQuantity: 30, unit: StockUnit.paquet, location: 'Magasin A - Étagère 1', locationAr: 'المستودع A - الرف 1', updatedAt: now, documents: []),
      StockArticle(id: 2, reference: 'ART-002', serialNumber: 'SN-CART-002', barcode: '6110000000028', designation: 'Cartouche imprimante noire', designationAr: 'خرطوشة طابعة سوداء', category: 'Informatique', categoryAr: 'معلوميات', quantity: 8, minimumQuantity: 10, unit: StockUnit.unite, location: 'Magasin A - Étagère 3', locationAr: 'المستودع A - الرف 3', updatedAt: now, documents: []),
      StockArticle(id: 3, reference: 'ART-003', serialNumber: 'LED50-0003', barcode: '6110000000035', designation: 'Ampoule LED 50W', designationAr: 'مصباح LED 50W', category: 'Électricité', categoryAr: 'كهرباء', quantity: 45, minimumQuantity: 20, unit: StockUnit.unite, location: 'Magasin B - Étagère 2', locationAr: 'المستودع B - الرف 2', updatedAt: now, documents: []),
      StockArticle(id: 4, reference: 'ART-004', serialNumber: 'CAB-0004', barcode: '6110000000042', designation: 'Câble électrique', designationAr: 'سلك كهربائي', category: 'Électricité', categoryAr: 'كهرباء', quantity: 15, minimumQuantity: 25, unit: StockUnit.metre, location: 'Magasin B - Zone 1', locationAr: 'المستودع B - المنطقة 1', updatedAt: now, documents: []),
    ]);

    movements.add(
      StockMovement(id: 1, articleId: 1, articleDesignation: 'Ramette papier A4', articleDesignationAr: 'رزمة ورق A4', type: MovementType.entry, quantity: 50, reason: 'Réception fournisseur', performedBy: 'Administrateur', date: now.subtract(const Duration(days: 2)), documents: [], supplierOrBeneficiary: 'Fournisseur Atlas', reference: 'ENT-2026-001'),
    );

    supplyRequests.add(
      SupplyRequest(id: 1, articleId: 2, articleDesignation: 'Cartouche imprimante noire', articleDesignationAr: 'خرطوشة طابعة سوداء', requestedQuantity: 20, requester: 'Service administratif', reason: 'Stock presque épuisé', requestDate: now.subtract(const Duration(days: 1)), status: SupplyRequestStatus.pending, documents: []),
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
