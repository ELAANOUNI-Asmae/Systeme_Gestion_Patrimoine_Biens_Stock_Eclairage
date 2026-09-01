import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/bien.dart';
import '../../models/lighting.dart';
import '../../models/stock.dart';
import '../../state/app_state.dart';

class DashboardScreen
    extends StatelessWidget {
  const DashboardScreen({
    super.key,
    this.onNavigate,
  });

  final ValueChanged<String>?
      onNavigate;

  @override
  Widget build(
    BuildContext context,
  ) {
    final state =
        context.watch<AppState>();

    final user =
        state.currentUser;

    final displayName =
        user == null
            ? ''
            : context.isArabic
                ? user.fullNameAr
                : user.fullName;

    final activeLights =
        state.lights
            .where(
              (light) =>
                  light.status ==
                  LightStatus.active,
            )
            .length;

    final damagedLights =
        state.lights
            .where(
              (light) =>
                  light.status ==
                  LightStatus.damaged,
            )
            .length;

    final maintenanceLights =
        state.lights
            .where(
              (light) =>
                  light.status ==
                  LightStatus
                      .underMaintenance,
            )
            .length;

    final maintenanceBiens =
        state.activeBiens
            .where(
              (bien) =>
                  bien.status ==
                  AssetStatus
                      .underMaintenance,
            )
            .toList();

    final visibleStatistics =
        <_StatItem>[
      if (state.hasPermission(
        Permissions
            .getAllUsers,
      ))
        _StatItem(
          label:
              context.tr(
            'Utilisateurs',
            'المستخدمون',
          ),
          value:
              state.users.length,
          description:
              context.tr(
            'Comptes enregistrés',
            'الحسابات المسجلة',
          ),
          icon:
              Icons
                  .people_outline,
        ),
      if (state.hasPermission(
        Permissions
            .getAllAssets,
      ))
        _StatItem(
          label:
              context.tr(
            'Biens',
            'الممتلكات',
          ),
          value:
              state.activeBiens.length,
          description:
              context.tr(
            'Biens communaux',
            'الممتلكات الجماعية',
          ),
          icon:
              Icons
                  .apartment_outlined,
        ),
      if (state.hasPermission(
        Permissions
            .getAllArticles,
      ))
        _StatItem(
          label:
              context.tr(
            'Articles',
            'المواد',
          ),
          value:
              state.articles.length,
          description:
              context.tr(
            'Articles en stock',
            'مواد المخزون',
          ),
          icon:
              Icons
                  .inventory_2_outlined,
        ),
      if (state.hasPermission(
        Permissions
            .getAllLights,
      ))
        _StatItem(
          label:
              context.tr(
            'Éclairage',
            'الإنارة',
          ),
          value:
              state.lights.length,
          description:
              context.tr(
            'Points lumineux',
            'نقط الإنارة',
          ),
          icon:
              Icons
                  .lightbulb_outline,
        ),
    ];

    final alerts =
        <_AlertItem>[
      ...state.lowStockArticles.map(
        (article) =>
            _AlertItem(
          title:
              context.tr(
            'Stock faible',
            'مخزون منخفض',
          ),
          message:
              '${context.isArabic ? article.designationAr : article.designation} : ${article.quantity} ${_unitLabel(context, article.unit)}',
          kind:
              _AlertKind.stock,
        ),
      ),
      ...state.unresolvedFailures.map(
        (failure) =>
            _AlertItem(
          title:
              context.tr(
            'Panne d’éclairage',
            'عطل في الإنارة',
          ),
          message:
              '${failure.lightReference} — ${context.isArabic ? failure.lightDesignationAr : failure.lightDesignation}',
          kind:
              _AlertKind.lighting,
        ),
      ),
      ...maintenanceBiens.map(
        (bien) =>
            _AlertItem(
          title:
              context.tr(
            'Bien en maintenance',
            'ممتلك قيد الصيانة',
          ),
          message:
              context.isArabic
                  ? bien.designationAr
                  : bien.designation,
          kind:
              _AlertKind.asset,
        ),
      ),
    ];

    final stockEntries =
        state.movements
            .where(
              (movement) =>
                  movement.type ==
                  MovementType.entry,
            )
            .fold<int>(
              0,
              (
                sum,
                movement,
              ) =>
                  sum +
                  movement.quantity,
            );

    final stockExits =
        state.movements
            .where(
              (movement) =>
                  movement.type ==
                  MovementType.exit,
            )
            .fold<int>(
              0,
              (
                sum,
                movement,
              ) =>
                  sum +
                  movement.quantity,
            );

    return ListView(
      padding:
          const EdgeInsets.all(
        16,
      ),
      children: [
        _WelcomeCard(
          name:
              displayName,
          role:
              user?.role.name ??
              '',
        ),
        if (visibleStatistics
            .isNotEmpty) ...[
          const SizedBox(
            height: 16,
          ),
          LayoutBuilder(
            builder: (
              context,
              constraints,
            ) {
              final cardWidth =
                  constraints.maxWidth >=
                          700
                      ? (constraints
                                  .maxWidth -
                              36) /
                          4
                      : (constraints
                                  .maxWidth -
                              12) /
                          2;

              return Wrap(
                spacing:
                    12,
                runSpacing:
                    12,
                children:
                    visibleStatistics
                        .map(
                          (
                            item,
                          ) =>
                              SizedBox(
                            width:
                                cardWidth,
                            child:
                                _StatisticCard(
                              item:
                                  item,
                            ),
                          ),
                        )
                        .toList(),
              );
            },
          ),
        ],
        const SizedBox(
          height: 16,
        ),
        LayoutBuilder(
          builder: (
            context,
            constraints,
          ) {
            final width =
                constraints.maxWidth >=
                        700
                    ? (constraints
                                .maxWidth -
                            36) /
                        4
                    : (constraints
                                .maxWidth -
                            12) /
                        2;

            final items =
                <Widget>[
              if (state.hasPermission(
                Permissions
                    .getStockAlerts,
              ))
                _AlertStatCard(
                  label:
                      context.tr(
                    'Alertes stock',
                    'تنبيهات المخزون',
                  ),
                  value:
                      state
                          .lowStockArticles
                          .length,
                  icon:
                      Icons
                          .warning_amber_rounded,
                  background:
                      Theme.of(
                    context,
                  )
                          .colorScheme
                          .errorContainer,
                  foreground:
                      Theme.of(
                    context,
                  )
                          .colorScheme
                          .onErrorContainer,
                ),
              if (state.hasPermission(
                Permissions
                    .getAllLights,
              ))
                _AlertStatCard(
                  label:
                      context.tr(
                    'Pannes ouvertes',
                    'الأعطال المفتوحة',
                  ),
                  value:
                      state
                          .unresolvedFailures
                          .length,
                  icon:
                      Icons
                          .lightbulb_outline,
                  background:
                      Theme.of(
                    context,
                  )
                          .colorScheme
                          .tertiaryContainer,
                  foreground:
                      Theme.of(
                    context,
                  )
                          .colorScheme
                          .onTertiaryContainer,
                ),
              if (state.hasPermission(
                Permissions
                    .getAllAssets,
              ))
                _AlertStatCard(
                  label:
                      context.tr(
                    'Biens en maintenance',
                    'ممتلكات قيد الصيانة',
                  ),
                  value:
                      maintenanceBiens
                          .length,
                  icon:
                      Icons
                          .build_outlined,
                  background:
                      Theme.of(
                    context,
                  )
                          .colorScheme
                          .secondaryContainer,
                  foreground:
                      Theme.of(
                    context,
                  )
                          .colorScheme
                          .onSecondaryContainer,
                ),
              if (state.hasPermission(
                Permissions
                    .getStockHistory,
              ))
                _AlertStatCard(
                  label:
                      context.tr(
                    'Mouvements stock',
                    'حركات المخزون',
                  ),
                  value:
                      state
                          .movements
                          .length,
                  icon:
                      Icons
                          .trending_up,
                  background:
                      Theme.of(
                    context,
                  )
                          .colorScheme
                          .primaryContainer,
                  foreground:
                      Theme.of(
                    context,
                  )
                          .colorScheme
                          .onPrimaryContainer,
                ),
            ];

            return Wrap(
              spacing:
                  12,
              runSpacing:
                  12,
              children:
                  items
                      .map(
                        (
                          item,
                        ) =>
                            SizedBox(
                          width:
                              width,
                          child:
                              item,
                        ),
                      )
                      .toList(),
            );
          },
        ),
        if (state.hasPermission(
          Permissions
              .getStockHistory,
        )) ...[
          const SizedBox(
            height: 16,
          ),
          _DashboardSection(
            title:
                context.tr(
              'Mouvements du stock',
              'حركات المخزون',
            ),
            subtitle:
                context.tr(
              'Entrées et sorties enregistrées',
              'المداخل والمخارج المسجلة',
            ),
            icon:
                Icons
                    .show_chart,
            child:
                _HorizontalBars(
              items: [
                _BarValue(
                  label:
                      context.tr(
                    'Entrées',
                    'المداخل',
                  ),
                  value:
                      stockEntries,
                ),
                _BarValue(
                  label:
                      context.tr(
                    'Sorties',
                    'المخارج',
                  ),
                  value:
                      stockExits,
                ),
              ],
            ),
          ),
        ],
        if (state.hasPermission(
          Permissions
              .getAllLights,
        )) ...[
          const SizedBox(
            height: 16,
          ),
          _DashboardSection(
            title:
                context.tr(
              'État de l’éclairage',
              'حالة الإنارة',
            ),
            subtitle:
                context.tr(
              'Répartition des points lumineux',
              'توزيع نقط الإنارة',
            ),
            icon:
                Icons
                    .lightbulb_outline,
            child:
                _LightingStatusChart(
              active:
                  activeLights,
              damaged:
                  damagedLights,
              maintenance:
                  maintenanceLights,
            ),
          ),
        ],
        if (state.hasPermission(
          Permissions
              .getAllAssets,
        )) ...[
          const SizedBox(
            height: 16,
          ),
          _DashboardSection(
            title:
                context.tr(
              'État des biens',
              'حالة الممتلكات',
            ),
            subtitle:
                context.tr(
              'Répartition par statut',
              'التوزيع حسب الحالة',
            ),
            icon:
                Icons
                    .apartment_outlined,
            child:
                _HorizontalBars(
              items: [
                _BarValue(
                  label:
                      context.tr(
                    'En utilisation',
                    'قيد الاستعمال',
                  ),
                  value:
                      state
                          .activeBiens
                          .where(
                            (bien) =>
                                bien.status ==
                                AssetStatus
                                    .inUse,
                          )
                          .length,
                ),
                _BarValue(
                  label:
                      context.tr(
                    'Disponible',
                    'متاح',
                  ),
                  value:
                      state
                          .activeBiens
                          .where(
                            (bien) =>
                                bien.status ==
                                AssetStatus
                                    .available,
                          )
                          .length,
                ),
                _BarValue(
                  label:
                      context.tr(
                    'Maintenance',
                    'صيانة',
                  ),
                  value:
                      maintenanceBiens
                          .length,
                ),
                _BarValue(
                  label:
                      context.tr(
                    'Autres',
                    'أخرى',
                  ),
                  value:
                      state
                          .activeBiens
                          .where(
                            (bien) =>
                                ![
                                  AssetStatus
                                      .inUse,
                                  AssetStatus
                                      .available,
                                  AssetStatus
                                      .underMaintenance,
                                ].contains(
                                  bien.status,
                                ),
                          )
                          .length,
                ),
              ],
            ),
          ),
        ],
        const SizedBox(
          height: 16,
        ),
        _DashboardSection(
          title:
              context.tr(
            'Alertes récentes',
            'التنبيهات الأخيرة',
          ),
          subtitle:
              context.tr(
            'Éléments nécessitant votre attention',
            'العناصر التي تتطلب انتباهك',
          ),
          icon:
              Icons
                  .warning_amber_rounded,
          child:
              alerts.isEmpty
                  ? Padding(
                      padding:
                          const EdgeInsets
                              .all(
                        8,
                      ),
                      child:
                          Text(
                        context.tr(
                          'Aucune alerte récente.',
                          'لا توجد تنبيهات حديثة.',
                        ),
                      ),
                    )
                  : Column(
                      children:
                          alerts
                              .take(
                                5,
                              )
                              .map(
                                (
                                  alert,
                                ) =>
                                    _AlertTile(
                                  alert:
                                      alert,
                                ),
                              )
                              .toList(),
                    ),
        ),
      ],
    );
  }

  static String _unitLabel(
    BuildContext context,
    StockUnit unit,
  ) {
    switch (
      unit
    ) {
      case StockUnit.unite:
        return context.tr(
          'unité',
          'وحدة',
        );
      case StockUnit.paquet:
        return context.tr(
          'paquet',
          'حزمة',
        );
      case StockUnit.metre:
        return context.tr(
          'mètre',
          'متر',
        );
      default:
        return unit.name;
    }
  }
}

