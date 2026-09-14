import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/app_notification.dart';

class NotificationApiException implements Exception {
  const NotificationApiException(this.statusCode, this.message);
  final int statusCode;
  final String message;

  @override
  String toString() => 'NotificationApiException($statusCode): $message';
}

class NotificationApiService {
  static const _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8081',
  );
  static const _cookieKey = 'sgpbse_auth_cookie';

  Future<List<AppNotification>> getAll() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/sgpbse/notif/me'),
      headers: await _headers(),
    );
    _ensure(response);
    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (decoded is! List) return [];
    return decoded
        .whereType<Map>()
        .map((item) => _map(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<void> markRead(int id) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/sgpbse/notif/me/$id/read'),
      headers: await _headers(),
    );
    _ensure(response);
  }

  Future<void> markAllRead() async {
    final response = await http.post(
      Uri.parse('$_baseUrl/sgpbse/notif/me/read-all'),
      headers: await _headers(),
    );
    _ensure(response);
  }

  Future<void> delete(int id) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/sgpbse/notif/me/$id'),
      headers: await _headers(),
    );
    _ensure(response);
  }

  AppNotification _map(Map<String, dynamic> json) {
    final title = (json['title'] ?? 'Notification').toString();
    final message = (json['message'] ?? '').toString();
    final classification = _classify('$title $message');
    return AppNotification(
      id: _int(json['id']),
      title: title,
      titleAr: _arabicTitle(title),
      message: message,
      messageAr: message,
      kind: classification.$2,
      module: classification.$1,
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
      read: json['readStatus'] == true,
      target: classification.$3,
    );
  }

  (NotificationModule, NotificationKind, String?) _classify(String raw) {
    final text = raw.toLowerCase();
    if (text.contains('stock') || text.contains('article') || text.contains('réappro') || text.contains('reappro') || text.contains('fourniture')) {
      return (NotificationModule.stock, text.contains('faible') || text.contains('alerte') ? NotificationKind.warning : NotificationKind.info, 'stock');
    }
    if (text.contains('panne') || text.contains('éclairage') || text.contains('eclairage') || text.contains('point lumineux') || text.contains('intervention')) {
      return (NotificationModule.lighting, text.contains('panne') && !text.contains('régl') && !text.contains('résolu') ? NotificationKind.error : NotificationKind.info, 'lighting');
    }
    if (text.contains('document') || text.contains('échéance') || text.contains('echeance') || text.contains('maintenance') || text.contains('location') || text.contains('accident') || text.contains('cession')) {
      return (NotificationModule.assets, text.contains('alerte') || text.contains('urgent') || text.contains('expir') ? NotificationKind.warning : NotificationKind.info, 'assets');
    }
    return (NotificationModule.system, NotificationKind.info, null);
  }

  String _arabicTitle(String title) {
    final value = title.toLowerCase();
    if (value.contains('échéance') || value.contains('echeance')) return 'تنبيه استحقاق وثيقة';
    if (value.contains('panne')) return 'إشعار عطل';
    if (value.contains('stock')) return 'إشعار المخزون';
    if (value.contains('intervention')) return 'إشعار تدخل';
    return title;
  }

  int _int(dynamic value) => int.tryParse(value?.toString() ?? '') ?? 0;

  Future<Map<String, String>> _headers() async {
    final preferences = await SharedPreferences.getInstance();
    final cookie = preferences.getString(_cookieKey);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (cookie != null && cookie.trim().isNotEmpty) 'Cookie': cookie,
    };
  }

  void _ensure(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = utf8.decode(response.bodyBytes, allowMalformed: true);
    throw NotificationApiException(response.statusCode, body.trim().isEmpty ? 'HTTP_${response.statusCode}' : body);
  }
}
