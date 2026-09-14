import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/config/permissions.dart';
import '../core/localization/bilingual.dart';

import '../screens/biens/biens_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/lighting/lighting_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/reports/reports_screen.dart';
import '../screens/public/public_failure_screen.dart';
import '../screens/roles/roles_screen.dart';
import '../screens/stock/stock_screen.dart';
import '../screens/users/users_screen.dart';

import '../services/auth_local_service.dart';
import '../state/app_state.dart';

class MainShell
    extends StatefulWidget {
  const MainShell({
    super.key,
  });

  @override
  State<MainShell>
      createState() =>
          _MainShellState();
}

class _MainShellState
    extends State<MainShell> {
  String _selected =
      'dashboard';

  final List<String> _navigationHistory = <String>[];

  void _selectPage(String id) {
    if (id == _selected) {
      return;
    }

    setState(() {
      _navigationHistory.add(_selected);
      _selected = id;
    });
  }

  void _goBack() {
    if (_navigationHistory.isEmpty) {
      return;
    }

    setState(() {
      _selected = _navigationHistory.removeLast();
    });
  }

  final LocalAuthService
      _authService =
      LocalAuthService();

  bool _canAccessNotifications(
    AppState state,
  ) {
    return Permissions
        .notificationAccess
        .any(
      state.hasPermission,
    );
  }

  Future<void> _logout(
    AppState state,
  ) async {
    await _authService
        .clearSession();

    state.currentUser =
        null;

    if (!mounted) {
      return;
    }

    Navigator.of(
      context,
    ).pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (_) =>
            const PublicFailureScreen(),
      ),
      (_) => false,
    );
  }

  @override
  Widget build(
    BuildContext context,
  ) {
    final state =
        context.watch<AppState>();

    final user =
        state.currentUser;

    if (user == null) {
      return const PublicFailureScreen();
    }

    final canAccessNotifications =
        _canAccessNotifications(
      state,
    );

    final items =
        _items(
      context,
      state,
    );

    if (!items.any(
      (item) =>
          item.id ==
          _selected,
    )) {
      _selected =
          'dashboard';
      _navigationHistory.clear();
    }

    final current =
        items.firstWhere(
      (item) =>
          item.id ==
          _selected,
    );

    final displayedUserName =
        state.isArabic &&
                user.fullNameAr
                    .trim()
                    .isNotEmpty
            ? user.fullNameAr
            : user.fullName;

    return PopScope(
      canPop:
          _navigationHistory.isEmpty &&
          _selected == 'dashboard',
      onPopInvokedWithResult: (
        didPop,
        result,
      ) {
        if (didPop) {
          return;
        }

        if (_navigationHistory.isNotEmpty) {
          _goBack();
          return;
        }

        if (_selected != 'dashboard') {
          setState(() {
            _selected = 'dashboard';
            _navigationHistory.clear();
          });
        }
      },
      child: Scaffold(
      appBar: AppBar(
        title: Text(
          current.label,
          style:
              const TextStyle(
            fontWeight:
                FontWeight.w800,
          ),
        ),

        actions: [
          if (_navigationHistory.isNotEmpty ||
              _selected != 'dashboard')
            IconButton(
              tooltip: context.tr(
                'Retour',
                'رجوع',
              ),
              icon: const Icon(
                Icons.arrow_back,
              ),
              onPressed: () {
                if (_navigationHistory.isNotEmpty) {
                  _goBack();
                } else {
                  setState(() {
                    _selected = 'dashboard';
                    _navigationHistory.clear();
                  });
                }
              },
            ),
          if (canAccessNotifications)
            Stack(
              children: [
                IconButton(
                  tooltip:
                      context.tr(
                    'Notifications',
                    'الإشعارات',
                  ),
                  icon:
                      const Icon(
                    Icons
                        .notifications_outlined,
                  ),
                  onPressed:
                      () {
                    _selectPage(
                      'notifications',
                    );
                  },
                ),

                if (state
                        .unreadNotificationCount >
                    0)
                  Positioned(
                    right: 7,
                    top: 7,
                    child:
                        Container(
                      constraints:
                          const BoxConstraints(
                        minWidth:
                            17,
                        minHeight:
                            17,
                      ),
                      padding:
                          const EdgeInsets
                              .symmetric(
                        horizontal:
                            4,
                      ),
                      decoration:
                          const BoxDecoration(
                        color:
                            Colors.red,
                        shape:
                            BoxShape
                                .circle,
                      ),
                      child:
                          Center(
                        child:
                            Text(
                          state.unreadNotificationCount >
                                  9
                              ? '9+'
                              : '${state.unreadNotificationCount}',
                          style:
                              const TextStyle(
                            color:
                                Colors
                                    .white,
                            fontSize:
                                9,
                            fontWeight:
                                FontWeight
                                    .bold,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
        ],
      ),

      drawer: Drawer(
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding:
                    const EdgeInsets
                        .fromLTRB(
                  16,
                  10,
                  16,
                  14,
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius:
                          BorderRadius
                              .circular(
                        12,
                      ),
                      child:
                          Image.asset(
                        'assets/images/logo.png',
                        width: 48,
                        height: 48,
                        fit:
                            BoxFit
                                .cover,
                      ),
                    ),

                    const SizedBox(
                      width: 12,
                    ),

                    Expanded(
                      child:
                          Column(
                        crossAxisAlignment:
                            CrossAxisAlignment
                                .start,
                        children: [
                          const Text(
                            'SGPBSE',
                            style:
                                TextStyle(
                              fontWeight:
                                  FontWeight
                                      .w900,
                              fontSize:
                                  18,
                            ),
                          ),

                          Text(
                            state
                                .communeName,
                            maxLines:
                                1,
                            overflow:
                                TextOverflow
                                    .ellipsis,
                            style:
                                Theme.of(
                              context,
                            )
                                    .textTheme
                                    .bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const Divider(
                height: 1,
              ),

              Expanded(
                child:
                    ListView(
                  padding:
                      const EdgeInsets
                          .symmetric(
                    vertical:
                        8,
                  ),
                  children:
                      items.map(
                    (
                      item,
                    ) {
                      return ListTile(
                        selected:
                            item.id ==
                                _selected,
                        selectedTileColor:
                            Theme.of(
                          context,
                        )
                                .colorScheme
                                .primary
                                .withValues(
                                  alpha:
                                      .10,
                                ),
                        leading:
                            Icon(
                          item.icon,
                        ),
                        title:
                            Text(
                          item.label,
                        ),
                        trailing:
                            item.id ==
                                        'notifications' &&
                                    state.unreadNotificationCount >
                                        0
                                ? Badge(
                                    label:
                                        Text(
                                      state.unreadNotificationCount >
                                              9
                                          ? '9+'
                                          : '${state.unreadNotificationCount}',
                                    ),
                                  )
                                : null,
                        onTap:
                            () {
                          Navigator.of(
                            context,
                          ).pop();

                          _selectPage(
                            item.id,
                          );
                        },
                      );
                    },
                  ).toList(),
                ),
              ),

              const Divider(
                height: 1,
              ),

              Padding(
                padding:
                    const EdgeInsets
                        .fromLTRB(
                  12,
                  8,
                  12,
                  4,
                ),
                child:
                    ListTile(
                  leading:
                      CircleAvatar(
                    child:
                        Text(
                      displayedUserName
                              .trim()
                              .isEmpty
                          ? '?'
                          : displayedUserName
                              .trim()[0]
                              .toUpperCase(),
                    ),
                  ),
                  title:
                      Text(
                    displayedUserName,
                    maxLines:
                        1,
                    overflow:
                        TextOverflow
                            .ellipsis,
                  ),
                  subtitle:
                      Text(
                    user.role
                        .name,
                    maxLines:
                        1,
                    overflow:
                        TextOverflow
                            .ellipsis,
                  ),
                  onTap:
                      () {
                    Navigator.of(
                      context,
                    ).pop();

                    _selectPage(
                      'profile',
                    );
                  },
                ),
              ),

              Padding(
                padding:
                    const EdgeInsets
                        .fromLTRB(
                  12,
                  0,
                  12,
                  12,
                ),
                child:
                    ListTile(
                  leading:
                      const Icon(
                    Icons
                        .logout,
                    color:
                        Colors.red,
                  ),
                  title:
                      Text(
                    context.tr(
                      'Déconnexion',
                      'تسجيل الخروج',
                    ),
                    style:
                        const TextStyle(
                      color:
                          Colors.red,
                      fontWeight:
                          FontWeight
                              .w600,
                    ),
                  ),
                  onTap:
                      () async {
                    Navigator.of(
                      context,
                    ).pop();

                    await _logout(
                      state,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),

      body:
          current.builder(),
      ),
    );
  }

  List<_MenuItem> _items(
    BuildContext context,
    AppState state,
  ) {
    final result =
        <_MenuItem>[
      _MenuItem(
        'dashboard',
        context.tr(
          'Tableau de bord',
          'لوحة القيادة',
        ),
        Icons
            .dashboard_outlined,
        () =>
            const DashboardScreen(),
      ),
    ];

    // USERS
    if (state.hasPermission(
      Permissions
          .getAllProfils,
    )) {
      result.add(
        _MenuItem(
          'users',
          context.tr(
            'Utilisateurs',
            'المستخدمون',
          ),
          Icons
              .people_outline,
          () =>
              const UsersScreen(),
        ),
      );
    }

    // ROLES
    if (state.hasPermission(
      Permissions
          .getAllRoles,
    )) {
      result.add(
        _MenuItem(
          'roles',
          context.tr(
            'Rôles',
            'الأدوار',
          ),
          Icons
              .admin_panel_settings_outlined,
          () =>
              const RolesScreen(),
        ),
      );
    }

    // BIENS
    if (state.hasPermission(
      Permissions
          .getAllAssets,
    )) {
      result.add(
        _MenuItem(
          'biens',
          context.tr(
            'Biens',
            'الممتلكات',
          ),
          Icons
              .apartment_outlined,
          () =>
              const BiensScreen(),
        ),
      );
    }

    // STOCK
    if (state.hasPermission(
      Permissions
          .getAllItems,
    )) {
      result.add(
        _MenuItem(
          'stock',
          context.tr(
            'Stock',
            'المخزون',
          ),
          Icons
              .inventory_2_outlined,
          () =>
              const StockScreen(),
        ),
      );
    }

    // ECLAIRAGE
    if (state.hasPermission(
      Permissions
          .getAllLightPoint,
    )) {
      result.add(
        _MenuItem(
          'lighting',
          context.tr(
            'Éclairage public',
            'الإنارة العمومية',
          ),
          Icons
              .lightbulb_outline,
          () =>
              const LightingScreen(),
        ),
      );
    }

    // RAPPORTS - visible selon les modules réellement accessibles
    if (Permissions.reportAccess.any(state.hasPermission)) {
      result.add(
        _MenuItem(
          'reports',
          context.tr('Rapports', 'التقارير'),
          Icons.bar_chart_outlined,
          () => const ReportsScreen(),
        ),
      );
    }

    // NOTIFICATIONS
    if (_canAccessNotifications(
      state,
    )) {
      result.add(
        _MenuItem(
          'notifications',
          context.tr(
            'Notifications',
            'الإشعارات',
          ),
          Icons
              .notifications_outlined,
          () =>
              const NotificationsScreen(),
        ),
      );
    }

    // PROFILE
    //
    // /sgpbse/user/me est accessible
    // à tout utilisateur authentifié.

    result.add(
      _MenuItem(
        'profile',
        context.tr(
          'Profil',
          'الملف الشخصي',
        ),
        Icons
            .person_outline,
        () =>
            const ProfileScreen(),
      ),
    );

    // SETTINGS reste masqué tant qu'aucune fonctionnalité Backend dédiée n'existe.

    return result;
  }
}

class _MenuItem {
  const _MenuItem(
    this.id,
    this.label,
    this.icon,
    this.builder,
  );

  final String id;

  final String label;

  final IconData icon;

  final Widget Function()
      builder;
}