class _WelcomeCard
    extends StatelessWidget {
  const _WelcomeCard({
    required this.name,
    required this.role,
  });

  final String name;
  final String role;

  @override
  Widget build(
    BuildContext context,
  ) {
    final theme =
        Theme.of(
      context,
    );

    return Container(
      padding:
          const EdgeInsets.all(
        22,
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
              theme
                  .colorScheme
                  .primary
                  .withValues(
                    alpha:
                        .18,
                  ),
        ),
        color:
            theme
                .colorScheme
                .surface,
      ),
      child:
          LayoutBuilder(
        builder: (
          context,
          constraints,
        ) {
          final compact =
              constraints.maxWidth <
                  620;

          final welcome =
              Column(
            crossAxisAlignment:
                CrossAxisAlignment
                    .start,
            children: [
              Text(
                'SGPBSE',
                style:
                    theme
                        .textTheme
                        .labelLarge
                        ?.copyWith(
                          fontWeight:
                              FontWeight
                                  .w900,
                          letterSpacing:
                              2.4,
                          color:
                              theme
                                  .colorScheme
                                  .primary,
                        ),
              ),
              const SizedBox(
                height: 10,
              ),
              Text(
                context.tr(
                  'Bonjour $name',
                  'مرحباً $name',
                ),
                style:
                    theme
                        .textTheme
                        .headlineSmall
                        ?.copyWith(
                          fontWeight:
                              FontWeight
                                  .w900,
                        ),
              ),
              const SizedBox(
                height: 8,
              ),
              Text(
                context.tr(
                  'Vue générale du patrimoine communal, du stock et de l’éclairage public.',
                  'نظرة عامة على الممتلكات الجماعية والمخزون والإنارة العمومية.',
                ),
              ),
            ],
          );

          final roleCard =
              Container(
            padding:
                const EdgeInsets
                    .symmetric(
              horizontal:
                  16,
              vertical:
                  12,
            ),
            decoration:
                BoxDecoration(
              borderRadius:
                  BorderRadius
                      .circular(
                16,
              ),
              color:
                  theme
                      .colorScheme
                      .surfaceContainerHighest
                      .withValues(
                        alpha:
                            .55,
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
                    'Connecté en tant que',
                    'متصل بصفة',
                  ),
                  style:
                      theme
                          .textTheme
                          .labelSmall,
                ),
                const SizedBox(
                  height: 4,
                ),
                Text(
                  role,
                  style:
                      const TextStyle(
                    fontWeight:
                        FontWeight
                            .w800,
                  ),
                ),
              ],
            ),
          );

          if (
            compact
          ) {
            return Column(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .stretch,
              children: [
                welcome,
                const SizedBox(
                  height: 14,
                ),
                roleCard,
              ],
            );
          }

          return Row(
            crossAxisAlignment:
                CrossAxisAlignment
                    .center,
            children: [
              Expanded(
                child:
                    welcome,
              ),
              const SizedBox(
                width: 18,
              ),
              roleCard,
            ],
          );
        },
      ),
    );
  }
}

