import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/permission_labels.dart';
import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/user_models.dart';
import '../../services/role_api_service.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';

class RolesScreen extends StatefulWidget {
  const RolesScreen({
    super.key,
  });

  @override
  State<RolesScreen> createState() =>
      _RolesScreenState();
}

class _RolesScreenState
    extends State<RolesScreen> {
  final TextEditingController
      _searchController =
      TextEditingController();

  final RoleApiService _roleApi =
      RoleApiService();

  List<AppRole> _roles = [];

  List<AppPermission> _permissions =
      [];

  bool _loading = true;

  String? _loadError;

  @override
  void initState() {
    super.initState();

    Future.microtask(
      _loadRolesAndPermissions,
    );
  }

  @override
  void dispose() {
    _searchController.dispose();

    super.dispose();
  }

  Future<void>
      _loadRolesAndPermissions() async {
    if (mounted) {
      setState(() {
        _loading = true;
        _loadError = null;
      });
    }

    try {
      final roles =
          await _roleApi
              .getAllRoles();

      final permissions =
          await _roleApi
              .getAllPermissions();

      if (!mounted) {
        return;
      }

      setState(() {
        _roles = roles;
        _permissions =
            permissions;
      });
    } on RoleApiException catch (
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
    String roleName,
  ) {
    switch (
      roleName
          .trim()
          .toUpperCase()
    ) {
      case 'ADMIN':
        return context.tr(
          'Administrateur',
          'مدير النظام',
        );

      case 'GESTIONNAIRE':
        return context.tr(
          'Gestionnaire',
          'المسيّر',
        );

      case 'RESPONSABLE':
        return context.tr(
          'Responsable',
          'المسؤول',
        );

      case 'UTILISATEUR':
        return context.tr(
          'Utilisateur',
          'المستخدم',
        );

      case 'AGENT':
        return context.tr(
          'Agent',
          'الموظف',
        );

      default:
        return roleName;
    }
  }

  List<AppRole> _filteredRoles(
    BuildContext context,
  ) {
    final query =
        _searchController.text
            .trim()
            .toLowerCase();

    if (query.isEmpty) {
      return _roles;
    }

    return _roles.where(
      (role) {
        final translatedName =
            _roleLabel(
          context,
          role.name,
        ).toLowerCase();

        return role.name
                .toLowerCase()
                .contains(
                  query,
                ) ||
            translatedName
                .contains(
                  query,
                );
      },
    ).toList();
  }

  @override
  Widget build(
    BuildContext context,
  ) {
    final state =
        context.watch<AppState>();

    final roles =
        _filteredRoles(
      context,
    );

    return RefreshIndicator(
      onRefresh:
          _loadRolesAndPermissions,
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
                    'Rôles et permissions',
                    'الأدوار والصلاحيات',
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
                Permissions.createRole,
              ))
                IconButton.filled(
                  tooltip:
                      context.tr(
                    'Ajouter un rôle',
                    'إضافة دور',
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
                        .add_moderator_outlined,
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
            onChanged: (_) {
              setState(() {});
            },
            decoration:
                InputDecoration(
              prefixIcon:
                  const Icon(
                Icons.search,
              ),
              hintText:
                  context.tr(
                'Rechercher un rôle',
                'البحث عن دور',
              ),
            ),
          ),

          const SizedBox(
            height: 10,
          ),

          if (_loading)
            const Card(
              child: Padding(
                padding:
                    EdgeInsets.all(
                  24,
                ),
                child: Center(
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
                        'Impossible de charger les rôles et les permissions.',
                        'تعذر تحميل الأدوار والصلاحيات.',
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
                          _loadRolesAndPermissions,
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
                '${roles.length} rôle(s)',
                '${roles.length} دور',
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

            if (roles.isEmpty)
              Card(
                child: Padding(
                  padding:
                      const EdgeInsets
                          .all(
                    24,
                  ),
                  child: Text(
                    context.tr(
                      'Aucun rôle trouvé.',
                      'لم يتم العثور على أي دور.',
                    ),
                    textAlign:
                        TextAlign
                            .center,
                  ),
                ),
              )
            else
              ...roles.map(
                (role) =>
                    _RoleCard(
                  role:
                      role,

                  roleLabel:
                      _roleLabel(
                    context,
                    role.name,
                  ),

                  onView:
                      state.hasPermission(
                    Permissions
                        .getRoleInfos,
                  )
                          ? () =>
                              _showDetails(
                                context,
                                role,
                              )
                          : null,

                  onEdit:
                      state.hasPermission(
                    Permissions
                        .updateRole,
                  )
                          ? () =>
                              _openForm(
                                context,
                                role:
                                    role,
                              )
                          : null,

                  onDelete:
                      state.hasPermission(
                                Permissions
                                    .deleteRole,
                              ) &&
                              role.name
                                      .trim()
                                      .toUpperCase() !=
                                  'ADMIN'
                          ? () =>
                              _deleteRole(
                                context,
                                role,
                              )
                          : null,
                ),
              ),
          ],
        ],
      ),
    );
  }

  Future<void> _showDetails(
    BuildContext context,
    AppRole role,
  ) {
    final permissions =
        role.permissions
            .toList()
          ..sort(
            (
              first,
              second,
            ) =>
                PermissionLabels.of(
              context,
              first,
            ).compareTo(
              PermissionLabels.of(
                context,
                second,
              ),
            ),
          );

    return showModalBottomSheet<void>(
      context:
          context,
      isScrollControlled:
          true,
      useSafeArea:
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
          child:
              Column(
            crossAxisAlignment:
                CrossAxisAlignment
                    .stretch,
            children: [
              const CircleAvatar(
                radius: 34,
                child: Icon(
                  Icons
                      .admin_panel_settings_outlined,
                  size: 34,
                ),
              ),

              const SizedBox(
                height: 12,
              ),

              Text(
                _roleLabel(
                  sheetContext,
                  role.name,
                ),
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
                height: 6,
              ),

              Text(
                sheetContext.tr(
                  '${permissions.length} permission(s)',
                  '${permissions.length} صلاحية',
                ),
                textAlign:
                    TextAlign
                        .center,
              ),

              const SizedBox(
                height: 18,
              ),

              Text(
                sheetContext.tr(
                  'Permissions associées',
                  'الصلاحيات المرتبطة',
                ),
                style:
                    const TextStyle(
                  fontWeight:
                      FontWeight
                          .w800,
                ),
              ),

              const SizedBox(
                height: 8,
              ),

              if (permissions.isEmpty)
                Text(
                  sheetContext.tr(
                    'Aucune permission associée.',
                    'لا توجد صلاحيات مرتبطة.',
                  ),
                )
              else
                ...permissions.map(
                  (
                    permission,
                  ) =>
                      Card(
                    margin:
                        const EdgeInsets
                            .only(
                      bottom:
                          8,
                    ),
                    child:
                        ListTile(
                      leading:
                          const Icon(
                        Icons
                            .check_circle_outline,
                        color:
                            Colors
                                .green,
                      ),

                      // غير الاسم العادي
                      title:
                          Text(
                        PermissionLabels.of(
                          sheetContext,
                          permission,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _deleteRole(
    BuildContext context,
    AppRole role,
  ) async {
    final confirmed =
        await confirmAction(
      context,
      fr:
          'Supprimer le rôle ${_roleLabel(context, role.name)} ?',
      ar:
          'هل تريد حذف دور ${_roleLabel(context, role.name)}؟',
    );

    if (!confirmed ||
        !context.mounted) {
      return;
    }

    try {
      await _roleApi.deleteRole(
        role.id,
      );

      await _loadRolesAndPermissions();

      if (!context.mounted) {
        return;
      }

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content:
              Text(
            context.tr(
              'Rôle supprimé.',
              'تم حذف الدور.',
            ),
          ),
        ),
      );
    } on RoleApiException catch (
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

  Future<void> _openForm(
    BuildContext context, {
    AppRole? role,
  }) async {
    if (_permissions.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content:
              Text(
            context.tr(
              'Aucune permission disponible.',
              'لا توجد أي صلاحية متاحة.',
            ),
          ),
        ),
      );

      return;
    }

    final formKey =
        GlobalKey<FormState>();

    final nameController =
        TextEditingController(
      text:
          role?.name ??
          '',
    );

    final permissionsController =
        ScrollController();

    final selectedPermissionIds =
        <int>{};

    if (role != null) {
      for (
        final permission
        in _permissions
      ) {
        if (
          role.permissions
              .contains(
            permission.name,
          )
        ) {
          selectedPermissionIds
              .add(
            permission.id,
          );
        }
      }
    }

    var saving = false;

    try {
      await showModalBottomSheet<void>(
        context:
            context,
        isScrollControlled:
            true,
        useSafeArea:
            true,
        enableDrag:
            false,
        showDragHandle:
            false,
        builder:
            (sheetContext) =>
                StatefulBuilder(
          builder: (
            sheetContext,
            setLocalState,
          ) {
            final media =
                MediaQuery.of(
              sheetContext,
            );

            final bottomInset =
                media.viewInsets
                    .bottom;

            final allSelected =
                _permissions
                        .isNotEmpty &&
                    selectedPermissionIds
                            .length ==
                        _permissions
                            .length;

            return AnimatedPadding(
              duration:
                  const Duration(
                milliseconds:
                    180,
              ),
              curve:
                  Curves.easeOut,
              padding:
                  EdgeInsets.only(
                bottom:
                    bottomInset,
              ),
              child:
                  FractionallySizedBox(
                heightFactor:
                    0.96,
                child:
                    Material(
                  color:
                      Theme.of(
                    sheetContext,
                  )
                          .colorScheme
                          .surface,
                  child:
                      Column(
                    children: [
                      // ========================
                      // HEADER FIXE
                      // ========================
                      Padding(
                        padding:
                            const EdgeInsets
                                .fromLTRB(
                          16,
                          10,
                          8,
                          8,
                        ),
                        child:
                            Row(
                          children: [
                            Expanded(
                              child:
                                  Text(
                                role ==
                                        null
                                    ? sheetContext
                                        .tr(
                                        'Ajouter un rôle',
                                        'إضافة دور',
                                      )
                                    : sheetContext
                                        .tr(
                                        'Modifier le rôle',
                                        'تعديل الدور',
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

                            IconButton(
                              tooltip:
                                  sheetContext
                                      .tr(
                                'Fermer',
                                'إغلاق',
                              ),
                              onPressed:
                                  saving
                                      ? null
                                      : () {
                                          Navigator.of(
                                            sheetContext,
                                          ).pop();
                                        },
                              icon:
                                  const Icon(
                                Icons.close,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const Divider(
                        height: 1,
                      ),

                      // ========================
                      // NOM FIXE
                      // ========================
                      Padding(
                        padding:
                            const EdgeInsets
                                .fromLTRB(
                          16,
                          12,
                          16,
                          8,
                        ),
                        child:
                            Form(
                          key:
                              formKey,
                          child:
                              TextFormField(
                            controller:
                                nameController,
                            textCapitalization:
                                TextCapitalization
                                    .characters,
                            enabled:
                                !saving,
                            validator:
                                (
                                  value,
                                ) {
                              final name =
                                  value
                                          ?.trim() ??
                                      '';

                              if (name
                                  .isEmpty) {
                                return sheetContext
                                    .tr(
                                  'Le nom du rôle est obligatoire.',
                                  'اسم الدور إجباري.',
                                );
                              }

                              final duplicate =
                                  _roles.any(
                                (
                                  item,
                                ) =>
                                    item.id !=
                                        role?.id &&
                                    item.name
                                            .trim()
                                            .toUpperCase() ==
                                        name
                                            .toUpperCase(),
                              );

                              if (duplicate) {
                                return sheetContext
                                    .tr(
                                  'Un rôle avec ce nom existe déjà.',
                                  'يوجد دور بهذا الاسم من قبل.',
                                );
                              }

                              return null;
                            },
                            decoration:
                                InputDecoration(
                              labelText:
                                  sheetContext
                                      .tr(
                                'Nom du rôle',
                                'اسم الدور',
                              ),
                              hintText:
                                  'GESTIONNAIRE_STOCK',
                            ),
                          ),
                        ),
                      ),

                      // ========================
                      // BARRE PERMISSIONS FIXE
                      // ========================
                      Padding(
                        padding:
                            const EdgeInsets
                                .fromLTRB(
                          16,
                          0,
                          16,
                          6,
                        ),
                        child:
                            Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child:
                                      Text(
                                    sheetContext
                                        .tr(
                                      'Permissions',
                                      'الصلاحيات',
                                    ),
                                    style:
                                        const TextStyle(
                                      fontWeight:
                                          FontWeight
                                              .w800,
                                    ),
                                  ),
                                ),

                                TextButton(
                                  onPressed:
                                      saving ||
                                              allSelected
                                          ? null
                                          : () {
                                              setLocalState(
                                                () {
                                                  selectedPermissionIds
                                                    ..clear()
                                                    ..addAll(
                                                      _permissions.map(
                                                        (
                                                          permission,
                                                        ) =>
                                                            permission.id,
                                                      ),
                                                    );
                                                },
                                              );
                                            },
                                  child:
                                      Text(
                                    sheetContext
                                        .tr(
                                      'Tout sélectionner',
                                      'تحديد الكل',
                                    ),
                                  ),
                                ),

                                TextButton(
                                  onPressed:
                                      saving ||
                                              selectedPermissionIds
                                                  .isEmpty
                                          ? null
                                          : () {
                                              setLocalState(
                                                () {
                                                  selectedPermissionIds
                                                      .clear();
                                                },
                                              );
                                            },
                                  child:
                                      Text(
                                    sheetContext
                                        .tr(
                                      'Tout désélectionner',
                                      'إلغاء تحديد الكل',
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            if (selectedPermissionIds
                                .isEmpty)
                              Align(
                                alignment:
                                    Alignment
                                        .centerLeft,
                                child:
                                    Text(
                                  sheetContext
                                      .tr(
                                    'Sélectionnez au moins une permission.',
                                    'اختر صلاحية واحدة على الأقل.',
                                  ),
                                  style:
                                      TextStyle(
                                    color:
                                        Theme.of(
                                      sheetContext,
                                    )
                                            .colorScheme
                                            .error,
                                    fontSize:
                                        12,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),

                      const Divider(
                        height: 1,
                      ),

                      // ========================
                      // غير اللائحة كتسكرول
                      // ========================
                      Expanded(
                        child:
                            Scrollbar(
                          controller:
                              permissionsController,
                          thumbVisibility:
                              true,
                          child:
                              ListView.separated(
                            controller:
                                permissionsController,
                            primary:
                                false,
                            padding:
                                const EdgeInsets
                                    .fromLTRB(
                              12,
                              6,
                              12,
                              6,
                            ),
                            itemCount:
                                _permissions
                                    .length,
                            separatorBuilder:
                                (
                                  _,
                                  __,
                                ) =>
                                    const Divider(
                              height:
                                  1,
                            ),
                            itemBuilder:
                                (
                                  context,
                                  index,
                                ) {
                              final permission =
                                  _permissions[
                                      index];

                              final checked =
                                  selectedPermissionIds
                                      .contains(
                                permission
                                    .id,
                              );

                              return CheckboxListTile(
                                dense:
                                    true,
                                visualDensity:
                                    VisualDensity
                                        .compact,
                                contentPadding:
                                    const EdgeInsets
                                        .symmetric(
                                  horizontal:
                                      4,
                                  vertical:
                                      1,
                                ),
                                value:
                                    checked,

                                
                                title:
                                    Text(
                                  PermissionLabels.of(
                                    sheetContext,
                                    permission
                                        .name,
                                  ),
                                ),

                                onChanged:
                                    saving
                                        ? null
                                        : (
                                            value,
                                          ) {
                                            setLocalState(
                                              () {
                                                if (value ==
                                                    true) {
                                                  selectedPermissionIds
                                                      .add(
                                                    permission
                                                        .id,
                                                  );
                                                } else {
                                                  selectedPermissionIds
                                                      .remove(
                                                    permission
                                                        .id,
                                                  );
                                                }
                                              },
                                            );
                                          },
                              );
                            },
                          ),
                        ),
                      ),

                      // ========================
                      // FOOTER / SAVE FIXE
                      // ========================
                      Container(
                        width:
                            double.infinity,
                        padding:
                            const EdgeInsets
                                .fromLTRB(
                          16,
                          10,
                          16,
                          14,
                        ),
                        decoration:
                            BoxDecoration(
                          color:
                              Theme.of(
                            sheetContext,
                          )
                                  .colorScheme
                                  .surface,
                          border:
                              Border(
                            top:
                                BorderSide(
                              color:
                                  Theme.of(
                                sheetContext,
                              )
                                      .dividerColor,
                            ),
                          ),
                        ),
                        child:
                            FilledButton.icon(
                          onPressed:
                              saving
                                  ? null
                                  : () async {
                                      if (!formKey
                                          .currentState!
                                          .validate()) {
                                        return;
                                      }

                                      if (selectedPermissionIds
                                          .isEmpty) {
                                        setLocalState(
                                          () {},
                                        );

                                        return;
                                      }

                                      setLocalState(
                                        () {
                                          saving =
                                              true;
                                        },
                                      );

                                      try {
                                        if (role ==
                                            null) {
                                          await _roleApi
                                              .createRole(
                                            name:
                                                nameController
                                                    .text
                                                    .trim(),
                                            permissionIds:
                                                selectedPermissionIds,
                                          );
                                        } else {
                                          await _roleApi
                                              .updateRole(
                                            id:
                                                role.id,
                                            name:
                                                nameController
                                                    .text
                                                    .trim(),
                                            permissionIds:
                                                selectedPermissionIds,
                                          );
                                        }

                                        await _loadRolesAndPermissions();

                                        if (!sheetContext
                                            .mounted) {
                                          return;
                                        }

                                        Navigator.of(
                                          sheetContext,
                                        ).pop();
                                      } on RoleApiException catch (
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
                                              error.message,
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
                          icon:
                              saving
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
                                          .save_outlined,
                                    ),
                          label:
                              Text(
                            role == null
                                ? sheetContext
                                    .tr(
                                    'Créer le rôle',
                                    'إنشاء الدور',
                                  )
                                : sheetContext
                                    .tr(
                                    'Enregistrer les modifications',
                                    'حفظ التعديلات',
                                  ),
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
      nameController.dispose();
      permissionsController.dispose();
    }
  }
}

class _RoleCard
    extends StatelessWidget {
  const _RoleCard({
    required this.role,
    required this.roleLabel,
    this.onView,
    this.onEdit,
    this.onDelete,
  });

  final AppRole role;

  final String roleLabel;

  final VoidCallback? onView;

  final VoidCallback? onEdit;

  final VoidCallback? onDelete;

  @override
  Widget build(
    BuildContext context,
  ) {
    return Card(
      child: ListTile(
        contentPadding:
            const EdgeInsets
                .symmetric(
          horizontal:
              14,
          vertical:
              6,
        ),
        leading:
            const CircleAvatar(
          child:
              Icon(
            Icons
                .admin_panel_settings_outlined,
          ),
        ),
        title:
            Text(
          roleLabel,
          style:
              const TextStyle(
            fontWeight:
                FontWeight
                    .w800,
          ),
        ),
        subtitle:
            Text(
          context.tr(
            '${role.permissions.length} permission(s)',
            '${role.permissions.length} صلاحية',
          ),
        ),
        trailing:
            PopupMenuButton<String>(
          onSelected:
              (
                value,
              ) {
            switch (
              value
            ) {
              case 'view':
                onView
                    ?.call();
                break;

              case 'edit':
                onEdit
                    ?.call();
                break;

              case 'delete':
                onDelete
                    ?.call();
                break;
            }
          },
          itemBuilder:
              (_) => [
            if (onView !=
                null)
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
                        Colors
                            .red,
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