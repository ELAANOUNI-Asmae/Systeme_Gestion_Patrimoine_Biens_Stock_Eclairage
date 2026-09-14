import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/app_document.dart';
import '../../models/lighting.dart';
import '../../state/app_state.dart';
import '../../widgets/document_editor.dart';

class LightingScreen extends StatefulWidget {
  const LightingScreen({super.key});

  @override
  State<LightingScreen> createState() => _LightingScreenState();
}

class _LightingScreenState extends State<LightingScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _search = TextEditingController();

  LightStatus? _statusFilter;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<AppState>().loadLightingData();
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TabBar(
          controller: _tabs,
          tabs: [
            Tab(text: context.tr('Points', 'النقاط')),
            Tab(text: context.tr('Carte', 'الخريطة')),
            Tab(text: context.tr('Pannes', 'الأعطاب')),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabs,
            children: [
              _points(context),
              _map(context),
              _history(context),
            ],
          ),
        ),
      ],
    );
  }

  Widget _points(BuildContext context) {
    final state = context.watch<AppState>();
    final query = _search.text.trim().toLowerCase();

    final items = state.lights.where((light) {
      final matchesSearch =
          query.isEmpty ||
          light.reference.toLowerCase().contains(query) ||
          light.designation.toLowerCase().contains(query) ||
          light.designationAr.toLowerCase().contains(query) ||
          light.localisation.toLowerCase().contains(query);

      final matchesStatus =
          _statusFilter == null || light.status == _statusFilter;

      return matchesSearch && matchesStatus;
    }).toList();

    final openIds = state.unresolvedFailures
        .map((failure) => failure.lightId)
        .toSet();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                context.tr(
                  'Éclairage public',
                  'الإنارة العمومية',
                ),
                style: Theme.of(context)
                    .textTheme
                    .headlineSmall
                    ?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
            ),
            if (state.hasPermission(Permissions.createLightPoint))
              IconButton.filled(
                onPressed: () => _lightForm(context),
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
              'Référence, désignation ou localisation',
              'المرجع أو التسمية أو الموقع',
            ),
          ),
        ),
        const SizedBox(height: 10),
        DropdownButtonFormField<LightStatus?>(
          initialValue: _statusFilter,
          decoration: InputDecoration(
            labelText: context.tr(
              'Statut',
              'الحالة',
            ),
          ),
          items: [
            DropdownMenuItem<LightStatus?>(
              value: null,
              child: Text(
                context.tr(
                  'Tous les statuts',
                  'جميع الحالات',
                ),
              ),
            ),
            ...LightStatus.values.map(
              (status) => DropdownMenuItem<LightStatus?>(
                value: status,
                child: Text(
                  _statusLabel(context, status),
                ),
              ),
            ),
          ],
          onChanged: (value) {
            setState(() => _statusFilter = value);
          },
        ),
        const SizedBox(height: 14),
        if (items.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Text(
                  context.tr(
                    'Aucun point lumineux trouvé.',
                    'لم يتم العثور على نقاط إنارة.',
                  ),
                ),
              ),
            ),
          )
        else
          ...items.map(
            (light) => Card(
              child: ListTile(
                leading: CircleAvatar(
                  child: Icon(
                    Icons.lightbulb_outline,
                    color: _statusColor(light.status),
                  ),
                ),
                title: Text(
                  context.isArabic
                      ? light.designationAr
                      : light.designation,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                subtitle: Text(
                  '${light.reference}\n'
                  '${light.localisation}\n'
                  '${light.power.toStringAsFixed(0)} W · '
                  '${_statusLabel(context, light.status)}',
                ),
                isThreeLine: true,
                onTap: () => _details(context, light),
                trailing: PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'details') {
                      _details(context, light);
                    } else if (value == 'edit') {
                      _lightForm(
                        context,
                        light: light,
                      );
                    } else if (value == 'failure') {
                      _failureForm(
                        context,
                        light,
                      );
                    } else if (value == 'delete') {
                      _deleteLight(
                        context,
                        light,
                      );
                    }
                  },
                  itemBuilder: (_) => [
                    PopupMenuItem(
                      value: 'details',
                      child: Text(
                        context.tr(
                          'Détails',
                          'التفاصيل',
                        ),
                      ),
                    ),
                    if (state.hasPermission(
                      Permissions.updateLightPoint,
                    ))
                      PopupMenuItem(
                        value: 'edit',
                        child: Text(
                          context.tr(
                            'Modifier',
                            'تعديل',
                          ),
                        ),
                      ),
                    if (state.hasPermission(
                          Permissions.reportFailure,
                        ) &&
                        !openIds.contains(light.id))
                      PopupMenuItem(
                        value: 'failure',
                        child: Text(
                          context.tr(
                            'Déclarer une panne',
                            'التبليغ عن عطل',
                          ),
                        ),
                      ),
                    if (state.hasPermission(
                      Permissions.deleteLightPoint,
                    ))
                      PopupMenuItem(
                        value: 'delete',
                        child: Text(
                          context.tr(
                            'Supprimer',
                            'حذف',
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _map(BuildContext context) {
    final state = context.watch<AppState>();

    final center = state.lights.isEmpty
        ? const LatLng(
            30.4208,
            -9.5981,
          )
        : LatLng(
            state.lights.first.latitude,
            state.lights.first.longitude,
          );

    return FlutterMap(
      options: MapOptions(
        initialCenter: center,
        initialZoom: 13,
      ),
      children: [
        TileLayer(
          urlTemplate:
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName:
              'ma.sgpbse.mobile',
        ),
        MarkerLayer(
          markers: state.lights
              .map(
                (light) => Marker(
                  point: LatLng(
                    light.latitude,
                    light.longitude,
                  ),
                  width: 48,
                  height: 48,
                  child: GestureDetector(
                    onTap: () =>
                        _details(
                      context,
                      light,
                    ),
                    child: Icon(
                      Icons.location_on,
                      size: 40,
                      color: _statusColor(
                        light.status,
                      ),
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _history(BuildContext context) {
    final state = context.watch<AppState>();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          context.tr(
            'Pannes et interventions',
            'الأعطاب والتدخلات',
          ),
          style: Theme.of(context)
              .textTheme
              .headlineSmall
              ?.copyWith(
                fontWeight: FontWeight.w900,
              ),
        ),
        const SizedBox(height: 12),
        if (state.failures.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Text(
                  context.tr(
                    'Aucune panne.',
                    'لا توجد أعطاب.',
                  ),
                ),
              ),
            ),
          )
        else
          ...state.failures.map(
            (failure) {
              final linked = state.interventions
                  .where(
                    (item) =>
                        item.failureId ==
                        failure.id,
                  )
                  .toList();

              Intervention? active;

              for (final intervention in linked) {
                if (!intervention.completed) {
                  active = intervention;
                  break;
                }
              }

              return Card(
                margin:
                    const EdgeInsets.only(
                  bottom: 12,
                ),
                child: Padding(
                  padding:
                      const EdgeInsets.all(
                    14,
                  ),
                  child: Column(
                    crossAxisAlignment:
                        CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${failure.lightReference} — '
                              '${context.isArabic ? failure.lightDesignationAr : failure.lightDesignation}',
                              style:
                                  const TextStyle(
                                fontWeight:
                                    FontWeight.w900,
                              ),
                            ),
                          ),
                          Chip(
                            label: Text(
                              _failureStatus(
                                context,
                                failure.status,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 6,
                      ),
                      Text(
                        failure.description,
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      Text(
                        '${context.tr('Déclarée par', 'المبلغ')}: '
                        '${failure.reportedBy == 'PUBLIC' ? context.tr('Signalement public', 'تبليغ عمومي') : failure.reportedBy}',
                        style:
                            Theme.of(context)
                                .textTheme
                                .bodySmall,
                      ),
                      if (failure
                                  .status ==
                              FailureStatus
                                  .reported &&
                          state.hasPermission(
                            Permissions
                                .createIntervention,
                          )) ...[
                        const SizedBox(
                          height: 10,
                        ),
                        FilledButton.icon(
                          onPressed: () =>
                              _interventionForm(
                            context,
                            failure,
                          ),
                          icon: const Icon(
                            Icons
                                .engineering_outlined,
                          ),
                          label: Text(
                            context.tr(
                              'Planifier une intervention',
                              'برمجة تدخل',
                            ),
                          ),
                        ),
                      ],
                      if (active != null) ...[
                        const Divider(
                          height: 24,
                        ),
                        _interventionCard(
                          context,
                          active,
                        ),
                      ],
                      ...linked
                          .where(
                            (item) =>
                                item.completed,
                          )
                          .map(
                            (item) =>
                                Padding(
                              padding:
                                  const EdgeInsets
                                      .only(
                                top: 10,
                              ),
                              child:
                                  _interventionCard(
                                context,
                                item,
                              ),
                            ),
                          ),
                    ],
                  ),
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _interventionCard(
    BuildContext context,
    Intervention intervention,
  ) {
    final state =
        context.watch<AppState>();

    return Container(
      padding:
          const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(
          color: Theme.of(context)
              .dividerColor,
        ),
        borderRadius:
            BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                intervention.completed
                    ? Icons
                        .check_circle_outline
                    : Icons.schedule_outlined,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  context.isArabic
                      ? intervention
                          .technicianNameAr
                      : intervention
                          .technicianName,
                  style:
                      const TextStyle(
                    fontWeight:
                        FontWeight.w800,
                  ),
                ),
              ),
              Text(
                intervention.completed
                    ? context.tr(
                        'Terminée',
                        'مكتملة',
                      )
                    : context.tr(
                        'Planifiée',
                        'مبرمجة',
                      ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            intervention
                .technicianLocalisation,
          ),
          Text(
            '${context.tr('Date prévue', 'التاريخ المبرمج')}: '
            '${_date(intervention.interventionDate)}',
            style: Theme.of(context)
                .textTheme
                .bodySmall,
          ),
          const SizedBox(height: 6),
          Text(
            intervention.description,
          ),
          if (!intervention.completed &&
              state.hasPermission(
                Permissions
                    .updateIntervention,
              )) ...[
            const SizedBox(height: 10),
            FilledButton.icon(
              onPressed: () =>
                  _completeIntervention(
                context,
                intervention,
              ),
              icon:
                  const Icon(Icons.done_all),
              label: Text(
                context.tr(
                  'Terminer',
                  'إنهاء',
                ),
              ),
            ),
          ],
          if (intervention.completed) ...[
            const Divider(height: 22),
            Text(
              context.tr(
                'Rapport',
                'التقرير',
              ),
              style:
                  const TextStyle(
                fontWeight:
                    FontWeight.w800,
              ),
            ),
            Text(
              intervention.report ?? '',
            ),
            const SizedBox(height: 8),
            Text(
              '${context.tr('Coût', 'التكلفة')}: '
              '${(intervention.cost ?? 0).toStringAsFixed(2)} DH',
              style:
                  const TextStyle(
                fontWeight:
                    FontWeight.w700,
              ),
            ),
            if (intervention
                    .completedAt !=
                null)
              Text(
                '${context.tr('Terminée le', 'انتهت في')}: '
                '${_date(intervention.completedAt!)}',
              ),
            if (intervention
                .photos.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(
                context.tr(
                  'Photos',
                  'الصور',
                ),
                style:
                    const TextStyle(
                  fontWeight:
                      FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children:
                    intervention.photos
                        .map(
                          (photo) =>
                              Chip(
                            avatar:
                                const Icon(
                              Icons
                                  .photo_outlined,
                              size: 17,
                            ),
                            label: Text(
                              photo
                                  .fileName,
                            ),
                          ),
                        )
                        .toList(),
              ),
            ],
            if (intervention
                .documents.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(
                context.tr(
                  'Documents',
                  'الوثائق',
                ),
                style:
                    const TextStyle(
                  fontWeight:
                      FontWeight.w800,
                ),
              ),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children:
                    intervention.documents
                        .map(
                          (document) =>
                              Chip(
                            avatar:
                                const Icon(
                              Icons
                                  .attach_file,
                              size: 17,
                            ),
                            label: Text(
                              document
                                  .fileName,
                            ),
                          ),
                        )
                        .toList(),
              ),
            ],
          ],
        ],
      ),
    );
  }

  Future<void> _lightForm(
    BuildContext context, {
    LightPoint? light,
  }) async {
    final state =
        context.read<AppState>();

    final reference =
        TextEditingController(
      text: light?.reference ?? '',
    );
    final designation =
        TextEditingController(
      text: light?.designation ?? '',
    );
    final designationAr =
        TextEditingController(
      text: light?.designationAr ?? '',
    );
    final localisation =
        TextEditingController(
      text: light?.localisation ?? '',
    );
    final power =
        TextEditingController(
      text:
          light?.power.toString() ??
          '100',
    );
    final latitude =
        TextEditingController(
      text:
          light?.latitude.toString() ??
          '30.4208',
    );
    final longitude =
        TextEditingController(
      text:
          light?.longitude.toString() ??
          '-9.5981',
    );

    var installationDate =
        light?.installationDate ??
        DateTime.now();
    var status =
        light?.status ??
        LightStatus.active;
    var documents =
        <AppDocument>[
      ...?light?.documents,
    ];

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) =>
          StatefulBuilder(
        builder: (
          sheetContext,
          setLocal,
        ) =>
            Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            MediaQuery.viewInsetsOf(
                  sheetContext,
                ).bottom +
                20,
          ),
          child:
              SingleChildScrollView(
            child: Column(
              children: [
                _sheetHeader(
                  context,
                  sheetContext,
                  light == null
                      ? 'Ajouter un point lumineux'
                      : 'Modifier le point lumineux',
                  light == null
                      ? 'إضافة نقطة إنارة'
                      : 'تعديل نقطة الإنارة',
                ),
                if (light ==
                    null) ...[
                  const SizedBox(
                    height: 8,
                  ),
                  Text(
                    context.tr(
                      'Le nouveau point sera Actif automatiquement.',
                      'ستكون نقطة الإنارة نشطة تلقائياً.',
                    ),
                  ),
                ],
                const SizedBox(
                  height: 14,
                ),
                TextField(
                  controller:
                      reference,
                  decoration:
                      InputDecoration(
                    labelText:
                        context.tr(
                      'Référence *',
                      'المرجع *',
                    ),
                  ),
                ),
                const SizedBox(
                  height: 8,
                ),
                TextField(
                  controller:
                      designation,
                  decoration:
                      InputDecoration(
                    labelText:
                        context.tr(
                      'Désignation FR *',
                      'التسمية بالفرنسية *',
                    ),
                  ),
                ),
                const SizedBox(
                  height: 8,
                ),
                TextField(
                  controller:
                      designationAr,
                  textDirection:
                      TextDirection.rtl,
                  decoration:
                      InputDecoration(
                    labelText:
                        context.tr(
                      'Désignation AR *',
                      'التسمية بالعربية *',
                    ),
                  ),
                ),
                const SizedBox(
                  height: 8,
                ),
                TextField(
                  controller:
                      localisation,
                  decoration:
                      InputDecoration(
                    labelText:
                        context.tr(
                      'Localisation *',
                      'الموقع *',
                    ),
                  ),
                ),
                const SizedBox(
                  height: 8,
                ),
                TextField(
                  controller: power,
                  keyboardType:
                      const TextInputType
                          .numberWithOptions(
                    decimal: true,
                  ),
                  decoration:
                      InputDecoration(
                    labelText:
                        context.tr(
                      'Puissance (W) *',
                      'القدرة (واط) *',
                    ),
                  ),
                ),
                const SizedBox(
                  height: 8,
                ),
                TextField(
                  controller:
                      latitude,
                  keyboardType:
                      const TextInputType
                          .numberWithOptions(
                    decimal: true,
                    signed: true,
                  ),
                  decoration:
                      const InputDecoration(
                    labelText:
                        'Latitude *',
                  ),
                ),
                const SizedBox(
                  height: 8,
                ),
                TextField(
                  controller:
                      longitude,
                  keyboardType:
                      const TextInputType
                          .numberWithOptions(
                    decimal: true,
                    signed: true,
                  ),
                  decoration:
                      const InputDecoration(
                    labelText:
                        'Longitude *',
                  ),
                ),
                if (light !=
                    null) ...[
                  const SizedBox(
                    height: 8,
                  ),
                  DropdownButtonFormField<
                      LightStatus>(
                    initialValue:
                        status,
                    decoration:
                        InputDecoration(
                      labelText:
                          context.tr(
                        'Statut',
                        'الحالة',
                      ),
                    ),
                    items:
                        LightStatus.values
                            .map(
                              (item) =>
                                  DropdownMenuItem<
                                      LightStatus>(
                                value:
                                    item,
                                child:
                                    Text(
                                  _statusLabel(
                                    context,
                                    item,
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                    onChanged:
                        (value) {
                      if (value !=
                          null) {
                        setLocal(
                          () =>
                              status =
                                  value,
                        );
                      }
                    },
                  ),
                ],
                const SizedBox(
                  height: 12,
                ),
                ListTile(
                  contentPadding:
                      EdgeInsets.zero,
                  title: Text(
                    context.tr(
                      'Date d’installation',
                      'تاريخ التركيب',
                    ),
                  ),
                  subtitle: Text(
                    _date(
                      installationDate,
                    ),
                  ),
                  trailing:
                      const Icon(
                    Icons
                        .calendar_month_outlined,
                  ),
                  onTap: () async {
                    final picked =
                        await showDatePicker(
                      context:
                          sheetContext,
                      firstDate:
                          DateTime(
                        2000,
                      ),
                      lastDate:
                          DateTime(
                        2100,
                      ),
                      initialDate:
                          installationDate,
                    );

                    if (picked !=
                        null) {
                      setLocal(
                        () =>
                            installationDate =
                                picked,
                      );
                    }
                  },
                ),
                const SizedBox(
                  height: 8,
                ),
                DocumentEditor(
                  documents:
                      documents,
                  onChanged:
                      (value) {
                    setLocal(
                      () =>
                          documents =
                              value,
                    );
                  },
                ),
                const SizedBox(
                  height: 14,
                ),
                FilledButton(
                  onPressed: () async {
                    final parsedPower =
                        double.tryParse(
                      power.text,
                    );
                    final parsedLat =
                        double.tryParse(
                      latitude.text,
                    );
                    final parsedLng =
                        double.tryParse(
                      longitude.text,
                    );

                    if (reference
                            .text
                            .trim()
                            .isEmpty ||
                        designation
                            .text
                            .trim()
                            .isEmpty ||
                        designationAr
                            .text
                            .trim()
                            .isEmpty ||
                        localisation
                            .text
                            .trim()
                            .isEmpty ||
                        parsedPower ==
                            null ||
                        parsedPower <=
                            0 ||
                        parsedLat ==
                            null ||
                        parsedLat <
                            -90 ||
                        parsedLat >
                            90 ||
                        parsedLng ==
                            null ||
                        parsedLng <
                            -180 ||
                        parsedLng >
                            180) {
                      ScaffoldMessenger
                              .of(
                                context,
                              )
                          .showSnackBar(
                        SnackBar(
                          content:
                              Text(
                            context.tr(
                              'Vérifiez les champs obligatoires.',
                              'تحقق من الحقول الإلزامية.',
                            ),
                          ),
                        ),
                      );
                      return;
                    }

                    try {
                      await state.saveLight(
                        LightPoint(
                        id:
                            light?.id ??
                            state
                                .nextLightId(),
                        reference:
                            reference
                                .text
                                .trim()
                                .toUpperCase(),
                        designation:
                            designation
                                .text
                                .trim(),
                        designationAr:
                            designationAr
                                .text
                                .trim(),
                        localisation:
                            localisation
                                .text
                                .trim(),
                        latitude:
                            parsedLat,
                        longitude:
                            parsedLng,
                        status:
                            light ==
                                    null
                                ? LightStatus
                                    .active
                                : status,
                        installationDate:
                            installationDate,
                        power:
                            parsedPower,
                        documents:
                            documents,
                        ),
                      );
                      if (sheetContext.mounted) Navigator.pop(sheetContext);
                    } on StateError catch (e) {
                      if (sheetContext.mounted) {
                        ScaffoldMessenger.of(sheetContext).showSnackBar(SnackBar(content: Text(e.message)));
                      }
                    }
                  },
                  child: Text(
                    context.tr(
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
    );

    reference.dispose();
    designation.dispose();
    designationAr.dispose();
    localisation.dispose();
    power.dispose();
    latitude.dispose();
    longitude.dispose();
  }

  Future<void> _failureForm(
    BuildContext context,
    LightPoint light,
  ) async {
    final description =
        TextEditingController();
    var documents =
        <AppDocument>[];

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) =>
          StatefulBuilder(
        builder: (
          sheetContext,
          setLocal,
        ) =>
            Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            MediaQuery.viewInsetsOf(
                  sheetContext,
                ).bottom +
                20,
          ),
          child:
              SingleChildScrollView(
            child: Column(
              children: [
                _sheetHeader(
                  context,
                  sheetContext,
                  'Déclarer une panne',
                  'التبليغ عن عطل',
                ),
                const SizedBox(
                  height: 8,
                ),
                Text(
                  '${light.reference} · '
                  '${light.localisation}',
                ),
                const SizedBox(
                  height: 12,
                ),
                TextField(
                  controller:
                      description,
                  minLines: 4,
                  maxLines: 6,
                  decoration:
                      InputDecoration(
                    labelText:
                        context.tr(
                      'Description *',
                      'الوصف *',
                    ),
                  ),
                ),
                const SizedBox(
                  height: 12,
                ),
                DocumentEditor(
                  documents:
                      documents,
                  onChanged:
                      (value) {
                    setLocal(
                      () =>
                          documents =
                              value,
                    );
                  },
                ),
                const SizedBox(
                  height: 14,
                ),
                FilledButton(
                  onPressed: () async {
                    if (description
                        .text
                        .trim()
                        .isEmpty) {
                      return;
                    }

                    try {
                      await context
                          .read<
                              AppState>()
                          .createFailure(
                            lightId:
                                light.id,
                            description:
                                description
                                    .text
                                    .trim(),
                            reportedBy:
                                context
                                        .read<
                                            AppState>()
                                        .currentUser
                                        ?.fullName ??
                                    'Agent',
                            documents:
                                documents,
                          );

                      Navigator.pop(
                        sheetContext,
                      );
                    } on StateError {
                      ScaffoldMessenger
                              .of(
                                context,
                              )
                          .showSnackBar(
                        SnackBar(
                          content:
                              Text(
                            context.tr(
                              'Une panne active existe déjà.',
                              'يوجد عطل نشط بالفعل.',
                            ),
                          ),
                        ),
                      );
                    }
                  },
                  child: Text(
                    context.tr(
                      'Déclarer',
                      'تبليغ',
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    description.dispose();
  }

  Future<void> _interventionForm(
    BuildContext context,
    FailureReport failure,
  ) async {
    final state =
        context.read<AppState>();
    final description =
        TextEditingController();
    final technicianSearch =
        TextEditingController();

    var selectedTechnicianId =
        0;
    var date = DateTime.now();
    var documents =
        <AppDocument>[];

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) =>
          StatefulBuilder(
        builder: (
          sheetContext,
          setLocal,
        ) {
          final query =
              technicianSearch.text
                  .trim()
                  .toLowerCase();

          final technicians = state
              .techniciansForLight(
                failure.lightId,
              )
              .where(
                (technician) =>
                    query.isEmpty ||
                    technician.name
                        .toLowerCase()
                        .contains(
                          query,
                        ) ||
                    technician.nameAr
                        .toLowerCase()
                        .contains(
                          query,
                        ) ||
                    technician.phone
                        .toLowerCase()
                        .contains(
                          query,
                        ) ||
                    technician
                        .localisation
                        .toLowerCase()
                        .contains(
                          query,
                        ),
              )
              .toList();

          return Padding(
            padding:
                EdgeInsets.fromLTRB(
              16,
              16,
              16,
              MediaQuery
                      .viewInsetsOf(
                        sheetContext,
                      )
                      .bottom +
                  20,
            ),
            child:
                SingleChildScrollView(
              child: Column(
                children: [
                  _sheetHeader(
                    context,
                    sheetContext,
                    'Planifier une intervention',
                    'برمجة تدخل',
                  ),
                  const SizedBox(
                    height: 12,
                  ),
                  TextField(
                    controller:
                        technicianSearch,
                    onChanged: (_) =>
                        setLocal(
                      () {},
                    ),
                    decoration:
                        InputDecoration(
                      prefixIcon:
                          const Icon(
                        Icons.search,
                      ),
                      labelText:
                          context.tr(
                        'Rechercher un technicien',
                        'البحث عن تقني',
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Text(
                    context.tr(
                      'Les techniciens les plus proches sont affichés en premier.',
                      'يتم عرض أقرب التقنيين أولاً.',
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
                  ...technicians.map(
                    (technician) {
                      final selected =
                          selectedTechnicianId ==
                              technician.id;

                      return Card(
                        child: ListTile(
                          selected:
                              selected,
                          onTap: () =>
                              setLocal(
                            () =>
                                selectedTechnicianId =
                                    technician
                                        .id,
                          ),
                          leading: Icon(
                            selected
                                ? Icons
                                    .radio_button_checked
                                : Icons
                                    .radio_button_off,
                          ),
                          title: Text(
                            context
                                    .isArabic
                                ? technician
                                    .nameAr
                                : technician
                                    .name,
                            style:
                                const TextStyle(
                              fontWeight:
                                  FontWeight
                                      .w800,
                            ),
                          ),
                          subtitle:
                              Text(
                            '${technician.localisation} · '
                            '${technician.phone}',
                          ),
                        ),
                      );
                    },
                  ),
                  ListTile(
                    contentPadding:
                        EdgeInsets.zero,
                    title: Text(
                      context.tr(
                        'Date prévue',
                        'التاريخ المبرمج',
                      ),
                    ),
                    subtitle: Text(
                      _date(date),
                    ),
                    trailing:
                        const Icon(
                      Icons
                          .calendar_month_outlined,
                    ),
                    onTap:
                        () async {
                      final picked =
                          await showDatePicker(
                        context:
                            sheetContext,
                        firstDate:
                            DateTime
                                .now(),
                        lastDate:
                            DateTime(
                          2100,
                        ),
                        initialDate:
                            date,
                      );

                      if (picked !=
                          null) {
                        setLocal(
                          () =>
                              date =
                                  picked,
                        );
                      }
                    },
                  ),
                  TextField(
                    controller:
                        description,
                    minLines: 3,
                    maxLines: 5,
                    decoration:
                        InputDecoration(
                      labelText:
                          context.tr(
                        'Travaux à effectuer *',
                        'الأشغال المراد تنفيذها *',
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 12,
                  ),
                  DocumentEditor(
                    documents:
                        documents,
                    onChanged:
                        (value) {
                      setLocal(
                        () =>
                            documents =
                                value,
                      );
                    },
                  ),
                  const SizedBox(
                    height: 14,
                  ),
                  FilledButton(
                    onPressed: () async {
                      if (selectedTechnicianId ==
                              0 ||
                          description
                              .text
                              .trim()
                              .isEmpty) {
                        ScaffoldMessenger
                                .of(
                                  context,
                                )
                            .showSnackBar(
                          SnackBar(
                            content:
                                Text(
                              context.tr(
                                'Sélectionnez un technicien et décrivez les travaux.',
                                'اختر تقنياً واكتب وصف الأشغال.',
                              ),
                            ),
                          ),
                        );
                        return;
                      }

                      try {
                        await state.createIntervention(
                          failureId:
                              failure.id,
                          technicianId:
                              selectedTechnicianId,
                          date: date,
                          description:
                              description
                                  .text
                                  .trim(),
                          documents:
                              documents,
                        );

                        Navigator.pop(
                          sheetContext,
                        );
                      } on StateError {
                        ScaffoldMessenger
                                .of(
                                  context,
                                )
                            .showSnackBar(
                          SnackBar(
                            content:
                                Text(
                              context.tr(
                                'Une intervention active existe déjà.',
                                'يوجد تدخل نشط بالفعل.',
                              ),
                            ),
                          ),
                        );
                      }
                    },
                    child: Text(
                      context.tr(
                        'Planifier',
                        'برمجة',
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );

    description.dispose();
    technicianSearch.dispose();
  }

  Future<void> _completeIntervention(
    BuildContext context,
    Intervention intervention,
  ) async {
    final report =
        TextEditingController();
    final cost =
        TextEditingController(
      text: '0',
    );

    var completedAt =
        DateTime.now();
    var photos =
        <AppDocument>[];
    var documents =
        <AppDocument>[];

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) =>
          StatefulBuilder(
        builder: (
          sheetContext,
          setLocal,
        ) =>
            Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            MediaQuery.viewInsetsOf(
                  sheetContext,
                ).bottom +
                20,
          ),
          child:
              SingleChildScrollView(
            child: Column(
              children: [
                _sheetHeader(
                  context,
                  sheetContext,
                  'Terminer l’intervention',
                  'إنهاء التدخل',
                ),
                const SizedBox(
                  height: 6,
                ),
                Text(
                  context.isArabic
                      ? intervention
                          .technicianNameAr
                      : intervention
                          .technicianName,
                ),
                const SizedBox(
                  height: 12,
                ),
                TextField(
                  controller: report,
                  minLines: 5,
                  maxLines: 8,
                  decoration:
                      InputDecoration(
                    labelText:
                        context.tr(
                      'Rapport d’intervention *',
                      'تقرير التدخل *',
                    ),
                  ),
                ),
                const SizedBox(
                  height: 10,
                ),
                TextField(
                  controller: cost,
                  keyboardType:
                      const TextInputType
                          .numberWithOptions(
                    decimal: true,
                  ),
                  decoration:
                      InputDecoration(
                    labelText:
                        context.tr(
                      'Coût (DH) *',
                      'التكلفة (درهم) *',
                    ),
                  ),
                ),
                ListTile(
                  contentPadding:
                      EdgeInsets.zero,
                  title: Text(
                    context.tr(
                      'Date de fin',
                      'تاريخ الانتهاء',
                    ),
                  ),
                  subtitle: Text(
                    _date(
                      completedAt,
                    ),
                  ),
                  trailing:
                      const Icon(
                    Icons
                        .calendar_month_outlined,
                  ),
                  onTap: () async {
                    final picked =
                        await showDatePicker(
                      context:
                          sheetContext,
                      firstDate:
                          DateTime(
                        2000,
                      ),
                      lastDate:
                          DateTime(
                        2100,
                      ),
                      initialDate:
                          completedAt,
                    );

                    if (picked !=
                        null) {
                      setLocal(
                        () =>
                            completedAt =
                                picked,
                      );
                    }
                  },
                ),
                OutlinedButton.icon(
                  onPressed: () async {
                    final result =
                        await FilePicker
                            .platform
                            .pickFiles(
                      type:
                          FileType.image,
                      allowMultiple:
                          true,
                      withData: true,
                    );

                    if (result ==
                        null) {
                      return;
                    }

                    var nextId = 1;

                    for (final photo
                        in photos) {
                      if (photo.id >=
                          nextId) {
                        nextId =
                            photo.id +
                                1;
                      }
                    }

                    final added =
                        <AppDocument>[];

                    for (
                      var index = 0;
                      index <
                          result.files
                              .length;
                      index++
                    ) {
                      final file =
                          result
                              .files[
                                  index];

                      added.add(
                        AppDocument(
                          id:
                              nextId +
                              index,
                          name:
                              file.name,
                          type:
                              DocumentType
                                  .photo,
                          fileName:
                              file.name,
                          uploadDate:
                              DateTime
                                  .now(),
                          category:
                              DocumentCategory
                                  .attachment,
                          fileBytes:
                              file.bytes,
                        ),
                      );
                    }

                    setLocal(
                      () =>
                          photos = [
                        ...photos,
                        ...added,
                      ],
                    );
                  },
                  icon:
                      const Icon(
                    Icons
                        .add_a_photo_outlined,
                  ),
                  label: Text(
                    context.tr(
                      'Ajouter des photos *',
                      'إضافة صور *',
                    ),
                  ),
                ),
                if (photos
                    .isNotEmpty)
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: photos
                        .map(
                          (photo) =>
                              Chip(
                            label: Text(
                              photo
                                  .fileName,
                            ),
                            onDeleted:
                                () {
                              setLocal(
                                () =>
                                    photos.removeWhere(
                                  (item) =>
                                      item.id ==
                                      photo.id,
                                ),
                              );
                            },
                          ),
                        )
                        .toList(),
                  ),
                const SizedBox(
                  height: 12,
                ),
                DocumentEditor(
                  documents:
                      documents,
                  onChanged:
                      (value) {
                    setLocal(
                      () =>
                          documents =
                              value,
                    );
                  },
                ),
                const SizedBox(
                  height: 14,
                ),
                FilledButton.icon(
                  onPressed: () async {
                    final parsedCost =
                        double.tryParse(
                      cost.text,
                    );

                    if (report.text
                            .trim()
                            .isEmpty ||
                        parsedCost ==
                            null ||
                        parsedCost <
                            0 ||
                        photos
                            .isEmpty) {
                      ScaffoldMessenger
                              .of(
                                context,
                              )
                          .showSnackBar(
                        SnackBar(
                          content:
                              Text(
                            context.tr(
                              'Rapport, coût et au moins une photo sont obligatoires.',
                              'التقرير والتكلفة وصورة واحدة على الأقل إلزامية.',
                            ),
                          ),
                        ),
                      );
                      return;
                    }

                    await context
                        .read<
                            AppState>()
                        .completeIntervention(
                          intervention
                              .id,
                          report: report
                              .text
                              .trim(),
                          cost:
                              parsedCost,
                          photos:
                              photos,
                          documents:
                              documents,
                          completedAt:
                              completedAt,
                        );

                    Navigator.pop(
                      sheetContext,
                    );
                  },
                  icon:
                      const Icon(
                    Icons.done_all,
                  ),
                  label: Text(
                    context.tr(
                      'Confirmer la fin',
                      'تأكيد الانتهاء',
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    report.dispose();
    cost.dispose();
  }

  void _details(
    BuildContext context,
    LightPoint light,
  ) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) =>
          Padding(
        padding:
            const EdgeInsets.all(18),
        child:
            SingleChildScrollView(
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment
                    .start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      context.isArabic
                          ? light.designationAr
                          : light.designation,
                      style: Theme.of(context)
                          .textTheme
                          .titleLarge
                          ?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                  ),
                  IconButton(
                    tooltip: context.tr(
                      'Fermer',
                      'إغلاق',
                    ),
                    onPressed: () =>
                        Navigator.of(sheetContext).pop(),
                    icon: const Icon(
                      Icons.close,
                    ),
                  ),
                ],
              ),
              const SizedBox(
                height: 8,
              ),
              Text(
                light.reference,
              ),
              const SizedBox(
                height: 8,
              ),
              Text(
                '${context.tr('Localisation', 'الموقع')}: '
                '${light.localisation}',
              ),
              Text(
                '${context.tr('Puissance', 'القدرة')}: '
                '${light.power.toStringAsFixed(0)} W',
              ),
              Text(
                '${context.tr('Statut', 'الحالة')}: '
                '${_statusLabel(context, light.status)}',
              ),
              Text(
                'GPS: ${light.latitude}, ${light.longitude}',
              ),
              Text(
                '${context.tr('Date d’installation', 'تاريخ التركيب')}: '
                '${_date(light.installationDate)}',
              ),
              if (light.documents
                  .isNotEmpty) ...[
                const SizedBox(
                  height: 12,
                ),
                Text(
                  context.tr(
                    'Documents',
                    'الوثائق',
                  ),
                  style:
                      const TextStyle(
                    fontWeight:
                        FontWeight
                            .w800,
                  ),
                ),
                ...light.documents
                    .map(
                  (document) =>
                      Text(
                    '• ${document.fileName}',
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _deleteLight(
    BuildContext context,
    LightPoint light,
  ) async {
    final confirmed =
        await showDialog<bool>(
      context: context,
      builder: (dialogContext) =>
          AlertDialog(
        title: Text(
          context.tr(
            'Supprimer le point',
            'حذف نقطة الإنارة',
          ),
        ),
        content: Text(
          context.tr(
            'Voulez-vous supprimer ${light.reference} ?',
            'هل تريد حذف ${light.reference}؟',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.pop(
              dialogContext,
              false,
            ),
            child: Text(
              context.tr(
                'Annuler',
                'إلغاء',
              ),
            ),
          ),
          FilledButton(
            onPressed: () =>
                Navigator.pop(
              dialogContext,
              true,
            ),
            child: Text(
              context.tr(
                'Supprimer',
                'حذف',
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true &&
        context.mounted) {
      await context
          .read<AppState>()
          .deleteLight(
            light.id,
          );
    }
  }

  Widget _sheetHeader(
    BuildContext context,
    BuildContext sheetContext,
    String fr,
    String ar,
  ) {
    return Row(
      children: [
        Expanded(
          child: Text(
            context.tr(fr, ar),
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
        ),
        IconButton(
          tooltip: context.tr(
            'Fermer',
            'إغلاق',
          ),
          onPressed: () =>
              Navigator.of(sheetContext).pop(),
          icon: const Icon(
            Icons.close,
          ),
        ),
      ],
    );
  }

  String _date(DateTime date) =>
      '${date.year.toString().padLeft(4, '0')}-'
      '${date.month.toString().padLeft(2, '0')}-'
      '${date.day.toString().padLeft(2, '0')}';

  Color _statusColor(
    LightStatus status,
  ) =>
      switch (status) {
        LightStatus.active =>
          Colors.green,
        LightStatus.inactive =>
          Colors.blueGrey,
        LightStatus.damaged =>
          Colors.red,
        LightStatus
              .underMaintenance =>
          Colors.orange,
      };

  String _statusLabel(
    BuildContext context,
    LightStatus status,
  ) =>
      switch (status) {
        LightStatus.active =>
          context.tr(
            'Actif',
            'نشط',
          ),
        LightStatus.inactive =>
          context.tr(
            'Inactif',
            'غير نشط',
          ),
        LightStatus.damaged =>
          context.tr(
            'Endommagé',
            'متضرر',
          ),
        LightStatus
              .underMaintenance =>
          context.tr(
            'En maintenance',
            'قيد الصيانة',
          ),
      };

  String _failureStatus(
    BuildContext context,
    FailureStatus status,
  ) =>
      switch (status) {
        FailureStatus.reported =>
          context.tr(
            'Signalée',
            'مبلغ عنها',
          ),
        FailureStatus.inProgress =>
          context.tr(
            'En cours',
            'قيد المعالجة',
          ),
        FailureStatus.resolved =>
          context.tr(
            'Résolue',
            'محلولة',
          ),
      };
}
