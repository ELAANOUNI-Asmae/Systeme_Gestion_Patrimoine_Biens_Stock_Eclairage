import 'dart:convert';

import 'package:http/http.dart'
    as http;

import 'package:shared_preferences/shared_preferences.dart';

class DashboardApiException
    implements Exception {
  const DashboardApiException({
    required this.statusCode,
    required this.message,
  });

  final int statusCode;
  final String message;

  @override
  String toString() {
    return 'DashboardApiException($statusCode): $message';
  }
}

class DashboardApiService {
  static const String _baseUrl =
      String.fromEnvironment(
    'API_BASE_URL',
    defaultValue:
        'http://127.0.0.1:8081',
  );

  static const String _cookieKey =
      'sgpbse_auth_cookie';

  static const String _dashboardPath =
      '/sgpbse/dashboard';

  Future<String> getUsernameFr() {
    return _getString(
      '$_dashboardPath/username_fr',
    );
  }

  Future<String> getUsernameAr() {
    return _getString(
      '$_dashboardPath/username_ar',
    );
  }

  Future<String> getRoleName() {
    return _getString(
      '$_dashboardPath/role_name',
    );
  }

  Future<int> countUsers() {
    return _getInt(
      '$_dashboardPath/count_users',
    );
  }

  Future<int> countAssets() {
    return _getInt(
      '$_dashboardPath/count_assets',
    );
  }

  Future<int> countItems() {
    return _getInt(
      '$_dashboardPath/count_items',
    );
  }

  Future<int> countLightPoints() {
    return _getInt(
      '$_dashboardPath/count_light_points',
    );
  }

  Future<int> countFailures() {
    return _getInt(
      '$_dashboardPath/count_failures',
    );
  }

  Future<int> countLowStockAlerts() {
    return _getInt(
      '$_dashboardPath/count_low_stock_alerts',
    );
  }

  Future<int> countAssetsByStatus(
    String status,
  ) {
    return _getIntWithBody(
      '$_dashboardPath/count_assets_by_status',
      status,
    );
  }

  Future<int> countStockMovementByPeriod(
    int days,
  ) {
    return _getIntWithBody(
      '$_dashboardPath/count_stock_movement_by_period',
      days,
    );
  }

  Future<List<dynamic>>
      getLowStockAlertsByPeriod(
    int days,
  ) async {
    final response =
        await _getWithBody(
      '$_dashboardPath/get_low_stock_alerts_by_period',
      days,
    );

    final decoded =
        _decodeJson(
      response,
    );

    if (decoded is List) {
      return decoded;
    }

    throw DashboardApiException(
      statusCode:
          response.statusCode,
      message:
          'INVALID_DASHBOARD_RESPONSE',
    );
  }

  Future<String> _getString(
    String path,
  ) async {
    final response =
        await _get(
      path,
    );

    return utf8
        .decode(
          response.bodyBytes,
        )
        .trim()
        .replaceAll(
          '"',
          '',
        );
  }

  Future<int> _getInt(
    String path,
  ) async {
    final response =
        await _get(
      path,
    );

    return _parseInt(
      response,
    );
  }

  Future<int> _getIntWithBody(
    String path,
    Object value,
  ) async {
    final response =
        await _getWithBody(
      path,
      value,
    );

    return _parseInt(
      response,
    );
  }

  int _parseInt(
    http.Response response,
  ) {
    final raw =
        utf8
            .decode(
              response.bodyBytes,
            )
            .trim();

    final value =
        int.tryParse(
      raw,
    );

    if (value == null) {
      throw DashboardApiException(
        statusCode:
            response.statusCode,
        message:
            'INVALID_NUMBER_RESPONSE',
      );
    }

    return value;
  }

  Future<http.Response> _get(
    String path,
  ) async {
    final cookie =
        await _getCookie();

    final response =
        await http.get(
      Uri.parse(
        '$_baseUrl$path',
      ),
      headers: {
        'Accept':
            'application/json',
        if (cookie != null)
          'Cookie':
              cookie,
      },
    );

    _ensureSuccess(
      response,
    );

    return response;
  }

  Future<http.Response> _getWithBody(
    String path,
    Object value,
  ) async {
    final cookie =
        await _getCookie();

    final request =
        http.Request(
      'GET',
      Uri.parse(
        '$_baseUrl$path',
      ),
    );

    request.headers.addAll({
      'Accept':
          'application/json',
      'Content-Type':
          'application/json',
      if (cookie != null)
        'Cookie':
            cookie,
    });

    request.body =
        jsonEncode(
      value,
    );

    final streamedResponse =
        await request.send();

    final response =
        await http.Response
            .fromStream(
      streamedResponse,
    );

    _ensureSuccess(
      response,
    );

    return response;
  }

  dynamic _decodeJson(
    http.Response response,
  ) {
    final raw =
        utf8.decode(
      response.bodyBytes,
    );

    if (raw.trim().isEmpty) {
      return null;
    }

    return jsonDecode(
      raw,
    );
  }

  Future<String?>
      _getCookie() async {
    final preferences =
        await SharedPreferences
            .getInstance();

    return preferences.getString(
      _cookieKey,
    );
  }

  void _ensureSuccess(
    http.Response response,
  ) {
    if (response.statusCode >=
            200 &&
        response.statusCode <
            300) {
      return;
    }

    throw DashboardApiException(
      statusCode:
          response.statusCode,
      message:
          utf8.decode(
        response.bodyBytes,
      ),
    );
  }
}