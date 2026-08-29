import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/app_document.dart';
import '../../models/lighting.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';
import '../../widgets/document_editor.dart';

class LightingScreen extends StatefulWidget {
  const LightingScreen({super.key});

  @override
  State<LightingScreen> createState() => _LightingScreenState();
}

class _LightingScreenState extends State<LightingScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _search = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
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
            Tab(text: context.tr('Pannes', 'الأعطال')),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabs,
            children: [_points(context), _map(context), _history(context)],
          ),
        ),
      ],
    );
  }

  Widget _points(BuildContext context) {
    final state = context.watch<AppState>();
    final q = _search.text.trim().toLowerCase();
    final items = state.lights.where((l) => q.isEmpty || l.reference.toLowerCase().contains(q) || l.designation.toLowerCase().contains(q) || l.designationAr.contains(q) || l.zone.toLowerCase().contains(q)).toList();
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(children: [
          Expanded(child: Text(context.tr('Éclairage public', 'الإنارة العمومية'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900))),
          if (state.hasPermission(Permissions.createLight)) IconButton.filled(onPressed: () => _lightForm(context), icon: const Icon(Icons.add)),
        ]),
        const SizedBox(height: 12),
        TextField(controller: _search, onChanged: (_) => setState(() {}), decoration: InputDecoration(prefixIcon: const Icon(Icons.search), hintText: context.tr('Référence, zone, désignation...', 'المرجع، المنطقة، التسمية...'))),
        const SizedBox(height: 14),
        if (items.isEmpty)
          EmptyState(icon: Icons.lightbulb_outline, title: context.tr('Aucun point lumineux', 'لا توجد نقطة إنارة'))
        else
          ...items.map((light) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SectionCard(
                  child: InkWell(
                    onTap: () => _details(context, light),
                    child: Row(children: [
                      CircleAvatar(backgroundColor: _statusColor(light.status).withOpacity(.12), child: Icon(Icons.lightbulb_outline, color: _statusColor(light.status))),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(context.isArabic ? light.designationAr : light.designation, style: const TextStyle(fontWeight: FontWeight.w800)),
                        Text('${light.reference} · ${context.isArabic ? light.zoneAr : light.zone}', style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: 5),
                        Text(_statusLabel(context, light.status), style: TextStyle(color: _statusColor(light.status), fontWeight: FontWeight.w700)),
                      ])),
                      const Icon(Icons.chevron_right),
                    ]),
                  ),
                ),
              )),
      ],
    );
  }

  Widget _map(BuildContext context) {
    final state = context.watch<AppState>();
    if (state.lights.isEmpty) return const SizedBox.shrink();
    return FlutterMap(
      options: MapOptions(initialCenter: LatLng(state.lights.first.latitude, state.lights.first.longitude), initialZoom: 13),
      children: [
        TileLayer(urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', userAgentPackageName: 'ma.sgpbse.mobile'),
        MarkerLayer(
          markers: state.lights
              .map(
                (light) => Marker(
                  point: LatLng(light.latitude, light.longitude),
                  width: 48,
                  height: 48,
                  child: GestureDetector(
                    onTap: () => _details(context, light),
                    child: Icon(Icons.location_on, size: 40, color: _statusColor(light.status)),
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
        Text(context.tr('Pannes et interventions', 'الأعطال والتدخلات'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
        const SizedBox(height: 12),
        if (state.failures.isEmpty)
          EmptyState(icon: Icons.build_outlined, title: context.tr('Aucune panne', 'لا توجد أعطال'))
        else
          ...state.failures.map((failure) {
            final linked = state.interventions.where((i) => i.failureId == failure.id).toList();
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: SectionCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Expanded(child: Text('${failure.lightReference} — ${context.isArabic ? failure.lightDesignationAr : failure.lightDesignation}', style: const TextStyle(fontWeight: FontWeight.w800))),
                    Chip(label: Text(_failureStatus(context, failure.status))),
                  ]),
                  const SizedBox(height: 6),
                  Text(failure.description),
                  const SizedBox(height: 5),
                  Text('${context.tr('Déclaré par', 'المبلغ')}: ${failure.reportedBy == 'PUBLIC' ? context.tr('Signalement public', 'تبليغ عمومي') : failure.reportedBy} · ${formatDate(failure.reportedAt)}', style: Theme.of(context).textTheme.bodySmall),
                  if (failure.documents.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text('${context.tr('Documents', 'الوثائق')}: ${failure.documents.map((d) => d.fileName).join(', ')}', style: Theme.of(context).textTheme.bodySmall),
                  ],
                  if (linked.isNotEmpty) ...[
                    const Divider(height: 22),
                    ...linked.map((i) => ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: CircleAvatar(child: Icon(i.completed ? Icons.check : Icons.engineering_outlined)),
                          title: Text(i.technician),
                          subtitle: Text('${i.description}\n${formatDate(i.interventionDate)}'),
                          isThreeLine: true,
                          trailing: !i.completed && state.hasPermission(Permissions.updateIntervention) ? IconButton(onPressed: () => state.completeIntervention(i.id), icon: const Icon(Icons.check_circle_outline, color: Colors.green)) : null,
                        )),
                  ],
                  if (failure.status != FailureStatus.resolved && state.hasPermission(Permissions.createIntervention))
                    Align(alignment: AlignmentDirectional.centerEnd, child: FilledButton.tonalIcon(onPressed: () => _interventionForm(context, failure), icon: const Icon(Icons.engineering_outlined), label: Text(context.tr('Intervention', 'تدخل')))),
                ]),
              ),
            );
          }),
      ],
    );
  }

  void _details(BuildContext context, LightPoint light) {
    final state = context.read<AppState>();
    final openFailure = state.failures.where((f) => f.lightId == light.id && f.status != FailureStatus.resolved).toList();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheetContext) => DraggableScrollableSheet(
        initialChildSize: .86,
        maxChildSize: .96,
        expand: false,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 24),
          children: [
            Text(context.isArabic ? light.designationAr : light.designation, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
            Text(light.reference),
            const SizedBox(height: 10),
            ListTile(contentPadding: EdgeInsets.zero, title: Text(context.tr('Zone', 'المنطقة')), subtitle: Text(context.isArabic ? light.zoneAr : light.zone)),
            ListTile(contentPadding: EdgeInsets.zero, title: Text(context.tr('Adresse', 'العنوان')), subtitle: Text(context.isArabic ? light.addressAr : light.address)),
            ListTile(contentPadding: EdgeInsets.zero, title: Text(context.tr('Coordonnées', 'الإحداثيات')), subtitle: Text('${light.latitude}, ${light.longitude}')),
            ListTile(contentPadding: EdgeInsets.zero, title: Text(context.tr('Puissance', 'القدرة')), subtitle: Text('${light.power.toStringAsFixed(0)} W')),
            DocumentEditor(documents: light.documents, onChanged: (docs) { light.documents = docs; state.saveLight(light); }),
            const SizedBox(height: 12),
            Wrap(spacing: 8, runSpacing: 8, children: [
              if (state.hasPermission(Permissions.updateLight)) OutlinedButton.icon(onPressed: () { Navigator.pop(sheetContext); _lightForm(context, light: light); }, icon: const Icon(Icons.edit_outlined), label: Text(context.tr('Modifier', 'تعديل'))),
              if (state.hasPermission(Permissions.reportFailure) && openFailure.isEmpty) FilledButton.tonalIcon(onPressed: () => _failureForm(context, light), icon: const Icon(Icons.report_problem_outlined), label: Text(context.tr('Déclarer panne', 'التبليغ عن عطل'))),
              if (state.hasPermission(Permissions.deleteLight)) OutlinedButton.icon(onPressed: () async { final ok = await confirmAction(context, fr: 'Supprimer ce point lumineux ?', ar: 'حذف نقطة الإنارة؟'); if (ok && context.mounted) { state.deleteLight(light.id); Navigator.pop(sheetContext); } }, icon: const Icon(Icons.delete_outline, color: Colors.red), label: Text(context.tr('Supprimer', 'حذف'))),
            ]),
          ],
        ),
      ),
    );
  }

  Future<void> _lightForm(BuildContext context, {LightPoint? light}) async {
    final state = context.read<AppState>();
    final reference = TextEditingController(text: light?.reference ?? ''); final designation = TextEditingController(text: light?.designation ?? ''); final designationAr = TextEditingController(text: light?.designationAr ?? ''); final zone = TextEditingController(text: light?.zone ?? ''); final zoneAr = TextEditingController(text: light?.zoneAr ?? ''); final address = TextEditingController(text: light?.address ?? ''); final addressAr = TextEditingController(text: light?.addressAr ?? ''); final lat = TextEditingController(text: '${light?.latitude ?? 30.42}'); final lng = TextEditingController(text: '${light?.longitude ?? -9.59}'); final power = TextEditingController(text: '${light?.power ?? 100}'); var status = light?.status ?? LightStatus.active; var docs = [...?light?.documents];
    await showModalBottomSheet<void>(context: context, isScrollControlled: true, showDragHandle: true, builder: (context) => StatefulBuilder(builder: (context, setLocal) => Padding(padding: EdgeInsets.fromLTRB(18, 0, 18, 18 + MediaQuery.of(context).viewInsets.bottom), child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Text(light == null ? context.tr('Ajouter un point lumineux', 'إضافة نقطة إنارة') : context.tr('Modifier le point', 'تعديل نقطة الإنارة'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)), const SizedBox(height: 12),
      TextField(controller: reference, decoration: InputDecoration(labelText: context.tr('Référence', 'المرجع'))), const SizedBox(height: 8),
      TextField(controller: designation, decoration: const InputDecoration(labelText: 'Désignation FR')), const SizedBox(height: 8), TextField(controller: designationAr, decoration: const InputDecoration(labelText: 'التسمية AR')), const SizedBox(height: 8),
      TextField(controller: zone, decoration: const InputDecoration(labelText: 'Zone FR')), const SizedBox(height: 8), TextField(controller: zoneAr, decoration: const InputDecoration(labelText: 'المنطقة AR')), const SizedBox(height: 8),
      TextField(controller: address, decoration: const InputDecoration(labelText: 'Adresse FR')), const SizedBox(height: 8), TextField(controller: addressAr, decoration: const InputDecoration(labelText: 'العنوان AR')), const SizedBox(height: 8),
      Row(children: [Expanded(child: TextField(controller: lat, keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true), decoration: const InputDecoration(labelText: 'Latitude'))), const SizedBox(width: 8), Expanded(child: TextField(controller: lng, keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true), decoration: const InputDecoration(labelText: 'Longitude')))]), const SizedBox(height: 8),
      TextField(controller: power, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: context.tr('Puissance W', 'القدرة W'))), const SizedBox(height: 8),
      DropdownButtonFormField<LightStatus>(value: status, decoration: InputDecoration(labelText: context.tr('Statut', 'الحالة')), items: LightStatus.values.map((s) => DropdownMenuItem(value: s, child: Text(_statusLabel(context, s)))).toList(), onChanged: (v) => setLocal(() => status = v ?? status)), const SizedBox(height: 12),
      DocumentEditor(documents: docs, onChanged: (v) => setLocal(() => docs = v)), const SizedBox(height: 14),
      FilledButton(onPressed: () { state.saveLight(LightPoint(id: light?.id ?? state.nextLightId(), reference: reference.text.trim().toUpperCase(), designation: designation.text.trim(), designationAr: designationAr.text.trim(), zone: zone.text.trim(), zoneAr: zoneAr.text.trim(), address: address.text.trim(), addressAr: addressAr.text.trim(), latitude: double.tryParse(lat.text) ?? 0, longitude: double.tryParse(lng.text) ?? 0, status: status, installationDate: light?.installationDate ?? DateTime.now(), power: double.tryParse(power.text) ?? 0, documents: docs)); Navigator.pop(context); }, child: Text(context.tr('Enregistrer', 'حفظ'))),
    ])))));
  }

  Future<void> _failureForm(BuildContext context, LightPoint light) async {
    final description = TextEditingController(); var docs = <AppDocument>[];
    await showModalBottomSheet<void>(context: context, isScrollControlled: true, showDragHandle: true, builder: (context) => StatefulBuilder(builder: (context, setLocal) => Padding(padding: EdgeInsets.fromLTRB(18, 0, 18, 18 + MediaQuery.of(context).viewInsets.bottom), child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Text(context.tr('Déclarer une panne', 'التبليغ عن عطل'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)), const SizedBox(height: 12),
      TextField(controller: description, minLines: 4, maxLines: 6, decoration: InputDecoration(labelText: context.tr('Description', 'الوصف'))), const SizedBox(height: 12),
      DocumentEditor(documents: docs, onChanged: (v) => setLocal(() => docs = v)), const SizedBox(height: 14),
      FilledButton(onPressed: () { try { context.read<AppState>().createFailure(lightId: light.id, description: description.text.trim(), reportedBy: context.read<AppState>().currentUser?.fullName ?? 'Agent', documents: docs); Navigator.pop(context); } on StateError { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('Une panne existe déjà.', 'يوجد عطل مسجل بالفعل.')))); } }, child: Text(context.tr('Envoyer', 'إرسال'))),
    ])))));
  }

  Future<void> _interventionForm(BuildContext context, FailureReport failure) async {
    final technician = TextEditingController(text: context.read<AppState>().currentUser?.fullName ?? ''); final description = TextEditingController(); var docs = <AppDocument>[];
    await showModalBottomSheet<void>(context: context, isScrollControlled: true, showDragHandle: true, builder: (context) => StatefulBuilder(builder: (context, setLocal) => Padding(padding: EdgeInsets.fromLTRB(18, 0, 18, 18 + MediaQuery.of(context).viewInsets.bottom), child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Text(context.tr('Créer une intervention', 'إنشاء تدخل'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)), const SizedBox(height: 12),
      TextField(controller: technician, decoration: InputDecoration(labelText: context.tr('Technicien', 'التقني'))), const SizedBox(height: 8), TextField(controller: description, minLines: 3, maxLines: 5, decoration: InputDecoration(labelText: context.tr('Description', 'الوصف'))), const SizedBox(height: 12),
      DocumentEditor(documents: docs, onChanged: (v) => setLocal(() => docs = v)), const SizedBox(height: 14),
      FilledButton(onPressed: () { try { context.read<AppState>().createIntervention(failureId: failure.id, technician: technician.text.trim(), date: DateTime.now(), description: description.text.trim(), documents: docs); Navigator.pop(context); } on StateError { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('Une intervention active existe déjà.', 'يوجد تدخل جارٍ بالفعل.')))); } }, child: Text(context.tr('Créer', 'إنشاء'))),
    ])))));
  }

  Color _statusColor(LightStatus status) => switch (status) { LightStatus.active => Colors.green, LightStatus.inactive => Colors.blueGrey, LightStatus.damaged => Colors.red, LightStatus.underMaintenance => Colors.orange };
  String _statusLabel(BuildContext context, LightStatus status) => switch (status) { LightStatus.active => context.tr('Actif', 'نشط'), LightStatus.inactive => context.tr('Inactif', 'غير نشط'), LightStatus.damaged => context.tr('Endommagé', 'متضرر'), LightStatus.underMaintenance => context.tr('Maintenance', 'صيانة') };
  String _failureStatus(BuildContext context, FailureStatus status) => switch (status) { FailureStatus.reported => context.tr('Signalée', 'مبلغ عنها'), FailureStatus.inProgress => context.tr('En cours', 'قيد المعالجة'), FailureStatus.resolved => context.tr('Résolue', 'محلولة') };
}
