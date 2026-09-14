import 'dart:convert';

import 'package:http/http.dart'
    as http;

import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_models.dart';

class RoleApiException
    implements Exception {
  const RoleApiException({
    required this.statusCode,
    required this.message,
  });

  final int statusCode;
  final String message;

  @override
  String toString() =>
      'RoleApiException($statusCode): $message';
}

class RoleApiService {
  static const String _baseUrl =
      String.fromEnvironment(
    'API_BASE_URL',
    defaultValue:
        'http://127.0.0.1:8081',
  );

  static const String _cookieKey =
      'sgpbse_auth_cookie';

  Future<List<AppRole>>
      getAllRoles() async {
    final response =
        await http.get(
      Uri.parse(
        '$_baseUrl/sgpbse/role/all',
      ),
      headers:
          await _headers(),
    );

    _ensureSuccess(
      response,
    );

    final decoded =
        jsonDecode(
      utf8.decode(
        response.bodyBytes,
      ),
    );

    if (decoded is! List) {
      return [];
    }

    return decoded
        .whereType<Map>()
        .map(
          (item) =>
              AppRole.fromJson(
            Map<String, dynamic>.from(
              item,
            ),
          ),
        )
        .toList();
  }

  Future<List<AppPermission>>
      getAllPermissions() async {
    final response =
        await http.get(
      Uri.parse(
        '$_baseUrl/sgpbse/permission/all',
      ),
      headers:
          await _headers(),
    );

    _ensureSuccess(
      response,
    );

    final decoded =
        jsonDecode(
      utf8.decode(
        response.bodyBytes,
      ),
    );

    if (decoded is! List) {
      return [];
    }

    return decoded
        .whereType<Map>()
        .map(
          (item) =>
              AppPermission.fromJson(
            Map<String, dynamic>.from(
              item,
            ),
          ),
        )
        .toList();
  }

  Future<void> createRole({
    required String name,
    required Set<int> permissionIds,
  }) async {
    final response =
        await http.post(
      Uri.parse(
        '$_baseUrl/sgpbse/role/create',
      ),
      headers:
          await _headers(),
      body: jsonEncode({
        'name':
            name
                .trim()
                .toUpperCase(),

        'permission_ids':
            permissionIds
                .toList(),
      }),
    );

    _ensureSuccess(
      response,
    );
  }

  Future<void> updateRole({
    required int id,
    required String name,
    required Set<int> permissionIds,
  }) async {
    final response =
        await http.put(
      Uri.parse(
        '$_baseUrl/sgpbse/role/update/$id',
      ),
      headers:
          await _headers(),
      body: jsonEncode({
        'name':
            name
                .trim()
                .toUpperCase(),

        'permission_ids':
            permissionIds
                .toList(),
      }),
    );

    _ensureSuccess(
      response,
    );
  }

  Future<void> deleteRole(
    int id,
  ) async {
    final response =
        await http.delete(
      Uri.parse(
        '$_baseUrl/sgpbse/role/delete/$id',
      ),
      headers:
          await _headers(),
    );

    _ensureSuccess(
      response,
    );
  }

  Future<Map<String, String>>
      _headers() async {
    final preferences =
        await SharedPreferences
            .getInstance();

    final cookie =
        preferences.getString(
      _cookieKey,
    );

    return {
      'Content-Type':
          'application/json',

      'Accept':
          'application/json',

      if (cookie != null)
        'Cookie':
            cookie,
    };
  }

  void _ensureSuccess(
    http.Response response,
  ) {
    if (
      response.statusCode >= 200 &&
      response.statusCode < 300
    ) {
      return;
    }

    throw RoleApiException(
      statusCode:
          response.statusCode,

      message:
          _errorMessage(
        response,
      ),
    );
  }

  String _errorMessage(
    http.Response response,
  ) {
    final body =
        utf8.decode(
      response.bodyBytes,
      allowMalformed: true,
    );

    if (body.trim().isEmpty) {
      return 'HTTP_${response.statusCode}';
    }

    try {
      final decoded =
          jsonDecode(body);

      if (decoded is Map) {
        final message =
            decoded['message'] ??
            decoded['detail'] ??
            decoded['error'];

        if (
          message != null &&
          message
              .toString()
              .trim()
              .isNotEmpty
        ) {
          return message
              .toString();
        }
      }
    } catch (_) {}

    return body;
  }
}