import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../services/bien_api_service.dart';
import '../../services/user_api_service.dart';
import '../../state/app_state.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key, this.onNavigate});

  final ValueChanged<String>? onNavigate;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _loading = true;
  bool _partialError = false;

  int? _usersTotal;
  int? _usersActive;
  int? _usersInactive;
  int? _assetsTotal;
  int? _assetsAvailable;
  int? _assetsMaintenance;
  int? _stockArticles;
  int? _stockQuantity;
  int? _stockLow;
  int? _lightsTotal;
  int? _lightsActive;
  int? _lightsIssue;
  int? _failuresOpen;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadDashboard());
  }

  Future<void> _loadDashboard() async {
    if (!mounted) return;
    final state = context.read<AppState>();
    setState(() {
      _loading = true;
      _partialError = false;
    });
    var hasError = false;

    if (state.hasPermission(Permissions.getAllProfils)) {
      try {
        final users = await UserApiService().getAllUsers();
        _usersTotal = users.length;
        _usersActive = users.where((user) => user.isActive).length;
        _usersInactive = users.length - (_usersActive ?? 0);
      } catch (_) { hasError = true; }
    }

    if (state.hasPermission(Permissions.getAllAssets)) {
      try {
        final assets = await BienApiService().getAll();
        _assetsTotal = assets.length;
        _assetsAvailable = assets.where((item) => item.status.toUpperCase() == 'AVAILABLE').length;
        _assetsMaintenance = assets.where((item) => item.status.toUpperCase().replaceAll('_', '') == 'UNDERMAINTENANCE').length;
      } catch (_) { hasError = true; }
    }

    if (state.hasPermission(Permissions.getAllItems)) {
      try {
        await state.loadStockData();
        if (state.stockError != null) throw StateError(state.stockError!);
        _stockArticles = state.articles.length;
        _stockQuantity = state.articles.fold<int>(0, (sum, item) => sum + item.quantity);
        _stockLow = state.lowStockArticles.length;
      } catch (_) { hasError = true; }
    }

    if (state.hasPermission(Permissions.getAllLightPoint)) {
      try {
        await state.loadLightingData();
        if (state.lightingError != null) throw StateError(state.lightingError!);
        _lightsTotal = state.lights.length;
        _lightsActive = state.lights.where((item) => item.status.name.toUpperCase() == 'ACTIVE').length;
        _lightsIssue = state.lights.where((item) {
          final value = item.status.name.toUpperCase();
          return value == 'DAMAGED' || value == 'UNDERMAINTENANCE';
        }).length;
        if (state.hasPermission(Permissions.getAllFailure)) {
          _failuresOpen = state.unresolvedFailures.length;
        }
      } catch (_) { hasError = true; }
    }

    if (!mounted) return;
    setState(() {
      _partialError = hasError;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final user = state.currentUser;
    final displayName = user == null
        ? ''
        : context.isArabic && user.fullNameAr.trim().isNotEmpty
            ? user.fullNameAr
            : user.fullName;

    final canUsers = state.hasPermission(Permissions.getAllProfils);
    final canAssets = state.hasPermission(Permissions.getAllAssets);
    final canStock = state.hasPermission(Permissions.getAllItems);
    final canLighting = state.hasPermission(Permissions.getAllLightPoint);
    final canFailures = state.hasPermission(Permissions.getAllFailure);

    final statistics = <_DashboardStat>[
      if (canUsers) ...[
        _DashboardStat(title: context.tr('Utilisateurs', 'المستخدمون'), subtitle: context.tr('Comptes enregistrés', 'الحسابات المسجلة'), value: _usersTotal, icon: Icons.people_outline),
        _DashboardStat(title: context.tr('Utilisateurs actifs', 'المستخدمون النشطون'), subtitle: context.tr('Comptes actifs', 'الحسابات النشطة'), value: _usersActive, icon: Icons.verified_user_outlined),
        _DashboardStat(title: context.tr('Utilisateurs inactifs', 'المستخدمون غير النشطين'), subtitle: context.tr('Comptes désactivés', 'الحسابات المعطلة'), value: _usersInactive, icon: Icons.person_off_outlined),
      ],
      if (canAssets) ...[
        _DashboardStat(title: context.tr('Biens', 'الممتلكات'), subtitle: context.tr('Patrimoine enregistré', 'الممتلكات المسجلة'), value: _assetsTotal, icon: Icons.apartment_outlined),
        _DashboardStat(title: context.tr('Biens disponibles', 'الممتلكات المتاحة'), subtitle: context.tr('Disponibles', 'متاحة'), value: _assetsAvailable, icon: Icons.check_circle_outline),
        _DashboardStat(title: context.tr('En maintenance', 'قيد الصيانة'), subtitle: context.tr('Biens en maintenance', 'ممتلكات قيد الصيانة'), value: _assetsMaintenance, icon: Icons.build_outlined),
      ],
      if (canStock) ...[
        _DashboardStat(title: context.tr('Articles', 'المواد'), subtitle: context.tr('Références en stock', 'مراجع المخزون'), value: _stockArticles, icon: Icons.inventory_2_outlined),
        _DashboardStat(title: context.tr('Quantité totale', 'الكمية الإجمالية'), subtitle: context.tr('Toutes unités confondues', 'مجموع الوحدات'), value: _stockQuantity, icon: Icons.numbers_outlined),
      ],
      if (canLighting) ...[
        _DashboardStat(title: context.tr('Points lumineux', 'نقاط الإنارة'), subtitle: context.tr('Équipements suivis', 'معدات الإنارة المتابعة'), value: _lightsTotal, icon: Icons.lightbulb_outline),
        _DashboardStat(title: context.tr('Points opérationnels', 'نقاط الإنارة المشتغلة'), subtitle: context.tr('Fonctionnement normal', 'تعمل بشكل عادي'), value: _lightsActive, icon: Icons.check_circle_outline),
      ],
    ];

    final alerts = <_DashboardAlert>[
      if (canStock)
        _DashboardAlert(title: context.tr('Stock faible', 'مخزون منخفض'), value: _stockLow, icon: Icons.warning_amber_rounded, type: _DashboardAlertType.stock),
      if (canLighting)
        _DashboardAlert(title: context.tr('En panne / maintenance', 'معطلة / قيد الصيانة'), value: _lightsIssue, icon: Icons.build_outlined, type: _DashboardAlertType.failure),
      if (canFailures)
        _DashboardAlert(title: context.tr('Pannes ouvertes', 'الأعطاب المفتوحة'), value: _failuresOpen, icon: Icons.report_problem_outlined, type: _DashboardAlertType.failure),
    ];

    final hasDashboardData = statistics.isNotEmpty || alerts.isNotEmpty;

    return RefreshIndicator(
      onRefresh: _loadDashboard,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          _WelcomeCard(name: displayName, role: user?.role.name ?? '', loading: _loading, onRefresh: _loading ? null : _loadDashboard),
          if (_partialError) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: Colors.amber.withValues(alpha: .10), border: Border.all(color: Colors.amber.withValues(alpha: .45)), borderRadius: BorderRadius.circular(16)),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Icon(Icons.warning_amber_rounded, color: Colors.amber), const SizedBox(width: 10), Expanded(child: Text(context.tr('Certaines données du tableau de bord n’ont pas pu être chargées.', 'تعذر تحميل بعض بيانات لوحة القيادة.')))]),
            ),
          ],
          if (statistics.isNotEmpty) ...[
            const SizedBox(height: 16),
            LayoutBuilder(builder: (context, constraints) {
              final width = constraints.maxWidth >= 700 ? (constraints.maxWidth - 36) / 4 : (constraints.maxWidth - 12) / 2;
              return Wrap(spacing: 12, runSpacing: 12, children: statistics.map((item) => SizedBox(width: width, child: _StatisticCard(statistic: item, loading: _loading))).toList());
            }),
          ],
          if (alerts.isNotEmpty) ...[
            const SizedBox(height: 16),
            LayoutBuilder(builder: (context, constraints) {
              final width = constraints.maxWidth >= 700 ? (constraints.maxWidth - 12) / 2 : constraints.maxWidth;
              return Wrap(spacing: 12, runSpacing: 12, children: alerts.map((item) => SizedBox(width: width, child: _AlertCard(alert: item, loading: _loading))).toList());
            }),
          ],
          if (!hasDashboardData && !_loading) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Theme.of(context).colorScheme.surface, borderRadius: BorderRadius.circular(20), border: Border.all(color: Theme.of(context).dividerColor)),
              child: Column(children: [const Icon(Icons.dashboard_outlined, size: 34), const SizedBox(height: 12), Text(context.tr('Tableau de bord', 'لوحة القيادة'), style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)), const SizedBox(height: 6), Text(context.tr('Votre rôle ne possède aucun module métier consultable.', 'لا يتوفر لهذا الدور أي وحدة مهنية قابلة للعرض.'), textAlign: TextAlign.center)]),
            ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ==========================================================
