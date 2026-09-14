import 'dart:io';

import 'package:excel/excel.dart' as xls;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../state/app_state.dart';
import '../../services/bien_api_service.dart';
import '../../services/user_api_service.dart';
import '../../widgets/common.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  String _type = 'ASSETS';
  DateTime _start = DateTime(DateTime.now().year, 1, 1);
  DateTime _end = DateTime.now();
  final _search = TextEditingController();
  _ReportData? _report;
  bool _generating = false;
  bool _pdfBusy = false;
  bool _excelBusy = false;
  List<_ApiAssetAdapter> _reportAssets = <_ApiAssetAdapter>[];

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final report = _report;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            const Icon(Icons.bar_chart_rounded),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                context.tr('Rapports', 'التقارير'),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Text(
          context.tr(
            'Rapports complets basés sur les données réelles des modules, avec aperçu, indicateurs, PDF et Excel.',
            'تقارير كاملة مبنية على البيانات الفعلية للوحدات، مع المعاينة والمؤشرات وملفات PDF وExcel.',
          ),
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 16),
        _typeSelector(context, state),
        const SizedBox(height: 14),
        SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                context.tr('Période du rapport', 'فترة التقرير'),
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                context.tr(
                  'La période filtre les événements. Les sections « état actuel » gardent une vue complète du système.',
                  'تقوم الفترة بتصفية الأحداث، بينما تحتفظ أقسام الحالة الحالية بصورة كاملة للنظام.',
                ),
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _pickDate(true),
                      icon: const Icon(Icons.event),
                      label: Text(
                          '${context.tr('Début', 'البداية')}: ${_date(_start)}'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _pickDate(false),
                      icon: const Icon(Icons.event_available),
                      label: Text(
                          '${context.tr('Fin', 'النهاية')}: ${_date(_end)}'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _generating
                    ? null
                    : () async {
                        setState(() => _generating = true);
                        try {
                          await _prepareData(state);
                          if (!mounted) return;
                          final generated = _buildReport(
                            state,
                            arabic: context.isArabic,
                          );
                          setState(() {
                            _report = generated;
                            _search.clear();
                          });
                        } catch (_) {
                          if (!mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(context.tr(
                              'Impossible de charger les données réelles du rapport.',
                              'تعذر تحميل البيانات الفعلية للتقرير.',
                            ))),
                          );
                        } finally {
                          if (mounted) setState(() => _generating = false);
                        }
                      },
                icon: _generating
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.analytics_outlined),
                label: Text(
                  _generating
                      ? context.tr('Génération...', 'جارٍ الإنشاء...')
                      : context.tr(
                          'Générer le rapport complet', 'إنشاء التقرير الكامل'),
                ),
              ),
            ],
          ),
        ),
        if (report != null) ...[
          const SizedBox(height: 16),
          _reportHeader(context, state, report),
          const SizedBox(height: 12),
          _metrics(context, report),
          const SizedBox(height: 12),
          TextField(
            controller: _search,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search),
              labelText: context.tr(
                'Rechercher dans le rapport',
                'البحث في التقرير',
              ),
              suffixIcon: _search.text.isEmpty
                  ? null
                  : IconButton(
                      onPressed: () {
                        _search.clear();
                        setState(() {});
                      },
                      icon: const Icon(Icons.close),
                    ),
            ),
          ),
          const SizedBox(height: 12),
          ..._visibleSections(report).map(
            (section) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _sectionCard(context, section),
            ),
          ),
        ],
      ],
    );
  }

  Widget _typeSelector(BuildContext context, AppState state) {
    final items = <_ReportOption>[
      _ReportOption(
          'USERS', Icons.people_alt_outlined, _L('Utilisateurs', 'المستخدمون')),
      _ReportOption(
          'ASSETS', Icons.inventory_2_outlined, _L('Patrimoine', 'الممتلكات')),
      _ReportOption('STOCK', Icons.warehouse_outlined, _L('Stock', 'المخزون')),
      _ReportOption(
          'LIGHTING', Icons.lightbulb_outline, _L('Éclairage', 'الإنارة')),
    ].where((item) {
      if (item.type == 'USERS') return state.hasPermission(Permissions.getAllProfils);
      if (item.type == 'ASSETS') return state.hasPermission(Permissions.getAllAssets);
      if (item.type == 'STOCK') return state.hasPermission(Permissions.getAllItems);
      if (item.type == 'LIGHTING') return state.hasPermission(Permissions.getAllLightPoint);
      return false;
    }).toList();

    if (items.isNotEmpty && !items.any((item) => item.type == _type)) {
      _type = items.first.type;
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: items.map((item) {
          final selected = item.type == _type;
          return Padding(
            padding: const EdgeInsetsDirectional.only(end: 8),
            child: ChoiceChip(
              selected: selected,
              onSelected: (_) {
                setState(() {
                  _type = item.type;
                  _report = null;
                  _search.clear();
                });
              },
              avatar: Icon(item.icon, size: 18),
              label: Text(item.label.of(context)),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _reportHeader(
      BuildContext context, AppState state, _ReportData report) {
    final user = state.currentUser;
    final generatedBy = user == null
        ? '-'
        : (context.isArabic ? user.fullNameAr : user.fullName);

    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'SGPBSE',
            style: TextStyle(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 4),
          Text(
            report.title.of(context),
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            '${context.tr('Période', 'الفترة')}: ${_date(_start)} → ${_date(_end)}',
          ),
          Text('${context.tr('Généré par', 'أنشئ بواسطة')}: $generatedBy'),
          Text(
              '${context.tr('Généré le', 'تاريخ الإنشاء')}: ${_dateTime(report.generatedAt)}'),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton.tonalIcon(
                  onPressed: _pdfBusy ? null : () => _exportPdf(context, state),
                  icon: _pdfBusy
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.picture_as_pdf_outlined),
                  label: Text(context.tr('Exporter PDF', 'تصدير PDF')),
                ),
              FilledButton.tonalIcon(
                  onPressed: _excelBusy ? null : () => _exportExcel(context),
                  icon: _excelBusy
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.table_chart_outlined),
                  label: Text(context.tr('Exporter Excel', 'تصدير Excel')),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _metrics(BuildContext context, _ReportData report) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: report.metrics
          .map(
            (item) => SizedBox(
              width: MediaQuery.of(context).size.width >= 700 ? 220 : 165,
              child: SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.label.of(context),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${item.value}${item.unit == null ? '' : ' ${item.unit}'}',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                  ],
                ),
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _sectionCard(BuildContext context, _ReportSection section) {
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      section.title.of(context),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    if (section.description != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        section.description!.of(context),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ],
                ),
              ),
              Chip(
                label: Text(
                  '${section.periodFiltered ? context.tr('Période', 'الفترة') : context.tr('État actuel', 'الحالة الحالية')} · ${section.rows.length}',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (section.rows.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 18),
              child: Center(
                child: Text(
                  context.tr(
                    'Aucune donnée pour cette section.',
                    'لا توجد بيانات في هذا القسم.',
                  ),
                ),
              ),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowHeight: 42,
                dataRowMinHeight: 42,
                dataRowMaxHeight: 90,
                columns: section.columns
                    .map(
                      (column) => DataColumn(
                        label: Text(
                          column.label.of(context),
                          style: const TextStyle(fontWeight: FontWeight.w800),
                        ),
                      ),
                    )
                    .toList(),
                rows: section.rows
                    .map(
                      (entry) => DataRow(
                        cells: section.columns
                            .map(
                              (column) => DataCell(
                                ConstrainedBox(
                                  constraints:
                                      const BoxConstraints(maxWidth: 260),
                                  child: Text(
                                    '${entry.values[column.key] ?? '-'}',
                                    maxLines: 4,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    )
                    .toList(),
              ),
            ),
        ],
      ),
    );
  }

  List<_ReportSection> _visibleSections(_ReportData report) {
    final q = _search.text.trim().toLowerCase();
    if (q.isEmpty) return report.sections;

    return report.sections
        .map(
          (section) => section.copyWith(
            rows: section.rows
                .where(
                  (row) => row.values.values.any(
                    (value) => '$value'.toLowerCase().contains(q),
                  ),
                )
                .toList(),
          ),
        )
        .toList();
  }

  Future<void> _pickDate(bool start) async {
    final current = start ? _start : _end;
    final selected = await showDatePicker(
      context: context,
      initialDate: current,
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (selected == null) return;

    setState(() {
      if (start) {
        _start = selected;
        if (_start.isAfter(_end)) _end = _start;
      } else {
        _end = selected;
        if (_end.isBefore(_start)) _start = _end;
      }
      _report = null;
    });
  }

  Future<void> _prepareData(AppState state) async {
    switch (_type) {
      case 'USERS':
        final realUsers = await UserApiService().getAllUsers();
        state.users
          ..clear()
          ..addAll(realUsers);
        break;
      case 'ASSETS':
        final service = BienApiService();
        final groups = await Future.wait<List<BienApiListItem>>([
          service.getAll(),
          service.getArchived(),
        ]);
        _reportAssets = <_ApiAssetAdapter>[
          ...groups[0].map((item) => _ApiAssetAdapter(item, archived: false)),
          ...groups[1].map((item) => _ApiAssetAdapter(item, archived: true)),
        ];
        break;
      case 'STOCK':
        await state.loadStockData();
        if (state.stockError != null) throw StateError(state.stockError!);
        break;
      case 'LIGHTING':
        await state.loadLightingData();
        if (state.lightingError != null) throw StateError(state.lightingError!);
        break;
    }
  }

  _ReportData _buildReport(AppState state, {required bool arabic}) {
    switch (_type) {
      case 'USERS':
        return _usersReport(state, arabic);
      case 'STOCK':
        return _stockReport(state, arabic);
      case 'LIGHTING':
        return _lightingReport(state, arabic);
      case 'ASSETS':
      default:
        return _assetsReport(state, arabic);
    }
  }

  _ReportData _usersReport(AppState state, bool ar) {
    final users = state.users;
    final active = users.where((user) => user.isActive).length;
    final roles = users.map((user) => user.role.name).toSet().length;

    return _ReportData(
      type: 'USERS',
      title:
          _L('Rapport complet des utilisateurs', 'التقرير الكامل للمستخدمين'),
      generatedAt: DateTime.now(),
      metrics: [
        _M(_L('Utilisateurs', 'المستخدمون'), users.length),
        _M(_L('Comptes actifs', 'الحسابات النشطة'), active),
        _M(_L('Comptes inactifs', 'الحسابات غير النشطة'),
            users.length - active),
        _M(_L('Rôles distincts', 'الأدوار المختلفة'), roles),
      ],
      sections: [
        _ReportSection(
          title: _L('Annuaire des utilisateurs', 'دليل المستخدمين'),
          description: _L(
            'État actuel des comptes, identités et rôles.',
            'الحالة الحالية للحسابات والهويات والأدوار.',
          ),
          columns: [
            _C('name', _L('Nom complet', 'الاسم الكامل')),
            _C('nameAr', _L('Nom en arabe', 'الاسم بالعربية')),
            _C('email', _L('E-mail', 'البريد الإلكتروني')),
            _C('phone', _L('Téléphone', 'الهاتف')),
            _C('cin', _L('CIN', 'CIN')),
            _C('gender', _L('Genre', 'الجنس')),
            _C('role', _L('Rôle', 'الدور')),
            _C('status', _L('Statut du compte', 'حالة الحساب')),
          ],
          rows: users
              .map(
                (user) => _R({
                  'name': user.fullName,
                  'nameAr': user.fullNameAr,
                  'email': user.email,
                  'phone': user.phone,
                  'cin': user.cin,
                  'gender': _status(_enumName(user.gender), ar),
                  'role': user.role.name,
                  'status': user.isActive
                      ? (ar ? 'نشط' : 'Actif')
                      : (ar ? 'غير نشط' : 'Inactif'),
                }),
              )
              .toList(),
        ),
      ],
    );
  }

  _ReportData _assetsReport(AppState state, bool ar) {
    final all = _reportAssets.cast<dynamic>();
    final active = all.where((asset) => !_assetArchived(asset)).toList();
    final archived = all.where(_assetArchived).toList();

    final currentRows = active
        .map(
          (asset) => _R({
            'inventory': _s(_safe(() => asset.inventoryId)),
            'designation': ar
                ? _s(_safe(() => asset.designationAr),
                    _s(_safe(() => asset.designation)))
                : _s(_safe(() => asset.designation)),
            'type': _assetTypeLabel(_enumName(_safe(() => asset.type)), ar),
            'status': _status(
                _enumName(_safe(() => asset.status) ??
                    _safe(() => asset.assetStatus)),
                ar),
            'assignment': ar
                ? _s(_safe(() => asset.assignmentAr),
                    _s(_safe(() => asset.assignment)))
                : _s(_safe(() => asset.assignment)),
            'acquisitionDate': _dateValue(_safe(() => asset.acquisitionDate)),
            'value': _round2(_n(_safe(() => asset.purchaseValue))),
            'details': _assetDetails(asset, ar),
            'documents': _docCount(asset),
          }),
        )
        .toList();

    final acquisitionRows = active
        .where((asset) => _inPeriod(_safe(() => asset.acquisitionDate)))
        .map(
          (asset) => _R({
            'date': _dateValue(_safe(() => asset.acquisitionDate)),
            'inventory': _s(_safe(() => asset.inventoryId)),
            'designation': ar
                ? _s(_safe(() => asset.designationAr),
                    _s(_safe(() => asset.designation)))
                : _s(_safe(() => asset.designation)),
            'type': _assetTypeLabel(_enumName(_safe(() => asset.type)), ar),
            'assignment': ar
                ? _s(_safe(() => asset.assignmentAr),
                    _s(_safe(() => asset.assignment)))
                : _s(_safe(() => asset.assignment)),
            'value': _round2(_n(_safe(() => asset.purchaseValue))),
          }),
        )
        .toList();

    final rentals = <_R>[];
    for (final asset in active) {
      final list =
          (_safe(() => asset.rentals) ?? _safe(() => asset.rentalHistory));
      if (list is! Iterable) continue;
      for (final dynamic rental in list) {
        if (!_inPeriod(_safe(() => rental.startDate))) continue;
        rentals.add(
          _R({
            'asset': ar
                ? _s(_safe(() => asset.designationAr),
                    _s(_safe(() => asset.designation)))
                : _s(_safe(() => asset.designation)),
            'inventory': _s(_safe(() => asset.inventoryId)),
            'tenant': _s(_safe(() => rental.tenantName)),
            'startDate': _dateValue(_safe(() => rental.startDate)),
            'endDate': _dateValue(_safe(() => rental.endDate)),
            'monthlyAmount': _round2(_n(_safe(() => rental.monthlyAmount))),
            'reference': _s(_safe(() => rental.contractReference)),
            'notes': _s(_safe(() => rental.notes)),
          }),
        );
      }
    }

    final archiveRows = archived.where((asset) {
      final value = _safe(() => asset.archivedAt) ??
          _safe(() => asset.archive.archivedAt);
      return _inPeriod(value);
    }).map((asset) {
      final archive = _safe(() => asset.archive);
      return _R({
        'date': _dateValue(
            _safe(() => asset.archivedAt) ?? _safe(() => archive.archivedAt)),
        'inventory': _s(_safe(() => asset.inventoryId)),
        'designation': ar
            ? _s(_safe(() => asset.designationAr),
                _s(_safe(() => asset.designation)))
            : _s(_safe(() => asset.designation)),
        'type': _assetTypeLabel(_enumName(_safe(() => asset.type)), ar),
        'reason': _status(
          _enumName(
              _safe(() => asset.archiveReason) ?? _safe(() => archive.reason)),
          ar,
        ),
        'reference': _s(_safe(() => archive.reference)),
        'value': _round2(_n(_safe(() => asset.purchaseValue))),
        'notes': _s(_safe(() => archive.notes)),
      });
    }).toList();

    final totalValue = active.fold<double>(
      0,
      (sum, asset) => sum + _n(_safe(() => asset.purchaseValue)),
    );

    return _ReportData(
      type: 'ASSETS',
      title: _L('Rapport complet du patrimoine', 'التقرير الكامل للممتلكات'),
      generatedAt: DateTime.now(),
      metrics: [
        _M(_L('Biens actifs', 'الممتلكات النشطة'), active.length),
        _M(_L("Valeur d'acquisition totale", 'إجمالي قيمة الاقتناء'),
            _round2(totalValue),
            unit: 'DH'),
        _M(
          _L('Disponibles', 'المتاحة'),
          active
              .where((a) =>
                  _enumName(_safe(() => a.status) ?? _safe(() => a.assetStatus))
                      .toUpperCase() ==
                  'AVAILABLE')
              .length,
        ),
        _M(
          _L('En service', 'قيد الاستعمال'),
          active
              .where((a) =>
                  _enumName(_safe(() => a.status) ?? _safe(() => a.assetStatus))
                          .toUpperCase() ==
                      'INUSE' ||
                  _enumName(_safe(() => a.status) ?? _safe(() => a.assetStatus))
                          .toUpperCase() ==
                      'IN_USE')
              .length,
        ),
        _M(
          _L('En maintenance', 'قيد الصيانة'),
          active
              .where((a) =>
                  _enumName(_safe(() => a.status) ?? _safe(() => a.assetStatus))
                      .toUpperCase()
                      .replaceAll('_', '') ==
                  'UNDERMAINTENANCE')
              .length,
        ),
        _M(
            _L('Sorties / archives de la période',
                'الخروج / الأرشيف خلال الفترة'),
            archiveRows.length),
      ],
      sections: [
        _ReportSection(
          title: _L('État actuel du patrimoine', 'الحالة الحالية للممتلكات'),
          description: _L('Inventaire actif et informations principales.',
              'الجرد النشط والمعلومات الرئيسية.'),
          columns: [
            _C('inventory', _L('N° inventaire', 'رقم الجرد')),
            _C('designation', _L('Désignation', 'التسمية')),
            _C('type', _L('Type', 'النوع')),
            _C('status', _L('Statut', 'الحالة')),
            _C('assignment', _L('Affectation', 'التخصيص')),
            _C('acquisitionDate', _L('Acquisition', 'تاريخ الاقتناء')),
            _C('value', _L('Valeur (DH)', 'القيمة (درهم)')),
            _C('details', _L('Détails spécifiques', 'تفاصيل خاصة')),
            _C('documents', _L('Documents', 'الوثائق')),
          ],
          rows: currentRows,
        ),
        _ReportSection(
          title: _L('Acquisitions de la période', 'اقتناءات الفترة'),
          periodFiltered: true,
          columns: [
            _C('date', _L('Date', 'التاريخ')),
            _C('inventory', _L('N° inventaire', 'رقم الجرد')),
            _C('designation', _L('Désignation', 'التسمية')),
            _C('type', _L('Type', 'النوع')),
            _C('assignment', _L('Affectation', 'التخصيص')),
            _C('value', _L('Valeur (DH)', 'القيمة (درهم)')),
          ],
          rows: acquisitionRows,
        ),
        _ReportSection(
          title: _L('Locations enregistrées sur la période',
              'عمليات الكراء المسجلة خلال الفترة'),
          periodFiltered: true,
          columns: [
            _C('asset', _L('Bien', 'الممتلك')),
            _C('inventory', _L('N° inventaire', 'رقم الجرد')),
            _C('tenant', _L('Locataire', 'المكتري')),
            _C('startDate', _L('Début', 'البداية')),
            _C('endDate', _L('Fin', 'النهاية')),
            _C('monthlyAmount', _L('Mensualité (DH)', 'المبلغ الشهري')),
            _C('reference', _L('Référence contrat', 'مرجع العقد')),
            _C('notes', _L('Observations', 'ملاحظات')),
          ],
          rows: rentals,
        ),
        _ReportSection(
          title: _L('Sorties / cessions / archives de la période',
              'الخروج / التفويت / الأرشيف خلال الفترة'),
          periodFiltered: true,
          columns: [
            _C('date', _L('Date', 'التاريخ')),
            _C('inventory', _L('N° inventaire', 'رقم الجرد')),
            _C('designation', _L('Désignation', 'التسمية')),
            _C('type', _L('Type', 'النوع')),
            _C('reason', _L('Motif', 'السبب')),
            _C('reference', _L('Référence', 'المرجع')),
            _C('value', _L("Valeur d'origine (DH)", 'القيمة الأصلية')),
            _C('notes', _L('Observations', 'ملاحظات')),
          ],
          rows: archiveRows,
        ),
      ],
    );
  }

  _ReportData _stockReport(AppState state, bool ar) {
    final articles = state.articles.cast<dynamic>();
    final movements = state.movements.cast<dynamic>();
    final requests = state.supplyRequests.cast<dynamic>();
    final restocks = state.restockAlerts.cast<dynamic>();

    final articleRows = articles.map((article) {
      final qty = _n(_safe(() => article.quantity));
      final minimum = _n(_safe(() => article.minimumQuantity));
      final unitHt = _n(_safe(() => article.unitPriceHt));
      final vat = _n(_safe(() => article.vatRate));
      final unitTtc = unitHt * (1 + vat / 100);
      return _R({
        'reference': _s(_safe(() => article.reference)),
        'barcode': _s(_safe(() => article.barcode)),
        'brand': _s(_safe(() => article.brand)),
        'designation': ar
            ? _s(_safe(() => article.designationAr),
                _s(_safe(() => article.designation)))
            : _s(_safe(() => article.designation)),
        'category': ar
            ? _s(_safe(() => article.categoryAr),
                _s(_safe(() => article.category)))
            : _s(_safe(() => article.category)),
        'unit': _unitLabel(_enumName(_safe(() => article.unit)), ar),
        'quantity': qty.toInt(),
        'minimum': minimum.toInt(),
        'location': ar
            ? _s(_safe(() => article.locationAr),
                _s(_safe(() => article.location)))
            : _s(_safe(() => article.location)),
        'unitPriceHt': _round2(unitHt),
        'vatRate': _round2(vat),
        'unitPriceTtc': _round2(unitTtc),
        'totalHt': _round2(qty * unitHt),
        'totalTtc': _round2(qty * unitTtc),
        'stockStatus': qty <= minimum
            ? (ar ? 'مخزون منخفض' : 'Stock faible')
            : (ar ? 'عادي' : 'Normal'),
        'documents': _docCount(article),
      });
    }).toList();

    final movementRows = movements
        .where((movement) => _inPeriod(_safe(() => movement.date)))
        .map((movement) {
      final qty = _n(_safe(() => movement.quantity));
      final unitHt = _n(_safe(() => movement.unitPriceHt));
      final vat = _n(_safe(() => movement.vatRate));
      return _R({
        'date': _dateValue(_safe(() => movement.date)),
        'type': _status(_enumName(_safe(() => movement.type)), ar),
        'article': ar
            ? _s(_safe(() => movement.articleDesignationAr),
                _s(_safe(() => movement.articleDesignation)))
            : _s(_safe(() => movement.articleDesignation)),
        'referenceArticle': _s(_safe(() => movement.articleReference)),
        'quantity': qty.toInt(),
        'unitPriceHt': _round2(unitHt),
        'vatRate': _round2(vat),
        'totalHt': _round2(qty * unitHt),
        'totalTtc': _round2(qty * unitHt * (1 + vat / 100)),
        'reason': _s(_safe(() => movement.reason)),
        'supplierBeneficiary': _s(_safe(() => movement.supplierOrBeneficiary)),
        'reference': _s(_safe(() => movement.reference)),
        'performedBy': _s(_safe(() => movement.performedBy)),
        'requestId': _s(_safe(() => movement.supplyRequestId)),
        'documents': _docCount(movement),
      });
    }).toList();

    final requestRows = requests
        .where((request) => _inPeriod(_safe(() => request.requestDate)))
        .map((request) => _R({
              'date': _dateValue(_safe(() => request.requestDate)),
              'article': ar
                  ? _s(_safe(() => request.articleDesignationAr),
                      _s(_safe(() => request.articleDesignation)))
                  : _s(_safe(() => request.articleDesignation)),
              'quantity': _n(_safe(() => request.requestedQuantity)).toInt(),
              'requester': _s(_safe(() => request.requester)),
              'reason': _s(_safe(() => request.reason)),
              'status': _status(_enumName(_safe(() => request.status)), ar),
              'rejectionReason': _s(_safe(() => request.rejectionReason)),
              'decisionDate': _dateValue(_safe(() => request.decisionDate)),
              'receivedAt': _dateValue(_safe(() => request.receivedAt)),
              'documents': _docCount(request),
            }))
        .toList();

    final restockRows = restocks
        .where((alert) => _inPeriod(_safe(() => alert.createdAt)))
        .map((alert) => _R({
              'date': _dateValue(_safe(() => alert.createdAt)),
              'article': ar
                  ? _s(_safe(() => alert.articleDesignationAr),
                      _s(_safe(() => alert.articleDesignation)))
                  : _s(_safe(() => alert.articleDesignation)),
              'requested': _n(_safe(() => alert.requestedQuantity)).toInt(),
              'availableAtRequest':
                  _n(_safe(() => alert.availableQuantityAtRequest)).toInt(),
              'requester': _s(_safe(() => alert.requester)),
              'reason': _s(_safe(() => alert.reason)),
              'status': _status(_enumName(_safe(() => alert.status)), ar),
              'readyNotifiedAt': _dateValue(_safe(() => alert.readyNotifiedAt)),
            }))
        .toList();

    final totalQty =
        articles.fold<double>(0, (sum, a) => sum + _n(_safe(() => a.quantity)));
    final totalTtc = articles.fold<double>(0, (sum, a) {
      final qty = _n(_safe(() => a.quantity));
      final ht = _n(_safe(() => a.unitPriceHt));
      final vat = _n(_safe(() => a.vatRate));
      return sum + qty * ht * (1 + vat / 100);
    });
    final lowStock = articles
        .where((a) =>
            _n(_safe(() => a.quantity)) <= _n(_safe(() => a.minimumQuantity)))
        .length;
    final pending = requests
        .where(
            (r) => _enumName(_safe(() => r.status)).toLowerCase() == 'pending')
        .length;

    return _ReportData(
      type: 'STOCK',
      title: _L('Rapport complet du stock', 'التقرير الكامل للمخزون'),
      generatedAt: DateTime.now(),
      metrics: [
        _M(_L('Articles', 'المواد'), articles.length),
        _M(_L('Quantité totale', 'الكمية الإجمالية'), totalQty.toInt()),
        _M(_L('Valeur actuelle TTC', 'القيمة الحالية شاملة الضريبة'),
            _round2(totalTtc),
            unit: 'DH'),
        _M(_L('Articles sous seuil', 'مواد تحت الحد الأدنى'), lowStock),
        _M(_L('Mouvements de la période', 'حركات الفترة'), movementRows.length),
        _M(_L('Demandes en attente', 'طلبات قيد الانتظار'), pending),
        _M(_L('Besoins de réapprovisionnement', 'حاجيات إعادة التموين'),
            restockRows.length),
      ],
      sections: [
        _ReportSection(
          title: _L('État actuel du stock', 'الحالة الحالية للمخزون'),
          description: _L('Quantités, valorisation, seuils et localisation.',
              'الكميات والتقييم والحدود والموقع.'),
          columns: [
            _C('reference', _L('Référence', 'المرجع')),
            _C('barcode', _L('Code-barres', 'الباركود')),
            _C('brand', _L('Marque', 'العلامة')),
            _C('designation', _L('Article', 'المادة')),
            _C('category', _L('Catégorie', 'الفئة')),
            _C('unit', _L('Unité', 'الوحدة')),
            _C('quantity', _L('Quantité', 'الكمية')),
            _C('minimum', _L('Seuil min.', 'الحد الأدنى')),
            _C('location', _L('Emplacement', 'الموقع')),
            _C('unitPriceHt', _L('PU HT', 'ثمن الوحدة دون ضريبة')),
            _C('vatRate', _L('TVA %', 'الضريبة %')),
            _C('unitPriceTtc', _L('PU TTC', 'ثمن الوحدة شامل الضريبة')),
            _C('totalHt', _L('Total HT', 'المجموع دون ضريبة')),
            _C('totalTtc', _L('Total TTC', 'المجموع شامل الضريبة')),
            _C('stockStatus', _L('Alerte', 'التنبيه')),
            _C('documents', _L('Documents', 'الوثائق')),
          ],
          rows: articleRows,
        ),
        _ReportSection(
          title: _L(
              'Mouvements de stock de la période', 'حركات المخزون خلال الفترة'),
          periodFiltered: true,
          columns: [
            _C('date', _L('Date', 'التاريخ')),
            _C('type', _L('Type', 'النوع')),
            _C('article', _L('Article', 'المادة')),
            _C('referenceArticle', _L('Réf. article', 'مرجع المادة')),
            _C('quantity', _L('Quantité', 'الكمية')),
            _C('unitPriceHt', _L('PU HT', 'ثمن الوحدة دون ضريبة')),
            _C('vatRate', _L('TVA %', 'الضريبة %')),
            _C('totalHt', _L('Total HT', 'المجموع دون ضريبة')),
            _C('totalTtc', _L('Total TTC', 'المجموع شامل الضريبة')),
            _C('reason', _L('Motif', 'السبب')),
            _C('supplierBeneficiary',
                _L('Fournisseur / bénéficiaire', 'المورد / المستفيد')),
            _C('reference', _L('Pièce / Référence', 'الوثيقة / المرجع')),
            _C('performedBy', _L('Effectué par', 'أنجزها')),
            _C('requestId', _L('Demande liée', 'الطلب المرتبط')),
            _C('documents', _L('Documents', 'الوثائق')),
          ],
          rows: movementRows,
        ),
        _ReportSection(
          title: _L('Demandes de fourniture de la période',
              'طلبات التموين خلال الفترة'),
          periodFiltered: true,
          columns: [
            _C('date', _L('Date', 'التاريخ')),
            _C('article', _L('Article', 'المادة')),
            _C('quantity', _L('Quantité demandée', 'الكمية المطلوبة')),
            _C('requester', _L('Demandeur', 'الطالب')),
            _C('reason', _L('Motif', 'السبب')),
            _C('status', _L('Statut', 'الحالة')),
            _C('rejectionReason', _L('Motif refus', 'سبب الرفض')),
            _C('decisionDate', _L('Décision', 'تاريخ القرار')),
            _C('receivedAt', _L('Réception', 'تاريخ الاستلام')),
            _C('documents', _L('Documents', 'الوثائق')),
          ],
          rows: requestRows,
        ),
        _ReportSection(
          title: _L('Besoins de réapprovisionnement', 'حاجيات إعادة التموين'),
          periodFiltered: true,
          columns: [
            _C('date', _L('Date', 'التاريخ')),
            _C('article', _L('Article', 'المادة')),
            _C('requested', _L('Quantité demandée', 'الكمية المطلوبة')),
            _C('availableAtRequest',
                _L('Disponible au besoin', 'المتاح عند الطلب')),
            _C('requester', _L('Demandeur', 'الطالب')),
            _C('reason', _L('Motif', 'السبب')),
            _C('status', _L('Statut', 'الحالة')),
            _C('readyNotifiedAt',
                _L('Notification disponibilité', 'إشعار التوفر')),
          ],
          rows: restockRows,
        ),
      ],
    );
  }

  _ReportData _lightingReport(AppState state, bool ar) {
    final lights = state.lights.cast<dynamic>();
    final failures = state.failures.cast<dynamic>();
    final interventions = state.interventions.cast<dynamic>();

    final failureById = <int, dynamic>{};
    for (final failure in failures) {
      failureById[_n(_safe(() => failure.id)).toInt()] = failure;
    }

    final lightRows = lights
        .map((light) => _R({
              'reference': _s(_safe(() => light.reference)),
              'designation': ar
                  ? _s(_safe(() => light.designationAr),
                      _s(_safe(() => light.designation)))
                  : _s(_safe(() => light.designation)),
              'localisation': _lightLocation(light, ar),
              'gps':
                  '${_n(_safe(() => light.latitude))}, ${_n(_safe(() => light.longitude))}',
              'power': _round2(_n(_safe(() => light.power))),
              'status': _status(_enumName(_safe(() => light.status)), ar),
              'installationDate':
                  _dateValue(_safe(() => light.installationDate)),
              'documents': _docCount(light),
            }))
        .toList();

    final failureRows = failures
        .where((failure) => _inPeriod(_safe(() => failure.reportedAt)))
        .map((failure) => _R({
              'date': _dateValue(_safe(() => failure.reportedAt)),
              'reference': _s(_safe(() => failure.lightReference)),
              'light': ar
                  ? _s(_safe(() => failure.lightDesignationAr),
                      _s(_safe(() => failure.lightDesignation)))
                  : _s(_safe(() => failure.lightDesignation)),
              'description': _s(_safe(() => failure.description)),
              'reportedBy': _s(_safe(() => failure.reportedBy)),
              'status': _status(_enumName(_safe(() => failure.status)), ar),
              'documents': _docCount(failure),
            }))
        .toList();

    final interventionRows = interventions.where((intervention) {
      return _inPeriod(_safe(() => intervention.interventionDate)) ||
          _inPeriod(_safe(() => intervention.completedAt));
    }).map((intervention) {
      final failureId = _n(_safe(() => intervention.failureId)).toInt();
      final failure = failureById[failureId];
      return _R({
        'date': _dateValue(_safe(() => intervention.interventionDate)),
        'light': failure == null
            ? '-'
            : (ar
                ? _s(_safe(() => failure.lightDesignationAr),
                    _s(_safe(() => failure.lightDesignation)))
                : _s(_safe(() => failure.lightDesignation))),
        'reference':
            failure == null ? '-' : _s(_safe(() => failure.lightReference)),
        'technician': ar
            ? _s(
                _safe(() => intervention.technicianNameAr),
                _s(_safe(() => intervention.technicianName) ??
                    _safe(() => intervention.technician)),
              )
            : _s(_safe(() => intervention.technicianName) ??
                _safe(() => intervention.technician)),
        'technicianLocation': _s(
          _safe(() => intervention.technicianLocalisation) ??
              _safe(() => intervention.technicianLocation),
        ),
        'description': _s(_safe(() => intervention.description)),
        'status': _safe(() => intervention.completed) == true
            ? (ar ? 'منتهٍ' : 'Terminée')
            : (ar ? 'مبرمج' : 'Planifiée'),
        'completedAt': _dateValue(_safe(() => intervention.completedAt)),
        'report': _s(_safe(() => intervention.report)),
        'cost': _round2(_n(_safe(() => intervention.cost))),
        'photos': _listLength(_safe(() => intervention.photos)),
        'documents': _docCount(intervention),
      });
    }).toList();

    final totalCost = interventions.fold<double>(
      0,
      (sum, intervention) => sum + _n(_safe(() => intervention.cost)),
    );

    return _ReportData(
      type: 'LIGHTING',
      title: _L("Rapport complet de l'éclairage public",
          'التقرير الكامل للإنارة العمومية'),
      generatedAt: DateTime.now(),
      metrics: [
        _M(_L('Points lumineux', 'نقاط الإنارة'), lights.length),
        _M(
          _L('Actifs', 'النشطة'),
          lights
              .where((l) =>
                  _enumName(_safe(() => l.status)).toLowerCase() == 'active')
              .length,
        ),
        _M(
          _L('Endommagés', 'المعطلة'),
          lights
              .where((l) =>
                  _enumName(_safe(() => l.status)).toLowerCase() == 'damaged')
              .length,
        ),
        _M(
          _L('En maintenance', 'قيد الصيانة'),
          lights
              .where((l) =>
                  _enumName(_safe(() => l.status))
                      .toLowerCase()
                      .replaceAll('_', '') ==
                  'undermaintenance')
              .length,
        ),
        _M(_L('Pannes de la période', 'أعطاب الفترة'), failureRows.length),
        _M(_L('Interventions de la période', 'تدخلات الفترة'),
            interventionRows.length),
        _M(
          _L('Interventions terminées', 'التدخلات المنجزة'),
          interventions.where((i) => _safe(() => i.completed) == true).length,
        ),
        _M(_L('Coût cumulé des interventions', 'التكلفة الإجمالية للتدخلات'),
            _round2(totalCost),
            unit: 'DH'),
      ],
      sections: [
        _ReportSection(
          title: _L('État actuel des points lumineux',
              'الحالة الحالية لنقاط الإنارة'),
          columns: [
            _C('reference', _L('Référence', 'المرجع')),
            _C('designation', _L('Désignation', 'التسمية')),
            _C('localisation', _L('Localisation', 'الموقع')),
            _C('gps', _L('Coordonnées GPS', 'إحداثيات GPS')),
            _C('power', _L('Puissance (W)', 'القدرة (واط)')),
            _C('status', _L('Statut', 'الحالة')),
            _C('installationDate', _L("Date d'installation", 'تاريخ التركيب')),
            _C('documents', _L('Documents', 'الوثائق')),
          ],
          rows: lightRows,
        ),
        _ReportSection(
          title: _L('Pannes signalées sur la période',
              'الأعطاب المبلغ عنها خلال الفترة'),
          periodFiltered: true,
          columns: [
            _C('date', _L('Date', 'التاريخ')),
            _C('reference', _L('Référence', 'المرجع')),
            _C('light', _L('Point lumineux', 'نقطة الإنارة')),
            _C('description', _L('Description', 'الوصف')),
            _C('reportedBy', _L('Déclaré par', 'المبلغ')),
            _C('status', _L('Statut', 'الحالة')),
            _C('documents', _L('Documents', 'الوثائق')),
          ],
          rows: failureRows,
        ),
        _ReportSection(
          title: _L('Interventions sur la période', 'التدخلات خلال الفترة'),
          periodFiltered: true,
          columns: [
            _C('date', _L('Date prévue', 'التاريخ المبرمج')),
            _C('light', _L('Point lumineux', 'نقطة الإنارة')),
            _C('reference', _L('Référence', 'المرجع')),
            _C('technician', _L('Technicien', 'التقني')),
            _C('technicianLocation',
                _L('Localisation technicien', 'موقع التقني')),
            _C('description', _L('Travaux prévus', 'الأشغال المبرمجة')),
            _C('status', _L('Statut', 'الحالة')),
            _C('completedAt', _L('Fin', 'تاريخ الانتهاء')),
            _C('report', _L('Rapport de fin', 'تقرير الإنجاز')),
            _C('cost', _L('Coût (DH)', 'التكلفة (درهم)')),
            _C('photos', _L('Photos', 'الصور')),
            _C('documents', _L('Documents', 'الوثائق')),
          ],
          rows: interventionRows,
        ),
      ],
    );
  }

  Future<void> _exportPdf(BuildContext context, AppState state) async {
    final current = _report;
    if (current == null) return;
    setState(() => _pdfBusy = true);

    try {
      final ar = context.isArabic;
      pw.Font? regular;
      pw.Font? bold;
      if (ar) {
        try {
          regular = await PdfGoogleFonts.notoNaskhArabicRegular();
          bold = await PdfGoogleFonts.notoNaskhArabicBold();
        } catch (_) {
          regular = null;
          bold = null;
        }
      }

      final pdfReport =
          ar && regular == null ? _buildReport(state, arabic: false) : current;
      final pdfArabic = ar && regular != null;

      pw.MemoryImage? logo;
      try {
        final bytes = await rootBundle.load('assets/images/logo.png');
        logo = pw.MemoryImage(bytes.buffer.asUint8List());
      } catch (_) {
        logo = null;
      }

      final document = pw.Document(
        theme: pw.ThemeData.withFont(
          base: regular ?? pw.Font.helvetica(),
          bold: bold ?? pw.Font.helveticaBold(),
        ),
      );

      final user = state.currentUser;
      final generatedBy =
          user == null ? '-' : (pdfArabic ? user.fullNameAr : user.fullName);

      document.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4.landscape,
          margin: const pw.EdgeInsets.all(22),
          footer: (pdfContext) => pw.Align(
            alignment: pw.Alignment.centerRight,
            child: pw.Text(
              'SGPBSE — ${pdfContext.pageNumber}/${pdfContext.pagesCount}',
              style: const pw.TextStyle(fontSize: 7, color: PdfColors.grey700),
            ),
          ),
          build: (_) => [
            pw.Row(
              crossAxisAlignment: pw.CrossAxisAlignment.center,
              children: [
                if (logo != null) ...[
                  pw.Image(logo, width: 56, height: 56),
                  pw.SizedBox(width: 14),
                ],
                pw.Expanded(
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('SGPBSE',
                          style: pw.TextStyle(
                              fontSize: 11, fontWeight: pw.FontWeight.bold)),
                      pw.SizedBox(height: 4),
                      pw.Text(
                        pdfReport.title.value(pdfArabic),
                        style: pw.TextStyle(
                            fontSize: 20, fontWeight: pw.FontWeight.bold),
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text(
                        '${pdfArabic ? 'الفترة' : 'Période'}: ${_date(_start)} — ${_date(_end)}',
                        style: const pw.TextStyle(fontSize: 9),
                      ),
                      pw.Text(
                        '${pdfArabic ? 'بواسطة' : 'Généré par'}: $generatedBy',
                        style: const pw.TextStyle(fontSize: 9),
                      ),
                      pw.Text(
                        '${pdfArabic ? 'تاريخ الإنشاء' : 'Généré le'}: ${_dateTime(pdfReport.generatedAt)}',
                        style: const pw.TextStyle(fontSize: 9),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            pw.Divider(),
            pw.Wrap(
              spacing: 8,
              runSpacing: 8,
              children: pdfReport.metrics
                  .map(
                    (metric) => pw.Container(
                      width: 145,
                      padding: const pw.EdgeInsets.all(8),
                      decoration: pw.BoxDecoration(
                        border: pw.Border.all(color: PdfColors.grey400),
                        borderRadius:
                            const pw.BorderRadius.all(pw.Radius.circular(5)),
                      ),
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(metric.label.value(pdfArabic),
                              style: const pw.TextStyle(fontSize: 7)),
                          pw.SizedBox(height: 3),
                          pw.Text(
                            '${metric.value}${metric.unit == null ? '' : ' ${metric.unit}'}',
                            style: pw.TextStyle(
                                fontSize: 12, fontWeight: pw.FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  )
                  .toList(),
            ),
            pw.SizedBox(height: 14),
            ...pdfReport.sections.expand((section) {
              final data = section.rows
                  .map(
                    (entry) => section.columns
                        .map((column) => '${entry.values[column.key] ?? '-'}')
                        .toList(),
                  )
                  .toList();
              return <pw.Widget>[
                pw.Header(
                  level: 1,
                  text: section.title.value(pdfArabic),
                  textStyle: pw.TextStyle(
                      fontSize: 13, fontWeight: pw.FontWeight.bold),
                ),
                if (section.description != null)
                  pw.Padding(
                    padding: const pw.EdgeInsets.only(bottom: 6),
                    child: pw.Text(section.description!.value(pdfArabic),
                        style: const pw.TextStyle(fontSize: 8)),
                  ),
                if (data.isEmpty)
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(8),
                    child:
                        pw.Text(pdfArabic ? 'لا توجد بيانات' : 'Aucune donnée'),
                  )
                else
                  pw.TableHelper.fromTextArray(
                    headers: section.columns
                        .map((c) => c.label.value(pdfArabic))
                        .toList(),
                    data: data,
                    headerStyle: pw.TextStyle(
                        fontSize: 6, fontWeight: pw.FontWeight.bold),
                    cellStyle: const pw.TextStyle(fontSize: 5.5),
                    headerDecoration:
                        const pw.BoxDecoration(color: PdfColors.grey200),
                    cellAlignment: pdfArabic
                        ? pw.Alignment.centerRight
                        : pw.Alignment.centerLeft,
                    headerAlignment: pdfArabic
                        ? pw.Alignment.centerRight
                        : pw.Alignment.centerLeft,
                  ),
                pw.SizedBox(height: 12),
              ];
            }),
          ],
        ),
      );

      await Printing.sharePdf(
        bytes: await document.save(),
        filename: 'SGPBSE_${current.type}_${_date(_start)}_${_date(_end)}.pdf',
      );
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              context.tr(
                  'Impossible d’exporter le PDF.', 'تعذر تصدير ملف PDF.'),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _pdfBusy = false);
    }
  }

  Future<void> _exportExcel(BuildContext context) async {
    final report = _report;
    if (report == null) return;
    setState(() => _excelBusy = true);

    try {
      final arabic = context.isArabic;
      final excel = xls.Excel.createExcel();
      final defaultName = excel.getDefaultSheet();
      const summaryName = 'Synthese';
      if (defaultName != null) {
        excel.rename(defaultName, summaryName);
      }
      final summary = excel[summaryName];
      summary.isRTL = arabic;
      summary.appendRow([xls.TextCellValue(report.title.value(arabic))]);
      summary.appendRow([
        xls.TextCellValue(arabic ? 'الفترة' : 'Période'),
        xls.TextCellValue(_date(_start)),
        xls.TextCellValue(_date(_end)),
      ]);
      final state = context.read<AppState>();
      final user = state.currentUser;
      final generatedBy =
          user == null ? '-' : (arabic ? user.fullNameAr : user.fullName);
      summary.appendRow([
        xls.TextCellValue(arabic ? 'أنشئ بواسطة' : 'Généré par'),
        xls.TextCellValue(generatedBy),
      ]);
      summary.appendRow([
        xls.TextCellValue(arabic ? 'تاريخ الإنشاء' : 'Généré le'),
        xls.TextCellValue(_dateTime(report.generatedAt)),
      ]);
      summary.appendRow([]);
      summary.appendRow([
        xls.TextCellValue(arabic ? 'المؤشر' : 'Indicateur'),
        xls.TextCellValue(arabic ? 'القيمة' : 'Valeur'),
      ]);
      for (final metric in report.metrics) {
        summary.appendRow([
          xls.TextCellValue(metric.label.value(arabic)),
          xls.TextCellValue(
              '${metric.value}${metric.unit == null ? '' : ' ${metric.unit}'}'),
        ]);
      }

      for (var i = 0; i < report.sections.length; i++) {
        final section = report.sections[i];
        var name = _safeSheetName(section.title.value(arabic));
        if (name.isEmpty) name = 'Section${i + 1}';
        if (excel.sheets.containsKey(name)) {
          name =
              '${name.substring(0, name.length > 27 ? 27 : name.length)}_${i + 1}';
        }
        final sheet = excel[name];
        sheet.isRTL = arabic;
        sheet.appendRow(
          section.columns
              .map<xls.CellValue?>(
                  (column) => xls.TextCellValue(column.label.value(arabic)))
              .toList(),
        );
        for (final entry in section.rows) {
          sheet.appendRow(
            section.columns
                .map<xls.CellValue?>((column) =>
                    xls.TextCellValue('${entry.values[column.key] ?? '-'}'))
                .toList(),
          );
        }
      }

      final bytes = excel.save();
      if (bytes == null) throw StateError('EXCEL_SAVE_FAILED');
      final dir = await getTemporaryDirectory();
      final file = File(
          '${dir.path}/SGPBSE_${report.type}_${_date(_start)}_${_date(_end)}.xlsx');
      await file.writeAsBytes(bytes, flush: true);
      await Share.shareXFiles(
        [XFile(file.path)],
        text: report.title.value(arabic),
      );
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              context.tr('Impossible d’exporter le fichier Excel.',
                  'تعذر تصدير ملف Excel.'),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _excelBusy = false);
    }
  }

  bool _assetArchived(dynamic asset) {
    final direct = _safe(() => asset.archived);
    if (direct is bool) return direct;
    final nested = _safe(() => asset.archive.archived);
    return nested == true;
  }

  String _assetDetails(dynamic asset, bool ar) {
    final type = _enumName(_safe(() => asset.type)).toLowerCase();
    if (type.contains('vehicle')) {
      final d = _safe(() => asset.vehicleDetails);
      return [
        _s(_safe(() => d.brand), ''),
        _s(_safe(() => d.model), ''),
        _s(_safe(() => d.registrationNumber), ''),
        _s(_safe(() => d.chassisNumber), ''),
        _s(_safe(() => d.fiscalHorsepower), ''),
        _dateValue(_safe(() => d.firstRegistrationDate), fallback: ''),
      ].where((e) => e.isNotEmpty).join(' | ').ifEmpty('-');
    }
    if (type.contains('machine')) {
      final d = _safe(() => asset.machineDetails);
      return [
        _s(_safe(() => d.brand), ''),
        _s(_safe(() => d.model), ''),
        _s(_safe(() => d.serialNumber), ''),
        _s(_safe(() => d.technicalReference), ''),
        _s(_safe(() => d.power), ''),
      ].where((e) => e.isNotEmpty).join(' | ').ifEmpty('-');
    }
    final d = _safe(() => asset.realEstateDetails);
    return [
      _s(_safe(() => d.address), ''),
      _s(_safe(() => d.surface), ''),
      _s(_safe(() => d.landTitleNumber), ''),
      _s(_safe(() => d.propertyType), ''),
      _s(_safe(() => d.cadastralReference), ''),
    ].where((e) => e.isNotEmpty).join(' | ').ifEmpty('-');
  }

  String _lightLocation(dynamic light, bool ar) {
    final localisation = ar
        ? _s(
            _safe(() => light.localisationAr) ??
                _safe(() => light.localisation),
            '',
          )
        : _s(_safe(() => light.localisation), '');
    if (localisation.isNotEmpty) return localisation;
    final zone = ar
        ? _s(_safe(() => light.zoneAr) ?? _safe(() => light.zone), '')
        : _s(_safe(() => light.zone), '');
    final address = ar
        ? _s(_safe(() => light.addressAr) ?? _safe(() => light.address), '')
        : _s(_safe(() => light.address), '');
    return [zone, address].where((e) => e.isNotEmpty).join(' — ').ifEmpty('-');
  }

  int _docCount(dynamic item) => _listLength(_safe(() => item.documents));

  int _listLength(dynamic value) => value is Iterable ? value.length : 0;

  dynamic _safe(dynamic Function() getter) {
    try {
      return getter();
    } catch (_) {
      return null;
    }
  }

  String _s(dynamic value, [String fallback = '-']) {
    if (value == null) return fallback;
    final result = '$value'.trim();
    return result.isEmpty ? fallback : result;
  }

  double _n(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse('$value') ?? 0;
  }

  double _round2(double value) => (value * 100).round() / 100;

  String _enumName(dynamic value) {
    if (value == null) return '';
    final raw = '$value';
    return raw.contains('.') ? raw.split('.').last : raw;
  }

  String _dateValue(dynamic value, {String fallback = '-'}) {
    if (value == null) return fallback;
    if (value is DateTime) return _date(value);
    final raw = '$value';
    if (raw.length >= 10) return raw.substring(0, 10);
    return raw.isEmpty ? fallback : raw;
  }

  bool _inPeriod(dynamic value) {
    DateTime? parsed;
    if (value is DateTime) {
      parsed = DateTime(value.year, value.month, value.day);
    } else if (value != null) {
      parsed = DateTime.tryParse('$value');
      if (parsed != null) {
        parsed = DateTime(parsed.year, parsed.month, parsed.day);
      }
    }
    if (parsed == null) return false;
    final start = DateTime(_start.year, _start.month, _start.day);
    final end = DateTime(_end.year, _end.month, _end.day);
    return !parsed.isBefore(start) && !parsed.isAfter(end);
  }

  String _date(DateTime value) =>
      '${value.year.toString().padLeft(4, '0')}-${value.month.toString().padLeft(2, '0')}-${value.day.toString().padLeft(2, '0')}';

  String _dateTime(DateTime value) =>
      '${_date(value)} ${value.hour.toString().padLeft(2, '0')}:${value.minute.toString().padLeft(2, '0')}';

  String _assetTypeLabel(String value, bool ar) {
    final key = value.toLowerCase().replaceAll('_', '');
    if (key.contains('vehicle')) return ar ? 'مركبة' : 'Véhicule';
    if (key.contains('machine')) return ar ? 'آلة' : 'Machine';
    if (key.contains('realestate')) return ar ? 'عقار' : 'Immobilier';
    return value.ifEmpty('-');
  }

  String _unitLabel(String value, bool ar) {
    final key = value.toUpperCase().replaceAll('_', '');
    const fr = <String, String>{
      'UNITE': 'Unité',
      'PIECE': 'Pièce',
      'PAQUET': 'Paquet',
      'BOITE': 'Boîte',
      'KG': 'Kg',
      'LITRE': 'Litre',
      'METRE': 'Mètre',
    };
    const arabic = <String, String>{
      'UNITE': 'وحدة',
      'PIECE': 'قطعة',
      'PAQUET': 'حزمة',
      'BOITE': 'علبة',
      'KG': 'كغ',
      'LITRE': 'لتر',
      'METRE': 'متر',
    };
    return (ar ? arabic[key] : fr[key]) ?? value.ifEmpty('-');
  }

  String _status(String value, bool ar) {
    final key = value.toUpperCase().replaceAll('_', '');
    const fr = <String, String>{
      'AVAILABLE': 'Disponible',
      'INUSE': 'En service',
      'RENTED': 'Loué',
      'UNDERMAINTENANCE': 'En maintenance',
      'OUTOFSERVICE': 'Hors service',
      'DAMAGED': 'Endommagé',
      'DISPOSED': 'Cédé',
      'ARCHIVED': 'Archivé',
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'REPORTED': 'Signalée',
      'INPROGRESS': 'En cours',
      'RESOLVED': 'Résolue',
      'PENDING': 'En attente',
      'APPROVED': 'Validée',
      'REJECTED': 'Refusée',
      'RECEIVED': 'Reçue',
      'WAITING': 'En attente de réapprovisionnement',
      'READYNOTIFIED': 'Quantité disponible / notifié',
      'ENTRY': 'Entrée',
      'EXIT': 'Sortie',
      'REFORMED': 'Réformé',
      'TRANSFERRED': 'Transféré',
      'DESTROYED': 'Détruit',
      'OTHER': 'Autre',
      'HOMME': 'Homme',
      'FEMME': 'Femme',
    };
    const arabic = <String, String>{
      'AVAILABLE': 'متاح',
      'INUSE': 'قيد الاستعمال',
      'RENTED': 'مكترى',
      'UNDERMAINTENANCE': 'قيد الصيانة',
      'OUTOFSERVICE': 'خارج الخدمة',
      'DAMAGED': 'متضرر',
      'DISPOSED': 'مفوت',
      'ARCHIVED': 'مؤرشف',
      'ACTIVE': 'نشط',
      'INACTIVE': 'غير نشط',
      'REPORTED': 'مبلغ عنه',
      'INPROGRESS': 'قيد المعالجة',
      'RESOLVED': 'محلول',
      'PENDING': 'قيد الانتظار',
      'APPROVED': 'مقبول',
      'REJECTED': 'مرفوض',
      'RECEIVED': 'مستلم',
      'WAITING': 'في انتظار إعادة التموين',
      'READYNOTIFIED': 'الكمية متاحة وتم الإشعار',
      'ENTRY': 'دخول',
      'EXIT': 'خروج',
      'REFORMED': 'إصلاح إداري',
      'TRANSFERRED': 'محول',
      'DESTROYED': 'متلف',
      'OTHER': 'آخر',
      'HOMME': 'ذكر',
      'FEMME': 'أنثى',
    };
    return (ar ? arabic[key] : fr[key]) ?? value.ifEmpty('-');
  }

  String _safeSheetName(String value) {
    final cleaned = value.replaceAll(RegExp(r'[\\/*?:\[\]]'), ' ').trim();
    return cleaned.length > 31 ? cleaned.substring(0, 31) : cleaned;
  }
}

class _ApiAssetAdapter {
  _ApiAssetAdapter(this.item, {required this.archived});

  final BienApiListItem item;
  final bool archived;

  int get id => item.id ?? 0;
  String get inventoryId => item.inventoryNumber;
  String get designation => item.designation;
  String get designationAr => _text(item.raw['designationAr'] ?? item.raw['designation_ar'], item.designation);
  String get type => item.type ?? '';
  String get status => item.status;
  String get assetStatus => item.status;
  String get assignment => item.assignment ?? '';
  String get assignmentAr => _text(item.raw['assignmentAr'] ?? item.raw['assignment_ar'], assignment);
  String get acquisitionDate => item.acquisitionDate;
  double get purchaseValue => item.purchaseValue ?? _number(item.raw['acquisitionValue']);
  List<dynamic> get documents => item.documents;
  String? get archivedAt => item.archivedAt;
  String? get archiveReason => _nullableText(item.raw['archiveReason'] ?? _disposal()['disposalMethod']);
  _ArchiveAdapter get archive => _ArchiveAdapter(_disposal(), item.archivedAt);
  List<_RentalAdapter> get rentals => _list(item.raw['rentalList'] ?? item.raw['rentals'])
      .whereType<Map>()
      .map((value) => _RentalAdapter(Map<String, dynamic>.from(value)))
      .toList();
  List<_RentalAdapter> get rentalHistory => rentals;

  _VehicleDetails get vehicleDetails => _VehicleDetails(item.raw);
  _MachineDetails get machineDetails => _MachineDetails(item.raw);
  _RealEstateDetails get realEstateDetails => _RealEstateDetails(item.raw);

  Map<String, dynamic> _disposal() {
    final value = item.raw['disposal'];
    return value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};
  }

  static List<dynamic> _list(dynamic value) => value is List ? value : const [];
  static String _text(dynamic value, [String fallback = '']) {
    final text = value?.toString().trim() ?? '';
    return text.isEmpty ? fallback : text;
  }
  static String? _nullableText(dynamic value) {
    final text = value?.toString().trim() ?? '';
    return text.isEmpty ? null : text;
  }
  static double _number(dynamic value) => value is num ? value.toDouble() : double.tryParse('${value ?? ''}') ?? 0;
}

class _ArchiveAdapter {
  _ArchiveAdapter(this.raw, this.fallbackDate);
  final Map<String, dynamic> raw;
  final String? fallbackDate;
  bool get archived => raw.isNotEmpty || fallbackDate != null;
  String? get archivedAt => _ApiAssetAdapter._nullableText(raw['disposalDate'] ?? fallbackDate);
  String? get reason => _ApiAssetAdapter._nullableText(raw['disposalMethod'] ?? raw['reason']);
  String? get reference => _ApiAssetAdapter._nullableText(raw['reference'] ?? raw['contractReference']);
  String? get notes => _ApiAssetAdapter._nullableText(raw['notes']);
}

class _RentalAdapter {
  _RentalAdapter(this.raw);
  final Map<String, dynamic> raw;
  String? get startDate => _ApiAssetAdapter._nullableText(raw['startDate']);
  String? get endDate => _ApiAssetAdapter._nullableText(raw['endDate']);
  String? get tenantName => _ApiAssetAdapter._nullableText(raw['tenantName']);
  double get monthlyAmount => _ApiAssetAdapter._number(raw['monthlyAmount'] ?? raw['amount']);
  String? get contractReference => _ApiAssetAdapter._nullableText(raw['contractReference']);
  String? get notes => _ApiAssetAdapter._nullableText(raw['notes']);
}

class _VehicleDetails {
  _VehicleDetails(this.raw);
  final Map<String, dynamic> raw;
  String? get brand => _ApiAssetAdapter._nullableText(raw['make'] ?? raw['brand']);
  String? get model => _ApiAssetAdapter._nullableText(raw['model']);
  String? get registrationNumber => _ApiAssetAdapter._nullableText(raw['registrationNumber']);
  String? get chassisNumber => _ApiAssetAdapter._nullableText(raw['chassisNumber']);
  dynamic get fiscalHorsepower => raw['fiscalHorsepower'];
  String? get firstRegistrationDate => _ApiAssetAdapter._nullableText(raw['firstRegistrationDate']);
}

class _MachineDetails {
  _MachineDetails(this.raw);
  final Map<String, dynamic> raw;
  String? get brand => _ApiAssetAdapter._nullableText(raw['brand']);
  String? get model => _ApiAssetAdapter._nullableText(raw['model']);
  String? get serialNumber => _ApiAssetAdapter._nullableText(raw['serialNumber']);
  String? get technicalReference => _ApiAssetAdapter._nullableText(raw['technicalRef'] ?? raw['technicalReference']);
  dynamic get power => raw['power'];
}

class _RealEstateDetails {
  _RealEstateDetails(this.raw);
  final Map<String, dynamic> raw;
  String? get address => _ApiAssetAdapter._nullableText(raw['gpsLocation'] ?? raw['address']);
  dynamic get surface => raw['areaM2'] ?? raw['surface'];
  String? get landTitleNumber => _ApiAssetAdapter._nullableText(raw['landTitleReference'] ?? raw['landTitleNumber']);
  String? get propertyType => _ApiAssetAdapter._nullableText(raw['realEstateType'] ?? raw['propertyType']);
  String? get cadastralReference => _ApiAssetAdapter._nullableText(raw['cadastralReference']);
}

class _ReportOption {
  const _ReportOption(this.type, this.icon, this.label);
  final String type;
  final IconData icon;
  final _L label;
}

class _L {
  const _L(this.fr, this.ar);
  final String fr;
  final String ar;
  String of(BuildContext context) => context.isArabic ? ar : fr;
  String value(bool arabic) => arabic ? ar : fr;
}

class _M {
  const _M(this.label, this.value, {this.unit});
  final _L label;
  final Object value;
  final String? unit;
}

class _C {
  const _C(this.key, this.label);
  final String key;
  final _L label;
}

class _R {
  const _R(this.values);
  final Map<String, Object> values;
}

class _ReportSection {
  const _ReportSection({
    required this.title,
    required this.columns,
    required this.rows,
    this.description,
    this.periodFiltered = false,
  });

  final _L title;
  final _L? description;
  final List<_C> columns;
  final List<_R> rows;
  final bool periodFiltered;

  _ReportSection copyWith({List<_R>? rows}) => _ReportSection(
        title: title,
        description: description,
        columns: columns,
        rows: rows ?? this.rows,
        periodFiltered: periodFiltered,
      );
}

class _ReportData {
  const _ReportData({
    required this.type,
    required this.title,
    required this.generatedAt,
    required this.metrics,
    required this.sections,
  });

  final String type;
  final _L title;
  final DateTime generatedAt;
  final List<_M> metrics;
  final List<_ReportSection> sections;
}

extension _NonEmptyString on String {
  String ifEmpty(String fallback) => isEmpty ? fallback : this;
}