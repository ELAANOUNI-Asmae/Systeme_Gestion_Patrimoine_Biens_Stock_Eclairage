import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/config/permissions.dart';
import '../core/localization/bilingual.dart';
import '../screens/biens/biens_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/lighting/lighting_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/public/public_failure_screen.dart';
import '../screens/reports/reports_screen.dart';
import '../screens/roles/roles_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/stock/stock_screen.dart';
import '../screens/users/users_screen.dart';
import '../state/app_state.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  String _selected = 'dashboard';

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final user = state.currentUser;
    if (user == null) return const PublicFailureScreen();

    final items = _items(context, state);
    if (!items.any((item) => item.id == _selected)) _selected = 'dashboard';
    final current = items.firstWhere((item) => item.id == _selected);

    return Scaffold(
      appBar: AppBar(
        title: Text(current.label, style: const TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          Stack(
            children: [
              IconButton(
                tooltip: context.tr('Notifications', 'الإشعارات'),
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => setState(() => _selected = 'notifications'),
              ),
              if (state.unreadNotificationCount > 0)
                Positioned(
                  right: 7,
                  top: 7,
                  child: Container(
                    constraints: const BoxConstraints(minWidth: 17, minHeight: 17),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    child: Center(
                      child: Text(
                        state.unreadNotificationCount > 9 ? '9+' : '${state.unreadNotificationCount}',
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
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
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.asset('assets/images/logo.png', width: 48, height: 48, fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('SGPBSE', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                          Text(state.communeName, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  children: items
                      .map(
                        (item) => ListTile(
                          selected: item.id == _selected,
                          selectedTileColor: Theme.of(context).colorScheme.primary.withOpacity(.10),
                          leading: Icon(item.icon),
                          title: Text(item.label),
                          trailing: item.id == 'notifications' && state.unreadNotificationCount > 0
                              ? Badge(label: Text('${state.unreadNotificationCount}'))
                              : null,
                          onTap: () {
                            Navigator.pop(context);
                            setState(() => _selected = item.id);
                          },
                        ),
                      )
                      .toList(),
                ),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.person_outline),
                title: Text(state.isArabic ? user.fullNameAr : user.fullName),
                subtitle: Text(user.role.name),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _selected = 'profile');
                },
              ),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.redAccent),
                title: Text(context.tr('Déconnexion', 'تسجيل الخروج')),
                onTap: () {
                  state.logout();
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const PublicFailureScreen()),
                    (_) => false,
                  );
                },
              ),
            ],
          ),
        ),
      ),
      body: SafeArea(child: current.builder()),
    );
  }

  List<_MenuItem> _items(BuildContext context, AppState state) {
    final result = <_MenuItem>[
      _MenuItem('dashboard', context.tr('Tableau de bord', 'لوحة القيادة'), Icons.dashboard_outlined, () => const DashboardScreen(onNavigate: null)),
    ];

    if (state.hasPermission(Permissions.getAllUsers)) {
      result.add(_MenuItem('users', context.tr('Utilisateurs', 'المستخدمون'), Icons.people_outline, () => const UsersScreen()));
    }
    if (state.hasPermission(Permissions.getAllRoles)) {
      result.add(_MenuItem('roles', context.tr('Rôles', 'الأدوار'), Icons.admin_panel_settings_outlined, () => const RolesScreen()));
    }
    if (state.hasPermission(Permissions.getAllAssets)) {
      result.add(_MenuItem('biens', context.tr('Biens', 'الممتلكات'), Icons.apartment_outlined, () => const BiensScreen()));
    }
    if (state.hasPermission(Permissions.getAllArticles)) {
      result.add(_MenuItem('stock', context.tr('Stock', 'المخزون'), Icons.inventory_2_outlined, () => const StockScreen()));
    }
    if (state.hasPermission(Permissions.getAllLights)) {
      result.add(_MenuItem('lighting', context.tr('Éclairage public', 'الإنارة العمومية'), Icons.lightbulb_outline, () => const LightingScreen()));
    }
    if (state.hasPermission(Permissions.generateReport)) {
      result.add(_MenuItem('reports', context.tr('Rapports', 'التقارير'), Icons.assessment_outlined, () => const ReportsScreen()));
    }
    result.add(_MenuItem('notifications', context.tr('Notifications', 'الإشعارات'), Icons.notifications_outlined, () => const NotificationsScreen()));
    result.add(_MenuItem('profile', context.tr('Profil', 'الملف الشخصي'), Icons.person_outline, () => const ProfileScreen()));
    if (state.hasPermission(Permissions.manageSettings)) {
      result.add(_MenuItem('settings', context.tr('Paramètres', 'الإعدادات'), Icons.settings_outlined, () => const SettingsScreen()));
    }
    return result;
  }
}

class _MenuItem {
  const _MenuItem(this.id, this.label, this.icon, this.builder);
  final String id;
  final String label;
  final IconData icon;
  final Widget Function() builder;
}