class _StatItem {
  const _StatItem({
    required this.label,
    required this.value,
    required this.description,
    required this.icon,
  });

  final String label;
  final int value;
  final String description;
  final IconData icon;
}

class _StatisticCard
    extends StatelessWidget {
  const _StatisticCard({
    required this.item,
  });

  final _StatItem item;

  @override
  Widget build(
    BuildContext context,
  ) {
    return Card(
      child:
          Padding(
        padding:
            const EdgeInsets.all(
          16,
        ),
        child:
            Row(
          crossAxisAlignment:
              CrossAxisAlignment
                  .start,
          children: [
            Expanded(
              child:
                  Column(
                crossAxisAlignment:
                    CrossAxisAlignment
                        .start,
                children: [
                  Text(
                    item.label,
                    style:
                        Theme.of(
                      context,
                    )
                            .textTheme
                            .bodySmall
                            ?.copyWith(
                              fontWeight:
                                  FontWeight
                                      .w700,
                            ),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Text(
                    '${item.value}',
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
                    item.description,
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
            CircleAvatar(
              child:
                  Icon(
                item.icon,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AlertStatCard
    extends StatelessWidget {
  const _AlertStatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.background,
    required this.foreground,
  });

  final String label;
  final int value;
  final IconData icon;
  final Color background;
  final Color foreground;

  @override
  Widget build(
    BuildContext context,
  ) {
    return Card(
      color:
          background,
      child:
          Padding(
        padding:
            const EdgeInsets.all(
          16,
        ),
        child:
            Row(
          children: [
            Expanded(
              child:
                  Column(
                crossAxisAlignment:
                    CrossAxisAlignment
                        .start,
                children: [
                  Text(
                    label,
                    style:
                        TextStyle(
                      color:
                          foreground,
                      fontWeight:
                          FontWeight
                              .w700,
                    ),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Text(
                    '$value',
                    style:
                        TextStyle(
                      color:
                          foreground,
                      fontWeight:
                          FontWeight
                              .w900,
                      fontSize:
                          28,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              icon,
              color:
                  foreground,
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardSection
    extends StatelessWidget {
  const _DashboardSection({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.child,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Widget child;

  @override
  Widget build(
    BuildContext context,
  ) {
    return Card(
      child:
          Padding(
        padding:
            const EdgeInsets.all(
          18,
        ),
        child:
            Column(
          crossAxisAlignment:
              CrossAxisAlignment
                  .start,
          children: [
            Row(
              children: [
                Expanded(
                  child:
                      Column(
                    crossAxisAlignment:
                        CrossAxisAlignment
                            .start,
                    children: [
                      Text(
                        title,
                        style:
                            Theme.of(
                          context,
                        )
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  fontWeight:
                                      FontWeight
                                          .w900,
                                ),
                      ),
                      const SizedBox(
                        height: 3,
                      ),
                      Text(
                        subtitle,
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
                Icon(
                  icon,
                  color:
                      Theme.of(
                    context,
                  )
                          .colorScheme
                          .primary,
                ),
              ],
            ),
            const SizedBox(
              height: 18,
            ),
            child,
          ],
        ),
      ),
    );
  }
}

class _BarValue {
  const _BarValue({
    required this.label,
    required this.value,
  });

  final String label;
  final int value;
}

class _HorizontalBars
    extends StatelessWidget {
  const _HorizontalBars({
    required this.items,
  });

  final List<_BarValue> items;

  @override
  Widget build(
    BuildContext context,
  ) {
    final maximum =
        items.fold<int>(
      0,
      (
        current,
        item,
      ) =>
          math.max(
        current,
        item.value,
      ),
    );

    return Column(
      children:
          items
              .map(
                (
                  item,
                ) {
                  final ratio =
                      maximum == 0
                          ? 0.0
                          : item.value /
                              maximum;

                  return Padding(
                    padding:
                        const EdgeInsets
                            .only(
                      bottom:
                          14,
                    ),
                    child:
                        Column(
                      crossAxisAlignment:
                          CrossAxisAlignment
                              .start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child:
                                  Text(
                                item.label,
                                style:
                                    const TextStyle(
                                  fontWeight:
                                      FontWeight
                                          .w700,
                                ),
                              ),
                            ),
                            Text(
                              '${item.value}',
                            ),
                          ],
                        ),
                        const SizedBox(
                          height: 7,
                        ),
                        ClipRRect(
                          borderRadius:
                              BorderRadius
                                  .circular(
                            99,
                          ),
                          child:
                              LinearProgressIndicator(
                            value:
                                ratio,
                            minHeight:
                                12,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              )
              .toList(),
    );
  }
}

class _LightingStatusChart
    extends StatelessWidget {
  const _LightingStatusChart({
    required this.active,
    required this.damaged,
    required this.maintenance,
  });

  final int active;
  final int damaged;
  final int maintenance;

  @override
  Widget build(
    BuildContext context,
  ) {
    final total =
        active +
        damaged +
        maintenance;

    return Column(
      children: [
        SizedBox(
          width:
              150,
          height:
              150,
          child:
              CustomPaint(
            painter:
                _DonutPainter(
              active:
                  active,
              damaged:
                  damaged,
              maintenance:
                  maintenance,
              background:
                  Theme.of(
                context,
              )
                      .colorScheme
                      .surfaceContainerHighest,
            ),
            child:
                Center(
              child:
                  Text(
                '$total',
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
            ),
          ),
        ),
        const SizedBox(
          height: 14,
        ),
        Wrap(
          alignment:
              WrapAlignment
                  .center,
          spacing:
              16,
          runSpacing:
              8,
          children: [
            _LegendItem(
              label:
                  context.tr(
                'Actifs',
                'نشطة',
              ),
              value:
                  active,
              color:
                  Colors.green,
            ),
            _LegendItem(
              label:
                  context.tr(
                'En panne',
                'معطلة',
              ),
              value:
                  damaged,
              color:
                  Colors.red,
            ),
            _LegendItem(
              label:
                  context.tr(
                'Maintenance',
                'صيانة',
              ),
              value:
                  maintenance,
              color:
                  Colors.orange,
            ),
          ],
        ),
      ],
    );
  }
}

class _LegendItem
    extends StatelessWidget {
  const _LegendItem({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final int value;
  final Color color;

  @override
  Widget build(
    BuildContext context,
  ) {
    return Row(
      mainAxisSize:
          MainAxisSize.min,
      children: [
        Container(
          width:
              10,
          height:
              10,
          decoration:
              BoxDecoration(
            color:
                color,
            shape:
                BoxShape.circle,
          ),
        ),
        const SizedBox(
          width: 6,
        ),
        Text(
          '$label ($value)',
        ),
      ],
    );
  }
}

class _DonutPainter
    extends CustomPainter {
  const _DonutPainter({
    required this.active,
    required this.damaged,
    required this.maintenance,
    required this.background,
  });

  final int active;
  final int damaged;
  final int maintenance;
  final Color background;

  @override
  void paint(
    Canvas canvas,
    Size size,
  ) {
    final total =
        active +
        damaged +
        maintenance;

    final center =
        Offset(
      size.width /
          2,
      size.height /
          2,
    );

    final radius =
        math.min(
              size.width,
              size.height,
            ) /
            2 -
        12;

    final rect =
        Rect.fromCircle(
      center:
          center,
      radius:
          radius,
    );

    final backgroundPaint =
        Paint()
          ..color =
              background
          ..style =
              PaintingStyle
                  .stroke
          ..strokeWidth =
              18;

    canvas.drawArc(
      rect,
      0,
      math.pi * 2,
      false,
      backgroundPaint,
    );

    if (
      total == 0
    ) {
      return;
    }

    var start =
        -math.pi /
        2;

    void drawSegment(
      int value,
      Color color,
    ) {
      if (
        value <= 0
      ) {
        return;
      }

      final sweep =
          math.pi *
          2 *
          value /
          total;

      final paint =
          Paint()
            ..color =
                color
            ..style =
                PaintingStyle
                    .stroke
            ..strokeWidth =
                18
            ..strokeCap =
                StrokeCap
                    .round;

      canvas.drawArc(
        rect,
        start,
        sweep,
        false,
        paint,
      );

      start +=
          sweep;
    }

    drawSegment(
      active,
      Colors.green,
    );

    drawSegment(
      damaged,
      Colors.red,
    );

    drawSegment(
      maintenance,
      Colors.orange,
    );
  }

  @override
  bool shouldRepaint(
    covariant _DonutPainter oldDelegate,
  ) =>
      oldDelegate.active !=
          active ||
      oldDelegate.damaged !=
          damaged ||
      oldDelegate.maintenance !=
          maintenance ||
      oldDelegate.background !=
          background;
}

enum _AlertKind {
  stock,
  lighting,
  asset,
}

class _AlertItem {
  const _AlertItem({
    required this.title,
    required this.message,
    required this.kind,
  });

  final String title;
  final String message;
  final _AlertKind kind;
}

class _AlertTile
    extends StatelessWidget {
  const _AlertTile({
    required this.alert,
  });

  final _AlertItem alert;

  @override
  Widget build(
    BuildContext context,
  ) {
    final color =
        switch (
          alert.kind
        ) {
          _AlertKind.stock =>
            Colors.orange,
          _AlertKind.lighting =>
            Colors.red,
          _AlertKind.asset =>
            Colors.amber,
        };

    return Padding(
      padding:
          const EdgeInsets
              .only(
        bottom:
            10,
      ),
      child:
          Container(
        padding:
            const EdgeInsets.all(
          12,
        ),
        decoration:
            BoxDecoration(
          borderRadius:
              BorderRadius
                  .circular(
            14,
          ),
          color:
              Theme.of(
            context,
          )
                  .colorScheme
                  .surfaceContainerHighest
                  .withValues(
                    alpha:
                        .35,
                  ),
        ),
        child:
            Row(
          crossAxisAlignment:
              CrossAxisAlignment
                  .start,
          children: [
            Container(
              margin:
                  const EdgeInsets
                      .only(
                top:
                    5,
              ),
              width:
                  10,
              height:
                  10,
              decoration:
                  BoxDecoration(
                color:
                    color,
                shape:
                    BoxShape
                        .circle,
              ),
            ),
            const SizedBox(
              width:
                  10,
            ),
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
                        const TextStyle(
                      fontWeight:
                          FontWeight
                              .w800,
                    ),
                  ),
                  const SizedBox(
                    height:
                        4,
                  ),
                  Text(
                    alert.message,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
