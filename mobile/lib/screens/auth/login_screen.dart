import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/localization/bilingual.dart';
import '../../services/auth_local_service.dart';
import '../../state/app_state.dart';
import '../../widgets/main_shell.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
  });

  @override
  State<LoginScreen> createState() =>
      _LoginScreenState();
}

class _LoginScreenState
    extends State<LoginScreen> {
  final _formKey =
      GlobalKey<FormState>();

  final _emailController =
      TextEditingController();

  final _passwordController =
      TextEditingController();

  final _authService =
      LocalAuthService();

  bool _loading = false;
  bool _obscurePassword = true;
  bool _rememberMe = false;
  bool _initializing = true;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    final rememberedEmail =
        await _authService
            .getRememberedEmail();

    if (!mounted) {
      return;
    }

    if (rememberedEmail != null) {
      _emailController.text =
          rememberedEmail;

      _rememberMe = true;
    }

    final state =
        context.read<AppState>();

    final restored =
        await _authService
            .restoreSession(
      state,
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _initializing = false;
    });

    if (restored) {
      Navigator.of(context)
          .pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) =>
              const MainShell(),
        ),
        (_) => false,
      );
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String? _validateEmail(
    String? value,
  ) {
    final email =
        value?.trim() ?? '';

    if (email.isEmpty) {
      return context.tr(
        'L’adresse e-mail est obligatoire.',
        'البريد الإلكتروني إجباري.',
      );
    }

    final valid =
        RegExp(
      r'^[^\s@]+@[^\s@]+\.[^\s@]+$',
    ).hasMatch(
      email,
    );

    if (!valid) {
      return context.tr(
        'Le format de l’adresse e-mail est invalide.',
        'صيغة البريد الإلكتروني غير صحيحة.',
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
        'Le mot de passe est obligatoire.',
        'كلمة المرور إجبارية.',
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

  Future<void> _login() async {
    if (_loading ||
        !_formKey.currentState!
            .validate()) {
      return;
    }

    setState(() {
      _loading = true;
    });

    final email =
        _emailController.text.trim();

    final password =
        _passwordController.text;

    final state =
        context.read<AppState>();

    final success =
        await state.login(
      email,
      password,
    );

    if (!mounted) {
      return;
    }

    if (!success) {
      setState(() {
        _loading = false;
      });

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Adresse e-mail ou mot de passe incorrect.',
              'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
            ),
          ),
        ),
      );

      return;
    }

    await _authService
        .saveRememberedEmail(
      _rememberMe
          ? email
          : null,
    );

    await _authService
        .saveSession(
      email,
    );

    if (!mounted) {
      return;
    }

    Navigator.of(context)
        .pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (_) =>
            const MainShell(),
      ),
      (_) => false,
    );
  }

  void _toggleLanguage() {
    final state =
        context.read<AppState>();

    state.setLocale(
      state.isArabic
          ? const Locale('fr')
          : const Locale('ar'),
    );
  }

  void _toggleTheme() {
    final state =
        context.read<AppState>();

    state.setThemeMode(
      state.themeMode ==
              ThemeMode.dark
          ? ThemeMode.light
          : ThemeMode.dark,
    );
  }

  @override
  Widget build(
    BuildContext context,
  ) {
    final state =
        context.watch<AppState>();

    if (_initializing) {
      return const Scaffold(
        body: Center(
          child:
              CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          context.tr(
            'Connexion',
            'تسجيل الدخول',
          ),
        ),
        actions: [
          TextButton(
            onPressed:
                _toggleLanguage,
            child: Text(
              state.isArabic
                  ? 'FR'
                  : 'العربية',
            ),
          ),
          IconButton(
            onPressed:
                _toggleTheme,
            tooltip:
                state.themeMode ==
                        ThemeMode.dark
                    ? context.tr(
                        'Mode clair',
                        'الوضع الفاتح',
                      )
                    : context.tr(
                        'Mode sombre',
                        'الوضع الداكن',
                      ),
            icon: Icon(
              state.themeMode ==
                      ThemeMode.dark
                  ? Icons
                      .light_mode_outlined
                  : Icons
                      .dark_mode_outlined,
            ),
          ),
        ],
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
                      Center(
                        child:
                            Image.asset(
                          'assets/images/logo.png',
                          width: 92,
                          height: 92,
                        ),
                      ),
                      const SizedBox(
                        height: 16,
                      ),
                      Text(
                        'SGPBSE',
                        textAlign:
                            TextAlign
                                .center,
                        style: Theme.of(
                          context,
                        )
                            .textTheme
                            .headlineMedium
                            ?.copyWith(
                              fontWeight:
                                  FontWeight
                                      .w900,
                            ),
                      ),
                      const SizedBox(
                        height: 6,
                      ),
                      Text(
                        context.tr(
                          'Accès réservé aux utilisateurs autorisés.',
                          'الولوج مخصص للمستخدمين المصرح لهم.',
                        ),
                        textAlign:
                            TextAlign
                                .center,
                      ),
                      const SizedBox(
                        height: 20,
                      ),
                      TextFormField(
                        controller:
                            _emailController,
                        keyboardType:
                            TextInputType
                                .emailAddress,
                        textInputAction:
                            TextInputAction
                                .next,
                        autofillHints:
                            const [
                          AutofillHints
                              .email,
                        ],
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
                        height: 12,
                      ),
                      TextFormField(
                        controller:
                            _passwordController,
                        obscureText:
                            _obscurePassword,
                        textInputAction:
                            TextInputAction
                                .done,
                        autofillHints:
                            const [
                          AutofillHints
                              .password,
                        ],
                        validator:
                            _validatePassword,
                        enabled:
                            !_loading,
                        onFieldSubmitted:
                            (_) {
                          _login();
                        },
                        decoration:
                            InputDecoration(
                          labelText:
                              context.tr(
                            'Mot de passe',
                            'كلمة المرور',
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
                        height: 8,
                      ),
                      Row(
                        children: [
                          Expanded(
                            child:
                                CheckboxListTile(
                              contentPadding:
                                  EdgeInsets
                                      .zero,
                              dense: true,
                              controlAffinity:
                                  ListTileControlAffinity
                                      .leading,
                              value:
                                  _rememberMe,
                              onChanged:
                                  _loading
                                      ? null
                                      : (value) {
                                          setState(
                                            () {
                                              _rememberMe =
                                                  value ??
                                                      false;
                                            },
                                          );
                                        },
                              title: Text(
                                context.tr(
                                  'Se souvenir de moi',
                                  'تذكرني',
                                ),
                              ),
                            ),
                          ),
                          TextButton(
                            onPressed:
                                _loading
                                    ? null
                                    : () {
                                        Navigator.of(
                                          context,
                                        ).push(
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                const ForgotPasswordScreen(),
                                          ),
                                        );
                                      },
                            child: Text(
                              context.tr(
                                'Mot de passe oublié ?',
                                'نسيت كلمة المرور؟',
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 8,
                      ),
                      FilledButton.icon(
                        onPressed:
                            _loading
                                ? null
                                : _login,
                        icon:
                            _loading
                                ? const SizedBox(
                                    width:
                                        18,
                                    height:
                                        18,
                                    child:
                                        CircularProgressIndicator(
                                      strokeWidth:
                                          2,
                                    ),
                                  )
                                : const Icon(
                                    Icons
                                        .login,
                                  ),
                        label: Text(
                          _loading
                              ? context
                                  .tr(
                                  'Connexion...',
                                  'جارٍ تسجيل الدخول...',
                                )
                              : context
                                  .tr(
                                  'Se connecter',
                                  'تسجيل الدخول',
                                ),
                        ),
                      ),
                      const SizedBox(
                        height: 16,
                      ),
                      Container(
                        padding:
                            const EdgeInsets
                                .all(
                          12,
                        ),
                        decoration:
                            BoxDecoration(
                          color: Theme.of(
                            context,
                          )
                              .colorScheme
                              .primary
                              .withValues(
                                alpha:
                                    .07,
                              ),
                          borderRadius:
                              BorderRadius
                                  .circular(
                            14,
                          ),
                        ),
                        child: Text(
                          context.tr(
                            'Accès réservé aux utilisateurs autorisés. Utilisez les identifiants fournis par l’administrateur.',
                            'الولوج مخصص للمستخدمين المصرح لهم. استخدم بيانات الدخول المقدمة من المسؤول.',
                          ),
                          style:
                              Theme.of(
                            context,
                          )
                                  .textTheme
                                  .bodySmall,
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
