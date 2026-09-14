import 'package:shared_preferences/shared_preferences.dart';

import '../state/app_state.dart';
import 'auth_api_service.dart';

class LocalAuthService {
  static const String
      _rememberedEmailKey =
      'sgpbse_remembered_email';

  static const String
      _sessionEmailKey =
      'sgpbse_session_email';

  final AuthApiService
      _authApiService =
      AuthApiService();

  Future<String?>
      getRememberedEmail() async {
    final preferences =
        await SharedPreferences
            .getInstance();

    return preferences.getString(
      _rememberedEmailKey,
    );
  }

  Future<void>
      saveRememberedEmail(
    String? email,
  ) async {
    final preferences =
        await SharedPreferences
            .getInstance();

    if (email == null ||
        email.trim().isEmpty) {
      await preferences.remove(
        _rememberedEmailKey,
      );

      return;
    }

    await preferences.setString(
      _rememberedEmailKey,
      email.trim(),
    );
  }

  Future<void> saveSession(
    String email,
  ) async {
    final preferences =
        await SharedPreferences
            .getInstance();

    await preferences.setString(
      _sessionEmailKey,
      email
          .trim()
          .toLowerCase(),
    );
  }

  Future<void>
      clearSession() async {
    final preferences =
        await SharedPreferences
            .getInstance();

    await preferences.remove(
      _sessionEmailKey,
    );

    await _authApiService
        .clearAuthentication();
  }

  Future<bool> restoreSession(
    AppState state,
  ) async {
    final user =
        await _authApiService
            .getCurrentUser();

    if (user == null) {
      final preferences =
          await SharedPreferences
              .getInstance();

      await preferences.remove(
        _sessionEmailKey,
      );

      return false;
    }

    state.currentUser = user;

    return true;
  }
}