import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/app_document.dart';
import '../../models/stock.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';
import '../../widgets/document_editor.dart';

class StockScreen extends StatefulWidget {
  const StockScreen({super.key});

  @override
  State<StockScreen> createState() => _StockScreenState();
}

class _StockScreenState extends State<StockScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _search = TextEditingController();
  bool _alertsOnly = false;

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
            Tab(text: context.tr('Articles', 'المواد')),
            Tab(text: context.tr('Historique', 'السجل')),
            Tab(text: context.tr('Demandes', 'الطلبات')),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabs,
            children: [
              _articles(context),
              _history(context),
              _requests(context),
            ],
          ),
        ),
      ],
    );
  }

  Widget _articles(BuildContext context) {
    final state = context.watch<AppState>();
    final q = _search.text.trim().toLowerCase();
    final items = state.articles.where((article) {
      if (_alertsOnly && !article.isLowStock) return false;
      if (q.isEmpty) return true;
      return article.reference.toLowerCase().contains(q) ||
          article.serialNumber.toLowerCase().contains(q) ||
          article.barcode.toLowerCase().contains(q) ||
          article.designation.toLowerCase().contains(q) ||
          article.designationAr.contains(q) ||
          article.category.toLowerCase().contains(q);
    }).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(child: Text(context.tr('Gestion du stock', 'تدبير المخزون'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900))),
            IconButton.outlined(onPressed: () => _scan(context), icon: const Icon(Icons.qr_code_scanner)),
            const SizedBox(width: 6),
            if (state.hasPermission(Permissions.createArticle)) IconButton.filled(onPressed: () => _articleForm(context), icon: const Icon(Icons.add)),
          ],
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _search,
          onChanged: (_) => setState(() {}),
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.search),
            suffixIcon: IconButton(icon: const Icon(Icons.qr_code_scanner), onPressed: () => _scan(context)),
            hintText: context.tr('Référence, série, code-barres, désignation...', 'المرجع، الرقم التسلسلي، الباركود، التسمية...'),
          ),
        ),
        SwitchListTile.adaptive(
          contentPadding: EdgeInsets.zero,
          title: Text(context.tr('Afficher uniquement les alertes de stock', 'إظهار تنبيهات المخزون فقط')),
          value: _alertsOnly,
          onChanged: (value) => setState(() => _alertsOnly = value),
        ),
        if (items.isEmpty)
          EmptyState(icon: Icons.inventory_2_outlined, title: context.tr('Aucun article trouvé', 'لم يتم العثور على مادة'))
        else
          ...items.map((article) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SectionCard(
                  child: InkWell(
                    onTap: () => _articleDetails(context, article),
                    child: Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: article.isLowStock ? Colors.orange.withOpacity(.15) : null,
                          child: Icon(Icons.inventory_2_outlined, color: article.isLowStock ? Colors.orange : null),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(context.isArabic ? article.designationAr : article.designation, style: const TextStyle(fontWeight: FontWeight.w800)),
                            Text('${article.reference} · SN: ${article.serialNumber}', style: Theme.of(context).textTheme.bodySmall),
                            Text('${context.tr('Code', 'الباركود')}: ${article.barcode}', style: Theme.of(context).textTheme.bodySmall),
                            const SizedBox(height: 5),
                            Text('${context.tr('Quantité', 'الكمية')}: ${article.quantity} · ${context.tr('Seuil', 'الحد')}: ${article.minimumQuantity}', style: TextStyle(fontWeight: FontWeight.w700, color: article.isLowStock ? Colors.orange.shade700 : null)),
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

  Widget _history(BuildContext context) {
    final state = context.watch<AppState>();
    if (state.movements.isEmpty) return Center(child: Text(context.tr('Aucun mouvement.', 'لا توجد حركة.')));
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: state.movements.length,
      itemBuilder: (context, index) {
        final m = state.movements[index];
        final entry = m.type == MovementType.entry;
        return Card(
          child: ListTile(
            leading: CircleAvatar(backgroundColor: (entry ? Colors.green : Colors.red).withOpacity(.12), child: Icon(entry ? Icons.south_west : Icons.north_east, color: entry ? Colors.green : Colors.red)),
            title: Text(context.isArabic ? m.articleDesignationAr : m.articleDesignation),
            subtitle: Text('${entry ? context.tr('Entrée', 'دخول') : context.tr('Sortie', 'خروج')} · ${m.quantity}\n${m.reason} · ${formatDate(m.date)}'),
            isThreeLine: true,
            trailing: m.documents.isEmpty ? null : const Icon(Icons.attach_file),
          ),
        );
      },
    );
  }

  Widget _requests(BuildContext context) {
    final state = context.watch<AppState>();
    if (state.supplyRequests.isEmpty) return Center(child: Text(context.tr('Aucune demande.', 'لا توجد طلبات.')));
    return ListView(
      padding: const EdgeInsets.all(16),
      children: state.supplyRequests.map((r) {
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(context.isArabic ? r.articleDesignationAr : r.articleDesignation, style: const TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 4),
              Text('${context.tr('Quantité', 'الكمية')}: ${r.requestedQuantity} · ${r.requester}'),
              Text(r.reason),
              const SizedBox(height: 8),
              Row(children: [
                Chip(label: Text(_requestStatus(context, r.status))),
                const Spacer(),
                if (r.status == SupplyRequestStatus.pending && state.hasPermission(Permissions.validateSupplyRequest)) ...[
                  IconButton(onPressed: () => state.setSupplyRequestStatus(r.id, SupplyRequestStatus.approved), icon: const Icon(Icons.check_circle_outline, color: Colors.green)),
                  IconButton(onPressed: () => state.setSupplyRequestStatus(r.id, SupplyRequestStatus.rejected), icon: const Icon(Icons.cancel_outlined, color: Colors.red)),
                ],
              ]),
            ]),
          ),
        );
      }).toList(),
    );
  }

  Future<void> _scan(BuildContext context) async {
    final result = await Navigator.push<String>(context, MaterialPageRoute(builder: (_) => const _BarcodeScannerScreen()));
    if (result != null && mounted) {
      _search.text = result;
      setState(() {});
    }
  }

  void _articleDetails(BuildContext context, StockArticle article) {
    final state = context.read<AppState>();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheetContext) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: .88,
        maxChildSize: .96,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 24),
          children: [
            Text(context.isArabic ? article.designationAr : article.designation, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
            Text(article.reference),
            const SizedBox(height: 12),
            ListTile(contentPadding: EdgeInsets.zero, title: Text(context.tr('N° série', 'الرقم التسلسلي')), subtitle: Text(article.serialNumber)),
            ListTile(contentPadding: EdgeInsets.zero, title: Text(context.tr('Code-barres', 'الباركود')), subtitle: Text(article.barcode)),
            ListTile(contentPadding: EdgeInsets.zero, title: Text(context.tr('Catégorie', 'الفئة')), subtitle: Text(context.isArabic ? article.categoryAr : article.category)),
            ListTile(contentPadding: EdgeInsets.zero, title: Text(context.tr('Emplacement', 'المكان')), subtitle: Text(context.isArabic ? article.locationAr : article.location)),
            ListTile(contentPadding: EdgeInsets.zero, title: Text(context.tr('Stock', 'المخزون')), subtitle: Text('${article.quantity} / ${article.minimumQuantity}')),
            DocumentEditor(documents: article.documents, onChanged: (docs) { article.documents = docs; state.saveArticle(article); }),
            const SizedBox(height: 12),
            Wrap(spacing: 8, runSpacing: 8, children: [
              if (state.hasPermission(Permissions.updateArticle)) OutlinedButton.icon(onPressed: () { Navigator.pop(sheetContext); _articleForm(context, article: article); }, icon: const Icon(Icons.edit_outlined), label: Text(context.tr('Modifier', 'تعديل'))),
              if (state.hasPermission(Permissions.createStockEntry)) FilledButton.tonalIcon(onPressed: () => _movementForm(context, article, MovementType.entry), icon: const Icon(Icons.add_box_outlined), label: Text(context.tr('Entrée', 'دخول'))),
              if (state.hasPermission(Permissions.createStockExit)) FilledButton.tonalIcon(onPressed: () => _movementForm(context, article, MovementType.exit), icon: const Icon(Icons.indeterminate_check_box_outlined), label: Text(context.tr('Sortie', 'خروج'))),
              if (state.hasPermission(Permissions.createSupplyRequest)) OutlinedButton.icon(onPressed: () => _requestForm(context, article), icon: const Icon(Icons.request_page_outlined), label: Text(context.tr('Demande', 'طلب'))),
              if (state.hasPermission(Permissions.deleteArticle)) OutlinedButton.icon(onPressed: () async { final ok = await confirmAction(context, fr: 'Supprimer cet article ?', ar: 'حذف هذه المادة؟'); if (ok && context.mounted) { state.deleteArticle(article.id); Navigator.pop(sheetContext); } }, icon: const Icon(Icons.delete_outline, color: Colors.red), label: Text(context.tr('Supprimer', 'حذف'))),
            ]),
          ],
        ),
      ),
    );
  }

  Future<void> _articleForm(BuildContext context, {StockArticle? article}) async {
    final state = context.read<AppState>();
    final reference = TextEditingController(text: article?.reference ?? '');
    final serial = TextEditingController(text: article?.serialNumber ?? '');
    final barcode = TextEditingController(text: article?.barcode ?? '');
    final designation = TextEditingController(text: article?.designation ?? '');
    final designationAr = TextEditingController(text: article?.designationAr ?? '');
    final category = TextEditingController(text: article?.category ?? '');
    final categoryAr = TextEditingController(text: article?.categoryAr ?? '');
    final qty = TextEditingController(text: '${article?.quantity ?? 0}');
    final minQty = TextEditingController(text: '${article?.minimumQuantity ?? 0}');
    final location = TextEditingController(text: article?.location ?? '');
    final locationAr = TextEditingController(text: article?.locationAr ?? '');
    var unit = article?.unit ?? StockUnit.unite;
    var docs = [...?article?.documents];

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setLocal) => Padding(
          padding: EdgeInsets.fromLTRB(18, 0, 18, 18 + MediaQuery.of(context).viewInsets.bottom),
          child: SingleChildScrollView(
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Text(article == null ? context.tr('Ajouter un article', 'إضافة مادة') : context.tr('Modifier l’article', 'تعديل المادة'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 14),
              TextField(controller: reference, decoration: InputDecoration(labelText: context.tr('Référence', 'المرجع'))), const SizedBox(height: 9),
              TextField(controller: serial, decoration: InputDecoration(labelText: context.tr('Numéro de série', 'الرقم التسلسلي'))), const SizedBox(height: 9),
              Row(children: [Expanded(child: TextField(controller: barcode, decoration: InputDecoration(labelText: context.tr('Code-barres', 'الباركود')))), IconButton(onPressed: () async { final v = await Navigator.push<String>(context, MaterialPageRoute(builder: (_) => const _BarcodeScannerScreen())); if (v != null) setLocal(() => barcode.text = v); }, icon: const Icon(Icons.qr_code_scanner))]),
              const SizedBox(height: 9),
              TextField(controller: designation, decoration: const InputDecoration(labelText: 'Désignation FR')), const SizedBox(height: 9),
              TextField(controller: designationAr, decoration: const InputDecoration(labelText: 'التسمية AR')), const SizedBox(height: 9),
              TextField(controller: category, decoration: const InputDecoration(labelText: 'Catégorie FR')), const SizedBox(height: 9),
              TextField(controller: categoryAr, decoration: const InputDecoration(labelText: 'الفئة AR')), const SizedBox(height: 9),
              Row(children: [Expanded(child: TextField(controller: qty, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: context.tr('Quantité', 'الكمية')))), const SizedBox(width: 8), Expanded(child: TextField(controller: minQty, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: context.tr('Seuil min.', 'الحد الأدنى'))))]),
              const SizedBox(height: 9),
              DropdownButtonFormField<StockUnit>(value: unit, decoration: InputDecoration(labelText: context.tr('Unité', 'الوحدة')), items: StockUnit.values.map((u) => DropdownMenuItem(value: u, child: Text(u.name.toUpperCase()))).toList(), onChanged: (v) => setLocal(() => unit = v ?? unit)),
              const SizedBox(height: 9),
              TextField(controller: location, decoration: const InputDecoration(labelText: 'Emplacement FR')), const SizedBox(height: 9),
              TextField(controller: locationAr, decoration: const InputDecoration(labelText: 'المكان AR')), const SizedBox(height: 12),
              DocumentEditor(documents: docs, onChanged: (v) => setLocal(() => docs = v)),
              const SizedBox(height: 16),
              FilledButton(onPressed: () { if (reference.text.trim().isEmpty || designation.text.trim().isEmpty) return; state.saveArticle(StockArticle(id: article?.id ?? state.nextArticleId(), reference: reference.text.trim().toUpperCase(), serialNumber: serial.text.trim(), barcode: barcode.text.trim(), designation: designation.text.trim(), designationAr: designationAr.text.trim(), category: category.text.trim(), categoryAr: categoryAr.text.trim(), quantity: int.tryParse(qty.text) ?? 0, minimumQuantity: int.tryParse(minQty.text) ?? 0, unit: unit, location: location.text.trim(), locationAr: locationAr.text.trim(), updatedAt: DateTime.now(), documents: docs)); Navigator.pop(context); }, child: Text(context.tr('Enregistrer', 'حفظ'))),
            ]),
          ),
        ),
      ),
    );
  }

  Future<void> _movementForm(BuildContext context, StockArticle article, MovementType type) async {
    final qty = TextEditingController(); final reason = TextEditingController(); final partner = TextEditingController(); final ref = TextEditingController(); var docs = <AppDocument>[];
    await showModalBottomSheet<void>(context: context, isScrollControlled: true, showDragHandle: true, builder: (context) => StatefulBuilder(builder: (context, setLocal) => Padding(padding: EdgeInsets.fromLTRB(18, 0, 18, 18 + MediaQuery.of(context).viewInsets.bottom), child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Text(type == MovementType.entry ? context.tr('Entrée de stock', 'إدخال المخزون') : context.tr('Sortie de stock', 'إخراج المخزون'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)), const SizedBox(height: 12),
      TextField(controller: qty, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: context.tr('Quantité', 'الكمية'))), const SizedBox(height: 9),
      TextField(controller: reason, decoration: InputDecoration(labelText: context.tr('Motif', 'السبب'))), const SizedBox(height: 9),
      TextField(controller: partner, decoration: InputDecoration(labelText: context.tr('Fournisseur / bénéficiaire', 'المورد / المستفيد'))), const SizedBox(height: 9),
      TextField(controller: ref, decoration: InputDecoration(labelText: context.tr('Référence opération', 'مرجع العملية'))), const SizedBox(height: 12),
      DocumentEditor(documents: docs, onChanged: (v) => setLocal(() => docs = v)), const SizedBox(height: 14),
      FilledButton(onPressed: () { try { context.read<AppState>().addStockMovement(articleId: article.id, type: type, quantity: int.tryParse(qty.text) ?? 0, reason: reason.text.trim(), partner: partner.text.trim(), reference: ref.text.trim(), documents: docs); Navigator.pop(context); } on StateError { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('Stock insuffisant.', 'المخزون غير كافٍ.')))); } }, child: Text(context.tr('Valider', 'تأكيد'))),
    ])))));
  }

  Future<void> _requestForm(BuildContext context, StockArticle article) async {
    final qty = TextEditingController(); final reason = TextEditingController(); var docs = <AppDocument>[];
    await showModalBottomSheet<void>(context: context, isScrollControlled: true, showDragHandle: true, builder: (context) => StatefulBuilder(builder: (context, setLocal) => Padding(padding: EdgeInsets.fromLTRB(18, 0, 18, 18 + MediaQuery.of(context).viewInsets.bottom), child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Text(context.tr('Demande de fourniture', 'طلب تموين'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)), const SizedBox(height: 12),
      TextField(controller: qty, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: context.tr('Quantité demandée', 'الكمية المطلوبة'))), const SizedBox(height: 9),
      TextField(controller: reason, decoration: InputDecoration(labelText: context.tr('Motif', 'السبب'))), const SizedBox(height: 12),
      DocumentEditor(documents: docs, onChanged: (v) => setLocal(() => docs = v)), const SizedBox(height: 14),
      FilledButton(onPressed: () { context.read<AppState>().createSupplyRequest(articleId: article.id, quantity: int.tryParse(qty.text) ?? 0, reason: reason.text.trim(), documents: docs); Navigator.pop(context); }, child: Text(context.tr('Envoyer', 'إرسال'))),
    ])))));
  }

  String _requestStatus(BuildContext context, SupplyRequestStatus status) => switch (status) { SupplyRequestStatus.pending => context.tr('En attente', 'قيد الانتظار'), SupplyRequestStatus.approved => context.tr('Approuvée', 'مقبول'), SupplyRequestStatus.rejected => context.tr('Refusée', 'مرفوض') };
}

class _BarcodeScannerScreen extends StatefulWidget {
  const _BarcodeScannerScreen();
  @override
  State<_BarcodeScannerScreen> createState() => _BarcodeScannerScreenState();
}

class _BarcodeScannerScreenState extends State<_BarcodeScannerScreen> {
  bool _done = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('Scanner le code-barres', 'مسح الباركود'))),
      body: MobileScanner(
        onDetect: (capture) {
          if (_done || capture.barcodes.isEmpty) return;
          final value = capture.barcodes.first.rawValue;
          if (value == null || value.isEmpty) return;
          _done = true;
          Navigator.pop(context, value);
        },
      ),
    );
  }
}
