
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/bien.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';
import '../../widgets/document_editor.dart';

class BiensScreen extends StatefulWidget {
  const BiensScreen({super.key});

  @override
  State<BiensScreen> createState() => _BiensScreenState();
}

class _BiensScreenState extends State<BiensScreen> {
  final _search = TextEditingController();

  bool _archives = false;
  AssetType? _typeFilter;
  AssetStatus? _statusFilter;

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<Bien> _filtered(AppState state) {
    final source =
        _archives ? state.archivedBiens : state.activeBiens;
    final query = _search.text.trim().toLowerCase();

    return source.where((bien) {
      final matchesSearch = query.isEmpty ||
          bien.inventoryId.toLowerCase().contains(query) ||
          bien.designation.toLowerCase().contains(query) ||
          bien.designationAr.toLowerCase().contains(query) ||
          bien.assignment.toLowerCase().contains(query) ||
          bien.assignmentAr.toLowerCase().contains(query);

      final matchesType =
          _typeFilter == null || bien.type == _typeFilter;

      final matchesStatus = _archives ||
          _statusFilter == null ||
          bien.status == _statusFilter;

      return matchesSearch &&
          matchesType &&
          matchesStatus;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final items = _filtered(state);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                context.tr(
                  'Gestion des biens',
                  'تدبير الممتلكات',
                ),
                style: Theme.of(context)
                    .textTheme
                    .headlineSmall
                    ?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
            ),
            if (!_archives &&
                state.hasPermission(
                  Permissions.createAsset,
                ))
              IconButton.filled(
                tooltip: context.tr(
                  'Ajouter un bien',
                  'إضافة ممتلك',
                ),
                onPressed: () => _openForm(context),
                icon: const Icon(Icons.add),
              ),
          ],
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _search,
          onChanged: (_) => setState(() {}),
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.search),
            hintText: context.tr(
              'Inventaire, désignation ou affectation',
              'رقم الجرد، التسمية أو الجهة المستعملة',
            ),
          ),
        ),
        const SizedBox(height: 10),
        SegmentedButton<bool>(
          segments: [
            ButtonSegment<bool>(
              value: false,
              label: Text(
                context.tr('Actifs', 'النشطة'),
              ),
            ),
            ButtonSegment<bool>(
              value: true,
              label: Text(
                context.tr('Archives', 'الأرشيف'),
              ),
            ),
          ],
          selected: {_archives},
          onSelectionChanged: (value) {
            setState(() {
              _archives = value.first;
              _statusFilter = null;
            });
          },
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<AssetType>(
                key: ValueKey(
                  _typeFilter?.name ?? 'all-type',
                ),
                initialValue: _typeFilter,
                decoration: InputDecoration(
                  labelText: context.tr('Type', 'النوع'),
                ),
                items: [
                  DropdownMenuItem<AssetType>(
                    value: null,
                    child: Text(
                      context.tr(
                        'Tous les types',
                        'كل الأنواع',
                      ),
                    ),
                  ),
                  ...AssetType.values.map(
                    (type) =>
                        DropdownMenuItem<AssetType>(
                      value: type,
                      child: Text(
                        _typeLabel(context, type),
                      ),
                    ),
                  ),
                ],
                onChanged: (value) {
                  setState(() {
                    _typeFilter = value;
                  });
                },
              ),
            ),
            if (!_archives) ...[
              const SizedBox(width: 10),
              Expanded(
                child:
                    DropdownButtonFormField<AssetStatus>(
                  key: ValueKey(
                    _statusFilter?.name ?? 'all-status',
                  ),
                  initialValue: _statusFilter,
                  decoration: InputDecoration(
                    labelText: context.tr(
                      'Statut',
                      'الحالة',
                    ),
                  ),
                  items: [
                    DropdownMenuItem<AssetStatus>(
                      value: null,
                      child: Text(
                        context.tr(
                          'Tous les statuts',
                          'كل الحالات',
                        ),
                      ),
                    ),
                    ..._activeStatuses.map(
                      (status) =>
                          DropdownMenuItem<AssetStatus>(
                        value: status,
                        child: Text(
                          _statusLabel(
                            context,
                            status,
                          ),
                        ),
                      ),
                    ),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _statusFilter = value;
                    });
                  },
                ),
              ),
            ],
          ],
        ),
        if (_archives) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: Theme.of(context)
                  .colorScheme
                  .primaryContainer
                  .withValues(alpha: .35),
            ),
            child: Text(
              context.tr(
                'L’archive contient uniquement les biens cédés.',
                'يحتوي الأرشيف فقط على الممتلكات المفوّتة.',
              ),
            ),
          ),
        ],
        const SizedBox(height: 14),
        if (items.isEmpty)
          EmptyState(
            icon: Icons.apartment_outlined,
            title: _archives
                ? context.tr(
                    'Aucun bien cédé',
                    'لا توجد ممتلكات مفوّتة',
                  )
                : context.tr(
                    'Aucun bien trouvé',
                    'لم يتم العثور على أي ممتلك',
                  ),
          )
        else
          ...items.map(
            (bien) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: SectionCard(
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => _details(context, bien),
                  child: Row(
                    children: [
                      CircleAvatar(
                        child: Icon(
                          _typeIcon(bien.type),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text(
                              context.isArabic
                                  ? bien.designationAr
                                  : bien.designation,
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              bien.status ==
                                          AssetStatus.inUse &&
                                      !bien.archived
                                  ? '${bien.inventoryId} · ${context.isArabic ? bien.assignmentAr : bien.assignment}'
                                  : bien.inventoryId,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall,
                            ),
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: [
                                Chip(
                                  label: Text(
                                    _archives
                                        ? context.tr(
                                            'Cédé',
                                            'مفوّت',
                                          )
                                        : _statusLabel(
                                            context,
                                            bien.status,
                                          ),
                                  ),
                                  visualDensity:
                                      VisualDensity.compact,
                                ),
                                Chip(
                                  label: Text(
                                    _typeLabel(
                                      context,
                                      bien.type,
                                    ),
                                  ),
                                  visualDensity:
                                      VisualDensity.compact,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Future<void> _details(
    BuildContext context,
    Bien bien,
  ) async {
    final state = context.read<AppState>();

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheetContext) =>
          DraggableScrollableSheet(
        initialChildSize: .9,
        minChildSize: .55,
        maxChildSize: .97,
        expand: false,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(
            18,
            0,
            18,
            24,
          ),
          children: [
            Text(
              sheetContext.isArabic
                  ? bien.designationAr
                  : bien.designation,
              style: Theme.of(sheetContext)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            Text(bien.inventoryId),
            const SizedBox(height: 14),
            _info(
              sheetContext,
              sheetContext.tr('Type', 'النوع'),
              _typeLabel(sheetContext, bien.type),
            ),
            _info(
              sheetContext,
              sheetContext.tr('Statut', 'الحالة'),
              bien.archived
                  ? sheetContext.tr('Cédé', 'مفوّت')
                  : _statusLabel(
                      sheetContext,
                      bien.status,
                    ),
            ),
            if (bien.status == AssetStatus.inUse &&
                !bien.archived)
              _info(
                sheetContext,
                sheetContext.tr(
                  'Affectation',
                  'الجهة المستعملة',
                ),
                sheetContext.isArabic
                    ? bien.assignmentAr
                    : bien.assignment,
              ),
            _info(
              sheetContext,
              sheetContext.tr('Valeur', 'القيمة'),
              '${bien.purchaseValue.toStringAsFixed(0)} DH',
            ),
            _info(
              sheetContext,
              sheetContext.tr(
                'Acquisition',
                'الاقتناء',
              ),
              formatDate(bien.acquisitionDate),
            ),
            ..._specificDetails(
              sheetContext,
              bien,
            ),
            if (bien.rentals.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                sheetContext.tr(
                  'Historique des locations',
                  'سجل الكراء',
                ),
                style: Theme.of(sheetContext)
                    .textTheme
                    .titleMedium
                    ?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 8),
              ...bien.rentals.map(
                (rental) => Card(
                  child: ListTile(
                    title: Text(rental.tenantName),
                    subtitle: Text(
                      '${formatDate(rental.startDate)}${rental.endDate != null ? ' → ${formatDate(rental.endDate!)}' : ''}\n${rental.monthlyAmount.toStringAsFixed(0)} DH / ${sheetContext.tr('mois', 'شهر')}',
                    ),
                    isThreeLine: true,
                  ),
                ),
              ),
            ],
            if (bien.archived) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Theme.of(sheetContext)
                      .colorScheme
                      .primaryContainer
                      .withValues(alpha: .4),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    Text(
                      sheetContext.tr(
                        'Bien cédé',
                        'ممتلك مفوّت',
                      ),
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    if (bien.archivedAt != null)
                      Text(
                        '${sheetContext.tr('Date', 'التاريخ')}: ${formatDate(bien.archivedAt!)}',
                      ),
                    if (bien.archiveReference
                            ?.isNotEmpty ==
                        true)
                      Text(
                        '${sheetContext.tr('Référence', 'المرجع')}: ${bien.archiveReference}',
                      ),
                    if (bien.archiveNotes?.isNotEmpty ==
                        true)
                      Text(
                        '${sheetContext.tr('Observations', 'ملاحظات')}: ${bien.archiveNotes}',
                      ),
                    if (bien.sale != null) ...[
                      const Divider(),
                      Text(
                        sheetContext.tr(
                          'Informations de vente',
                          'معلومات البيع',
                        ),
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        '${sheetContext.tr('Acheteur', 'المشتري')}: ${bien.sale!.buyerName}',
                      ),
                      Text(
                        '${sheetContext.tr('Prix', 'الثمن')}: ${bien.sale!.salePrice.toStringAsFixed(0)} DH',
                      ),
                      Text(
                        '${sheetContext.tr('Date', 'التاريخ')}: ${formatDate(bien.sale!.saleDate)}',
                      ),
                    ],
                  ],
                ),
              ),
            ],
            const SizedBox(height: 16),
            DocumentEditor(
              documents: bien.documents,
              readOnly: true,
              showGuidance: false,
              onChanged: (_) {},
            ),
            if (!bien.archived) ...[
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (state.hasPermission(
                    Permissions.updateAsset,
                  ))
                    OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(sheetContext);
                        _openForm(
                          context,
                          bien: bien,
                        );
                      },
                      icon:
                          const Icon(Icons.edit_outlined),
                      label: Text(
                        sheetContext.tr(
                          'Modifier',
                          'تعديل',
                        ),
                      ),
                    ),
                  if (state.hasPermission(
                    Permissions.updateAsset,
                  ))
                    OutlinedButton.icon(
                      onPressed: () =>
                          _rent(context, bien),
                      icon:
                          const Icon(Icons.key_outlined),
                      label: Text(
                        sheetContext.tr(
                          'Louer',
                          'كراء',
                        ),
                      ),
                    ),
                  if (state.hasPermission(
                    Permissions.updateAsset,
                  ))
                    OutlinedButton.icon(
                      onPressed: () =>
                          _sell(context, bien),
                      icon:
                          const Icon(Icons.sell_outlined),
                      label: Text(
                        sheetContext.tr(
                          'Vendre',
                          'بيع',
                        ),
                      ),
                    ),
                  if (state.hasPermission(
                    Permissions.updateAsset,
                  ))
                    FilledButton.icon(
                      onPressed: () =>
                          _cede(context, bien),
                      icon:
                          const Icon(
                        Icons.archive_outlined,
                      ),
                      label: Text(
                        sheetContext.tr(
                          'Céder',
                          'تفويت',
                        ),
                      ),
                    ),
                  if (state.hasPermission(
                    Permissions.deleteAsset,
                  ))
                    OutlinedButton.icon(
                      onPressed: () async {
                        final ok =
                            await confirmAction(
                          context,
                          fr:
                              'Supprimer définitivement ce bien ?',
                          ar:
                              'هل تريد حذف هذا الممتلك نهائياً؟',
                        );

                        if (ok &&
                            context.mounted) {
                          state.deleteBien(bien.id);

                          if (sheetContext.mounted) {
                            Navigator.pop(
                              sheetContext,
                            );
                          }
                        }
                      },
                      icon: const Icon(
                        Icons.delete_outline,
                        color: Colors.red,
                      ),
                      label: Text(
                        sheetContext.tr(
                          'Supprimer',
                          'حذف',
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  List<Widget> _specificDetails(
    BuildContext context,
    Bien bien,
  ) {
    final result = <Widget>[];

    void add(String label, String? value) {
      if (value != null && value.isNotEmpty) {
        result.add(
          _info(context, label, value),
        );
      }
    }

    if (bien.type == AssetType.vehicle) {
      add(
        context.tr(
          'Immatriculation',
          'رقم التسجيل',
        ),
        bien.registrationNumber,
      );
      add(
        context.tr('Marque', 'العلامة'),
        bien.brand,
      );
      add(
        context.tr('Modèle', 'الطراز'),
        bien.model,
      );
      add(
        context.tr('Année', 'السنة'),
        bien.year?.toString(),
      );
      add(
        context.tr(
          'Numéro de châssis',
          'رقم الهيكل',
        ),
        bien.chassisNumber,
      );
      add(
        context.tr(
          'Puissance fiscale',
          'القوة الجبائية',
        ),
        bien.fiscalHorsepower != null
            ? '${bien.fiscalHorsepower} CV'
            : null,
      );
      add(
        context.tr(
          'Première mise en circulation',
          'أول وضع في السير',
        ),
        bien.firstRegistrationDate != null
            ? formatDate(
                bien.firstRegistrationDate!,
              )
            : null,
      );
    }

    if (bien.type == AssetType.machine) {
      add(
        context.tr('Marque', 'العلامة'),
        bien.brand,
      );
      add(
        context.tr('Modèle', 'الطراز'),
        bien.model,
      );
      add(
        context.tr(
          'Numéro de série',
          'الرقم التسلسلي',
        ),
        bien.serialNumber,
      );
      add(
        context.tr(
          'Référence technique',
          'المرجع التقني',
        ),
        bien.technicalReference,
      );
      add(
        context.tr('Puissance', 'القدرة'),
        bien.machinePowerKw != null
            ? '${bien.machinePowerKw} kW'
            : null,
      );
    }

    if (bien.type == AssetType.realEstate) {
      add(
        context.tr('Adresse', 'العنوان'),
        bien.address,
      );
      add(
        context.tr('Superficie', 'المساحة'),
        bien.surface != null
            ? '${bien.surface} m²'
            : null,
      );
      add(
        context.tr(
          'Titre foncier',
          'الرسم العقاري',
        ),
        bien.landTitleNumber,
      );
      add(
        context.tr(
          'Type de propriété',
          'نوع الملكية',
        ),
        bien.propertyType,
      );
      add(
        context.tr(
          'Référence cadastrale',
          'المرجع المساحي',
        ),
        bien.cadastralReference,
      );
      add(
        context.tr('Domaine', 'المجال'),
        bien.domain == RealEstateDomain.public
            ? context.tr(
                'Domaine public',
                'الملك العام',
              )
            : bien.domain ==
                    RealEstateDomain.private
                ? context.tr(
                    'Domaine privé',
                    'الملك الخاص',
                  )
                : null,
      );
    }

    return result;
  }

  Widget _info(
    BuildContext context,
    String label,
    String value,
  ) =>
      ListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(
          label,
          style:
              Theme.of(context).textTheme.bodySmall,
        ),
        subtitle: Text(
          value,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
          ),
        ),
      );

  Future<void> _openForm(
    BuildContext context, {
    Bien? bien,
  }) async {
    final state = context.read<AppState>();
    final formKey = GlobalKey<FormState>();

    final designation =
        TextEditingController(
      text: bien?.designation ?? '',
    );
    final designationAr =
        TextEditingController(
      text: bien?.designationAr ?? '',
    );
    final inventory =
        TextEditingController(
      text: bien?.inventoryId ?? '',
    );
    final assignment =
        TextEditingController(
      text: bien?.assignment ?? '',
    );
    final assignmentAr =
        TextEditingController(
      text: bien?.assignmentAr ?? '',
    );
    final purchaseValue =
        TextEditingController(
      text: bien?.purchaseValue.toString() ?? '0',
    );

    final registrationNumber =
        TextEditingController(
      text: bien?.registrationNumber ?? '',
    );
    final brand = TextEditingController(
      text: bien?.brand ?? '',
    );
    final model = TextEditingController(
      text: bien?.model ?? '',
    );
    final year = TextEditingController(
      text: bien?.year?.toString() ?? '',
    );
    final chassisNumber =
        TextEditingController(
      text: bien?.chassisNumber ?? '',
    );
    final fiscalHorsepower =
        TextEditingController(
      text:
          bien?.fiscalHorsepower?.toString() ??
              '',
    );

    final serialNumber =
        TextEditingController(
      text: bien?.serialNumber ?? '',
    );
    final technicalReference =
        TextEditingController(
      text: bien?.technicalReference ?? '',
    );
    final machinePower =
        TextEditingController(
      text:
          bien?.machinePowerKw?.toString() ??
              '',
    );

    final address = TextEditingController(
      text: bien?.address ?? '',
    );
    final surface = TextEditingController(
      text: bien?.surface?.toString() ?? '',
    );
    final landTitle =
        TextEditingController(
      text: bien?.landTitleNumber ?? '',
    );
    final propertyType =
        TextEditingController(
      text: bien?.propertyType ?? '',
    );
    final cadastralReference =
        TextEditingController(
      text: bien?.cadastralReference ?? '',
    );

    var firstRegistrationDate =
        bien?.firstRegistrationDate;
    var domain = bien?.domain;
    var type = bien?.type ?? AssetType.vehicle;
    var status =
        bien?.status ?? AssetStatus.available;
    var acquisitionDate =
        bien?.acquisitionDate ?? DateTime.now();
    var documents = [...?bien?.documents];

    try {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (sheetContext) =>
            StatefulBuilder(
          builder: (
            sheetContext,
            setLocal,
          ) =>
              Padding(
            padding: EdgeInsets.fromLTRB(
              18,
              0,
              18,
              18 +
                  MediaQuery.of(sheetContext)
                      .viewInsets
                      .bottom,
            ),
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      bien == null
                          ? sheetContext.tr(
                              'Ajouter un bien',
                              'إضافة ممتلك',
                            )
                          : sheetContext.tr(
                              'Modifier le bien',
                              'تعديل الممتلك',
                            ),
                      style: Theme.of(sheetContext)
                          .textTheme
                          .titleLarge
                          ?.copyWith(
                            fontWeight:
                                FontWeight.w900,
                          ),
                    ),
                    if (bien == null) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding:
                            const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Theme.of(
                            sheetContext,
                          )
                              .colorScheme
                              .primaryContainer
                              .withValues(alpha: .4),
                          borderRadius:
                              BorderRadius.circular(
                            14,
                          ),
                        ),
                        child: Text(
                          sheetContext.tr(
                            'Le nouveau bien sera créé automatiquement avec le statut « Disponible ».',
                            'سيتم إنشاء الممتلك الجديد تلقائياً بالحالة « متاح ».',
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 14),
                    DropdownButtonFormField<
                        AssetType>(
                      initialValue: type,
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Type',
                          'النوع',
                        ),
                      ),
                      items: AssetType.values
                          .map(
                            (item) =>
                                DropdownMenuItem<
                                    AssetType>(
                              value: item,
                              child: Text(
                                _typeLabel(
                                  sheetContext,
                                  item,
                                ),
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (value) {
                        if (value != null) {
                          setLocal(() {
                            type = value;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: inventory,
                      validator: (value) =>
                          _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Identifiant inventaire',
                          'رقم الجرد',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: designation,
                      validator: (value) =>
                          _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Désignation',
                          'التسمية بالفرنسية',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: designationAr,
                      textDirection:
                          TextDirection.rtl,
                      validator: (value) =>
                          _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Désignation en arabe',
                          'التسمية بالعربية',
                        ),
                      ),
                    ),
                    if (bien != null) ...[
                      const SizedBox(height: 10),
                      DropdownButtonFormField<
                          AssetStatus>(
                        initialValue: status,
                        decoration: InputDecoration(
                          labelText:
                              sheetContext.tr(
                            'Statut',
                            'الحالة',
                          ),
                        ),
                        items: _activeStatuses
                            .map(
                              (item) =>
                                  DropdownMenuItem<
                                      AssetStatus>(
                                value: item,
                                child: Text(
                                  _statusLabel(
                                    sheetContext,
                                    item,
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                        onChanged: (value) {
                          if (value == null) return;

                          setLocal(() {
                            status = value;

                            if (status !=
                                AssetStatus.inUse) {
                              assignment.clear();
                              assignmentAr.clear();
                            }
                          });
                        },
                      ),
                    ],
                    if (bien != null &&
                        status ==
                            AssetStatus.inUse) ...[
                      const SizedBox(height: 10),
                      TextFormField(
                        controller: assignment,
                        validator: (value) =>
                            _required(
                          sheetContext,
                          value,
                        ),
                        decoration: InputDecoration(
                          labelText:
                              sheetContext.tr(
                            'Affectation / utilisateur du bien',
                            'الجهة أو الشخص المستعمل للممتلك',
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      TextFormField(
                        controller: assignmentAr,
                        textDirection:
                            TextDirection.rtl,
                        validator: (value) =>
                            _required(
                          sheetContext,
                          value,
                        ),
                        decoration: InputDecoration(
                          labelText:
                              sheetContext.tr(
                            'Affectation en arabe',
                            'الجهة المستعملة بالعربية',
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: purchaseValue,
                      keyboardType:
                          const TextInputType
                              .numberWithOptions(
                        decimal: true,
                      ),
                      validator: (value) {
                        final parsed =
                            double.tryParse(
                          value ?? '',
                        );

                        if (parsed == null ||
                            parsed <= 0) {
                          return sheetContext.tr(
                            'Valeur invalide.',
                            'القيمة غير صالحة.',
                          );
                        }
                        return null;
                      },
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Valeur (DH)',
                          'القيمة (درهم)',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () async {
                        final picked =
                            await showDatePicker(
                          context: sheetContext,
                          initialDate:
                              acquisitionDate,
                          firstDate:
                              DateTime(1900),
                          lastDate:
                              DateTime.now(),
                        );

                        if (picked != null) {
                          setLocal(() {
                            acquisitionDate =
                                picked;
                          });
                        }
                      },
                      icon:
                          const Icon(Icons.event),
                      label: Text(
                        '${sheetContext.tr('Date d’acquisition', 'تاريخ الاقتناء')}: ${formatDate(acquisitionDate)}',
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (type ==
                        AssetType.vehicle) ...[
                      _sectionTitle(
                        sheetContext,
                        sheetContext.tr(
                          'Informations du véhicule',
                          'معلومات المركبة',
                        ),
                      ),
                      _formField(
                        registrationNumber,
                        sheetContext.tr(
                          'Immatriculation',
                          'رقم التسجيل',
                        ),
                      ),
                      _formField(
                        brand,
                        sheetContext.tr(
                          'Marque',
                          'العلامة',
                        ),
                      ),
                      _formField(
                        model,
                        sheetContext.tr(
                          'Modèle',
                          'الطراز',
                        ),
                      ),
                      _formField(
                        year,
                        sheetContext.tr(
                          'Année',
                          'السنة',
                        ),
                        numeric: true,
                      ),
                      _formField(
                        chassisNumber,
                        sheetContext.tr(
                          'Numéro de châssis',
                          'رقم الهيكل',
                        ),
                      ),
                      _formField(
                        fiscalHorsepower,
                        sheetContext.tr(
                          'Puissance fiscale (CV)',
                          'القوة الجبائية (حصان)',
                        ),
                        numeric: true,
                      ),
                      OutlinedButton.icon(
                        onPressed: () async {
                          final picked =
                              await showDatePicker(
                            context: sheetContext,
                            initialDate:
                                firstRegistrationDate ??
                                    DateTime.now(),
                            firstDate:
                                DateTime(1900),
                            lastDate:
                                DateTime.now(),
                          );

                          if (picked != null) {
                            setLocal(() {
                              firstRegistrationDate =
                                  picked;
                            });
                          }
                        },
                        icon: const Icon(
                          Icons.event,
                        ),
                        label: Text(
                          firstRegistrationDate ==
                                  null
                              ? sheetContext.tr(
                                  'Première mise en circulation',
                                  'أول وضع في السير',
                                )
                              : '${sheetContext.tr('Première mise en circulation', 'أول وضع في السير')}: ${formatDate(firstRegistrationDate!)}',
                        ),
                      ),
                    ],
                    if (type ==
                        AssetType.machine) ...[
                      _sectionTitle(
                        sheetContext,
                        sheetContext.tr(
                          'Informations de la machine',
                          'معلومات الآلة',
                        ),
                      ),
                      _formField(
                        brand,
                        sheetContext.tr(
                          'Marque',
                          'العلامة',
                        ),
                      ),
                      _formField(
                        model,
                        sheetContext.tr(
                          'Modèle',
                          'الطراز',
                        ),
                      ),
                      _formField(
                        serialNumber,
                        sheetContext.tr(
                          'Numéro de série',
                          'الرقم التسلسلي',
                        ),
                      ),
                      _formField(
                        technicalReference,
                        sheetContext.tr(
                          'Référence technique',
                          'المرجع التقني',
                        ),
                      ),
                      _formField(
                        machinePower,
                        sheetContext.tr(
                          'Puissance (kW)',
                          'القدرة (كيلوواط)',
                        ),
                        numeric: true,
                      ),
                    ],
                    if (type ==
                        AssetType.realEstate) ...[
                      _sectionTitle(
                        sheetContext,
                        sheetContext.tr(
                          'Informations du bien immobilier',
                          'معلومات العقار',
                        ),
                      ),
                      _formField(
                        address,
                        sheetContext.tr(
                          'Adresse',
                          'العنوان',
                        ),
                      ),
                      _formField(
                        surface,
                        sheetContext.tr(
                          'Superficie (m²)',
                          'المساحة (م²)',
                        ),
                        numeric: true,
                      ),
                      _formField(
                        landTitle,
                        sheetContext.tr(
                          'Titre foncier',
                          'الرسم العقاري',
                        ),
                      ),
                      _formField(
                        propertyType,
                        sheetContext.tr(
                          'Type de propriété',
                          'نوع الملكية',
                        ),
                      ),
                      _formField(
                        cadastralReference,
                        sheetContext.tr(
                          'Référence cadastrale',
                          'المرجع المساحي',
                        ),
                      ),
                      const SizedBox(height: 10),
                      DropdownButtonFormField<
                          RealEstateDomain>(
                        initialValue: domain,
                        decoration: InputDecoration(
                          labelText:
                              sheetContext.tr(
                            'Domaine',
                            'المجال',
                          ),
                        ),
                        items: [
                          DropdownMenuItem<
                              RealEstateDomain>(
                            value:
                                RealEstateDomain
                                    .public,
                            child: Text(
                              sheetContext.tr(
                                'Domaine public',
                                'الملك العام',
                              ),
                            ),
                          ),
                          DropdownMenuItem<
                              RealEstateDomain>(
                            value:
                                RealEstateDomain
                                    .private,
                            child: Text(
                              sheetContext.tr(
                                'Domaine privé',
                                'الملك الخاص',
                              ),
                            ),
                          ),
                        ],
                        onChanged: (value) {
                          setLocal(() {
                            domain = value;
                          });
                        },
                      ),
                    ],
                    const SizedBox(height: 16),
                    DocumentEditor(
                      documents: documents,
                      onChanged: (value) {
                        setLocal(() {
                          documents = value;
                        });
                      },
                    ),
                    const SizedBox(height: 18),
                    FilledButton(
                      onPressed: () {
                        if (!formKey
                            .currentState!
                            .validate()) {
                          return;
                        }

                        final finalStatus =
                            bien == null
                                ? AssetStatus
                                    .available
                                : status;

                        state.saveBien(
                          Bien(
                            id: bien?.id ??
                                state.nextBienId(),
                            type: type,
                            designation:
                                designation.text
                                    .trim(),
                            designationAr:
                                designationAr.text
                                    .trim(),
                            status: finalStatus,
                            acquisitionDate:
                                acquisitionDate,
                            purchaseValue:
                                double.tryParse(
                                      purchaseValue
                                          .text,
                                    ) ??
                                    0,
                            assignment:
                                finalStatus ==
                                        AssetStatus
                                            .inUse
                                    ? assignment.text
                                        .trim()
                                    : '',
                            assignmentAr:
                                finalStatus ==
                                        AssetStatus
                                            .inUse
                                    ? assignmentAr
                                        .text
                                        .trim()
                                    : '',
                            inventoryId:
                                inventory.text
                                    .trim()
                                    .toUpperCase(),
                            documents: documents,
                            registrationNumber:
                                type ==
                                        AssetType
                                            .vehicle
                                    ? _nullable(
                                        registrationNumber
                                            .text,
                                      )
                                    : null,
                            brand: type ==
                                        AssetType
                                            .vehicle ||
                                    type ==
                                        AssetType
                                            .machine
                                ? _nullable(brand.text)
                                : null,
                            model: type ==
                                        AssetType
                                            .vehicle ||
                                    type ==
                                        AssetType
                                            .machine
                                ? _nullable(model.text)
                                : null,
                            year: type ==
                                    AssetType.vehicle
                                ? int.tryParse(
                                    year.text,
                                  )
                                : null,
                            chassisNumber:
                                type ==
                                        AssetType
                                            .vehicle
                                    ? _nullable(
                                        chassisNumber
                                            .text,
                                      )
                                    : null,
                            fiscalHorsepower:
                                type ==
                                        AssetType
                                            .vehicle
                                    ? double.tryParse(
                                        fiscalHorsepower
                                            .text,
                                      )
                                    : null,
                            firstRegistrationDate:
                                type ==
                                        AssetType
                                            .vehicle
                                    ? firstRegistrationDate
                                    : null,
                            serialNumber:
                                type ==
                                        AssetType
                                            .machine
                                    ? _nullable(
                                        serialNumber.text,
                                      )
                                    : null,
                            technicalReference:
                                type ==
                                        AssetType
                                            .machine
                                    ? _nullable(
                                        technicalReference
                                            .text,
                                      )
                                    : null,
                            machinePowerKw:
                                type ==
                                        AssetType
                                            .machine
                                    ? double.tryParse(
                                        machinePower.text,
                                      )
                                    : null,
                            address: type ==
                                    AssetType.realEstate
                                ? _nullable(
                                    address.text,
                                  )
                                : null,
                            surface: type ==
                                    AssetType.realEstate
                                ? double.tryParse(
                                    surface.text,
                                  )
                                : null,
                            landTitleNumber:
                                type ==
                                        AssetType
                                            .realEstate
                                    ? _nullable(
                                        landTitle.text,
                                      )
                                    : null,
                            propertyType:
                                type ==
                                        AssetType
                                            .realEstate
                                    ? _nullable(
                                        propertyType.text,
                                      )
                                    : null,
                            cadastralReference:
                                type ==
                                        AssetType
                                            .realEstate
                                    ? _nullable(
                                        cadastralReference
                                            .text,
                                      )
                                    : null,
                            domain: type ==
                                    AssetType.realEstate
                                ? domain
                                : null,
                            archived:
                                bien?.archived ??
                                    false,
                            archivedAt:
                                bien?.archivedAt,
                            archiveReason:
                                bien?.archiveReason,
                            archiveReference:
                                bien
                                    ?.archiveReference,
                            archiveDocumentFileName:
                                bien
                                    ?.archiveDocumentFileName,
                            archiveNotes:
                                bien?.archiveNotes,
                            rentals: bien?.rentals,
                            sale: bien?.sale,
                          ),
                        );

                        Navigator.pop(
                          sheetContext,
                        );
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
          ),
        ),
      );
    } finally {
      for (final controller in [
        designation,
        designationAr,
        inventory,
        assignment,
        assignmentAr,
        purchaseValue,
        registrationNumber,
        brand,
        model,
        year,
        chassisNumber,
        fiscalHorsepower,
        serialNumber,
        technicalReference,
        machinePower,
        address,
        surface,
        landTitle,
        propertyType,
        cadastralReference,
      ]) {
        controller.dispose();
      }
    }
  }

  Widget _sectionTitle(
    BuildContext context,
    String title,
  ) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(
          title,
          style: Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(
                fontWeight: FontWeight.w900,
              ),
        ),
      );

  Widget _formField(
    TextEditingController controller,
    String label, {
    bool numeric = false,
  }) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: TextField(
          controller: controller,
          keyboardType: numeric
              ? const TextInputType.numberWithOptions(
                  decimal: true,
                )
              : null,
          decoration: InputDecoration(
            labelText: label,
          ),
        ),
      );

  String? _required(
    BuildContext context,
    String? value,
  ) {
    if (value == null || value.trim().isEmpty) {
      return context.tr(
        'Champ obligatoire.',
        'هذا الحقل إجباري.',
      );
    }
    return null;
  }

  String? _nullable(String value) {
    final clean = value.trim();
    return clean.isEmpty ? null : clean;
  }

  Future<void> _rent(
    BuildContext context,
    Bien bien,
  ) async {
    final state = context.read<AppState>();
    final formKey = GlobalKey<FormState>();

    final name = TextEditingController();
    final cin = TextEditingController();
    final ice = TextEditingController();
    final phone = TextEditingController();
    final address = TextEditingController();
    final amount = TextEditingController();
    final contractReference =
        TextEditingController();
    final notes = TextEditingController();

    var partyType = PartyType.person;
    var startDate = DateTime.now();
    DateTime? endDate;
    String? contractFileName;

    try {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (sheetContext) =>
            StatefulBuilder(
          builder: (
            sheetContext,
            setLocal,
          ) =>
              Padding(
            padding: EdgeInsets.fromLTRB(
              18,
              0,
              18,
              18 +
                  MediaQuery.of(sheetContext)
                      .viewInsets
                      .bottom,
            ),
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      sheetContext.tr(
                        'Location du bien',
                        'كراء الممتلك',
                      ),
                      style: Theme.of(sheetContext)
                          .textTheme
                          .titleLarge
                          ?.copyWith(
                            fontWeight:
                                FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 14),
                    SegmentedButton<PartyType>(
                      segments: [
                        ButtonSegment<PartyType>(
                          value: PartyType.person,
                          label: Text(
                            sheetContext.tr(
                              'Personne',
                              'شخص',
                            ),
                          ),
                        ),
                        ButtonSegment<PartyType>(
                          value:
                              PartyType.company,
                          label: Text(
                            sheetContext.tr(
                              'Société',
                              'شركة',
                            ),
                          ),
                        ),
                      ],
                      selected: {partyType},
                      onSelectionChanged: (value) {
                        setLocal(() {
                          partyType =
                              value.first;
                        });
                      },
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: name,
                      validator: (value) =>
                          _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Nom du locataire',
                          'اسم المكتري',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    if (partyType ==
                        PartyType.person)
                      TextField(
                        controller: cin,
                        decoration:
                            const InputDecoration(
                          labelText: 'CIN',
                        ),
                      )
                    else
                      TextField(
                        controller: ice,
                        decoration:
                            const InputDecoration(
                          labelText: 'ICE',
                        ),
                      ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: phone,
                      keyboardType:
                          TextInputType.phone,
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Téléphone',
                          'الهاتف',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: address,
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Adresse',
                          'العنوان',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () async {
                        final picked =
                            await showDatePicker(
                          context: sheetContext,
                          initialDate: startDate,
                          firstDate:
                              DateTime(2000),
                          lastDate:
                              DateTime(2100),
                        );
                        if (picked != null) {
                          setLocal(() {
                            startDate = picked;
                          });
                        }
                      },
                      icon:
                          const Icon(Icons.event),
                      label: Text(
                        '${sheetContext.tr('Date de début', 'تاريخ البداية')}: ${formatDate(startDate)}',
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () async {
                        final picked =
                            await showDatePicker(
                          context: sheetContext,
                          initialDate: endDate ??
                              startDate.add(
                                const Duration(
                                  days: 30,
                                ),
                              ),
                          firstDate: startDate,
                          lastDate:
                              DateTime(2100),
                        );
                        if (picked != null) {
                          setLocal(() {
                            endDate = picked;
                          });
                        }
                      },
                      icon:
                          const Icon(Icons.event),
                      label: Text(
                        endDate == null
                            ? sheetContext.tr(
                                'Date de fin (optionnelle)',
                                'تاريخ النهاية (اختياري)',
                              )
                            : '${sheetContext.tr('Date de fin', 'تاريخ النهاية')}: ${formatDate(endDate!)}',
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: amount,
                      keyboardType:
                          const TextInputType
                              .numberWithOptions(
                        decimal: true,
                      ),
                      validator: (value) {
                        final parsed =
                            double.tryParse(
                          value ?? '',
                        );
                        if (parsed == null ||
                            parsed <= 0) {
                          return sheetContext.tr(
                            'Montant invalide.',
                            'المبلغ غير صالح.',
                          );
                        }
                        return null;
                      },
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Montant mensuel (DH)',
                          'المبلغ الشهري (درهم)',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller:
                          contractReference,
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Référence du contrat',
                          'مرجع العقد',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () async {
                        final result =
                            await FilePicker.platform
                                .pickFiles();

                        if (result != null &&
                            result.files
                                .isNotEmpty) {
                          setLocal(() {
                            contractFileName =
                                result.files.single
                                    .name;
                          });
                        }
                      },
                      icon: const Icon(
                        Icons.upload_file,
                      ),
                      label: Text(
                        contractFileName ??
                            sheetContext.tr(
                              'Contrat',
                              'العقد',
                            ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: notes,
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Observations',
                          'ملاحظات',
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () {
                        if (!formKey
                            .currentState!
                            .validate()) {
                          return;
                        }

                        state.rentBien(
                          id: bien.id,
                          partyType: partyType,
                          tenantName:
                              name.text.trim(),
                          cin: _nullable(cin.text),
                          ice: _nullable(ice.text),
                          phone:
                              _nullable(phone.text),
                          address:
                              _nullable(address.text),
                          startDate: startDate,
                          endDate: endDate,
                          monthlyAmount:
                              double.parse(
                            amount.text,
                          ),
                          contractReference:
                              _nullable(
                            contractReference.text,
                          ),
                          contractFileName:
                              contractFileName,
                          notes:
                              _nullable(notes.text),
                        );

                        Navigator.pop(
                          sheetContext,
                        );
                      },
                      child: Text(
                        sheetContext.tr(
                          'Enregistrer la location',
                          'تسجيل الكراء',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    } finally {
      for (final controller in [
        name,
        cin,
        ice,
        phone,
        address,
        amount,
        contractReference,
        notes,
      ]) {
        controller.dispose();
      }
    }
  }

  Future<void> _sell(
    BuildContext context,
    Bien bien,
  ) async {
    final state = context.read<AppState>();
    final formKey = GlobalKey<FormState>();

    final name = TextEditingController();
    final cin = TextEditingController();
    final ice = TextEditingController();
    final phone = TextEditingController();
    final address = TextEditingController();
    final price = TextEditingController();
    final contractReference =
        TextEditingController();
    final notes = TextEditingController();

    var partyType = PartyType.person;
    var saleDate = DateTime.now();
    String? contractFileName;
    String? receiptFileName;

    try {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (sheetContext) =>
            StatefulBuilder(
          builder: (
            sheetContext,
            setLocal,
          ) =>
              Padding(
            padding: EdgeInsets.fromLTRB(
              18,
              0,
              18,
              18 +
                  MediaQuery.of(sheetContext)
                      .viewInsets
                      .bottom,
            ),
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      sheetContext.tr(
                        'Vente du bien',
                        'بيع الممتلك',
                      ),
                      style: Theme.of(sheetContext)
                          .textTheme
                          .titleLarge
                          ?.copyWith(
                            fontWeight:
                                FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      sheetContext.tr(
                        'Après validation, le bien sera déplacé dans l’archive avec le statut « Cédé ».',
                        'بعد التأكيد سيتم نقل الممتلك إلى الأرشيف بحالة « مفوّت ».',
                      ),
                    ),
                    const SizedBox(height: 14),
                    SegmentedButton<PartyType>(
                      segments: [
                        ButtonSegment<PartyType>(
                          value: PartyType.person,
                          label: Text(
                            sheetContext.tr(
                              'Personne',
                              'شخص',
                            ),
                          ),
                        ),
                        ButtonSegment<PartyType>(
                          value:
                              PartyType.company,
                          label: Text(
                            sheetContext.tr(
                              'Société',
                              'شركة',
                            ),
                          ),
                        ),
                      ],
                      selected: {partyType},
                      onSelectionChanged: (value) {
                        setLocal(() {
                          partyType =
                              value.first;
                        });
                      },
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: name,
                      validator: (value) =>
                          _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Nom de l’acheteur',
                          'اسم المشتري',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    if (partyType ==
                        PartyType.person)
                      TextField(
                        controller: cin,
                        decoration:
                            const InputDecoration(
                          labelText: 'CIN',
                        ),
                      )
                    else
                      TextField(
                        controller: ice,
                        decoration:
                            const InputDecoration(
                          labelText: 'ICE',
                        ),
                      ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: phone,
                      keyboardType:
                          TextInputType.phone,
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Téléphone',
                          'الهاتف',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: address,
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Adresse',
                          'العنوان',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () async {
                        final picked =
                            await showDatePicker(
                          context: sheetContext,
                          initialDate: saleDate,
                          firstDate:
                              DateTime(2000),
                          lastDate:
                              DateTime(2100),
                        );
                        if (picked != null) {
                          setLocal(() {
                            saleDate = picked;
                          });
                        }
                      },
                      icon:
                          const Icon(Icons.event),
                      label: Text(
                        '${sheetContext.tr('Date de vente', 'تاريخ البيع')}: ${formatDate(saleDate)}',
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: price,
                      keyboardType:
                          const TextInputType
                              .numberWithOptions(
                        decimal: true,
                      ),
                      validator: (value) {
                        final parsed =
                            double.tryParse(
                          value ?? '',
                        );
                        if (parsed == null ||
                            parsed <= 0) {
                          return sheetContext.tr(
                            'Prix invalide.',
                            'الثمن غير صالح.',
                          );
                        }
                        return null;
                      },
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Prix de vente (DH)',
                          'ثمن البيع (درهم)',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller:
                          contractReference,
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Référence du contrat',
                          'مرجع العقد',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () async {
                        final result =
                            await FilePicker.platform
                                .pickFiles();

                        if (result != null &&
                            result.files
                                .isNotEmpty) {
                          setLocal(() {
                            contractFileName =
                                result.files.single
                                    .name;
                          });
                        }
                      },
                      icon: const Icon(
                        Icons.upload_file,
                      ),
                      label: Text(
                        contractFileName ??
                            sheetContext.tr(
                              'Contrat',
                              'العقد',
                            ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () async {
                        final result =
                            await FilePicker.platform
                                .pickFiles();

                        if (result != null &&
                            result.files
                                .isNotEmpty) {
                          setLocal(() {
                            receiptFileName =
                                result.files.single
                                    .name;
                          });
                        }
                      },
                      icon: const Icon(
                        Icons.receipt_long_outlined,
                      ),
                      label: Text(
                        receiptFileName ??
                            sheetContext.tr(
                              'Reçu / justificatif',
                              'الوصل / المبرر',
                            ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: notes,
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText:
                            sheetContext.tr(
                          'Observations',
                          'ملاحظات',
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () {
                        if (!formKey
                            .currentState!
                            .validate()) {
                          return;
                        }

                        state.sellBien(
                          id: bien.id,
                          partyType: partyType,
                          buyerName:
                              name.text.trim(),
                          cin: _nullable(cin.text),
                          ice: _nullable(ice.text),
                          phone:
                              _nullable(phone.text),
                          address:
                              _nullable(address.text),
                          saleDate: saleDate,
                          salePrice:
                              double.parse(
                            price.text,
                          ),
                          contractReference:
                              _nullable(
                            contractReference.text,
                          ),
                          contractFileName:
                              contractFileName,
                          receiptFileName:
                              receiptFileName,
                          notes:
                              _nullable(notes.text),
                        );

                        Navigator.pop(
                          sheetContext,
                        );
                      },
                      child: Text(
                        sheetContext.tr(
                          'Confirmer la vente',
                          'تأكيد البيع',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    } finally {
      for (final controller in [
        name,
        cin,
        ice,
        phone,
        address,
        price,
        contractReference,
        notes,
      ]) {
        controller.dispose();
      }
    }
  }

  Future<void> _cede(
    BuildContext context,
    Bien bien,
  ) async {
    final state = context.read<AppState>();
    final reference = TextEditingController();
    final notes = TextEditingController();

    var date = DateTime.now();
    String? documentFileName;

    try {
      await showDialog<void>(
        context: context,
        builder: (dialogContext) =>
            StatefulBuilder(
          builder: (
            dialogContext,
            setLocal,
          ) =>
              AlertDialog(
            title: Text(
              dialogContext.tr(
                'Céder le bien',
                'تفويت الممتلك',
              ),
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    dialogContext.tr(
                      'Le bien sera retiré de la liste principale et apparaîtra uniquement dans l’archive comme « Cédé ».',
                      'سيتم حذف الممتلك من اللائحة الرئيسية وسيظهر فقط في الأرشيف بحالة « مفوّت ».',
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () async {
                      final picked =
                          await showDatePicker(
                        context: dialogContext,
                        initialDate: date,
                        firstDate:
                            DateTime(2000),
                        lastDate:
                            DateTime(2100),
                      );

                      if (picked != null) {
                        setLocal(() {
                          date = picked;
                        });
                      }
                    },
                    icon:
                        const Icon(Icons.event),
                    label: Text(
                      '${dialogContext.tr('Date de cession', 'تاريخ التفويت')}: ${formatDate(date)}',
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: reference,
                    decoration: InputDecoration(
                      labelText:
                          dialogContext.tr(
                        'Référence',
                        'المرجع',
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: () async {
                      final result =
                          await FilePicker.platform
                              .pickFiles();

                      if (result != null &&
                          result.files
                              .isNotEmpty) {
                        setLocal(() {
                          documentFileName =
                              result.files.single
                                  .name;
                        });
                      }
                    },
                    icon: const Icon(
                      Icons.upload_file,
                    ),
                    label: Text(
                      documentFileName ??
                          dialogContext.tr(
                            'Document justificatif',
                            'الوثيقة المبررة',
                          ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: notes,
                    maxLines: 3,
                    decoration: InputDecoration(
                      labelText:
                          dialogContext.tr(
                        'Observations',
                        'ملاحظات',
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () =>
                    Navigator.pop(
                  dialogContext,
                ),
                child: Text(
                  dialogContext.tr(
                    'Annuler',
                    'إلغاء',
                  ),
                ),
              ),
              FilledButton(
                onPressed: () {
                  state.archiveBien(
                    id: bien.id,
                    archivedAt: date,
                    reference:
                        _nullable(
                      reference.text,
                    ),
                    documentFileName:
                        documentFileName,
                    notes:
                        _nullable(notes.text),
                  );

                  Navigator.pop(
                    dialogContext,
                  );
                },
                child: Text(
                  dialogContext.tr(
                    'Confirmer la cession',
                    'تأكيد التفويت',
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    } finally {
      reference.dispose();
      notes.dispose();
    }
  }
}

const _activeStatuses = <AssetStatus>[
  AssetStatus.available,
  AssetStatus.inUse,
  AssetStatus.rented,
  AssetStatus.underMaintenance,
  AssetStatus.outOfService,
  AssetStatus.damaged,
];

IconData _typeIcon(AssetType type) => switch (type) {
      AssetType.vehicle =>
        Icons.directions_car_outlined,
      AssetType.machine =>
        Icons.precision_manufacturing_outlined,
      AssetType.realEstate =>
        Icons.apartment_outlined,
    };

String _typeLabel(
  BuildContext context,
  AssetType type,
) =>
    switch (type) {
      AssetType.vehicle =>
        context.tr('Véhicule', 'مركبة'),
      AssetType.machine =>
        context.tr('Machine', 'آلة'),
      AssetType.realEstate =>
        context.tr('Immobilier', 'عقار'),
    };

String _statusLabel(
  BuildContext context,
  AssetStatus status,
) =>
    switch (status) {
      AssetStatus.available =>
        context.tr('Disponible', 'متاح'),
      AssetStatus.inUse =>
        context.tr('En service', 'قيد الاستعمال'),
      AssetStatus.rented =>
        context.tr('Loué', 'مكترى'),
      AssetStatus.underMaintenance =>
        context.tr('En maintenance', 'في الصيانة'),
      AssetStatus.outOfService =>
        context.tr('Hors service', 'خارج الخدمة'),
      AssetStatus.damaged =>
        context.tr('Endommagé', 'متضرر'),
      AssetStatus.disposed =>
        context.tr('Cédé', 'مفوّت'),
    };
