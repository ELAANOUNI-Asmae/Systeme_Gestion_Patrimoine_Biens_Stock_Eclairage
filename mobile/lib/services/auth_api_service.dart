import 'dart:convert';

import 'package:http/http.dart'
    as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_models.dart';

class AuthApiException
    implements Exception {
  const AuthApiException({
    required this.statusCode,
    required this.message,
  });

  final int statusCode;
  final String message;

  @override
  String toString() =>
      'AuthApiException($statusCode): $message';
}

class AuthApiService {
  static const String _baseUrl =
      String.fromEnvironment(
    'API_BASE_URL',
    defaultValue:
        'http://127.0.0.1:8081',
  );

  static const String _cookieKey =
      'sgpbse_auth_cookie';

  Future<bool> login(
    String email,
    String password,
  ) async {
    try {
      final response =
          await http.post(
        Uri.parse(
          '$_baseUrl/sgpbse/auth/login',
        ),
        headers: const {
          'Content-Type':
              'application/json',
          'Accept':
              'application/json',
        },
        body: jsonEncode({
          'email':
              email
                  .trim()
                  .toLowerCase(),
          'pwd':
              password,
        }),
      );

      if (response.statusCode !=
          200) {
        return false;
      }

      final setCookie =
          response
              .headers[
                  'set-cookie'];

      final jwtCookie =
          _extractJwtCookie(
        setCookie,
      );

      if (jwtCookie == null) {
        return false;
      }

      final preferences =
          await SharedPreferences
              .getInstance();

      await preferences.setString(
        _cookieKey,
        jwtCookie,
      );

      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void>
      requestPasswordReset(
    String email,
  ) async {
    final response =
        await http.post(
      Uri.parse(
        '$_baseUrl/sgpbse/auth/forgot_password',
      ),
      headers: const {
        'Content-Type':
            'application/json',
        'Accept':
            'application/json',
      },
      body: jsonEncode({
        'email':
            email
                .trim()
                .toLowerCase(),
      }),
    );

    if (response.statusCode <
            200 ||
        response.statusCode >=
            300) {
      throw AuthApiException(
        statusCode:
            response.statusCode,
        message:
            _errorMessage(
          response,
        ),
      );
    }
  }

  Future<void> resetPassword({
    required String token,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final response =
        await http.post(
      Uri.parse(
        '$_baseUrl/sgpbse/auth/reset_password',
      ),
      headers: const {
        'Content-Type':
            'application/json',
        'Accept':
            'application/json',
      },
      body: jsonEncode({
        'token':
            token.trim(),
        'newPassword':
            newPassword,
        'confirmPassword':
            confirmPassword,
      }),
    );

    if (response.statusCode <
            200 ||
        response.statusCode >=
            300) {
      throw AuthApiException(
        statusCode:
            response.statusCode,
        message:
            _errorMessage(
          response,
        ),
      );
    }
  }

  Future<AppUser?>
      getCurrentUser() async {
    final cookie =
        await _getCookie();

    if (cookie == null) {
      return null;
    }

    final response =
        await http.get(
      Uri.parse(
        '$_baseUrl/sgpbse/user/me',
      ),
      headers: {
        'Accept':
            'application/json',
        'Cookie':
            cookie,
      },
    );

    if (response.statusCode ==
        200) {
      final decoded =
          jsonDecode(
        utf8.decode(
          response.bodyBytes,
        ),
      );

      if (decoded
          is Map<String, dynamic>) {
        return AppUser
            .fromCurrentUserJson(
          decoded,
        );
      }

      if (decoded is Map) {
        return AppUser
            .fromCurrentUserJson(
          Map<String, dynamic>.from(
            decoded,
          ),
        );
      }

      return null;
    }

    if (response.statusCode ==
            401 ||
        response.statusCode ==
            403) {
      await clearAuthentication();
    }

    return null;
  }

  Future<void> logout() async {
    final cookie =
        await _getCookie();

    try {
      await http.post(
        Uri.parse(
          '$_baseUrl/sgpbse/auth/logout',
        ),
        headers: {
          if (cookie != null)
            'Cookie':
                cookie,
        },
      );
    } finally {
      await clearAuthentication();
    }
  }

  Future<void>
      clearAuthentication() async {
    final preferences =
        await SharedPreferences
            .getInstance();

    await preferences.remove(
      _cookieKey,
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

  String? _extractJwtCookie(
    String? setCookie,
  ) {
    if (setCookie == null ||
        setCookie.isEmpty) {
      return null;
    }

    final match = RegExp(
      r'jwt-token=[^;,\s]+',
    ).firstMatch(
      setCookie,
    );

    return match?.group(0);
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
            decoded['message'];

        if (message != null &&
            message
                .toString()
                .trim()
                .isNotEmpty) {
          return message
              .toString();
        }

        final error =
            decoded['error'];

        if (error != null) {
          return error.toString();
        }

        final detail =
            decoded['detail'];

        if (detail != null) {
          return detail.toString();
        }
      }
    } catch (_) {
      // Le backend peut retourner du texte simple.
    }

    return body;
  }
}