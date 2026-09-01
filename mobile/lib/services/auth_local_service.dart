import 'package:shared_preferences/shared_preferences.dart';

import '../state/app_state.dart';

class LocalAuthService {
  static const String _rememberedEmailKey =
      'sgpbse_remembered_email';

  static const String _sessionEmailKey =
      'sgpbse_session_email';

  Future<String?> getRememberedEmail() async {
    final preferences =
        await SharedPreferences.getInstance();

    return preferences.getString(
      _rememberedEmailKey,
    );
  }

  Future<void> saveRememberedEmail(
    String? email,
  ) async {
    final preferences =
        await SharedPreferences.getInstance();

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
        await SharedPreferences.getInstance();

    await preferences.setString(
      _sessionEmailKey,
      email.trim().toLowerCase(),
    );
  }

  Future<void> clearSession() async {
    final preferences =
        await SharedPreferences.getInstance();

    await preferences.remove(
      _sessionEmailKey,
    );
  }

  Future<bool> restoreSession(
    AppState state,
  ) async {
    final preferences =
        await SharedPreferences.getInstance();

    final sessionEmail =
        preferences.getString(
      _sessionEmailKey,
    );

    if (sessionEmail == null) {
      return false;
    }

    for (final user in state.users) {
      if (user.email.toLowerCase() ==
              sessionEmail.toLowerCase() &&
          user.isActive) {
        state.currentUser = user;
        return true;
      }
    }

    await preferences.remove(
      _sessionEmailKey,
    );

    return false;
  }

  bool emailExists(
    AppState state,
    String email,
  ) {
    final normalizedEmail =
        email.trim().toLowerCase();

    return state.users.any(
      (user) =>
          user.email.toLowerCase() ==
          normalizedEmail,
    );
  }

  bool resetPassword(
    AppState state,
    String email,
    String newPassword,
  ) {
    return state.resetPasswordForEmail(
      email,
      newPassword,
    );
  }
}
