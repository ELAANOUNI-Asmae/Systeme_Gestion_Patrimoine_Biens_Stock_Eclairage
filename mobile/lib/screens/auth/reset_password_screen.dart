import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/localization/bilingual.dart';
import '../../services/auth_local_service.dart';
import '../../state/app_state.dart';
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

  final _passwordController =
      TextEditingController();

  final _confirmationController =
      TextEditingController();

  final _authService =
      LocalAuthService();

  bool _loading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmation = true;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmationController.dispose();
    super.dispose();
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

  Future<void> _submit() async {
    if (_loading ||
        !_formKey.currentState!
            .validate()) {
      return;
    }

    setState(() {
      _loading = true;
    });

    await Future<void>.delayed(
      const Duration(
        milliseconds: 350,
      ),
    );

    if (!mounted) {
      return;
    }

    final success =
        _authService.resetPassword(
      context.read<AppState>(),
      widget.email,
      _passwordController.text,
    );

    setState(() {
      _loading = false;
    });

    if (!success) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Impossible de réinitialiser le mot de passe.',
              'تعذر إعادة تعيين كلمة المرور.',
            ),
          ),
        ),
      );

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
        child:
            SingleChildScrollView(
          padding:
              const EdgeInsets.all(
            22,
          ),
          child:
              ConstrainedBox(
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
                        style:
                            Theme.of(
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
                        height: 22,
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
                        child: Text(
                          _loading
                              ? context
                                  .tr(
                                  'Réinitialisation...',
                                  'جارٍ إعادة التعيين...',
                                )
                              : context
                                  .tr(
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
