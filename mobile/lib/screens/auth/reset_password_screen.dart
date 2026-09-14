import 'package:flutter/material.dart';

import '../../core/localization/bilingual.dart';
import '../../services/auth_api_service.dart';
import 'login_screen.dart';

class ResetPasswordScreen
    extends StatefulWidget {
  const ResetPasswordScreen({
    super.key,
    required this.email,
  });

  final String email;

  @override
  State<ResetPasswordScreen>
      createState() =>
          _ResetPasswordScreenState();
}

class _ResetPasswordScreenState
    extends State<ResetPasswordScreen> {
  final _formKey =
      GlobalKey<FormState>();

  final _tokenController =
      TextEditingController();

  final _passwordController =
      TextEditingController();

  final _confirmationController =
      TextEditingController();

  final _authService =
      AuthApiService();

  bool _loading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmation = true;

  static final RegExp _passwordRegex =
      RegExp(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$',
  );

  static final RegExp _uuidRegex =
      RegExp(
    r'^[0-9a-fA-F]{8}-'
    r'[0-9a-fA-F]{4}-'
    r'[0-9a-fA-F]{4}-'
    r'[0-9a-fA-F]{4}-'
    r'[0-9a-fA-F]{12}$',
  );

  @override
  void dispose() {
    _tokenController.dispose();
    _passwordController.dispose();
    _confirmationController.dispose();
    super.dispose();
  }

  String? _validateToken(
    String? value,
  ) {
    final token =
        _extractToken(
      value ?? '',
    );

    if (token == null) {
      return context.tr(
        'Collez le lien reçu par e-mail ou le jeton de réinitialisation.',
        'ألصق الرابط الذي توصلت به عبر البريد الإلكتروني أو رمز إعادة التعيين.',
      );
    }

    return null;
  }

  String? _validatePassword(
    String? value,
  ) {
    final password =
        value ?? '';

    if (password.isEmpty) {
      return context.tr(
        'Veuillez saisir un nouveau mot de passe.',
        'يرجى إدخال كلمة مرور جديدة.',
      );
    }

    if (password.length < 8) {
      return context.tr(
        'Le mot de passe doit contenir au moins 8 caractères.',
        'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.',
      );
    }

    if (password.length > 50) {
      return context.tr(
        'Le mot de passe ne doit pas dépasser 50 caractères.',
        'يجب ألا تتجاوز كلمة المرور 50 حرفاً.',
      );
    }

    if (!_passwordRegex.hasMatch(
      password,
    )) {
      return context.tr(
        'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial (@\$!%*?&).',
        'يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم ورمز خاص (@\$!%*?&).',
      );
    }

    return null;
  }

  String? _validateConfirmation(
    String? value,
  ) {
    if (value == null ||
        value.isEmpty) {
      return context.tr(
        'Veuillez confirmer le mot de passe.',
        'يرجى تأكيد كلمة المرور.',
      );
    }

    if (value !=
        _passwordController.text) {
      return context.tr(
        'Les mots de passe ne correspondent pas.',
        'كلمتا المرور غير متطابقتين.',
      );
    }

    return null;
  }

  String? _extractToken(
    String input,
  ) {
    var value = input.trim();

    if (value.isEmpty) {
      return null;
    }

    // Quoted-printable mail encoding.
    value = value
        .replaceAll('=\r\n', '')
        .replaceAll('=\n', '')
        .replaceAll('=3D', '=')
        .replaceAll(RegExp(r'\s+'), '');

    String candidate = value;

    final uri = Uri.tryParse(value);

    final queryToken =
        uri?.queryParameters['token'];

    if (queryToken != null &&
        queryToken.isNotEmpty) {
      candidate = queryToken;
    } else {
      final marker =
          value.indexOf('token=');

      if (marker >= 0) {
        candidate = value.substring(
          marker + 'token='.length,
        );

        final ampersand =
            candidate.indexOf('&');

        if (ampersand >= 0) {
          candidate =
              candidate.substring(
            0,
            ampersand,
          );
        }
      }
    }

    candidate =
        Uri.decodeComponent(
      candidate,
    ).trim();

    if (_uuidRegex.hasMatch(
      candidate,
    )) {
      return candidate;
    }

    // Protection for copied raw Mailtrap
    // values such as "3D<uuid>".
    if (candidate.startsWith('3D')) {
      final without3d =
          candidate.substring(2);

      if (_uuidRegex.hasMatch(
        without3d,
      )) {
        return without3d;
      }
    }

    // Remove stray "=" only when the
    // resulting value is a valid UUID.
    final withoutEquals =
        candidate.replaceAll(
      '=',
      '',
    );

    if (_uuidRegex.hasMatch(
      withoutEquals,
    )) {
      return withoutEquals;
    }

    if (withoutEquals.startsWith(
      '3D',
    )) {
      final clean =
          withoutEquals.substring(2);

      if (_uuidRegex.hasMatch(clean)) {
        return clean;
      }
    }

    return null;
  }

  Future<void> _submit() async {
    if (_loading ||
        !_formKey.currentState!
            .validate()) {
      return;
    }

    final token = _extractToken(
      _tokenController.text,
    );

    if (token == null) {
      return;
    }

    setState(() {
      _loading = true;
    });

    try {
      await _authService.resetPassword(
        token: token,
        newPassword:
            _passwordController.text,
        confirmPassword:
            _confirmationController.text,
      );

      if (!mounted) {
        return;
      }

      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (dialogContext) =>
            AlertDialog(
          icon: const Icon(
            Icons
                .check_circle_outline,
            color: Colors.green,
            size: 48,
          ),
          title: Text(
            context.tr(
              'Mot de passe réinitialisé',
              'تمت إعادة تعيين كلمة المرور',
            ),
          ),
          content: Text(
            context.tr(
              'Votre mot de passe a été modifié avec succès.',
              'تم تغيير كلمة المرور بنجاح.',
            ),
          ),
          actions: [
            FilledButton(
              onPressed: () =>
                  Navigator.of(
                dialogContext,
              ).pop(),
              child: Text(
                context.tr(
                  'Se connecter',
                  'تسجيل الدخول',
                ),
              ),
            ),
          ],
        ),
      );

      if (!mounted) {
        return;
      }

      Navigator.of(context)
          .pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) =>
              const LoginScreen(),
        ),
        (_) => false,
      );
    } on AuthApiException {
      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Le lien est invalide, expiré ou déjà utilisé. Demandez un nouveau lien.',
              'الرابط غير صالح أو منتهي الصلاحية أو تم استعماله مسبقاً. اطلب رابطاً جديداً.',
            ),
          ),
        ),
      );
    } catch (_) {
      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Impossible de contacter le serveur.',
              'تعذر الاتصال بالخادم.',
            ),
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(
    BuildContext context,
  ) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          context.tr(
            'Réinitialiser le mot de passe',
            'إعادة تعيين كلمة المرور',
          ),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding:
              const EdgeInsets.all(22),
          child: ConstrainedBox(
            constraints:
                const BoxConstraints(
              maxWidth: 480,
            ),
            child: Card(
              child: Padding(
                padding:
                    const EdgeInsets.all(
                  22,
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment:
                        CrossAxisAlignment
                            .stretch,
                    children: [
                      Text(
                        widget.email,
                        textAlign:
                            TextAlign
                                .center,
                        style: Theme.of(
                          context,
                        )
                            .textTheme
                            .bodyMedium
                            ?.copyWith(
                              fontWeight:
                                  FontWeight
                                      .w700,
                            ),
                      ),
                      const SizedBox(
                        height: 8,
                      ),
                      Text(
                        context.tr(
                          'Collez ci-dessous le lien reçu par e-mail. Vous pouvez aussi coller uniquement le jeton.',
                          'ألصق أدناه الرابط الذي توصلت به عبر البريد الإلكتروني، ويمكنك أيضاً لصق الرمز فقط.',
                        ),
                        textAlign:
                            TextAlign
                                .center,
                      ),
                      const SizedBox(
                        height: 22,
                      ),
                      TextFormField(
                        controller:
                            _tokenController,
                        validator:
                            _validateToken,
                        enabled:
                            !_loading,
                        autocorrect: false,
                        enableSuggestions:
                            false,
                        decoration:
                            InputDecoration(
                          labelText:
                              context.tr(
                            'Lien ou jeton de réinitialisation',
                            'رابط أو رمز إعادة التعيين',
                          ),
                          prefixIcon:
                              const Icon(
                            Icons
                                .link_outlined,
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 12,
                      ),
                      TextFormField(
                        controller:
                            _passwordController,
                        obscureText:
                            _obscurePassword,
                        validator:
                            _validatePassword,
                        enabled:
                            !_loading,
                        autofillHints:
                            const [
                          AutofillHints
                              .newPassword,
                        ],
                        decoration:
                            InputDecoration(
                          labelText:
                              context.tr(
                            'Nouveau mot de passe',
                            'كلمة المرور الجديدة',
                          ),
                          prefixIcon:
                              const Icon(
                            Icons
                                .lock_outline,
                          ),
                          suffixIcon:
                              IconButton(
                            onPressed:
                                _loading
                                    ? null
                                    : () {
                                        setState(
                                          () {
                                            _obscurePassword =
                                                !_obscurePassword;
                                          },
                                        );
                                      },
                            icon: Icon(
                              _obscurePassword
                                  ? Icons
                                      .visibility_outlined
                                  : Icons
                                      .visibility_off_outlined,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 12,
                      ),
                      TextFormField(
                        controller:
                            _confirmationController,
                        obscureText:
                            _obscureConfirmation,
                        validator:
                            _validateConfirmation,
                        enabled:
                            !_loading,
                        autofillHints:
                            const [
                          AutofillHints
                              .newPassword,
                        ],
                        decoration:
                            InputDecoration(
                          labelText:
                              context.tr(
                            'Confirmer le mot de passe',
                            'تأكيد كلمة المرور',
                          ),
                          prefixIcon:
                              const Icon(
                            Icons
                                .lock_reset_outlined,
                          ),
                          suffixIcon:
                              IconButton(
                            onPressed:
                                _loading
                                    ? null
                                    : () {
                                        setState(
                                          () {
                                            _obscureConfirmation =
                                                !_obscureConfirmation;
                                          },
                                        );
                                      },
                            icon: Icon(
                              _obscureConfirmation
                                  ? Icons
                                      .visibility_outlined
                                  : Icons
                                      .visibility_off_outlined,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 18,
                      ),
                      FilledButton(
                        onPressed:
                            _loading
                                ? null
                                : _submit,
                        child: _loading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child:
                                    CircularProgressIndicator(
                                  strokeWidth:
                                      2,
                                ),
                              )
                            : Text(
                                context.tr(
                                  'Réinitialiser le mot de passe',
                                  'إعادة تعيين كلمة المرور',
                                ),
                              ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}