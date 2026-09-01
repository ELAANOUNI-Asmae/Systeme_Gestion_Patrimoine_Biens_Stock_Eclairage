import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/user_models.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';

class UsersScreen
    extends StatefulWidget {
  const UsersScreen({
    super.key,
  });

  @override
  State<UsersScreen>
      createState() =>
          _UsersScreenState();
}

class _UsersScreenState
    extends State<UsersScreen> {
  final _searchController =
      TextEditingController();

  String? _roleFilter;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _roleLabel(
    BuildContext context,
    String role,
  ) {
    switch (role) {
      case 'ADMIN':
        return context.tr(
          'Administrateur',
          'مدير النظام',
        );
      case 'GESTIONNAIRE':
        return context.tr(
          'Gestionnaire',
          'مسير',
        );
      case 'RESPONSABLE':
        return context.tr(
          'Responsable',
          'مسؤول',
        );
      case 'UTILISATEUR':
        return context.tr(
          'Utilisateur',
          'مستخدم',
        );
      case 'AGENT':
        return context.tr(
          'Agent',
          'موظف',
        );
      default:
        return role;
    }
  }

  List<AppUser> _filteredUsers(
    AppState state,
  ) {
    final query =
        _searchController.text
            .trim()
            .toLowerCase();

    return state.users.where(
      (user) {
        final matchesSearch =
            query.isEmpty ||
            user.fullName
                .toLowerCase()
                .contains(
                  query,
                ) ||
            user.fullNameAr
                .toLowerCase()
                .contains(
                  query,
                ) ||
            user.email
                .toLowerCase()
                .contains(
                  query,
                ) ||
            user.cin
                .toLowerCase()
                .contains(
                  query,
                );

        final matchesRole =
            _roleFilter == null ||
            _roleFilter!.isEmpty ||
            user.role.name ==
                _roleFilter;

        return matchesSearch &&
            matchesRole;
      },
    ).toList();
  }

  @override
  Widget build(
    BuildContext context,
  ) {
    final state =
        context.watch<AppState>();

    final users =
        _filteredUsers(
      state,
    );

    return ListView(
      padding:
          const EdgeInsets.all(
        16,
      ),
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                context.tr(
                  'Utilisateurs',
                  'المستخدمون',
                ),
                style:
                    Theme.of(
                  context,
                )
                        .textTheme
                        .headlineSmall
                        ?.copyWith(
                          fontWeight:
                              FontWeight
                                  .w900,
                        ),
              ),
            ),
            if (state.hasPermission(
              Permissions
                  .createUser,
            ))
              IconButton.filled(
                tooltip:
                    context.tr(
                  'Ajouter un utilisateur',
                  'إضافة مستخدم',
                ),
                onPressed: () =>
                    _openForm(
                  context,
                ),
                icon:
                    const Icon(
                  Icons
                      .person_add_alt_1,
                ),
              ),
          ],
        ),
        const SizedBox(
          height: 12,
        ),
        TextField(
          controller:
              _searchController,
          onChanged: (_) =>
              setState(
            () {},
          ),
          decoration:
              InputDecoration(
            prefixIcon:
                const Icon(
              Icons.search,
            ),
            hintText:
                context.tr(
              'Nom, e-mail ou CIN',
              'الاسم، البريد الإلكتروني أو CIN',
            ),
          ),
        ),
        const SizedBox(
          height: 10,
        ),
        DropdownButtonFormField<String>(
          key: ValueKey(
            _roleFilter ??
                '',
          ),
          initialValue:
              _roleFilter,
          decoration:
              InputDecoration(
            prefixIcon:
                const Icon(
              Icons
                  .admin_panel_settings_outlined,
            ),
            labelText:
                context.tr(
              'Filtrer par rôle',
              'التصفية حسب الدور',
            ),
          ),
          items: [
            DropdownMenuItem<String>(
              value: '',
              child: Text(
                context.tr(
                  'Tous les rôles',
                  'كل الأدوار',
                ),
              ),
            ),
            ...state.roles.map(
              (role) =>
                  DropdownMenuItem<String>(
                value:
                    role.name,
                child: Text(
                  _roleLabel(
                    context,
                    role.name,
                  ),
                ),
              ),
            ),
          ],
          onChanged: (
            value,
          ) {
            setState(() {
              _roleFilter =
                  value == null ||
                          value
                              .isEmpty
                      ? null
                      : value;
            });
          },
        ),
        const SizedBox(
          height: 8,
        ),
        Text(
          context.tr(
            '${users.length} utilisateur(s)',
            '${users.length} مستخدم',
          ),
          style:
              Theme.of(
            context,
          )
                  .textTheme
                  .bodySmall,
        ),
        const SizedBox(
          height: 8,
        ),
        if (users.isEmpty)
          Card(
            child: Padding(
              padding:
                  const EdgeInsets.all(
                24,
              ),
              child: Text(
                context.tr(
                  'Aucun utilisateur trouvé.',
                  'لم يتم العثور على أي مستخدم.',
                ),
                textAlign:
                    TextAlign
                        .center,
              ),
            ),
          )
        else
          ...users.map(
            (user) =>
                _UserCard(
              user: user,
              roleLabel:
                  _roleLabel(
                context,
                user.role.name,
              ),
              onView: () =>
                  _showDetails(
                context,
                user,
              ),
              onEdit: state
                      .hasPermission(
                    Permissions
                        .updateUser,
                  )
                  ? () =>
                      _openForm(
                        context,
                        user:
                            user,
                      )
                  : null,
              onToggleActive:
                  state.hasPermission(
                    Permissions
                        .updateUser,
                  )
                      ? () =>
                          _toggleActive(
                            context,
                            user,
                          )
                      : null,
              onDelete: state
                          .hasPermission(
                        Permissions
                            .deleteUser,
                      ) &&
                      state.currentUser
                              ?.id !=
                          user.id
                  ? () =>
                      _deleteUser(
                        context,
                        user,
                      )
                  : null,
            ),
          ),
      ],
    );
  }

  Future<void> _deleteUser(
    BuildContext context,
    AppUser user,
  ) async {
    final confirmed =
        await confirmAction(
      context,
      fr:
          'Supprimer définitivement ${user.fullName} ?',
      ar:
          'هل تريد حذف ${user.fullNameAr} نهائياً؟',
    );

    if (
      !confirmed ||
      !context.mounted
    ) {
      return;
    }

    try {
      context
          .read<AppState>()
          .deleteUser(
            user.id,
          );

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Utilisateur supprimé.',
              'تم حذف المستخدم.',
            ),
          ),
        ),
      );
    } on StateError {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Cette opération est impossible.',
              'لا يمكن تنفيذ هذه العملية.',
            ),
          ),
        ),
      );
    }
  }

  Future<void> _toggleActive(
    BuildContext context,
    AppUser user,
  ) async {
    final nextActive =
        !user.isActive;

    final confirmed =
        await confirmAction(
      context,
      fr: nextActive
          ? 'Activer ${user.fullName} ?'
          : 'Désactiver ${user.fullName} ? Le compte restera enregistré mais l’accès sera bloqué.',
      ar: nextActive
          ? 'هل تريد تفعيل ${user.fullNameAr}؟'
          : 'هل تريد تعطيل ${user.fullNameAr}؟ سيبقى الحساب محفوظاً لكن سيتم منع الولوج.',
    );

    if (
      !confirmed ||
      !context.mounted
    ) {
      return;
    }

    try {
      context
          .read<AppState>()
          .setUserActive(
            user.id,
            nextActive,
          );

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            nextActive
                ? context.tr(
                    'Utilisateur activé.',
                    'تم تفعيل المستخدم.',
                  )
                : context.tr(
                    'Utilisateur désactivé.',
                    'تم تعطيل المستخدم.',
                  ),
          ),
        ),
      );
    } on StateError {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Vous ne pouvez pas désactiver votre propre compte.',
              'لا يمكنك تعطيل حسابك الحالي.',
            ),
          ),
        ),
      );
    }
  }

  Future<void> _showDetails(
    BuildContext context,
    AppUser user,
  ) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled:
          true,
      showDragHandle:
          true,
      builder:
          (sheetContext) =>
              SafeArea(
        child:
            SingleChildScrollView(
          padding:
              const EdgeInsets
                  .fromLTRB(
            20,
            0,
            20,
            24,
          ),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment
                    .stretch,
            children: [
              CircleAvatar(
                radius: 36,
                child: Text(
                  _initials(
                    sheetContext,
                    user,
                  ),
                  style:
                      Theme.of(
                    sheetContext,
                  )
                          .textTheme
                          .titleLarge
                          ?.copyWith(
                            fontWeight:
                                FontWeight
                                    .w900,
                          ),
                ),
              ),
              const SizedBox(
                height: 12,
              ),
              Text(
                sheetContext
                        .isArabic
                    ? user.fullNameAr
                    : user.fullName,
                textAlign:
                    TextAlign
                        .center,
                style:
                    Theme.of(
                  sheetContext,
                )
                        .textTheme
                        .titleLarge
                        ?.copyWith(
                          fontWeight:
                              FontWeight
                                  .w900,
                        ),
              ),
              const SizedBox(
                height: 14,
              ),
              _DetailRow(
                icon:
                    Icons
                        .email_outlined,
                label:
                    sheetContext
                        .tr(
                  'E-mail',
                  'البريد الإلكتروني',
                ),
                value:
                    user.email,
              ),
              _DetailRow(
                icon:
                    Icons
                        .phone_outlined,
                label:
                    sheetContext
                        .tr(
                  'Téléphone',
                  'الهاتف',
                ),
                value:
                    user.phone,
              ),
              _DetailRow(
                icon:
                    Icons
                        .badge_outlined,
                label:
                    'CIN',
                value:
                    user.cin,
              ),
              _DetailRow(
                icon:
                    Icons
                        .person_outline,
                label:
                    sheetContext
                        .tr(
                  'Genre',
                  'الجنس',
                ),
                value:
                    user.gender ==
                            'HOMME'
                        ? sheetContext
                            .tr(
                            'Homme',
                            'ذكر',
                          )
                        : sheetContext
                            .tr(
                            'Femme',
                            'أنثى',
                          ),
              ),
              _DetailRow(
                icon:
                    Icons
                        .admin_panel_settings_outlined,
                label:
                    sheetContext
                        .tr(
                  'Rôle',
                  'الدور',
                ),
                value:
                    _roleLabel(
                  sheetContext,
                  user.role.name,
                ),
              ),
              _DetailRow(
                icon:
                    user.isActive
                        ? Icons
                            .check_circle_outline
                        : Icons
                            .block_outlined,
                label:
                    sheetContext
                        .tr(
                  'Statut',
                  'الحالة',
                ),
                value:
                    user.isActive
                        ? sheetContext
                            .tr(
                            'Actif',
                            'نشط',
                          )
                        : sheetContext
                            .tr(
                            'Inactif',
                            'غير نشط',
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _initials(
    BuildContext context,
    AppUser user,
  ) {
    final first =
        context.isArabic
            ? user.firstNameAr
            : user.firstName;

    final last =
        context.isArabic
            ? user.lastNameAr
            : user.lastName;

    final firstInitial =
        first.isEmpty
            ? ''
            : first[0];

    final lastInitial =
        last.isEmpty
            ? ''
            : last[0];

    final result =
        '$firstInitial$lastInitial';

    return result.isEmpty
        ? '?'
        : result.toUpperCase();
  }

  Future<void> _openForm(
    BuildContext context, {
    AppUser? user,
  }) async {
    final state =
        context.read<AppState>();

    final formKey =
        GlobalKey<FormState>();

    final firstNameController =
        TextEditingController(
      text:
          user?.firstName ??
          '',
    );

    final lastNameController =
        TextEditingController(
      text:
          user?.lastName ??
          '',
    );

    final firstNameArController =
        TextEditingController(
      text:
          user?.firstNameAr ??
          '',
    );

    final lastNameArController =
        TextEditingController(
      text:
          user?.lastNameAr ??
          '',
    );

    final emailController =
        TextEditingController(
      text:
          user?.email ??
          '',
    );

    final phoneController =
        TextEditingController(
      text:
          user?.phone ??
          '',
    );

    final cinController =
        TextEditingController(
      text:
          user?.cin ??
          '',
    );

    final passwordController =
        TextEditingController();

    var gender =
        user?.gender ??
        'HOMME';

    var role =
        user?.role ??
        state.roles.first;

    try {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled:
            true,
        showDragHandle:
            true,
        builder:
            (sheetContext) =>
                StatefulBuilder(
          builder: (
            sheetContext,
            setLocalState,
          ) {
            final bottomInset =
                MediaQuery.of(
              sheetContext,
            ).viewInsets.bottom;

            return Padding(
              padding:
                  EdgeInsets.fromLTRB(
                18,
                0,
                18,
                18 +
                    bottomInset,
              ),
              child:
                  SingleChildScrollView(
                child: Form(
                  key:
                      formKey,
                  child: Column(
                    crossAxisAlignment:
                        CrossAxisAlignment
                            .stretch,
                    children: [
                      Text(
                        user == null
                            ? sheetContext
                                .tr(
                                'Ajouter un utilisateur',
                                'إضافة مستخدم',
                              )
                            : sheetContext
                                .tr(
                                'Modifier l’utilisateur',
                                'تعديل المستخدم',
                              ),
                        style:
                            Theme.of(
                          sheetContext,
                        )
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                  fontWeight:
                                      FontWeight
                                          .w900,
                                ),
                      ),
                      const SizedBox(
                        height: 14,
                      ),
                      TextFormField(
                        controller:
                            firstNameController,
                        textInputAction:
                            TextInputAction
                                .next,
                        validator:
                            (value) =>
                                _validateName(
                          sheetContext,
                          value,
                        ),
                        decoration:
                            InputDecoration(
                          labelText:
                              sheetContext
                                  .tr(
                            'Prénom',
                            'الاسم',
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      TextFormField(
                        controller:
                            lastNameController,
                        textInputAction:
                            TextInputAction
                                .next,
                        validator:
                            (value) =>
                                _validateName(
                          sheetContext,
                          value,
                        ),
                        decoration:
                            InputDecoration(
                          labelText:
                              sheetContext
                                  .tr(
                            'Nom',
                            'النسب',
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      TextFormField(
                        controller:
                            firstNameArController,
                        textDirection:
                            TextDirection
                                .rtl,
                        textInputAction:
                            TextInputAction
                                .next,
                        validator:
                            (value) =>
                                _validateRequired(
                          sheetContext,
                          value,
                        ),
                        decoration:
                            InputDecoration(
                          labelText:
                              sheetContext
                                  .tr(
                            'Prénom en arabe',
                            'الاسم بالعربية',
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      TextFormField(
                        controller:
                            lastNameArController,
                        textDirection:
                            TextDirection
                                .rtl,
                        textInputAction:
                            TextInputAction
                                .next,
                        validator:
                            (value) =>
                                _validateRequired(
                          sheetContext,
                          value,
                        ),
                        decoration:
                            InputDecoration(
                          labelText:
                              sheetContext
                                  .tr(
                            'Nom en arabe',
                            'النسب بالعربية',
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      TextFormField(
                        controller:
                            emailController,
                        keyboardType:
                            TextInputType
                                .emailAddress,
                        textInputAction:
                            TextInputAction
                                .next,
                        validator:
                            (value) =>
                                _validateEmail(
                          sheetContext,
                          value,
                          state,
                          user,
                        ),
                        decoration:
                            InputDecoration(
                          labelText:
                              sheetContext
                                  .tr(
                            'E-mail',
                            'البريد الإلكتروني',
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      TextFormField(
                        controller:
                            phoneController,
                        keyboardType:
                            TextInputType
                                .phone,
                        textInputAction:
                            TextInputAction
                                .next,
                        validator:
                            (value) =>
                                _validatePhone(
                          sheetContext,
                          value,
                        ),
                        decoration:
                            InputDecoration(
                          labelText:
                              sheetContext
                                  .tr(
                            'Téléphone',
                            'الهاتف',
                          ),
                          hintText:
                              '0612345678',
                        ),
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      TextFormField(
                        controller:
                            cinController,
                        textCapitalization:
                            TextCapitalization
                                .characters,
                        validator:
                            (value) =>
                                _validateCin(
                          sheetContext,
                          value,
                        ),
                        decoration:
                            const InputDecoration(
                          labelText:
                              'CIN',
                          hintText:
                              'AB123456',
                        ),
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      DropdownButtonFormField<String>(
                        initialValue:
                            gender,
                        decoration:
                            InputDecoration(
                          labelText:
                              sheetContext
                                  .tr(
                            'Genre',
                            'الجنس',
                          ),
                        ),
                        items: [
                          DropdownMenuItem<String>(
                            value:
                                'HOMME',
                            child:
                                Text(
                              sheetContext
                                  .tr(
                                'Homme',
                                'ذكر',
                              ),
                            ),
                          ),
                          DropdownMenuItem<String>(
                            value:
                                'FEMME',
                            child:
                                Text(
                              sheetContext
                                  .tr(
                                'Femme',
                                'أنثى',
                              ),
                            ),
                          ),
                        ],
                        onChanged:
                            (value) {
                          if (
                            value ==
                            null
                          ) {
                            return;
                          }

                          setLocalState(
                            () {
                              gender =
                                  value;
                            },
                          );
                        },
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      DropdownButtonFormField<AppRole>(
                        initialValue:
                            role,
                        decoration:
                            InputDecoration(
                          labelText:
                              sheetContext
                                  .tr(
                            'Rôle',
                            'الدور',
                          ),
                        ),
                        items: state.roles
                            .map(
                              (item) =>
                                  DropdownMenuItem<AppRole>(
                                value:
                                    item,
                                child:
                                    Text(
                                  _roleLabel(
                                    sheetContext,
                                    item.name,
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                        onChanged:
                            (value) {
                          if (
                            value ==
                            null
                          ) {
                            return;
                          }

                          setLocalState(
                            () {
                              role =
                                  value;
                            },
                          );
                        },
                      ),
                      if (
                        user ==
                        null
                      ) ...[
                        const SizedBox(
                          height: 10,
                        ),
                        TextFormField(
                          controller:
                              passwordController,
                          obscureText:
                              true,
                          validator:
                              (value) =>
                                  _validatePassword(
                            sheetContext,
                            value,
                          ),
                          decoration:
                              InputDecoration(
                            labelText:
                                sheetContext
                                    .tr(
                              'Mot de passe',
                              'كلمة المرور',
                            ),
                            helperText:
                                sheetContext
                                    .tr(
                              '8 caractères min., majuscule, minuscule, chiffre et symbole.',
                              '8 أحرف على الأقل مع حرف كبير وصغير ورقم ورمز.',
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(
                        height: 18,
                      ),
                      FilledButton(
                        onPressed:
                            () {
                          if (
                            !formKey
                                .currentState!
                                .validate()
                          ) {
                            return;
                          }

                          state.saveUser(
                            id:
                                user?.id,
                            firstName:
                                firstNameController
                                    .text
                                    .trim(),
                            lastName:
                                lastNameController
                                    .text
                                    .trim(),
                            firstNameAr:
                                firstNameArController
                                    .text
                                    .trim(),
                            lastNameAr:
                                lastNameArController
                                    .text
                                    .trim(),
                            email:
                                emailController
                                    .text
                                    .trim()
                                    .toLowerCase(),
                            gender:
                                gender,
                            phone:
                                phoneController
                                    .text
                                    .trim(),
                            cin:
                                cinController
                                    .text
                                    .trim()
                                    .toUpperCase(),
                            role:
                                role,
                            password:
                                user ==
                                        null
                                    ? passwordController
                                        .text
                                    : null,
                          );

                          Navigator.of(
                            sheetContext,
                          ).pop();
                        },
                        child:
                            Text(
                          sheetContext
                              .tr(
                            'Enregistrer',
                            'حفظ',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      );
    } finally {
      firstNameController
          .dispose();
      lastNameController
          .dispose();
      firstNameArController
          .dispose();
      lastNameArController
          .dispose();
      emailController
          .dispose();
      phoneController
          .dispose();
      cinController
          .dispose();
      passwordController
          .dispose();
    }
  }

  String? _validateRequired(
    BuildContext context,
    String? value,
  ) {
    if (
      value == null ||
      value.trim().isEmpty
    ) {
      return context.tr(
        'Champ obligatoire.',
        'هذا الحقل إجباري.',
      );
    }

    return null;
  }

  String? _validateName(
    BuildContext context,
    String? value,
  ) {
    final required =
        _validateRequired(
      context,
      value,
    );

    if (
      required != null
    ) {
      return required;
    }

    if (
      value!.trim().length <
          3
    ) {
      return context.tr(
        'Minimum 3 caractères.',
        '3 أحرف على الأقل.',
      );
    }

    return null;
  }

  String? _validateEmail(
    BuildContext context,
    String? value,
    AppState state,
    AppUser? editingUser,
  ) {
    final email =
        value?.trim() ??
        '';

    if (
      !RegExp(
        r'^[^\s@]+@[^\s@]+\.[^\s@]+$',
      ).hasMatch(
        email,
      )
    ) {
      return context.tr(
        'Adresse e-mail invalide.',
        'البريد الإلكتروني غير صالح.',
      );
    }

    final duplicate =
        state.users.any(
      (user) =>
          user.id !=
              editingUser?.id &&
          user.email
                  .toLowerCase() ==
              email
                  .toLowerCase(),
    );

    if (
      duplicate
    ) {
      return context.tr(
        'Cette adresse e-mail est déjà utilisée.',
        'هذا البريد الإلكتروني مستخدم من قبل.',
      );
    }

    return null;
  }

  String? _validatePhone(
    BuildContext context,
    String? value,
  ) {
    final phone =
        value?.trim() ??
        '';

    if (
      !RegExp(
        r'^(0[5-7])[0-9]{8}$',
      ).hasMatch(
        phone,
      )
    ) {
      return context.tr(
        'Numéro de téléphone invalide.',
        'رقم الهاتف غير صالح.',
      );
    }

    return null;
  }

  String? _validateCin(
    BuildContext context,
    String? value,
  ) {
    final cin =
        value?.trim()
                .toUpperCase() ??
            '';

    if (
      !RegExp(
        r'^[A-Z]{1,2}[0-9]{5,6}$',
      ).hasMatch(
        cin,
      )
    ) {
      return context.tr(
        'CIN invalide.',
        'رقم البطاقة الوطنية غير صالح.',
      );
    }

    return null;
  }

  String? _validatePassword(
    BuildContext context,
    String? value,
  ) {
    final password =
        value ?? '';

    final valid =
        RegExp(
      r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,50}$',
    ).hasMatch(
      password,
    );

    if (!valid) {
      return context.tr(
        'Mot de passe invalide.',
        'كلمة المرور غير مستوفية للشروط.',
      );
    }

    return null;
  }
}

class _UserCard
    extends StatelessWidget {
  const _UserCard({
    required this.user,
    required this.roleLabel,
    required this.onView,
    this.onEdit,
    this.onToggleActive,
    this.onDelete,
  });

  final AppUser user;
  final String roleLabel;

  final VoidCallback onView;
  final VoidCallback? onEdit;
  final VoidCallback?
      onToggleActive;
  final VoidCallback? onDelete;

  @override
  Widget build(
    BuildContext context,
  ) {
    final displayName =
        context.isArabic
            ? user.fullNameAr
            : user.fullName;

    final firstName =
        context.isArabic
            ? user.firstNameAr
            : user.firstName;

    final initial =
        firstName.isEmpty
            ? '?'
            : firstName[0]
                .toUpperCase();

    return Card(
      child: ListTile(
        contentPadding:
            const EdgeInsets
                .symmetric(
          horizontal: 14,
          vertical: 6,
        ),
        leading:
            CircleAvatar(
          child:
              Text(
            initial,
          ),
        ),
        title: Text(
          displayName,
          style:
              TextStyle(
            fontWeight:
                FontWeight.w700,
            color:
                user.isActive
                    ? null
                    : Theme.of(
                        context,
                      )
                        .disabledColor,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment:
              CrossAxisAlignment
                  .start,
          children: [
            const SizedBox(
              height: 2,
            ),
            Text(
              user.email,
            ),
            const SizedBox(
              height: 4,
            ),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              crossAxisAlignment:
                  WrapCrossAlignment
                      .center,
              children: [
                Chip(
                  visualDensity:
                      VisualDensity
                          .compact,
                  label:
                      Text(
                    roleLabel,
                  ),
                ),
                Chip(
                  visualDensity:
                      VisualDensity
                          .compact,
                  avatar:
                      Icon(
                    user.isActive
                        ? Icons
                            .check_circle_outline
                        : Icons
                            .block_outlined,
                    size: 16,
                  ),
                  label:
                      Text(
                    user.isActive
                        ? context
                            .tr(
                            'Actif',
                            'نشط',
                          )
                        : context
                            .tr(
                            'Inactif',
                            'غير نشط',
                          ),
                  ),
                ),
              ],
            ),
            Text(
              user.phone,
            ),
          ],
        ),
        isThreeLine:
            true,
        trailing:
            PopupMenuButton<String>(
          onSelected:
              (value) {
            switch (
              value
            ) {
              case 'view':
                onView();
              case 'edit':
                onEdit?.call();
              case 'toggle':
                onToggleActive
                    ?.call();
              case 'delete':
                onDelete
                    ?.call();
            }
          },
          itemBuilder:
              (_) => [
            PopupMenuItem<String>(
              value:
                  'view',
              child:
                  ListTile(
                contentPadding:
                    EdgeInsets
                        .zero,
                leading:
                    const Icon(
                  Icons
                      .visibility_outlined,
                ),
                title:
                    Text(
                  context.tr(
                    'Voir',
                    'عرض',
                  ),
                ),
              ),
            ),
            if (
              onEdit !=
              null
            )
              PopupMenuItem<String>(
                value:
                    'edit',
                child:
                    ListTile(
                  contentPadding:
                      EdgeInsets
                          .zero,
                  leading:
                      const Icon(
                    Icons
                        .edit_outlined,
                  ),
                  title:
                      Text(
                    context.tr(
                      'Modifier',
                      'تعديل',
                    ),
                  ),
                ),
              ),
            if (
              onToggleActive !=
              null
            )
              PopupMenuItem<String>(
                value:
                    'toggle',
                child:
                    ListTile(
                  contentPadding:
                      EdgeInsets
                          .zero,
                  leading:
                      Icon(
                    user.isActive
                        ? Icons
                            .person_off_outlined
                        : Icons
                            .person_add_alt_outlined,
                  ),
                  title:
                      Text(
                    user.isActive
                        ? context
                            .tr(
                            'Désactiver',
                            'تعطيل',
                          )
                        : context
                            .tr(
                            'Activer',
                            'تفعيل',
                          ),
                  ),
                ),
              ),
            if (
              onDelete !=
              null
            )
              PopupMenuItem<String>(
                value:
                    'delete',
                child:
                    ListTile(
                  contentPadding:
                      EdgeInsets
                          .zero,
                  leading:
                      const Icon(
                    Icons
                        .delete_outline,
                    color:
                        Colors.red,
                  ),
                  title:
                      Text(
                    context.tr(
                      'Supprimer',
                      'حذف',
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow
    extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(
    BuildContext context,
  ) {
    return Padding(
      padding:
          const EdgeInsets
              .symmetric(
        vertical: 7,
      ),
      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment
                .start,
        children: [
          Icon(
            icon,
            size: 20,
            color:
                Theme.of(
              context,
            )
                    .colorScheme
                    .primary,
          ),
          const SizedBox(
            width: 10,
          ),
          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .start,
              children: [
                Text(
                  label,
                  style:
                      Theme.of(
                    context,
                  )
                          .textTheme
                          .bodySmall,
                ),
                const SizedBox(
                  height: 2,
                ),
                Text(
                  value,
                  style:
                      const TextStyle(
                    fontWeight:
                        FontWeight
                            .w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
