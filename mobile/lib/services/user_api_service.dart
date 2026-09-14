import 'dart:convert';

import 'package:http/http.dart'
    as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_models.dart';

class UserApiException
    implements Exception {
  const UserApiException({
    required this.statusCode,
    required this.message,
  });

  final int statusCode;
  final String message;

  @override
  String toString() =>
      'UserApiException($statusCode): $message';
}

class UserApiService {
  static const String _baseUrl =
      String.fromEnvironment(
    'API_BASE_URL',
    defaultValue:
        'http://127.0.0.1:8081',
  );

  static const String _cookieKey =
      'sgpbse_auth_cookie';

  Future<List<AppUser>>
      getAllUsers() async {
    final response =
        await http.get(
      Uri.parse(
        '$_baseUrl/sgpbse/user/all',
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
              AppUser.fromCurrentUserJson(
            Map<String, dynamic>.from(
              item,
            ),
          ),
        )
        .toList();
  }

  Future<AppUser> getUserById(
    int id,
  ) async {
    final response =
        await http.get(
      Uri.parse(
        '$_baseUrl/sgpbse/user/profil/$id',
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

    if (decoded is! Map) {
      throw const UserApiException(
        statusCode: 500,
        message:
            'INVALID_USER_RESPONSE',
      );
    }

    return AppUser
        .fromCurrentUserJson(
      Map<String, dynamic>.from(
        decoded,
      ),
    );
  }

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

  Future<void> createUser({
    required String firstName,
    required String lastName,
    required String firstNameAr,
    required String lastNameAr,
    required String email,
    required String gender,
    required String phone,
    required String cin,
    required int roleId,
    required String password,
  }) async {
    final response =
        await http.post(
      Uri.parse(
        '$_baseUrl/sgpbse/user/create',
      ),
      headers:
          await _headers(),
      body: jsonEncode({
        'firstname_fr':
            firstName.trim(),
        'lastname_fr':
            lastName.trim(),
        'firstname_ar':
            firstNameAr.trim(),
        'lastname_ar':
            lastNameAr.trim(),
        'email':
            email
                .trim()
                .toLowerCase(),
        'gender':
            gender,
        'phone':
            phone.trim(),
        'cin':
            cin
                .trim()
                .toUpperCase(),
        'pwd':
            password,
        'role': {
          'id':
              roleId,
        },
      }),
    );

    _ensureSuccess(
      response,
    );
  }

  Future<void> updateUser({
    required int id,
    required String firstName,
    required String lastName,
    required String firstNameAr,
    required String lastNameAr,
    required String email,
    required String gender,
    required String phone,
    required String cin,
    required int roleId,
  }) async {
    final response =
        await http.put(
      Uri.parse(
        '$_baseUrl/sgpbse/user/update/$id',
      ),
      headers:
          await _headers(),
      body: jsonEncode({
        'firstname_fr':
            firstName.trim(),
        'lastname_fr':
            lastName.trim(),
        'firstname_ar':
            firstNameAr.trim(),
        'lastname_ar':
            lastNameAr.trim(),
        'email':
            email
                .trim()
                .toLowerCase(),
        'gender':
            gender,
        'phone':
            phone.trim(),
        'cin':
            cin
                .trim()
                .toUpperCase(),
        'role': {
          'id':
              roleId,
        },
      }),
    );

    _ensureSuccess(
      response,
    );
  }

  Future<AppUser> getCurrentProfile() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/sgpbse/user/me'),
      headers: await _headers(),
    );
    _ensureSuccess(response);
    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (decoded is! Map) {
      throw const UserApiException(statusCode: 500, message: 'INVALID_USER_RESPONSE');
    }
    return AppUser.fromCurrentUserJson(Map<String, dynamic>.from(decoded));
  }

  Future<AppUser> updateCurrentProfile({
    required String firstName,
    required String lastName,
    required String firstNameAr,
    required String lastNameAr,
    required String phone,
  }) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/sgpbse/user/me'),
      headers: await _headers(),
      body: jsonEncode({
        'firstname_fr': firstName.trim(),
        'lastname_fr': lastName.trim(),
        'firstname_ar': firstNameAr.trim(),
        'lastname_ar': lastNameAr.trim(),
        'phone': phone.trim(),
      }),
    );
    _ensureSuccess(response);
    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (decoded is! Map) {
      throw const UserApiException(statusCode: 500, message: 'INVALID_USER_RESPONSE');
    }
    return AppUser.fromCurrentUserJson(Map<String, dynamic>.from(decoded));
  }

  Future<void> changeCurrentPassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/sgpbse/user/me/password'),
      headers: await _headers(),
      body: jsonEncode({
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      }),
    );
    _ensureSuccess(response);
  }

  Future<void> setActive(
    int id,
    bool active,
  ) async {
    final response =
        await http.post(
      Uri.parse(
        active
            ? '$_baseUrl/sgpbse/user/activate/$id'
            : '$_baseUrl/sgpbse/user/deactivate/$id',
      ),
      headers:
          await _headers(),
    );

    _ensureSuccess(
      response,
    );
  }

  Future<void> deleteUser(
    int id,
  ) async {
    final response =
        await http.delete(
      Uri.parse(
        '$_baseUrl/sgpbse/user/delete/$id',
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
    if (response.statusCode >= 200 &&
        response.statusCode < 300) {
      return;
    }

    throw UserApiException(
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
          jsonDecode(
        body,
      );

      if (decoded is Map) {
        final message =
            decoded['message'] ??
            decoded['detail'] ??
            decoded['error'];

        if (message != null &&
            message
                .toString()
                .trim()
                .isNotEmpty) {
          return message
              .toString();
        }
      }
    } catch (_) {
      // Le backend peut retourner du texte simple.
    }

    return body;
  }
}