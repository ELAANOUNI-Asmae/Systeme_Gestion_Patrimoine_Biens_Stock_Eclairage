import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/app_document.dart';
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

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final source = _archives ? state.archivedBiens : state.activeBiens;
    final q = _search.text.trim().toLowerCase();
    final items = source.where((b) => q.isEmpty || b.inventoryId.toLowerCase().contains(q) || b.designation.toLowerCase().contains(q) || b.designationAr.contains(q) || b.assignment.toLowerCase().contains(q)).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(child: Text(context.tr('Gestion des biens', 'تدبير الممتلكات'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900))),
            if (state.hasPermission(Permissions.createAsset))
              IconButton.filled(onPressed: () => _openForm(context), icon: const Icon(Icons.add)),
          ],
        ),
        const SizedBox(height: 12),
        TextField(controller: _search, onChanged: (_) => setState(() {}), decoration: InputDecoration(prefixIcon: const Icon(Icons.search), hintText: context.tr('Inventaire, désignation, affectation...', 'رقم الجرد، التسمية، المصلحة...'))),
        const SizedBox(height: 10),
        SegmentedButton<bool>(
          segments: [
            ButtonSegment(value: false, label: Text(context.tr('Actifs', 'النشطة'))),
            ButtonSegment(value: true, label: Text(context.tr('Archives', 'الأرشيف'))),
          ],
          selected: {_archives},
          onSelectionChanged: (value) => setState(() => _archives = value.first),
        ),
        const SizedBox(height: 14),
        if (items.isEmpty)
          EmptyState(icon: Icons.apartment_outlined, title: context.tr('Aucun bien trouvé', 'لم يتم العثور على ممتلك'))
        else
          ...items.map((b) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SectionCard(
                  child: InkWell(
                    onTap: () => _details(context, b),
                    child: Row(
                      children: [
                        CircleAvatar(child: Icon(_typeIcon(b.type))),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(context.isArabic ? b.designationAr : b.designation, style: const TextStyle(fontWeight: FontWeight.w800)),
                            const SizedBox(height: 3),
                            Text('${b.inventoryId} · ${context.isArabic ? b.assignmentAr : b.assignment}', style: Theme.of(context).textTheme.bodySmall),
                            const SizedBox(height: 6),
                            Wrap(spacing: 6, children: [Chip(label: Text(_status(context, b.status)), visualDensity: VisualDensity.compact), Chip(label: Text(_type(context, b.type)), visualDensity: VisualDensity.compact)]),
                          ]),
                        ),
                        const Icon(Icons.chevron_right),
                      ],
                    ),
                  ),
                ),
              )),
      ],
    );
  }

  void _details(BuildContext context, Bien bien) {
    final state = context.read<AppState>();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheetContext) => DraggableScrollableSheet(
        initialChildSize: .85,
        minChildSize: .5,
        maxChildSize: .95,
        expand: false,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 24),
          children: [
            Text(context.isArabic ? bien.designationAr : bien.designation, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
            Text(bien.inventoryId),
            const SizedBox(height: 14),
            _info(context, context.tr('Statut', 'الحالة'), _status(context, bien.status)),
            _info(context, context.tr('Affectation', 'المصلحة'), context.isArabic ? bien.assignmentAr : bien.assignment),
            _info(context, context.tr('Valeur', 'القيمة'), '${bien.purchaseValue.toStringAsFixed(0)} DH'),
            _info(context, context.tr('Acquisition', 'الاقتناء'), formatDate(bien.acquisitionDate)),
            if (bien.registrationNumber != null) _info(context, context.tr('Immatriculation', 'رقم التسجيل'), bien.registrationNumber!),
            if (bien.serialNumber != null) _info(context, context.tr('N° série', 'الرقم التسلسلي'), bien.serialNumber!),
            if (bien.address != null) _info(context, context.tr('Adresse', 'العنوان'), bien.address!),
            const SizedBox(height: 12),
            DocumentEditor(
              documents: bien.documents,
              onChanged: (docs) {
                bien.documents = docs;
                state.saveBien(bien);
              },
            ),
            if (!bien.archived) ...[
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (state.hasPermission(Permissions.updateAsset)) OutlinedButton.icon(onPressed: () { Navigator.pop(sheetContext); _openForm(context, bien: bien); }, icon: const Icon(Icons.edit_outlined), label: Text(context.tr('Modifier', 'تعديل'))),
                  OutlinedButton.icon(onPressed: () => _rent(context, bien), icon: const Icon(Icons.key_outlined), label: Text(context.tr('Louer', 'كراء'))),
                  OutlinedButton.icon(onPressed: () => _sell(context, bien), icon: const Icon(Icons.sell_outlined), label: Text(context.tr('Vendre', 'بيع'))),
                  OutlinedButton.icon(onPressed: () => _archive(context, bien), icon: const Icon(Icons.archive_outlined), label: Text(context.tr('Archiver', 'أرشفة'))),
                  if (state.hasPermission(Permissions.deleteAsset)) OutlinedButton.icon(onPressed: () async { final ok = await confirmAction(context, fr: 'Supprimer définitivement ce bien ?', ar: 'حذف هذا الممتلك نهائياً؟'); if (ok && context.mounted) { state.deleteBien(bien.id); Navigator.pop(sheetContext); } }, icon: const Icon(Icons.delete_outline, color: Colors.red), label: Text(context.tr('Supprimer', 'حذف'))),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _info(BuildContext context, String label, String value) => ListTile(contentPadding: EdgeInsets.zero, title: Text(label, style: Theme.of(context).textTheme.bodySmall), subtitle: Text(value, style: const TextStyle(fontWeight: FontWeight.w700)));

  Future<void> _openForm(BuildContext context, {Bien? bien}) async {
    final state = context.read<AppState>();
    final designation = TextEditingController(text: bien?.designation ?? '');
    final designationAr = TextEditingController(text: bien?.designationAr ?? '');
    final inventory = TextEditingController(text: bien?.inventoryId ?? '');
    final assignment = TextEditingController(text: bien?.assignment ?? '');
    final assignmentAr = TextEditingController(text: bien?.assignmentAr ?? '');
    final value = TextEditingController(text: bien?.purchaseValue.toString() ?? '0');
    var type = bien?.type ?? AssetType.vehicle;
    var status = bien?.status ?? AssetStatus.available;
    var date = bien?.acquisitionDate ?? DateTime.now();
    var docs = [...?bien?.documents];

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setLocal) => Padding(
          padding: EdgeInsets.fromLTRB(18, 0, 18, 18 + MediaQuery.of(context).viewInsets.bottom),
          child: SingleChildScrollView(
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Text(bien == null ? context.tr('Ajouter un bien', 'إضافة ممتلك') : context.tr('Modifier le bien', 'تعديل الممتلك'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 14),
              TextField(controller: inventory, decoration: InputDecoration(labelText: context.tr('Identifiant inventaire', 'رقم الجرد'))),
              const SizedBox(height: 10),
              TextField(controller: designation, decoration: const InputDecoration(labelText: 'Désignation FR')),
              const SizedBox(height: 10),
              TextField(controller: designationAr, decoration: const InputDecoration(labelText: 'التسمية AR')),
              const SizedBox(height: 10),
              TextField(controller: assignment, decoration: const InputDecoration(labelText: 'Affectation FR')),
              const SizedBox(height: 10),
              TextField(controller: assignmentAr, decoration: const InputDecoration(labelText: 'المصلحة AR')),
              const SizedBox(height: 10),
              Row(children: [
                Expanded(child: DropdownButtonFormField<AssetType>(value: type, decoration: InputDecoration(labelText: context.tr('Type', 'النوع')), items: AssetType.values.map((e) => DropdownMenuItem(value: e, child: Text(_type(context, e)))).toList(), onChanged: (v) => setLocal(() => type = v ?? type))),
                const SizedBox(width: 10),
                Expanded(child: DropdownButtonFormField<AssetStatus>(value: status, decoration: InputDecoration(labelText: context.tr('Statut', 'الحالة')), items: AssetStatus.values.where((e) => e != AssetStatus.archived && e != AssetStatus.sold).map((e) => DropdownMenuItem(value: e, child: Text(_status(context, e)))).toList(), onChanged: (v) => setLocal(() => status = v ?? status))),
              ]),
              const SizedBox(height: 10),
              TextField(controller: value, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: context.tr('Valeur (DH)', 'القيمة (درهم)'))),
              const SizedBox(height: 10),
              OutlinedButton.icon(onPressed: () async { final d = await showDatePicker(context: context, initialDate: date, firstDate: DateTime(1980), lastDate: DateTime.now().add(const Duration(days: 365))); if (d != null) setLocal(() => date = d); }, icon: const Icon(Icons.event), label: Text('${context.tr('Date', 'التاريخ')}: ${formatDate(date)}')),
              const SizedBox(height: 12),
              DocumentEditor(documents: docs, onChanged: (v) => setLocal(() => docs = v)),
              const SizedBox(height: 16),
              FilledButton(onPressed: () { if (inventory.text.trim().isEmpty || designation.text.trim().isEmpty) return; state.saveBien(Bien(id: bien?.id ?? state.nextBienId(), type: type, designation: designation.text.trim(), designationAr: designationAr.text.trim(), status: status, acquisitionDate: date, purchaseValue: double.tryParse(value.text) ?? 0, assignment: assignment.text.trim(), assignmentAr: assignmentAr.text.trim(), inventoryId: inventory.text.trim().toUpperCase(), documents: docs, registrationNumber: bien?.registrationNumber, brand: bien?.brand, model: bien?.model, serialNumber: bien?.serialNumber, address: bien?.address, surface: bien?.surface, archived: bien?.archived ?? false, archiveReason: bien?.archiveReason, rentals: bien?.rentals, sale: bien?.sale)); Navigator.pop(context); }, child: Text(context.tr('Enregistrer', 'حفظ'))),
            ]),
          ),
        ),
      ),
    );
  }

  Future<void> _rent(BuildContext context, Bien bien) async {
    final tenant = TextEditingController(); final amount = TextEditingController();
    await showDialog<void>(context: context, builder: (context) => AlertDialog(title: Text(context.tr('Location du bien', 'كراء الممتلك')), content: Column(mainAxisSize: MainAxisSize.min, children: [TextField(controller: tenant, decoration: InputDecoration(labelText: context.tr('Locataire', 'المكتري'))), const SizedBox(height: 10), TextField(controller: amount, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: context.tr('Montant mensuel', 'المبلغ الشهري')))]), actions: [TextButton(onPressed: () => Navigator.pop(context), child: Text(context.tr('Annuler', 'إلغاء'))), FilledButton(onPressed: () { context.read<AppState>().rentBien(bien.id, tenant.text.trim(), DateTime.now(), double.tryParse(amount.text) ?? 0); Navigator.pop(context); }, child: Text(context.tr('Valider', 'تأكيد')))]));
  }

  Future<void> _sell(BuildContext context, Bien bien) async {
    final buyer = TextEditingController(); final price = TextEditingController();
    await showDialog<void>(context: context, builder: (context) => AlertDialog(title: Text(context.tr('Vente du bien', 'بيع الممتلك')), content: Column(mainAxisSize: MainAxisSize.min, children: [TextField(controller: buyer, decoration: InputDecoration(labelText: context.tr('Acheteur', 'المشتري'))), const SizedBox(height: 10), TextField(controller: price, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: context.tr('Prix', 'الثمن')))]), actions: [TextButton(onPressed: () => Navigator.pop(context), child: Text(context.tr('Annuler', 'إلغاء'))), FilledButton(onPressed: () { context.read<AppState>().sellBien(bien.id, buyer.text.trim(), DateTime.now(), double.tryParse(price.text) ?? 0); Navigator.pop(context); }, child: Text(context.tr('Valider', 'تأكيد')))]));
  }

  Future<void> _archive(BuildContext context, Bien bien) async {
    final reason = TextEditingController();
    await showDialog<void>(context: context, builder: (context) => AlertDialog(title: Text(context.tr('Archiver le bien', 'أرشفة الممتلك')), content: TextField(controller: reason, decoration: InputDecoration(labelText: context.tr('Motif', 'السبب'))), actions: [TextButton(onPressed: () => Navigator.pop(context), child: Text(context.tr('Annuler', 'إلغاء'))), FilledButton(onPressed: () { context.read<AppState>().archiveBien(bien.id, reason.text.trim().isEmpty ? 'OTHER' : reason.text.trim()); Navigator.pop(context); }, child: Text(context.tr('Archiver', 'أرشفة')))]));
  }

  IconData _typeIcon(AssetType type) => switch (type) { AssetType.vehicle => Icons.directions_car_outlined, AssetType.machine => Icons.precision_manufacturing_outlined, AssetType.realEstate => Icons.apartment_outlined };
  String _type(BuildContext context, AssetType type) => switch (type) { AssetType.vehicle => context.tr('Véhicule', 'مركبة'), AssetType.machine => context.tr('Machine', 'آلة'), AssetType.realEstate => context.tr('Immobilier', 'عقار') };
  String _status(BuildContext context, AssetStatus status) => switch (status) { AssetStatus.available => context.tr('Disponible', 'متاح'), AssetStatus.inUse => context.tr('En utilisation', 'قيد الاستعمال'), AssetStatus.rented => context.tr('Loué', 'مكترى'), AssetStatus.underMaintenance => context.tr('Maintenance', 'صيانة'), AssetStatus.outOfService => context.tr('Hors service', 'خارج الخدمة'), AssetStatus.damaged => context.tr('Endommagé', 'متضرر'), AssetStatus.disposed => context.tr('Réformé', 'متخلى عنه'), AssetStatus.sold => context.tr('Vendu', 'مباع'), AssetStatus.archived => context.tr('Archivé', 'مؤرشف') };
}