// WELCOME CARD
// ==========================================================

class _WelcomeCard
    extends StatelessWidget {
  const _WelcomeCard({
    required this.name,
    required this.role,
    required this.loading,
    required this.onRefresh,
  });

  final String name;

  final String role;

  final bool loading;

  final Future<void> Function()?
      onRefresh;

  @override
  Widget build(
    BuildContext context,
  ) {
    final greeting =
        context.isArabic
            ? name.isEmpty
                ? 'مرحباً'
                : 'مرحباً $name'
            : name.isEmpty
                ? 'Bonjour'
                : 'Bonjour $name';

    return Container(
      padding:
          const EdgeInsets.all(
        20,
      ),
      decoration:
          BoxDecoration(
        borderRadius:
            BorderRadius.circular(
          24,
        ),
        border:
            Border.all(
          color:
              Colors.orange
                  .withValues(
            alpha: .20,
          ),
        ),
        gradient:
            LinearGradient(
          begin:
              Alignment.topLeft,
          end:
              Alignment.bottomRight,
          colors: [
            Colors.orange
                .withValues(
              alpha: .10,
            ),
            Theme.of(
              context,
            )
                .colorScheme
                .surface,
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment
                .start,
        children: [
          Text(
            'SGPBSE',
            style:
                Theme.of(
              context,
            )
                    .textTheme
                    .labelLarge
                    ?.copyWith(
                      color:
                          Colors
                              .deepOrange,
                      fontWeight:
                          FontWeight
                              .w900,
                      letterSpacing:
                          2,
                    ),
          ),

          const SizedBox(
            height: 8,
          ),

          Text(
            greeting,
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

          const SizedBox(
            height: 6,
          ),

          Text(
            context.tr(
              'Vue générale du patrimoine communal, du stock et de l’éclairage public.',
              'نظرة عامة على الممتلكات الجماعية والمخزون والإنارة العمومية.',
            ),
            style:
                Theme.of(
              context,
            )
                    .textTheme
                    .bodyMedium
                    ?.copyWith(
                      color:
                          Theme.of(
                        context,
                      )
                              .colorScheme
                              .onSurfaceVariant,
                    ),
          ),

          const SizedBox(
            height: 18,
          ),

          Row(
            children: [
              Expanded(
                child:
                    Container(
                  padding:
                      const EdgeInsets
                          .symmetric(
                    horizontal:
                        14,
                    vertical:
                        12,
                  ),
                  decoration:
                      BoxDecoration(
                    color:
                        Theme.of(
                      context,
                    )
                            .colorScheme
                            .surface
                            .withValues(
                              alpha:
                                  .85,
                            ),
                    borderRadius:
                        BorderRadius.circular(
                      16,
                    ),
                    border:
                        Border.all(
                      color:
                          Colors
                              .orange
                              .withValues(
                        alpha:
                            .18,
                      ),
                    ),
                  ),
                  child:
                      Column(
                    crossAxisAlignment:
                        CrossAxisAlignment
                            .start,
                    children: [
                      Text(
                        context.tr(
                          'CONNECTÉ EN TANT QUE',
                          'متصل بصفة',
                        ),
                        style:
                            Theme.of(
                          context,
                        )
                                .textTheme
                                .labelSmall
                                ?.copyWith(
                                  color:
                                      Theme.of(
                                    context,
                                  )
                                          .colorScheme
                                          .onSurfaceVariant,
                                  fontWeight:
                                      FontWeight
                                          .w700,
                                ),
                      ),

                      const SizedBox(
                        height:
                            4,
                      ),

                      Text(
                        role.isEmpty
                            ? '-'
                            : role,
                        style:
                            const TextStyle(
                          fontWeight:
                              FontWeight
                                  .w900,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(
                width: 10,
              ),

              IconButton.filledTonal(
                tooltip:
                    context.tr(
                  'Actualiser',
                  'تحديث',
                ),
                onPressed:
                    loading ||
                            onRefresh ==
                                null
                        ? null
                        : () {
                            onRefresh!();
                          },
                icon:
                    loading
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
                        : const Icon(
                            Icons
                                .refresh,
                          ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ==========================================================
// STATISTIC CARD
// ==========================================================

class _StatisticCard
    extends StatelessWidget {
  const _StatisticCard({
    required this.statistic,
    required this.loading,
  });

  final _DashboardStat
      statistic;

  final bool loading;

  @override
  Widget build(
    BuildContext context,
  ) {
    return Container(
      padding:
          const EdgeInsets.all(
        16,
      ),
      decoration:
          BoxDecoration(
        color:
            Theme.of(
          context,
        ).colorScheme.surface,
        borderRadius:
            BorderRadius.circular(
          20,
        ),
        border:
            Border.all(
          color:
              Theme.of(
            context,
          ).dividerColor,
        ),
        boxShadow: [
          BoxShadow(
            color:
                Colors.black
                    .withValues(
              alpha: .04,
            ),
            blurRadius:
                12,
            offset:
                const Offset(
              0,
              4,
            ),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment
                .start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .start,
              children: [
                Text(
                  statistic.title,
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
                            color:
                                Theme.of(
                              context,
                            )
                                    .colorScheme
                                    .onSurfaceVariant,
                          ),
                ),

                const SizedBox(
                  height: 8,
                ),

                Text(
                  loading &&
                          statistic
                                  .value ==
                              null
                      ? '...'
                      : statistic.value
                              ?.toString() ??
                          '—',
                  style:
                      Theme.of(
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
                  height: 4,
                ),

                Text(
                  statistic.subtitle,
                  style:
                      Theme.of(
                    context,
                  )
                          .textTheme
                          .bodySmall
                          ?.copyWith(
                            color:
                                Theme.of(
                              context,
                            )
                                    .colorScheme
                                    .onSurfaceVariant,
                          ),
                ),
              ],
            ),
          ),

          const SizedBox(
            width: 8,
          ),

          Container(
            width: 48,
            height: 48,
            decoration:
                BoxDecoration(
              color:
                  Colors.orange
                      .withValues(
                alpha: .15,
              ),
              borderRadius:
                  BorderRadius.circular(
                15,
              ),
            ),
            child: Icon(
              statistic.icon,
              color:
                  Colors.deepOrange,
            ),
          ),
        ],
      ),
    );
  }
}

// ==========================================================
// ALERT CARD
// ==========================================================

class _AlertCard
    extends StatelessWidget {
  const _AlertCard({
    required this.alert,
    required this.loading,
  });

  final _DashboardAlert alert;

  final bool loading;

  @override
  Widget build(
    BuildContext context,
  ) {
    final isStock =
        alert.type ==
        _DashboardAlertType
            .stock;

    final color =
        isStock
            ? Colors.red
            : Colors.deepOrange;

    return Container(
      padding:
          const EdgeInsets.all(
        17,
      ),
      decoration:
          BoxDecoration(
        color:
            color.withValues(
          alpha: .07,
        ),
        borderRadius:
            BorderRadius.circular(
          20,
        ),
        border:
            Border.all(
          color:
              color.withValues(
            alpha: .30,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child:
                Column(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .start,
              children: [
                Text(
                  alert.title,
                  style:
                      TextStyle(
                    color:
                        color,
                    fontWeight:
                        FontWeight
                            .w800,
                  ),
                ),

                const SizedBox(
                  height: 8,
                ),

                Text(
                  loading &&
                          alert.value ==
                              null
                      ? '...'
                      : alert.value
                              ?.toString() ??
                          '—',
                  style:
                      Theme.of(
                    context,
                  )
                          .textTheme
                          .headlineMedium
                          ?.copyWith(
                            color:
                                color,
                            fontWeight:
                                FontWeight
                                    .w900,
                          ),
                ),
              ],
            ),
          ),

          Icon(
            alert.icon,
            size: 30,
            color: color,
          ),
        ],
      ),
    );
  }
}

// ==========================================================
// MODELS
// ==========================================================

class _DashboardStat {
  const _DashboardStat({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.icon,
  });

  final String title;

  final String subtitle;

  final int? value;

  final IconData icon;
}

class _DashboardAlert {
  const _DashboardAlert({
    required this.title,
    required this.value,
    required this.icon,
    required this.type,
  });

  final String title;

  final int? value;

  final IconData icon;

  final _DashboardAlertType
      type;
}

enum _DashboardAlertType {
  failure,
  stock,
}