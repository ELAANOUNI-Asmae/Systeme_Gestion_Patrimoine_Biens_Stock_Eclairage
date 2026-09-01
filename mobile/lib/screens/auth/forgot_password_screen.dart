import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/localization/bilingual.dart';
import '../../services/auth_local_service.dart';
import '../../state/app_state.dart';
import 'reset_password_screen.dart';

class ForgotPasswordScreen
    extends StatefulWidget {
  const ForgotPasswordScreen({
    super.key,
  });

  @override
  State<ForgotPasswordScreen>
      createState() =>
          _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState
    extends State<ForgotPasswordScreen> {
  final _formKey =
      GlobalKey<FormState>();

  final _emailController =
      TextEditingController();

  final _authService =
      LocalAuthService();

  bool _loading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  String? _validateEmail(
    String? value,
  ) {
    final email =
        value?.trim() ?? '';

    if (email.isEmpty) {
      return context.tr(
        'Veuillez saisir votre adresse e-mail.',
        'يرجى إدخال بريدك الإلكتروني.',
      );
    }

    if (!RegExp(
      r'^[^\s@]+@[^\s@]+\.[^\s@]+$',
    ).hasMatch(email)) {
      return context.tr(
        'Adresse e-mail invalide.',
        'البريد الإلكتروني غير صالح.',
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

    final email =
        _emailController.text.trim();

    final exists =
        _authService.emailExists(
      context.read<AppState>(),
      email,
    );

    setState(() {
      _loading = false;
    });

    if (!exists) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Si un compte existe avec cette adresse e-mail, un lien de réinitialisation a été envoyé.',
              'إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة تعيين كلمة المرور.',
            ),
          ),
        ),
      );

      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) =>
            ResetPasswordScreen(
          email: email,
        ),
      ),
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
            'Mot de passe oublié',
            'نسيت كلمة المرور',
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
                      Icon(
                        Icons
                            .mark_email_read_outlined,
                        size: 58,
                        color:
                            Theme.of(
                          context,
                        )
                                .colorScheme
                                .primary,
                      ),
                      const SizedBox(
                        height: 16,
                      ),
                      Text(
                        context.tr(
                          'Réinitialiser votre accès',
                          'إعادة تعيين بيانات الولوج',
                        ),
                        textAlign:
                            TextAlign
                                .center,
                        style:
                            Theme.of(
                          context,
                        )
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                  fontWeight:
                                      FontWeight
                                          .w800,
                                ),
                      ),
                      const SizedBox(
                        height: 8,
                      ),
                      Text(
                        context.tr(
                          'Entrez votre adresse e-mail pour poursuivre la réinitialisation du mot de passe.',
                          'أدخل بريدك الإلكتروني لمتابعة إعادة تعيين كلمة المرور.',
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
                            _emailController,
                        keyboardType:
                            TextInputType
                                .emailAddress,
                        validator:
                            _validateEmail,
                        enabled:
                            !_loading,
                        decoration:
                            InputDecoration(
                          labelText:
                              context.tr(
                            'Adresse e-mail',
                            'البريد الإلكتروني',
                          ),
                          prefixIcon:
                              const Icon(
                            Icons
                                .email_outlined,
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
                                  'Envoi en cours...',
                                  'جارٍ الإرسال...',
                                )
                              : context
                                  .tr(
                                  'Envoyer le lien',
                                  'إرسال الرابط',
                                ),
                        ),
                      ),
                      const SizedBox(
                        height: 8,
                      ),
                      TextButton.icon(
                        onPressed:
                            _loading
                                ? null
                                : () =>
                                    Navigator.of(
                                      context,
                                    ).pop(),
                        icon:
                            const Icon(
                          Icons
                              .arrow_back,
                        ),
                        label: Text(
                          context.tr(
                            'Retour à la connexion',
                            'العودة إلى تسجيل الدخول',
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
