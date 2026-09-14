import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/app_document.dart';
import '../models/stock.dart';

class StockApiException implements Exception {
  const StockApiException(this.statusCode, this.message);
  final int statusCode;
  final String message;
  @override
  String toString() => message;
}

class StockApiService {
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8081',
  );
  static const String _cookieKey = 'sgpbse_auth_cookie';

  Future<List<StockArticle>> getArticles() async =>
      _list('/sgpbse/item/all', _article);

  Future<StockArticle> getArticle(int id) async =>
      _article(await _object('/sgpbse/item/$id'));

  Future<StockArticle> createArticle(StockArticle article) async {
    final created = _article(await _objectRequest('POST', '/sgpbse/item/create', body: _itemPayload(article)));
    await _uploadMany('/sgpbse/item/joinDoc/${created.id}', article.documents);
    return getArticle(created.id);
  }

  Future<StockArticle> updateArticle(StockArticle article, List<AppDocument> previousDocuments) async {
    final kept = article.documents.map((d) => d.backendId).whereType<int>().toSet();
    for (final old in previousDocuments) {
      final id = old.backendId;
      if (id != null && !kept.contains(id)) {
        await _request('DELETE', '/sgpbse/item/${article.id}/document/$id');
      }
    }
    await _objectRequest('PUT', '/sgpbse/item/update/${article.id}', body: _itemPayload(article));
    await _uploadMany('/sgpbse/item/joinDoc/${article.id}', article.documents);
    return getArticle(article.id);
  }

  Future<void> deleteArticle(int id) async { await _request('DELETE', '/sgpbse/item/delete/$id'); }

  Future<List<StockMovement>> getMovements() async =>
      _list('/sgpbse/stockMovement/all', _movement);

  Future<StockMovement> createMovement({
    required StockArticle article,
    required MovementType type,
    required int quantity,
    required String reason,
    required String partner,
    required String reference,
    required List<AppDocument> documents,
    double? unitPriceHt,
    double? vatRate,
  }) async {
    final path = type == MovementType.entry ? 'entry' : 'exit';
    final raw = await _objectRequest('POST', '/sgpbse/stockMovement/$path/${article.id}', body: {
      'quantity': quantity,
      'reason': reason,
      'supplierOrBeneficiary': partner.trim().isEmpty ? null : partner.trim(),
      'reference': reference.trim().isEmpty ? null : reference.trim(),
      'date': _iso(DateTime.now()),
      'unitPriceHt': unitPriceHt,
      'vatRate': vatRate,
    });
    final movement = _movement(raw);
    await _uploadMany('/sgpbse/stockMovement/joinDoc/${movement.id}', documents);
    return movement;
  }

  Future<List<SupplyRequest>> getRequests() async =>
      _list('/sgpbse/itemRequest/all', _requestModel);

  Future<SupplyRequest> createRequest({
    required int articleId,
    required int requesterId,
    required int quantity,
    required String reason,
    required List<AppDocument> documents,
  }) async {
    final raw = await _objectRequest('POST', '/sgpbse/itemRequest/create/$articleId', body: {
      'providerId': requesterId,
      'requestDate': _iso(DateTime.now()),
      'quantity': quantity,
      'reason': reason,
    });
    final request = _requestModel(raw);
    await _uploadMany('/sgpbse/itemRequest/joinDoc/${request.id}', documents);
    return request;
  }

  Future<SupplyRequest> approveRequest(int id) async =>
      _requestModel(await _objectRequest('POST', '/sgpbse/itemRequest/aprouve/$id'));

  Future<SupplyRequest> rejectRequest(int id, String reason) async {
    final response = await _request('POST', '/sgpbse/itemRequest/reject/$id', rawBody: reason, contentType: 'text/plain; charset=utf-8');
    return _requestModel(_decodeObject(response));
  }

  Future<SupplyRequest> confirmRequest(int id) async =>
      _requestModel(await _objectRequest('POST', '/sgpbse/itemRequest/confirm/$id'));

  Future<List<RestockAlert>> getRestockAlerts() async =>
      _list('/sgpbse/lowStockAlert/restock/all', _restock);

  Future<RestockAlert> createRestockAlert({required int articleId, required int quantity, required String reason}) async =>
      _restock(await _objectRequest('POST', '/sgpbse/lowStockAlert/restock/create/$articleId', body: {
        'requestedQuantity': quantity,
        'reason': reason,
      }));

  Future<RestockAlert> markRestockReady(int id) async =>
      _restock(await _objectRequest('POST', '/sgpbse/lowStockAlert/restock/ready/$id'));

  Future<Uint8List> downloadDocument(AppDocument document) async {
    final id = document.backendId;
    if (id == null) {
      if (document.fileBytes != null) return document.fileBytes!;
      throw const StockApiException(400, 'INVALID_DOCUMENT_ID');
    }
    final response = await _request('GET', '/sgpbse/document/$id/content');
    return response.bodyBytes;
  }

  Map<String, dynamic> _itemPayload(StockArticle a) => {
    'reference': a.reference.trim().toUpperCase(),
    'name': a.designation.trim(),
    'designationAr': a.designationAr.trim(),
    'serialNumber': a.barcode.trim(),
    'category': a.category.trim(),
    'categoryAr': a.categoryAr.trim(),
    'quantity': a.quantity,
    'alertThreshold': a.minimumQuantity,
    'price': a.unitPriceHt,
    'vatRate': a.vatRate,
    'unit': _unitToBackend(a.unit),
    'brand': a.brand.trim(),
    'location_fr': a.location.trim(),
    'location_ar': a.locationAr.trim(),
  };

  StockArticle _article(Map<String, dynamic> j) => StockArticle(
    id: _int(j['id']),
    reference: _text(j['reference']).toUpperCase(),
    barcode: _text(j['serialNumber']),
    brand: _text(j['brand']),
    designation: _text(j['name']),
    designationAr: _text(j['designationAr'], _text(j['name'])),
    category: _text(j['category']),
    categoryAr: _text(j['categoryAr'], _text(j['category'])),
    quantity: _int(j['quantity']),
    minimumQuantity: _int(j['alertThreshold']),
    unit: _unitFromBackend(_text(j['unit'], 'UNITE')),
    location: _text(j['location_fr']),
    locationAr: _text(j['location_ar']),
    unitPriceHt: _double(j['price']),
    vatRate: _double(j['vatRate']),
    updatedAt: DateTime.tryParse(_text(j['updatedAt'])) ?? DateTime.now(),
    documents: _documents(j['documents']),
  );

  StockMovement _movement(Map<String, dynamic> j) => StockMovement(
    id: _int(j['id']), articleId: _int(j['articleId']),
    articleDesignation: _text(j['articleDesignation']),
    articleDesignationAr: _text(j['articleDesignationAr'], _text(j['articleDesignation'])),
    type: _text(j['type']) == 'EXIT' ? MovementType.exit : MovementType.entry,
    quantity: _int(j['quantity']), reason: _text(j['reason']), performedBy: _text(j['performedBy'], 'Agent'),
    date: DateTime.tryParse(_text(j['date'])) ?? DateTime.now(),
    unitPriceHt: _double(j['unitPriceHt']), vatRate: _double(j['vatRate']), documents: _documents(j['documents']),
    supplierOrBeneficiary: _nullableText(j['supplierOrBeneficiary']), reference: _nullableText(j['reference']),
    supplyRequestId: j['supplyRequestId'] == null ? null : _int(j['supplyRequestId']),
  );

  SupplyRequest _requestModel(Map<String, dynamic> j) {
    final rawStatus = _text(j['status'], 'PENDING');
    final status = rawStatus == 'APPROVED' ? SupplyRequestStatus.approved
        : (rawStatus == 'ISSUED' || rawStatus == 'RECEIVED') ? SupplyRequestStatus.received
        : (rawStatus == 'REJECTED' || rawStatus == 'CANCELLED') ? SupplyRequestStatus.rejected
        : SupplyRequestStatus.pending;
    return SupplyRequest(
      id: _int(j['id']), articleId: _int(j['articleId']), articleDesignation: _text(j['articleDesignation']),
      articleDesignationAr: _text(j['articleDesignationAr'], _text(j['articleDesignation'])), requestedQuantity: _int(j['requestedQuantity']),
      requesterId: _int(j['requesterId']), requester: _text(j['requester']), reason: _text(j['reason']),
      requestDate: DateTime.tryParse(_text(j['requestDate'])) ?? DateTime.now(), status: status, documents: _documents(j['documents']),
      rejectionReason: _nullableText(j['rejectionReason']) ?? (rawStatus == 'CANCELLED' ? 'Annulée' : null),
      decisionDate: _date(j['decisionDate']), receivedAt: _date(j['receivedAt']),
    );
  }

  RestockAlert _restock(Map<String, dynamic> j) => RestockAlert(
    id: _int(j['id']), articleId: _int(j['articleId']), articleDesignation: _text(j['articleDesignation']),
    articleDesignationAr: _text(j['articleDesignationAr'], _text(j['articleDesignation'])), requestedQuantity: _int(j['requestedQuantity']),
    availableQuantityAtRequest: _int(j['availableQuantityAtRequest']), requesterId: _int(j['requesterId']), requester: _text(j['requester']),
    reason: _text(j['reason']), createdAt: DateTime.tryParse(_text(j['createdAt'])) ?? DateTime.now(),
    status: _text(j['status']) == 'READY_NOTIFIED' ? RestockAlertStatus.readyNotified : RestockAlertStatus.waiting,
    readyNotifiedAt: _date(j['readyNotifiedAt']),
  );

  List<AppDocument> _documents(dynamic raw) {
    if (raw is! List) return [];
    return raw.whereType<Map>().toList().asMap().entries.map((entry) {
      final j = Map<String, dynamic>.from(entry.value);
      final id = _int(j['id'], -(entry.key + 1));
      final path = _text(j['path']);
      final fileName = path.replaceAll('\\', '/').split('/').lastOrNull ?? (path.isEmpty ? 'document' : path);
      return AppDocument(
        id: id,
        backendId: id > 0 ? id : null,
        name: _text(j['title_fr'], _text(j['title_ar'], fileName)),
        type: _docType(_text(j['type'], 'OTHER')),
        fileName: fileName,
        uploadDate: DateTime.now(),
        category: _text(j['documentType']) == 'DOCUMENT_OFFICIEL' ? DocumentCategory.official : DocumentCategory.attachment,
        expirationDate: _date(j['endDate']),
        reminderDaysBefore: j['alertThreshold'] == null ? null : _int(j['alertThreshold']),
      );
    }).toList();
  }

  Future<List<T>> _list<T>(String path, T Function(Map<String, dynamic>) mapper) async {
    final response = await _request('GET', path);
    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (decoded is! List) throw const StockApiException(500, 'UNEXPECTED_RESPONSE');
    return decoded.whereType<Map>().map((e) => mapper(Map<String, dynamic>.from(e))).toList();
  }

  Future<Map<String, dynamic>> _object(String path) async => _decodeObject(await _request('GET', path));
  Future<Map<String, dynamic>> _objectRequest(String method, String path, {Map<String, dynamic>? body}) async =>
      _decodeObject(await _request(method, path, body: body));

  Map<String, dynamic> _decodeObject(http.Response response) {
    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (decoded is! Map) throw const StockApiException(500, 'UNEXPECTED_RESPONSE');
    return Map<String, dynamic>.from(decoded);
  }

  Future<http.Response> _request(String method, String path, {Map<String, dynamic>? body, String? rawBody, String contentType = 'application/json'}) async {
    final cookie = await _cookie();
    final request = http.Request(method, Uri.parse('$_baseUrl$path'))
      ..headers.addAll({'Accept': 'application/json', 'Cookie': cookie, 'Content-Type': contentType});
    if (body != null) request.body = jsonEncode(body);
    if (rawBody != null) request.body = rawBody;
    final response = await http.Response.fromStream(await request.send());
    if (response.statusCode < 200 || response.statusCode >= 300) throw StockApiException(response.statusCode, _errorMessage(response));
    return response;
  }

  Future<String> _cookie() async {
    final value = (await SharedPreferences.getInstance()).getString(_cookieKey);
    if (value == null || value.trim().isEmpty) throw const StockApiException(401, 'AUTH_REQUIRED');
    return value;
  }

  String _errorMessage(http.Response response) {
    final body = utf8.decode(response.bodyBytes).trim();
    if (body.isEmpty) return 'SERVER_ERROR';
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map) {
        final message = decoded['message'] ?? decoded['error'];
        if (message != null && message.toString().trim().isNotEmpty) return message.toString().trim();
      }
    } catch (_) {}
    return body.replaceAll('"', '').trim();
  }

  Future<void> _uploadMany(String path, List<AppDocument> documents) async {
    for (final d in documents) {
      if (d.fileBytes != null) {
        await _upload(path, d);
      }
    }
  }

  Future<void> _upload(String path, AppDocument d) async {
    final bytes = d.fileBytes;
    if (bytes == null) return;

    final cookie = await _cookie();
    final boundary =
        '----sgpbse-stock-${DateTime.now().microsecondsSinceEpoch}';
    final body = BytesBuilder(copy: false);

    void write(String value) => body.add(utf8.encode(value));

    String safeFileName(String value) => value
        .replaceAll('"', '_')
        .replaceAll('\r', '')
        .replaceAll('\n', '');

    write('--$boundary\r\n');
    write(
      'Content-Disposition: form-data; name="file"; filename="${safeFileName(d.fileName)}"\r\n',
    );
    write('Content-Type: application/octet-stream\r\n\r\n');
    body.add(bytes);
    write('\r\n');

    final data = jsonEncode({
      'title_fr': d.name,
      'title_ar': d.name,
      'path': null,
      'documentType':
          d.isOfficial ? 'DOCUMENT_OFFICIEL' : 'PIECE_JOINTE',
      'type': _docTypeBackend(d.type),
      'endDate': d.isOfficial && d.expirationDate != null
          ? _iso(d.expirationDate!)
          : null,
      'alertThreshold':
          d.isOfficial ? d.reminderDaysBefore ?? 7 : null,
    });

    write('--$boundary\r\n');
    write('Content-Disposition: form-data; name="data"\r\n');
    write('Content-Type: application/json; charset=utf-8\r\n\r\n');
    write(data);
    write('\r\n--$boundary--\r\n');

    final request = http.Request(
      'POST',
      Uri.parse('$_baseUrl$path'),
    )
      ..headers.addAll({
        'Accept': 'application/json',
        'Cookie': cookie,
        'Content-Type': 'multipart/form-data; boundary=$boundary',
      })
      ..bodyBytes = body.takeBytes();

    final response =
        await http.Response.fromStream(await request.send());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw StockApiException(
        response.statusCode,
        _errorMessage(response),
      );
    }
  }

  int _int(dynamic v, [int fallback = 0]) => v is int ? v : int.tryParse(v?.toString() ?? '') ?? fallback;
  double _double(dynamic v, [double fallback = 0]) => v is num ? v.toDouble() : double.tryParse(v?.toString() ?? '') ?? fallback;
  String _text(dynamic v, [String fallback = '']) { final s = v?.toString().trim() ?? ''; return s.isEmpty ? fallback : s; }
  String? _nullableText(dynamic v) { final s = v?.toString().trim() ?? ''; return s.isEmpty ? null : s; }
  DateTime? _date(dynamic v) { final s = _nullableText(v); return s == null ? null : DateTime.tryParse(s); }
  String _iso(DateTime d) => '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  StockUnit _unitFromBackend(String v) => switch (v.toUpperCase()) {
    'BOITE' => StockUnit.boite, 'PAQUET' => StockUnit.paquet, 'LITRE' => StockUnit.litre,
    'KILOGRAMME' => StockUnit.kilogramme, 'METRE' => StockUnit.metre, _ => StockUnit.unite,
  };
  String _unitToBackend(StockUnit v) => switch (v) {
    StockUnit.unite => 'UNITE', StockUnit.boite => 'BOITE', StockUnit.paquet => 'PAQUET', StockUnit.litre => 'LITRE', StockUnit.kilogramme => 'KILOGRAMME', StockUnit.metre => 'METRE',
  };
  DocumentType _docType(String v) => switch (v) {
    'INVOICE' => DocumentType.invoice, 'RECEIPT' => DocumentType.receipt, 'CONTRACT' => DocumentType.contract,
    'REGISTRATION' => DocumentType.registration, 'INSURANCE' => DocumentType.insurance, 'CERTIFICATE' => DocumentType.certificate,
    'DELIVERY_NOTE' => DocumentType.deliveryNote, 'EXIT_VOUCHER' => DocumentType.exitVoucher, 'TECHNICAL_SHEET' => DocumentType.technicalSheet,
    'WARRANTY' => DocumentType.warranty, 'REPORT' => DocumentType.report, 'PHOTO' => DocumentType.photo, _ => DocumentType.other,
  };
  String _docTypeBackend(DocumentType v) => switch (v) {
    DocumentType.invoice => 'INVOICE', DocumentType.receipt => 'RECEIPT', DocumentType.contract => 'CONTRACT', DocumentType.registration => 'REGISTRATION',
    DocumentType.insurance => 'INSURANCE', DocumentType.certificate => 'CERTIFICATE', DocumentType.deliveryNote => 'DELIVERY_NOTE', DocumentType.exitVoucher => 'EXIT_VOUCHER',
    DocumentType.technicalSheet => 'TECHNICAL_SHEET', DocumentType.warranty => 'WARRANTY', DocumentType.report => 'REPORT', DocumentType.photo => 'PHOTO', DocumentType.other => 'OTHER',
  };
}

extension _LastOrNull<T> on List<T> { T? get lastOrNull => isEmpty ? null : last; }

