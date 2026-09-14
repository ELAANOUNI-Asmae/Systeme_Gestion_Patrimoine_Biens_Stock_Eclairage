import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/user_models.dart';
import '../../services/user_api_service.dart';
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

  final UserApiService _userApi =
      UserApiService();

  List<AppUser> _users = [];
  List<AppRole> _roles = [];

  String? _roleFilter;

  bool _loading = true;
  String? _loadError;

  @override
  void initState() {
    super.initState();

    Future.microtask(
      _loadUsersAndRoles,
    );
  }

  @override
  void dispose() {
    _searchController.dispose();

    super.dispose();
  }

  Future<void>
      _loadUsersAndRoles() async {
    if (mounted) {
      setState(() {
        _loading = true;
        _loadError = null;
      });
    }

    try {
      final roles =
          await _userApi
              .getAllRoles();

      final users =
          await _userApi
              .getAllUsers();

      if (!mounted) {
        return;
      }

      setState(() {
        _roles = roles;
        _users = users;
      });
    } on UserApiException catch (
      error
    ) {
      if (!mounted) {
        return;
      }

      setState(() {
        _loadError =
            error.message;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }

      setState(() {
        _loadError =
            'LOAD_ERROR';
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
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

  List<AppUser>
      _filteredUsers() {
    final query =
        _searchController.text
            .trim()
            .toLowerCase();

    return _users.where(
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
        _filteredUsers();

    return RefreshIndicator(
      onRefresh:
          _loadUsersAndRoles,
      child: ListView(
        physics:
            const AlwaysScrollableScrollPhysics(),
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
                Permissions.createUser,
              ))
                IconButton.filled(
                  tooltip:
                      context.tr(
                    'Ajouter un utilisateur',
                    'إضافة مستخدم',
                  ),
                  onPressed:
                      _loading
                          ? null
                          : () =>
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
              _roleFilter ?? '',
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
              ..._roles.map(
                (role) =>
                    DropdownMenuItem<String>(
                  value:
                      role.name,
                  child:
                      Text(
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
            height: 12,
          ),

          if (_loading)
            const Card(
              child:
                  Padding(
                padding:
                    EdgeInsets.all(
                  24,
                ),
                child:
                    Center(
                  child:
                      CircularProgressIndicator(),
                ),
              ),
            )
          else if (_loadError !=
              null)
            Card(
              child: Padding(
                padding:
                    const EdgeInsets
                        .all(
                  18,
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons
                          .error_outline,
                      size: 36,
                    ),
                    const SizedBox(
                      height: 10,
                    ),
                    Text(
                      context.tr(
                        'Impossible de charger les utilisateurs.',
                        'تعذر تحميل المستخدمين.',
                      ),
                      textAlign:
                          TextAlign
                              .center,
                    ),
                    const SizedBox(
                      height: 6,
                    ),
                    Text(
                      _loadError!,
                      textAlign:
                          TextAlign
                              .center,
                      style:
                          Theme.of(
                        context,
                      )
                              .textTheme
                              .bodySmall,
                    ),
                    const SizedBox(
                      height: 12,
                    ),
                    FilledButton.icon(
                      onPressed:
                          _loadUsersAndRoles,
                      icon:
                          const Icon(
                        Icons.refresh,
                      ),
                      label:
                          Text(
                        context.tr(
                          'Réessayer',
                          'إعادة المحاولة',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else ...[
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
                      const EdgeInsets
                          .all(
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
                  user:
                      user,
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
                  onEdit:
                      state.hasPermission(
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

                  /*
                   * ACTIVATE_ACCOUNT /
                   * DEACTIVATE_ACCOUNT
                   * sont des permissions Backend
                   * distinctes de UPDATE_USER.
                   */
                  onToggleActive:
                      state.currentUser
                                  ?.id !=
                              user.id &&
                              state.hasPermission(
                                user.isActive
                                    ? Permissions
                                        .deactivateAccount
                                    : Permissions
                                        .activateAccount,
                              )
                          ? () =>
                              _toggleActive(
                                context,
                                user,
                              )
                          : null,

                  onDelete:
                      state.hasPermission(
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
        ],
      ),
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

    if (!confirmed ||
        !context.mounted) {
      return;
    }

    try {
      await _userApi.deleteUser(
        user.id,
      );

      await _loadUsersAndRoles();

      if (!context.mounted) {
        return;
      }

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
    } on UserApiException catch (
      error
    ) {
      if (!context.mounted) {
        return;
      }

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content:
              Text(
            error.message,
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

    if (!confirmed ||
        !context.mounted) {
      return;
    }

    try {
      await _userApi.setActive(
        user.id,
        nextActive,
      );

      await _loadUsersAndRoles();

      if (!context.mounted) {
        return;
      }

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
    } on UserApiException catch (
      error
    ) {
      if (!context.mounted) {
        return;
      }

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content:
              Text(
            error.message,
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
      isScrollControlled: true,
      showDragHandle: true,
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
                sheetContext.isArabic
                    ? user
                        .fullNameAr
                    : user
                        .fullName,
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
                    sheetContext.tr(
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
                    sheetContext.tr(
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
                    sheetContext.tr(
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
                    sheetContext.tr(
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
                    sheetContext.tr(
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
    if (_roles.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Aucun rôle disponible.',
              'لا يوجد أي دور متاح.',
            ),
          ),
        ),
      );

      return;
    }

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

    AppRole role;

    if (user == null) {
      role =
          _roles.first;
    } else {
      role =
          _roles.firstWhere(
        (item) =>
            item.id ==
            user.role.id,
        orElse: () =>
            _roles.first,
      );
    }

    var saving = false;

    try {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
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
                                _validateName(
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
                                _validateName(
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
                            saving
                                ? null
                                : (
                                    value,
                                  ) {
                                    if (value ==
                                        null) {
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

                      DropdownButtonFormField<int>(
                        initialValue:
                            role.id,
                        decoration:
                            InputDecoration(
                          labelText:
                              sheetContext
                                  .tr(
                            'Rôle',
                            'الدور',
                          ),
                        ),
                        items:
                            _roles
                                .map(
                                  (
                                    item,
                                  ) =>
                                      DropdownMenuItem<int>(
                                    value:
                                        item.id,
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
                            saving
                                ? null
                                : (
                                    value,
                                  ) {
                                    if (value ==
                                        null) {
                                      return;
                                    }

                                    final selectedRole =
                                        _roles
                                            .firstWhere(
                                      (item) =>
                                          item.id ==
                                          value,
                                    );

                                    setLocalState(
                                      () {
                                        role =
                                            selectedRole;
                                      },
                                    );
                                  },
                      ),

                      if (user ==
                          null) ...[
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
                            saving
                                ? null
                                : () async {
                                    if (!formKey
                                        .currentState!
                                        .validate()) {
                                      return;
                                    }

                                    setLocalState(
                                      () {
                                        saving =
                                            true;
                                      },
                                    );

                                    try {
                                      if (user ==
                                          null) {
                                        await _userApi
                                            .createUser(
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
                                                  .trim(),
                                          gender:
                                              gender,
                                          phone:
                                              phoneController
                                                  .text
                                                  .trim(),
                                          cin:
                                              cinController
                                                  .text
                                                  .trim(),
                                          roleId:
                                              role.id,
                                          password:
                                              passwordController
                                                  .text,
                                        );
                                      } else {
                                        await _userApi
                                            .updateUser(
                                          id:
                                              user.id,
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
                                                  .trim(),
                                          gender:
                                              gender,
                                          phone:
                                              phoneController
                                                  .text
                                                  .trim(),
                                          cin:
                                              cinController
                                                  .text
                                                  .trim(),
                                          roleId:
                                              role.id,
                                        );
                                      }

                                      await _loadUsersAndRoles();

                                      if (!sheetContext
                                          .mounted) {
                                        return;
                                      }

                                      Navigator.of(
                                        sheetContext,
                                      ).pop();
                                    } on UserApiException catch (
                                      error
                                    ) {
                                      if (!sheetContext
                                          .mounted) {
                                        return;
                                      }

                                      ScaffoldMessenger.of(
                                        sheetContext,
                                      ).showSnackBar(
                                        SnackBar(
                                          content:
                                              Text(
                                            error
                                                .message,
                                          ),
                                        ),
                                      );

                                      setLocalState(
                                        () {
                                          saving =
                                              false;
                                        },
                                      );
                                    } catch (_) {
                                      if (!sheetContext
                                          .mounted) {
                                        return;
                                      }

                                      ScaffoldMessenger.of(
                                        sheetContext,
                                      ).showSnackBar(
                                        SnackBar(
                                          content:
                                              Text(
                                            sheetContext
                                                .tr(
                                              'Une erreur est survenue.',
                                              'حدث خطأ.',
                                            ),
                                          ),
                                        ),
                                      );

                                      setLocalState(
                                        () {
                                          saving =
                                              false;
                                        },
                                      );
                                    }
                                  },
                        child:
                            saving
                                ? const SizedBox(
                                    width:
                                        20,
                                    height:
                                        20,
                                    child:
                                        CircularProgressIndicator(
                                      strokeWidth:
                                          2,
                                    ),
                                  )
                                : Text(
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
    if (value == null ||
        value.trim().isEmpty) {
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

    if (required != null) {
      return required;
    }

    if (value!.trim().length <
        3) {
      return context.tr(
        'Minimum 3 caractères.',
        '3 أحرف على الأقل.',
      );
    }

    if (value.trim().length >
        50) {
      return context.tr(
        'Maximum 50 caractères.',
        '50 حرفاً كحد أقصى.',
      );
    }

    return null;
  }

  String? _validateEmail(
    BuildContext context,
    String? value,
    AppUser? editingUser,
  ) {
    final email =
        value?.trim() ?? '';

    if (!RegExp(
      r'^[^\s@]+@[^\s@]+\.[^\s@]+$',
    ).hasMatch(
      email,
    )) {
      return context.tr(
        'Adresse e-mail invalide.',
        'البريد الإلكتروني غير صالح.',
      );
    }

    final duplicate =
        _users.any(
      (user) =>
          user.id !=
              editingUser?.id &&
          user.email
                  .toLowerCase() ==
              email.toLowerCase(),
    );

    if (duplicate) {
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
        value?.trim() ?? '';

    if (!RegExp(
      r'^(0[5-7])[0-9]{8}$',
    ).hasMatch(
      phone,
    )) {
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
        value
                ?.trim()
                .toUpperCase() ??
            '';

    if (!RegExp(
      r'^[A-Z]{1,2}[0-9]{5,6}$',
    ).hasMatch(
      cin,
    )) {
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
                        ? context.tr(
                            'Actif',
                            'نشط',
                          )
                        : context.tr(
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
            switch (value) {
              case 'view':
                onView();
                break;

              case 'edit':
                onEdit?.call();
                break;

              case 'toggle':
                onToggleActive
                    ?.call();
                break;

              case 'delete':
                onDelete?.call();
                break;
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
            if (onEdit !=
                null)
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
            if (onToggleActive !=
                null)
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
                        ? context.tr(
                            'Désactiver',
                            'تعطيل',
                          )
                        : context.tr(
                            'Activer',
                            'تفعيل',
                          ),
                  ),
                ),
              ),
            if (onDelete !=
                null)
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