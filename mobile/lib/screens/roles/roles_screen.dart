import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/permission_labels.dart';
import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/user_models.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';

class RolesScreen
    extends StatefulWidget {
  const RolesScreen({
    super.key,
  });

  @override
  State<RolesScreen>
      createState() =>
          _RolesScreenState();
}

class _RolesScreenState
    extends State<RolesScreen> {
  final _searchController =
      TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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
      default:
        return roleName;
    }
  }

  List<AppRole> _filteredRoles(
    BuildContext context,
    AppState state,
  ) {
    final query =
        _searchController.text
            .trim()
            .toLowerCase();

    if (query.isEmpty) {
      return state.roles;
    }

    return state.roles.where(
      (role) {
        final displayName =
            _roleLabel(
          context,
          role.name,
        ).toLowerCase();

        return role.name
                .toLowerCase()
                .contains(
                  query,
                ) ||
            displayName.contains(
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
              Permissions
                  .createRole,
            ))
              IconButton.filled(
                tooltip:
                    context.tr(
                  'Ajouter un rôle',
                  'إضافة دور',
                ),
                onPressed: () =>
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
              'Rechercher un rôle',
              'البحث عن دور',
            ),
          ),
        ),
        const SizedBox(
          height: 10,
        ),
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
                  const EdgeInsets.all(
                24,
              ),
              child: Text(
                context.tr(
                  'Aucun rôle trouvé.',
                  'لم يتم العثور على أي دور.',
                ),
                textAlign:
                    TextAlign.center,
              ),
            ),
          )
        else
          ...roles.map(
            (role) =>
                _RoleCard(
              role: role,
              roleLabel:
                  _roleLabel(
                context,
                role.name,
              ),
              onView: state
                      .hasPermission(
                    Permissions
                        .getRoleInfos,
                  )
                  ? () =>
                      _showDetails(
                        context,
                        role,
                      )
                  : null,
              onEdit: state
                      .hasPermission(
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
              onDelete: state
                          .hasPermission(
                        Permissions
                            .deleteRole,
                      ) &&
                      role.name !=
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
    );
  }

  Future<void> _showDetails(
    BuildContext context,
    AppRole role,
  ) {
    final permissions =
        role.permissions.toList()
          ..sort(
            (first, second) =>
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
                    TextAlign.center,
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
                    TextAlign.center,
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
                      FontWeight.w800,
                ),
              ),
              const SizedBox(
                height: 8,
              ),
              ...permissions.map(
                (permission) =>
                    Card(
                  margin:
                      const EdgeInsets
                          .only(
                    bottom: 8,
                  ),
                  child: ListTile(
                    leading:
                        const Icon(
                      Icons
                          .check_circle_outline,
                      color:
                          Colors.green,
                    ),
                    title: Text(
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

    if (
      !confirmed ||
      !context.mounted
    ) {
      return;
    }

    try {
      context
          .read<AppState>()
          .deleteRole(
            role.id,
          );

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Rôle supprimé.',
              'تم حذف الدور.',
            ),
          ),
        ),
      );
    } on StateError catch (
      error
    ) {
      final message =
          error.message ==
                  'ROLE_IN_USE'
              ? context.tr(
                  'Ce rôle est utilisé par un ou plusieurs utilisateurs.',
                  'هذا الدور مستخدم من طرف مستخدم واحد أو أكثر.',
                )
              : context.tr(
                  'Le rôle ADMIN ne peut pas être supprimé.',
                  'لا يمكن حذف دور مدير النظام.',
                );

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(
        SnackBar(
          content:
              Text(message),
        ),
      );
    }
  }

  Future<void> _openForm(
    BuildContext context, {
    AppRole? role,
  }) async {
    final state =
        context.read<AppState>();

    final formKey =
        GlobalKey<FormState>();

    final nameController =
        TextEditingController(
      text:
          role?.name ??
          '',
    );

    final selected =
        <String>{
      ...?role?.permissions,
    };

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

            final allSelected =
                selected.length ==
                    Permissions
                        .all.length;

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
                  key: formKey,
                  child: Column(
                    crossAxisAlignment:
                        CrossAxisAlignment
                            .stretch,
                    children: [
                      Text(
                        role == null
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
                      const SizedBox(
                        height: 14,
                      ),
                      TextFormField(
                        controller:
                            nameController,
                        textCapitalization:
                            TextCapitalization
                                .characters,
                        validator:
                            (value) {
                          final name =
                              value?.trim() ??
                                  '';

                          if (
                            name.isEmpty
                          ) {
                            return sheetContext
                                .tr(
                              'Le nom du rôle est obligatoire.',
                              'اسم الدور إجباري.',
                            );
                          }

                          final duplicate =
                              state.roles.any(
                            (item) =>
                                item.id !=
                                    role?.id &&
                                item.name
                                        .toUpperCase() ==
                                    name
                                        .toUpperCase(),
                          );

                          if (
                            duplicate
                          ) {
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
                      const SizedBox(
                        height: 18,
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
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
                                allSelected
                                    ? null
                                    : () {
                                        setLocalState(
                                          () {
                                            selected
                                              ..clear()
                                              ..addAll(
                                                Permissions.all,
                                              );
                                          },
                                        );
                                      },
                            child: Text(
                              sheetContext
                                  .tr(
                                'Tout sélectionner',
                                'تحديد الكل',
                              ),
                            ),
                          ),
                          TextButton(
                            onPressed:
                                selected.isEmpty
                                    ? null
                                    : () {
                                        setLocalState(
                                          selected.clear,
                                        );
                                      },
                            child: Text(
                              sheetContext
                                  .tr(
                                'Tout désélectionner',
                                'إلغاء تحديد الكل',
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (
                        selected.isEmpty
                      )
                        Padding(
                          padding:
                              const EdgeInsets
                                  .only(
                            bottom: 8,
                          ),
                          child: Text(
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
                      ...Permissions.all.map(
                        (permission) =>
                            CheckboxListTile(
                          contentPadding:
                              EdgeInsets.zero,
                          value:
                              selected.contains(
                            permission,
                          ),
                          title: Text(
                            PermissionLabels.of(
                              sheetContext,
                              permission,
                            ),
                          ),
                          onChanged:
                              (checked) {
                            setLocalState(
                              () {
                                if (
                                  checked ==
                                  true
                                ) {
                                  selected.add(
                                    permission,
                                  );
                                } else {
                                  selected.remove(
                                    permission,
                                  );
                                }
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(
                        height: 14,
                      ),
                      FilledButton(
                        onPressed: () {
                          if (
                            !formKey
                                .currentState!
                                .validate()
                          ) {
                            return;
                          }

                          if (
                            selected.isEmpty
                          ) {
                            setLocalState(
                              () {},
                            );
                            return;
                          }

                          try {
                            state.saveRole(
                              id:
                                  role?.id,
                              name:
                                  nameController
                                      .text
                                      .trim(),
                              permissions:
                                  selected,
                            );

                            Navigator.of(
                              sheetContext,
                            ).pop();
                          } on StateError {
                            ScaffoldMessenger.of(
                              sheetContext,
                            ).showSnackBar(
                              SnackBar(
                                content: Text(
                                  sheetContext
                                      .tr(
                                    'Un rôle avec ce nom existe déjà.',
                                    'يوجد دور بهذا الاسم من قبل.',
                                  ),
                                ),
                              ),
                            );
                          }
                        },
                        child: Text(
                          sheetContext.tr(
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
      nameController.dispose();
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
          horizontal: 14,
          vertical: 6,
        ),
        leading:
            const CircleAvatar(
          child: Icon(
            Icons
                .admin_panel_settings_outlined,
          ),
        ),
        title: Text(
          roleLabel,
          style:
              const TextStyle(
            fontWeight:
                FontWeight.w800,
          ),
        ),
        subtitle: Text(
          context.tr(
            '${role.permissions.length} permission(s)',
            '${role.permissions.length} صلاحية',
          ),
        ),
        trailing:
            PopupMenuButton<String>(
          onSelected:
              (value) {
            switch (value) {
              case 'view':
                onView?.call();
                break;
              case 'edit':
                onEdit?.call();
                break;
              case 'delete':
                onDelete?.call();
                break;
            }
          },
          itemBuilder:
              (_) => [
            if (onView != null)
              PopupMenuItem<String>(
                value: 'view',
                child: ListTile(
                  contentPadding:
                      EdgeInsets.zero,
                  leading:
                      const Icon(
                    Icons
                        .visibility_outlined,
                  ),
                  title: Text(
                    context.tr(
                      'Voir',
                      'عرض',
                    ),
                  ),
                ),
              ),
            if (onEdit != null)
              PopupMenuItem<String>(
                value: 'edit',
                child: ListTile(
                  contentPadding:
                      EdgeInsets.zero,
                  leading:
                      const Icon(
                    Icons
                        .edit_outlined,
                  ),
                  title: Text(
                    context.tr(
                      'Modifier',
                      'تعديل',
                    ),
                  ),
                ),
              ),
            if (onDelete != null)
              PopupMenuItem<String>(
                value: 'delete',
                child: ListTile(
                  contentPadding:
                      EdgeInsets.zero,
                  leading:
                      const Icon(
                    Icons
                        .delete_outline,
                    color: Colors.red,
                  ),
                  title: Text(
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
