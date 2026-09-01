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
  const StockScreen({
    super.key,
  });

  @override
  State<StockScreen> createState() => _StockScreenState();
}

class _StockScreenState extends State<StockScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _search = TextEditingController();

  bool _alertsOnly = false;

  @override
  void initState() {
    super.initState();

    _tabs = TabController(
      length: 3,
      vsync: this,
    );
  }

  @override
  void dispose() {
    _tabs.dispose();
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(
    BuildContext context,
  ) {
    return Column(
      children: [
        TabBar(
          controller: _tabs,
          tabs: [
            Tab(
              text: context.tr(
                'Articles',
                'المواد',
              ),
            ),
            Tab(
              text: context.tr(
                'Historique',
                'السجل',
              ),
            ),
            Tab(
              text: context.tr(
                'Demandes',
                'الطلبات',
              ),
            ),
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

  Widget _articles(
    BuildContext context,
  ) {
    final state = context.watch<AppState>();

    final query = _search.text.trim().toLowerCase();

    final items = state.articles.where(
      (article) {
        if (_alertsOnly && !article.isLowStock) {
          return false;
        }

        if (query.isEmpty) {
          return true;
        }

        return article.reference.toLowerCase().contains(query) ||
            article.barcode.toLowerCase().contains(query) ||
            article.brand.toLowerCase().contains(query) ||
            article.designation.toLowerCase().contains(query) ||
            article.designationAr.toLowerCase().contains(query) ||
            article.category.toLowerCase().contains(query) ||
            article.categoryAr.toLowerCase().contains(query);
      },
    ).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                context.tr(
                  'Gestion du stock',
                  'تدبير المخزون',
                ),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
            ),
            IconButton.outlined(
              tooltip: context.tr(
                'Scanner un code-barres',
                'مسح باركود',
              ),
              onPressed: () => _scanToSearch(
                context,
              ),
              icon: const Icon(
                Icons.qr_code_scanner,
              ),
            ),
            const SizedBox(
              width: 6,
            ),
            if (state.hasPermission(
              Permissions.createArticle,
            ))
              IconButton.filled(
                tooltip: context.tr(
                  'Ajouter un article',
                  'إضافة مادة',
                ),
                onPressed: () => _articleForm(
                  context,
                ),
                icon: const Icon(
                  Icons.add,
                ),
              ),
          ],
        ),
        const SizedBox(
          height: 12,
        ),
        TextField(
          controller: _search,
          onChanged: (_) => setState(() {}),
          decoration: InputDecoration(
            prefixIcon: const Icon(
              Icons.search,
            ),
            suffixIcon: IconButton(
              tooltip: context.tr(
                'Scanner le code-barres',
                'مسح الباركود',
              ),
              icon: const Icon(
                Icons.qr_code_scanner,
              ),
              onPressed: () => _scanToSearch(
                context,
              ),
            ),
            hintText: context.tr(
              'Référence, code-barres, marque ou désignation',
              'المرجع أو الباركود أو العلامة أو التسمية',
            ),
          ),
        ),
        SwitchListTile.adaptive(
          contentPadding: EdgeInsets.zero,
          title: Text(
            context.tr(
              'Afficher uniquement les alertes de stock',
              'إظهار تنبيهات المخزون فقط',
            ),
          ),
          value: _alertsOnly,
          onChanged: (value) => setState(
            () => _alertsOnly = value,
          ),
        ),
        if (items.isEmpty)
          EmptyState(
            icon: Icons.inventory_2_outlined,
            title: context.tr(
              'Aucun article trouvé',
              'لم يتم العثور على أي مادة',
            ),
          )
        else
          ...items.map(
            (article) => Padding(
              padding: const EdgeInsets.only(
                bottom: 10,
              ),
              child: SectionCard(
                child: InkWell(
                  borderRadius: BorderRadius.circular(
                    12,
                  ),
                  onTap: () => _articleDetails(
                    context,
                    article,
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor:
                            article.isLowStock ? const Color(0x26FF9800) : null,
                        child: Icon(
                          Icons.inventory_2_outlined,
                          color: article.isLowStock ? Colors.orange : null,
                        ),
                      ),
                      const SizedBox(
                        width: 12,
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              context.isArabic
                                  ? article.designationAr
                                  : article.designation,
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            Text(
                              '${article.reference} · ${article.brand}',
                              style: Theme.of(
                                context,
                              ).textTheme.bodySmall,
                            ),
                            Text(
                              '${context.tr('Code-barres', 'الباركود')}: ${article.barcode}',
                              style: Theme.of(
                                context,
                              ).textTheme.bodySmall,
                            ),
                            const SizedBox(
                              height: 5,
                            ),
                            Text(
                              '${context.tr('Quantité', 'الكمية')}: ${article.quantity} · ${context.tr('Seuil', 'الحد')}: ${article.minimumQuantity}',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: article.isLowStock
                                    ? Colors.orange.shade700
                                    : null,
                              ),
                            ),
                            Text(
                              '${context.tr('PU TTC', 'ثمن الوحدة شامل الضريبة')}: ${article.unitPriceTtc.toStringAsFixed(2)} DH',
                              style: Theme.of(
                                context,
                              ).textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _history(
    BuildContext context,
  ) {
    final state = context.watch<AppState>();

    if (state.movements.isEmpty) {
      return Center(
        child: Text(
          context.tr(
            'Aucun mouvement.',
            'لا توجد حركة.',
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: state.movements.length,
      itemBuilder: (
        context,
        index,
      ) {
        final movement = state.movements[index];

        final entry = movement.type == MovementType.entry;

        return Card(
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor:
                  entry ? Colors.green.shade100 : Colors.red.shade100,
              child: Icon(
                entry ? Icons.south_west : Icons.north_east,
                color: entry ? Colors.green : Colors.red,
              ),
            ),
            title: Text(
              context.isArabic
                  ? movement.articleDesignationAr
                  : movement.articleDesignation,
            ),
            subtitle: Text(
              '${entry ? context.tr('Entrée', 'إدخال') : context.tr('Sortie', 'إخراج')} · ${movement.quantity}\n'
              '${movement.reason}\n'
              '${context.tr('PU HT', 'ثمن الوحدة بدون الضريبة')}: ${movement.unitPriceHt.toStringAsFixed(2)} DH · '
              '${context.tr('TVA', 'الضريبة')}: ${movement.vatRate.toStringAsFixed(2)}% · '
              '${context.tr('Total TTC', 'الإجمالي شامل الضريبة')}: ${movement.totalTtc.toStringAsFixed(2)} DH\n'
              '${formatDate(movement.date)} · ${movement.performedBy}',
            ),
            isThreeLine: true,
            trailing: movement.documents.isEmpty
                ? null
                : const Icon(
                    Icons.attach_file,
                  ),
          ),
        );
      },
    );
  }

  Widget _requests(
    BuildContext context,
  ) {
    final state = context.watch<AppState>();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                context.tr(
                  'Demandes de fourniture',
                  'طلبات التموين',
                ),
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
            ),
            if (state.hasPermission(
              Permissions.createSupplyRequest,
            ))
              IconButton.filled(
                tooltip: context.tr(
                  'Nouvelle demande',
                  'طلب جديد',
                ),
                onPressed: () => _requestForm(
                  context,
                ),
                icon: const Icon(
                  Icons.add,
                ),
              ),
          ],
        ),
        const SizedBox(
          height: 12,
        ),
        if (state.supplyRequests.isEmpty)
          EmptyState(
            icon: Icons.request_page_outlined,
            title: context.tr(
              'Aucune demande',
              'لا توجد طلبات',
            ),
          )
        else
          ...state.supplyRequests.map(
            (request) => _requestCard(
              context,
              state,
              request,
            ),
          ),
        const SizedBox(
          height: 20,
        ),
        Row(
          children: [
            const Icon(
              Icons.notifications_active_outlined,
              color: Colors.orange,
            ),
            const SizedBox(
              width: 8,
            ),
            Expanded(
              child: Text(
                context.tr(
                  'Besoins de réapprovisionnement',
                  'احتياجات إعادة التزويد',
                ),
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
            ),
          ],
        ),
        const SizedBox(
          height: 10,
        ),
        if (state.restockAlerts.isEmpty)
          Text(
            context.tr(
              'Aucun besoin de réapprovisionnement signalé.',
              'لا توجد حاجة لإعادة التزويد.',
            ),
          )
        else
          ...state.restockAlerts.map(
            (alert) {
              final article = state.articles.firstWhere(
                (item) => item.id == alert.articleId,
              );

              final enough = article.quantity >= alert.requestedQuantity;

              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(
                    14,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        context.isArabic
                            ? alert.articleDesignationAr
                            : alert.articleDesignation,
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(
                        height: 4,
                      ),
                      Text(
                        '${context.tr('Demandé', 'المطلوب')}: ${alert.requestedQuantity} · '
                        '${context.tr('Stock actuel', 'المخزون الحالي')}: ${article.quantity}',
                      ),
                      Text(
                        '${alert.requester} · ${formatDate(alert.createdAt)}',
                        style: Theme.of(
                          context,
                        ).textTheme.bodySmall,
                      ),
                      const SizedBox(
                        height: 8,
                      ),
                      if (alert.status == RestockAlertStatus.readyNotified)
                        Chip(
                          label: Text(
                            context.tr(
                              'Demandeur notifié',
                              'تم إشعار مقدم الطلب',
                            ),
                          ),
                        )
                      else if (state.hasPermission(
                        Permissions.validateSupplyRequest,
                      ))
                        FilledButton.tonalIcon(
                          onPressed: enough
                              ? () {
                                  try {
                                    state.notifyRestockReady(
                                      alert.id,
                                    );

                                    _message(
                                      context,
                                      context.tr(
                                        'Le demandeur a été notifié.',
                                        'تم إشعار مقدم الطلب.',
                                      ),
                                    );
                                  } on StateError catch (error) {
                                    _stateError(
                                      context,
                                      error,
                                    );
                                  }
                                }
                              : null,
                          icon: const Icon(
                            Icons.inventory_outlined,
                          ),
                          label: Text(
                            enough
                                ? context.tr(
                                    'Notifier : quantité prête',
                                    'إشعار: الكمية جاهزة',
                                  )
                                : context.tr(
                                    'Stock encore insuffisant',
                                    'المخزون ما زال غير كافٍ',
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

  Widget _requestCard(
    BuildContext context,
    AppState state,
    SupplyRequest request,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              context.isArabic
                  ? request.articleDesignationAr
                  : request.articleDesignation,
              style: const TextStyle(
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(
              height: 4,
            ),
            Text(
              '${context.tr('Quantité', 'الكمية')}: ${request.requestedQuantity}',
            ),
            Text(
              request.reason,
            ),
            Text(
              '${request.requester} · ${formatDate(request.requestDate)}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            if (request.rejectionReason?.isNotEmpty == true) ...[
              const SizedBox(
                height: 6,
              ),
              Text(
                '${context.tr('Motif du refus', 'سبب الرفض')}: ${request.rejectionReason}',
                style: const TextStyle(
                  color: Colors.redAccent,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
            const SizedBox(
              height: 8,
            ),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Chip(
                  label: Text(
                    _requestStatus(
                      context,
                      request.status,
                    ),
                  ),
                ),
                if (request.status == SupplyRequestStatus.pending &&
                    state.hasPermission(
                      Permissions.validateSupplyRequest,
                    ))
                  IconButton.filledTonal(
                    tooltip: context.tr(
                      'Accepter',
                      'قبول',
                    ),
                    onPressed: () {
                      try {
                        state.setSupplyRequestStatus(
                          request.id,
                          SupplyRequestStatus.approved,
                        );

                        _message(
                          context,
                          context.tr(
                            'Demande acceptée.',
                            'تم قبول الطلب.',
                          ),
                        );
                      } on StateError catch (error) {
                        _stateError(
                          context,
                          error,
                        );
                      }
                    },
                    icon: const Icon(
                      Icons.check_circle_outline,
                      color: Colors.green,
                    ),
                  ),
                if (request.status == SupplyRequestStatus.pending &&
                    state.hasPermission(
                      Permissions.rejectSupplyRequest,
                    ))
                  IconButton.filledTonal(
                    tooltip: context.tr(
                      'Refuser',
                      'رفض',
                    ),
                    onPressed: () => _rejectRequest(
                      context,
                      request,
                    ),
                    icon: const Icon(
                      Icons.cancel_outlined,
                      color: Colors.red,
                    ),
                  ),
                if (request.status == SupplyRequestStatus.approved &&
                    state.currentUser?.id == request.requesterId)
                  FilledButton.icon(
                    onPressed: () {
                      try {
                        state.confirmSupplyRequestReceived(
                          request.id,
                        );

                        _message(
                          context,
                          context.tr(
                            'Réception confirmée. La sortie a été enregistrée automatiquement.',
                            'تم تأكيد الاستلام وتسجيل الخروج تلقائياً.',
                          ),
                        );
                      } on StateError catch (error) {
                        _stateError(
                          context,
                          error,
                        );
                      }
                    },
                    icon: const Icon(
                      Icons.inventory_2_outlined,
                    ),
                    label: Text(
                      context.tr(
                        'Reçu',
                        'تم الاستلام',
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _scanToSearch(
    BuildContext context,
  ) async {
    final result = await Navigator.push<String>(
      context,
      MaterialPageRoute(
        builder: (_) => const _BarcodeScannerScreen(),
      ),
    );

    if (result != null && mounted) {
      _search.text = result;
      setState(() {});
    }
  }

  Future<String?> _scanBarcode(
    BuildContext context,
  ) =>
      Navigator.push<String>(
        context,
        MaterialPageRoute(
          builder: (_) => const _BarcodeScannerScreen(),
        ),
      );

  void _articleDetails(
    BuildContext context,
    StockArticle article,
  ) {
    final state = context.read<AppState>();

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheetContext) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: .9,
        maxChildSize: .97,
        builder: (
          _,
          controller,
        ) =>
            ListView(
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
                  ? article.designationAr
                  : article.designation,
              style: Theme.of(
                sheetContext,
              ).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            Text(
              '${article.reference} · ${article.brand}',
            ),
            const SizedBox(
              height: 12,
            ),
            _info(
              sheetContext,
              sheetContext.tr(
                'Code-barres',
                'الباركود',
              ),
              article.barcode,
            ),
            _info(
              sheetContext,
              sheetContext.tr(
                'Catégorie',
                'الفئة',
              ),
              sheetContext.isArabic ? article.categoryAr : article.category,
            ),
            _info(
              sheetContext,
              sheetContext.tr(
                'Emplacement',
                'المكان',
              ),
              sheetContext.isArabic ? article.locationAr : article.location,
            ),
            _info(
              sheetContext,
              sheetContext.tr(
                'Stock',
                'المخزون',
              ),
              '${article.quantity} / ${article.minimumQuantity} ${article.unit.name.toUpperCase()}',
            ),
            _info(
              sheetContext,
              sheetContext.tr(
                'Prix unitaire HT',
                'ثمن الوحدة بدون الضريبة',
              ),
              '${article.unitPriceHt.toStringAsFixed(2)} DH',
            ),
            _info(
              sheetContext,
              sheetContext.tr(
                'TVA',
                'الضريبة',
              ),
              '${article.vatRate.toStringAsFixed(2)} %',
            ),
            _info(
              sheetContext,
              sheetContext.tr(
                'Prix unitaire TTC',
                'ثمن الوحدة شامل الضريبة',
              ),
              '${article.unitPriceTtc.toStringAsFixed(2)} DH',
            ),
            _info(
              sheetContext,
              sheetContext.tr(
                'Total HT du stock',
                'إجمالي المخزون بدون الضريبة',
              ),
              '${article.totalHt.toStringAsFixed(2)} DH',
            ),
            _info(
              sheetContext,
              sheetContext.tr(
                'Total TTC du stock',
                'إجمالي المخزون شامل الضريبة',
              ),
              '${article.totalTtc.toStringAsFixed(2)} DH',
            ),
            const SizedBox(
              height: 12,
            ),
            DocumentEditor(
              documents: article.documents,
              onChanged: (documents) {
                article.documents = documents;
                state.saveArticle(
                  article,
                );
              },
            ),
            const SizedBox(
              height: 12,
            ),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (state.hasPermission(
                  Permissions.updateArticle,
                ))
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(
                        sheetContext,
                      );

                      _articleForm(
                        context,
                        article: article,
                      );
                    },
                    icon: const Icon(
                      Icons.edit_outlined,
                    ),
                    label: Text(
                      sheetContext.tr(
                        'Modifier',
                        'تعديل',
                      ),
                    ),
                  ),
                if (state.hasPermission(
                  Permissions.createStockEntry,
                ))
                  FilledButton.tonalIcon(
                    onPressed: () => _movementForm(
                      context,
                      article,
                      MovementType.entry,
                    ),
                    icon: const Icon(
                      Icons.add_box_outlined,
                    ),
                    label: Text(
                      sheetContext.tr(
                        'Entrée',
                        'إدخال',
                      ),
                    ),
                  ),
                if (state.hasPermission(
                  Permissions.createStockExit,
                ))
                  FilledButton.tonalIcon(
                    onPressed: () => _movementForm(
                      context,
                      article,
                      MovementType.exit,
                    ),
                    icon: const Icon(
                      Icons.indeterminate_check_box_outlined,
                    ),
                    label: Text(
                      sheetContext.tr(
                        'Sortie',
                        'إخراج',
                      ),
                    ),
                  ),
                if (state.hasPermission(
                  Permissions.createSupplyRequest,
                ))
                  OutlinedButton.icon(
                    onPressed: () => _requestForm(
                      context,
                      initialArticle: article,
                    ),
                    icon: const Icon(
                      Icons.request_page_outlined,
                    ),
                    label: Text(
                      sheetContext.tr(
                        'Demande',
                        'طلب',
                      ),
                    ),
                  ),
                if (state.hasPermission(
                  Permissions.deleteArticle,
                ))
                  OutlinedButton.icon(
                    onPressed: () async {
                      final ok = await confirmAction(
                        context,
                        fr: 'Supprimer cet article ?',
                        ar: 'حذف هذه المادة؟',
                      );

                      if (ok && context.mounted) {
                        state.deleteArticle(
                          article.id,
                        );

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
        ),
      ),
    );
  }

  Widget _info(
    BuildContext context,
    String label,
    String value,
  ) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(
        label,
        style: Theme.of(context).textTheme.bodySmall,
      ),
      subtitle: Text(
        value,
        style: const TextStyle(
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Future<void> _articleForm(
    BuildContext context, {
    StockArticle? article,
  }) async {
    final state = context.read<AppState>();

    final formKey = GlobalKey<FormState>();

    final reference = TextEditingController(
      text: article?.reference ?? '',
    );
    final barcode = TextEditingController(
      text: article?.barcode ?? '',
    );
    final brand = TextEditingController(
      text: article?.brand ?? '',
    );
    final designation = TextEditingController(
      text: article?.designation ?? '',
    );
    final designationAr = TextEditingController(
      text: article?.designationAr ?? '',
    );
    final category = TextEditingController(
      text: article?.category ?? '',
    );
    final categoryAr = TextEditingController(
      text: article?.categoryAr ?? '',
    );
    final quantity = TextEditingController(
      text: '${article?.quantity ?? 0}',
    );
    final minimumQuantity = TextEditingController(
      text: '${article?.minimumQuantity ?? 0}',
    );
    final location = TextEditingController(
      text: article?.location ?? '',
    );
    final locationAr = TextEditingController(
      text: article?.locationAr ?? '',
    );
    final unitPriceHt = TextEditingController(
      text: '${article?.unitPriceHt ?? 0}',
    );
    final vatRate = TextEditingController(
      text: '${article?.vatRate ?? 20}',
    );

    var unit = article?.unit ?? StockUnit.unite;

    var documents = [...?article?.documents];

    var priceRefresh = 0;

    try {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (sheetContext) => StatefulBuilder(
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
                  MediaQuery.of(
                    sheetContext,
                  ).viewInsets.bottom,
            ),
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      article == null
                          ? sheetContext.tr(
                              'Ajouter un article',
                              'إضافة مادة',
                            )
                          : sheetContext.tr(
                              'Modifier l’article',
                              'تعديل المادة',
                            ),
                      style: Theme.of(
                        sheetContext,
                      ).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(
                      height: 14,
                    ),
                    TextFormField(
                      controller: reference,
                      validator: (value) => _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Référence',
                          'المرجع',
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: barcode,
                            validator: (value) => _required(
                              sheetContext,
                              value,
                            ),
                            decoration: InputDecoration(
                              labelText: sheetContext.tr(
                                'Code-barres',
                                'الباركود',
                              ),
                            ),
                          ),
                        ),
                        IconButton(
                          tooltip: sheetContext.tr(
                            'Scanner',
                            'مسح',
                          ),
                          onPressed: () async {
                            final value = await _scanBarcode(
                              sheetContext,
                            );

                            if (value != null) {
                              setLocal(
                                () => barcode.text = value,
                              );
                            }
                          },
                          icon: const Icon(
                            Icons.qr_code_scanner,
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.only(
                        bottom: 9,
                      ),
                      child: Text(
                        sheetContext.tr(
                          'Le code-barres est l’identifiant série de l’article.',
                          'الباركود هو المعرّف التسلسلي للمادة.',
                        ),
                        style: Theme.of(
                          sheetContext,
                        ).textTheme.bodySmall,
                      ),
                    ),
                    TextFormField(
                      controller: brand,
                      validator: (value) => _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Marque',
                          'العلامة',
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    TextFormField(
                      controller: designation,
                      validator: (value) => _required(
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
                    const SizedBox(
                      height: 9,
                    ),
                    TextFormField(
                      controller: designationAr,
                      textDirection: TextDirection.rtl,
                      validator: (value) => _required(
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
                    const SizedBox(
                      height: 9,
                    ),
                    TextFormField(
                      controller: category,
                      validator: (value) => _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Catégorie',
                          'الفئة بالفرنسية',
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    TextFormField(
                      controller: categoryAr,
                      textDirection: TextDirection.rtl,
                      validator: (value) => _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Catégorie en arabe',
                          'الفئة بالعربية',
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: quantity,
                            keyboardType: TextInputType.number,
                            onChanged: (_) => setLocal(
                              () => priceRefresh++,
                            ),
                            validator: (value) => _nonNegativeInt(
                              sheetContext,
                              value,
                            ),
                            decoration: InputDecoration(
                              labelText: sheetContext.tr(
                                'Quantité',
                                'الكمية',
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(
                          width: 8,
                        ),
                        Expanded(
                          child: TextFormField(
                            controller: minimumQuantity,
                            keyboardType: TextInputType.number,
                            validator: (value) => _nonNegativeInt(
                              sheetContext,
                              value,
                            ),
                            decoration: InputDecoration(
                              labelText: sheetContext.tr(
                                'Seuil min.',
                                'الحد الأدنى',
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    DropdownButtonFormField<StockUnit>(
                      initialValue: unit,
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Unité',
                          'الوحدة',
                        ),
                      ),
                      items: StockUnit.values
                          .map(
                            (
                              value,
                            ) =>
                                DropdownMenuItem<StockUnit>(
                              value: value,
                              child: Text(
                                value.name.toUpperCase(),
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (value) => setLocal(
                        () => unit = value ?? unit,
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    TextFormField(
                      controller: location,
                      validator: (value) => _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Emplacement',
                          'المكان بالفرنسية',
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    TextFormField(
                      controller: locationAr,
                      textDirection: TextDirection.rtl,
                      validator: (value) => _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Emplacement en arabe',
                          'المكان بالعربية',
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: unitPriceHt,
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                            ),
                            onChanged: (_) => setLocal(
                              () => priceRefresh++,
                            ),
                            validator: (value) => _positiveDouble(
                              sheetContext,
                              value,
                            ),
                            decoration: InputDecoration(
                              labelText: sheetContext.tr(
                                'Prix unitaire HT (DH)',
                                'ثمن الوحدة بدون الضريبة (درهم)',
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(
                          width: 8,
                        ),
                        Expanded(
                          child: TextFormField(
                            controller: vatRate,
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                            ),
                            onChanged: (_) => setLocal(
                              () => priceRefresh++,
                            ),
                            validator: (value) => _vat(
                              sheetContext,
                              value,
                            ),
                            decoration: InputDecoration(
                              labelText: sheetContext.tr(
                                'TVA (%)',
                                'الضريبة (%)',
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(
                      height: 10,
                    ),
                    Builder(
                      builder: (
                        context,
                      ) {
                        final q = int.tryParse(
                              quantity.text,
                            ) ??
                            0;

                        final ht = double.tryParse(
                              unitPriceHt.text,
                            ) ??
                            0;

                        final tva = double.tryParse(
                              vatRate.text,
                            ) ??
                            0;

                        final unitTtc = ht * (1 + tva / 100);

                        return Wrap(
                          key: ValueKey(
                            priceRefresh,
                          ),
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _priceChip(
                              sheetContext,
                              sheetContext.tr(
                                'PU TTC',
                                'ثمن الوحدة شامل الضريبة',
                              ),
                              unitTtc,
                            ),
                            _priceChip(
                              sheetContext,
                              sheetContext.tr(
                                'Total HT',
                                'الإجمالي بدون الضريبة',
                              ),
                              q * ht,
                            ),
                            _priceChip(
                              sheetContext,
                              sheetContext.tr(
                                'Total TTC',
                                'الإجمالي شامل الضريبة',
                              ),
                              q * unitTtc,
                            ),
                          ],
                        );
                      },
                    ),
                    const SizedBox(
                      height: 12,
                    ),
                    DocumentEditor(
                      documents: documents,
                      onChanged: (value) => setLocal(
                        () => documents = value,
                      ),
                    ),
                    const SizedBox(
                      height: 16,
                    ),
                    FilledButton(
                      onPressed: () {
                        if (!formKey.currentState!.validate()) {
                          return;
                        }

                        try {
                          state.saveArticle(
                            StockArticle(
                              id: article?.id ?? state.nextArticleId(),
                              reference: reference.text.trim().toUpperCase(),
                              barcode: barcode.text.trim(),
                              brand: brand.text.trim(),
                              designation: designation.text.trim(),
                              designationAr: designationAr.text.trim(),
                              category: category.text.trim(),
                              categoryAr: categoryAr.text.trim(),
                              quantity: int.parse(quantity.text),
                              minimumQuantity: int.parse(minimumQuantity.text),
                              unit: unit,
                              location: location.text.trim(),
                              locationAr: locationAr.text.trim(),
                              unitPriceHt: double.parse(unitPriceHt.text),
                              vatRate: double.parse(vatRate.text),
                              updatedAt: DateTime.now(),
                              documents: documents,
                            ),
                          );

                          Navigator.pop(
                            sheetContext,
                          );
                        } on StateError catch (error) {
                          _stateError(
                            sheetContext,
                            error,
                          );
                        }
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
        reference,
        barcode,
        brand,
        designation,
        designationAr,
        category,
        categoryAr,
        quantity,
        minimumQuantity,
        location,
        locationAr,
        unitPriceHt,
        vatRate,
      ]) {
        controller.dispose();
      }
    }
  }

  Future<void> _movementForm(
    BuildContext context,
    StockArticle article,
    MovementType type,
  ) async {
    final state = context.read<AppState>();

    final formKey = GlobalKey<FormState>();

    final quantity = TextEditingController();
    final reason = TextEditingController();
    final partner = TextEditingController();
    final reference = TextEditingController();
    final unitPriceHt = TextEditingController(
      text: article.unitPriceHt.toString(),
    );
    final vatRate = TextEditingController(
      text: article.vatRate.toString(),
    );

    var documents = <AppDocument>[];

    var refresh = 0;

    try {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (sheetContext) => StatefulBuilder(
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
                  MediaQuery.of(
                    sheetContext,
                  ).viewInsets.bottom,
            ),
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      type == MovementType.entry
                          ? sheetContext.tr(
                              'Entrée de stock',
                              'إدخال للمخزون',
                            )
                          : sheetContext.tr(
                              'Sortie de stock',
                              'إخراج من المخزون',
                            ),
                      style: Theme.of(
                        sheetContext,
                      ).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(
                      height: 8,
                    ),
                    Text(
                      '${sheetContext.isArabic ? article.designationAr : article.designation} · ${article.brand} · ${article.barcode}',
                    ),
                    const SizedBox(
                      height: 12,
                    ),
                    TextFormField(
                      controller: quantity,
                      keyboardType: TextInputType.number,
                      onChanged: (_) => setLocal(
                        () => refresh++,
                      ),
                      validator: (value) => _positiveInt(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Quantité',
                          'الكمية',
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    TextFormField(
                      controller: reason,
                      validator: (value) => _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Motif',
                          'السبب',
                        ),
                        hintText: sheetContext.tr(
                          'Indiquez clairement le motif',
                          'اكتب السبب بوضوح',
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    TextField(
                      controller: partner,
                      decoration: InputDecoration(
                        labelText: type == MovementType.entry
                            ? sheetContext.tr(
                                'Fournisseur',
                                'المورد',
                              )
                            : sheetContext.tr(
                                'Bénéficiaire',
                                'المستفيد',
                              ),
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    TextField(
                      controller: reference,
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Référence opération',
                          'مرجع العملية',
                        ),
                      ),
                    ),
                    if (type == MovementType.entry) ...[
                      const SizedBox(
                        height: 9,
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: unitPriceHt,
                              keyboardType:
                                  const TextInputType.numberWithOptions(
                                decimal: true,
                              ),
                              onChanged: (_) => setLocal(
                                () => refresh++,
                              ),
                              validator: (value) => _positiveDouble(
                                sheetContext,
                                value,
                              ),
                              decoration: InputDecoration(
                                labelText: sheetContext.tr(
                                  'Prix unitaire HT',
                                  'ثمن الوحدة بدون الضريبة',
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(
                            width: 8,
                          ),
                          Expanded(
                            child: TextFormField(
                              controller: vatRate,
                              keyboardType:
                                  const TextInputType.numberWithOptions(
                                decimal: true,
                              ),
                              onChanged: (_) => setLocal(
                                () => refresh++,
                              ),
                              validator: (value) => _vat(
                                sheetContext,
                                value,
                              ),
                              decoration: InputDecoration(
                                labelText: sheetContext.tr(
                                  'TVA (%)',
                                  'الضريبة (%)',
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(
                      height: 10,
                    ),
                    Builder(
                      builder: (_) {
                        final q = int.tryParse(
                              quantity.text,
                            ) ??
                            0;

                        final ht = type == MovementType.entry
                            ? double.tryParse(
                                  unitPriceHt.text,
                                ) ??
                                0
                            : article.unitPriceHt;

                        final tva = type == MovementType.entry
                            ? double.tryParse(
                                  vatRate.text,
                                ) ??
                                0
                            : article.vatRate;

                        final ttc = ht * (1 + tva / 100);

                        return Wrap(
                          key: ValueKey(
                            refresh,
                          ),
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _priceChip(
                              sheetContext,
                              sheetContext.tr(
                                'PU TTC',
                                'ثمن الوحدة شامل الضريبة',
                              ),
                              ttc,
                            ),
                            _priceChip(
                              sheetContext,
                              sheetContext.tr(
                                'Total HT',
                                'الإجمالي بدون الضريبة',
                              ),
                              q * ht,
                            ),
                            _priceChip(
                              sheetContext,
                              sheetContext.tr(
                                'Total TTC',
                                'الإجمالي شامل الضريبة',
                              ),
                              q * ttc,
                            ),
                          ],
                        );
                      },
                    ),
                    if (type == MovementType.entry) ...[
                      const SizedBox(
                        height: 8,
                      ),
                      Text(
                        sheetContext.tr(
                          'Le nouveau prix et la nouvelle TVA deviendront les valeurs courantes de l’article.',
                          'سيصبح الثمن والضريبة الجديدان القيمتين الحاليتين للمادة.',
                        ),
                        style: Theme.of(
                          sheetContext,
                        ).textTheme.bodySmall,
                      ),
                    ],
                    const SizedBox(
                      height: 12,
                    ),
                    DocumentEditor(
                      documents: documents,
                      onChanged: (value) => setLocal(
                        () => documents = value,
                      ),
                    ),
                    const SizedBox(
                      height: 14,
                    ),
                    FilledButton(
                      onPressed: () {
                        if (!formKey.currentState!.validate()) {
                          return;
                        }

                        try {
                          state.addStockMovement(
                            articleId: article.id,
                            type: type,
                            quantity: int.parse(quantity.text),
                            reason: reason.text.trim(),
                            partner: partner.text.trim(),
                            reference: reference.text.trim(),
                            documents: documents,
                            unitPriceHt: type == MovementType.entry
                                ? double.parse(unitPriceHt.text)
                                : null,
                            vatRate: type == MovementType.entry
                                ? double.parse(vatRate.text)
                                : null,
                          );

                          Navigator.pop(
                            sheetContext,
                          );
                        } on StateError catch (error) {
                          _stateError(
                            sheetContext,
                            error,
                          );
                        }
                      },
                      child: Text(
                        sheetContext.tr(
                          'Valider',
                          'تأكيد',
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
        quantity,
        reason,
        partner,
        reference,
        unitPriceHt,
        vatRate,
      ]) {
        controller.dispose();
      }
    }
  }

  Future<void> _requestForm(
    BuildContext context, {
    StockArticle? initialArticle,
  }) async {
    final state = context.read<AppState>();

    if (state.currentUser == null) {
      _message(
        context,
        context.tr(
          'Connexion requise.',
          'يجب تسجيل الدخول.',
        ),
      );
      return;
    }

    final formKey = GlobalKey<FormState>();

    final quantity = TextEditingController();
    final reason = TextEditingController();

    var selected = initialArticle;

    var documents = <AppDocument>[];

    try {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (sheetContext) => StatefulBuilder(
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
                  MediaQuery.of(
                    sheetContext,
                  ).viewInsets.bottom,
            ),
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      sheetContext.tr(
                        'Demande de fourniture',
                        'طلب تموين',
                      ),
                      style: Theme.of(
                        sheetContext,
                      ).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(
                      height: 10,
                    ),
                    Container(
                      padding: const EdgeInsets.all(
                        12,
                      ),
                      decoration: BoxDecoration(
                        color: Theme.of(
                          sheetContext,
                        ).colorScheme.primaryContainer,
                        borderRadius: BorderRadius.circular(
                          14,
                        ),
                      ),
                      child: Text(
                        '${sheetContext.tr('Demandeur', 'مقدم الطلب')}: ${state.currentUser!.fullName}\n'
                        '${sheetContext.tr('Le nom provient automatiquement du compte connecté.', 'يتم جلب الاسم تلقائياً من الحساب المتصل.')}',
                      ),
                    ),
                    const SizedBox(
                      height: 12,
                    ),
                    DropdownButtonFormField<int>(
                      initialValue: selected?.id,
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Article',
                          'المادة',
                        ),
                      ),
                      items: state.articles
                          .map(
                            (
                              article,
                            ) =>
                                DropdownMenuItem<int>(
                              value: article.id,
                              child: Text(
                                '${sheetContext.isArabic ? article.designationAr : article.designation} — ${article.brand}',
                              ),
                            ),
                          )
                          .toList(),
                      validator: (value) => value == null
                          ? sheetContext.tr(
                              'Choisissez un article.',
                              'اختر مادة.',
                            )
                          : null,
                      onChanged: (value) => setLocal(
                        () {
                          selected = value == null
                              ? null
                              : state.articles.firstWhere(
                                  (
                                    article,
                                  ) =>
                                      article.id == value,
                                );

                          quantity.clear();
                        },
                      ),
                    ),
                    if (selected != null) ...[
                      const SizedBox(
                        height: 8,
                      ),
                      Text(
                        '${sheetContext.tr('Stock disponible', 'المخزون المتوفر')}: ${selected!.quantity} ${selected!.unit.name.toUpperCase()} · ${sheetContext.tr('Code-barres', 'الباركود')}: ${selected!.barcode}',
                      ),
                    ],
                    const SizedBox(
                      height: 10,
                    ),
                    TextFormField(
                      controller: quantity,
                      keyboardType: TextInputType.number,
                      validator: (value) => _positiveInt(
                        sheetContext,
                        value,
                      ),
                      onChanged: (_) => setLocal(
                        () {},
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Quantité demandée',
                          'الكمية المطلوبة',
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 9,
                    ),
                    TextFormField(
                      controller: reason,
                      validator: (value) => _required(
                        sheetContext,
                        value,
                      ),
                      decoration: InputDecoration(
                        labelText: sheetContext.tr(
                          'Motif',
                          'السبب',
                        ),
                      ),
                    ),
                    if (selected != null &&
                        (int.tryParse(
                                  quantity.text,
                                ) ??
                                0) >
                            selected!.quantity) ...[
                      const SizedBox(
                        height: 10,
                      ),
                      Container(
                        padding: const EdgeInsets.all(
                          12,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0x1FFF9800),
                          borderRadius: BorderRadius.circular(
                            14,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              sheetContext.tr(
                                'Stock insuffisant',
                                'المخزون غير كافٍ',
                              ),
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            Text(
                              '${sheetContext.tr('Quantité disponible', 'الكمية المتوفرة')}: ${selected!.quantity}. '
                              '${sheetContext.tr('La demande ne sera pas créée avec une quantité supérieure au stock.', 'لن يتم إنشاء الطلب بكمية أكبر من المخزون.')}',
                            ),
                            const SizedBox(
                              height: 8,
                            ),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                if (selected!.quantity > 0)
                                  OutlinedButton(
                                    onPressed: () => setLocal(
                                      () => quantity.text =
                                          selected!.quantity.toString(),
                                    ),
                                    child: Text(
                                      sheetContext.tr(
                                        'Demander la quantité disponible',
                                        'طلب الكمية المتوفرة',
                                      ),
                                    ),
                                  ),
                                FilledButton.tonalIcon(
                                  onPressed: () {
                                    if (!formKey.currentState!.validate()) {
                                      return;
                                    }

                                    try {
                                      state.createRestockAlert(
                                        articleId: selected!.id,
                                        quantity: int.parse(quantity.text),
                                        reason: reason.text.trim(),
                                      );

                                      Navigator.pop(
                                        sheetContext,
                                      );

                                      _message(
                                        context,
                                        context.tr(
                                          'Le responsable a été notifié du besoin de réapprovisionnement.',
                                          'تم إشعار المسؤول بالحاجة إلى إعادة التزويد.',
                                        ),
                                      );
                                    } on StateError catch (error) {
                                      _stateError(
                                        sheetContext,
                                        error,
                                      );
                                    }
                                  },
                                  icon: const Icon(
                                    Icons.notifications_active_outlined,
                                  ),
                                  label: Text(
                                    sheetContext.tr(
                                      'Notifier le responsable',
                                      'إشعار المسؤول',
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(
                      height: 12,
                    ),
                    DocumentEditor(
                      documents: documents,
                      onChanged: (value) => setLocal(
                        () => documents = value,
                      ),
                    ),
                    const SizedBox(
                      height: 14,
                    ),
                    FilledButton(
                      onPressed: () {
                        if (!formKey.currentState!.validate() ||
                            selected == null) {
                          return;
                        }

                        final requested = int.parse(
                          quantity.text,
                        );

                        if (requested > selected!.quantity) {
                          _message(
                            sheetContext,
                            sheetContext.tr(
                              'Stock insuffisant. Utilisez une des deux options proposées.',
                              'المخزون غير كافٍ. استعمل أحد الخيارين المقترحين.',
                            ),
                          );
                          return;
                        }

                        try {
                          state.createSupplyRequest(
                            articleId: selected!.id,
                            quantity: requested,
                            reason: reason.text.trim(),
                            documents: documents,
                          );

                          Navigator.pop(
                            sheetContext,
                          );

                          _message(
                            context,
                            context.tr(
                              'Demande envoyée. Statut : En attente.',
                              'تم إرسال الطلب. الحالة: قيد الانتظار.',
                            ),
                          );
                        } on StateError catch (error) {
                          _stateError(
                            sheetContext,
                            error,
                          );
                        }
                      },
                      child: Text(
                        sheetContext.tr(
                          'Envoyer la demande',
                          'إرسال الطلب',
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
      quantity.dispose();
      reason.dispose();
    }
  }

  Future<void> _rejectRequest(
    BuildContext context,
    SupplyRequest request,
  ) async {
    final state = context.read<AppState>();

    final reason = TextEditingController();

    try {
      await showDialog<void>(
        context: context,
        builder: (
          dialogContext,
        ) =>
            AlertDialog(
          title: Text(
            dialogContext.tr(
              'Refuser la demande',
              'رفض الطلب',
            ),
          ),
          content: TextField(
            controller: reason,
            maxLines: 4,
            decoration: InputDecoration(
              labelText: dialogContext.tr(
                'Motif du refus',
                'سبب الرفض',
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(
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
                if (reason.text.trim().isEmpty) {
                  _message(
                    dialogContext,
                    dialogContext.tr(
                      'Le motif du refus est obligatoire.',
                      'سبب الرفض إجباري.',
                    ),
                  );
                  return;
                }

                try {
                  state.setSupplyRequestStatus(
                    request.id,
                    SupplyRequestStatus.rejected,
                    rejectionReason: reason.text.trim(),
                  );

                  Navigator.pop(
                    dialogContext,
                  );

                  _message(
                    context,
                    context.tr(
                      'Demande refusée et demandeur notifié.',
                      'تم رفض الطلب وإشعار مقدم الطلب.',
                    ),
                  );
                } on StateError catch (error) {
                  _stateError(
                    dialogContext,
                    error,
                  );
                }
              },
              child: Text(
                dialogContext.tr(
                  'Refuser',
                  'رفض',
                ),
              ),
            ),
          ],
        ),
      );
    } finally {
      reason.dispose();
    }
  }

  Widget _priceChip(
    BuildContext context,
    String label,
    double value,
  ) {
    return Chip(
      label: Text(
        '$label: ${value.toStringAsFixed(2)} DH',
      ),
    );
  }

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

  String? _positiveInt(
    BuildContext context,
    String? value,
  ) {
    final parsed = int.tryParse(
      value ?? '',
    );

    if (parsed == null || parsed <= 0) {
      return context.tr(
        'La valeur doit être supérieure à zéro.',
        'يجب أن تكون القيمة أكبر من صفر.',
      );
    }

    return null;
  }

  String? _nonNegativeInt(
    BuildContext context,
    String? value,
  ) {
    final parsed = int.tryParse(
      value ?? '',
    );

    if (parsed == null || parsed < 0) {
      return context.tr(
        'La valeur ne peut pas être négative.',
        'لا يمكن أن تكون القيمة سالبة.',
      );
    }

    return null;
  }

  String? _positiveDouble(
    BuildContext context,
    String? value,
  ) {
    final parsed = double.tryParse(
      value ?? '',
    );

    if (parsed == null || parsed <= 0) {
      return context.tr(
        'Le prix doit être supérieur à zéro.',
        'يجب أن يكون الثمن أكبر من صفر.',
      );
    }

    return null;
  }

  String? _vat(
    BuildContext context,
    String? value,
  ) {
    final parsed = double.tryParse(
      value ?? '',
    );

    if (parsed == null || parsed < 0 || parsed > 100) {
      return context.tr(
        'La TVA doit être comprise entre 0 et 100.',
        'يجب أن تكون الضريبة بين 0 و100.',
      );
    }

    return null;
  }

  void _stateError(
    BuildContext context,
    StateError error,
  ) {
    final raw = error.message.toString();

    if (raw.startsWith(
      'INSUFFICIENT_STOCK:',
    )) {
      final available = raw.split(':').last;

      _message(
        context,
        context.tr(
          'Stock insuffisant. Quantité disponible : $available.',
          'المخزون غير كافٍ. الكمية المتوفرة: $available.',
        ),
      );
      return;
    }

    final messages = <String, String>{
      'REFERENCE_ALREADY_USED': context.tr(
        'Cette référence existe déjà.',
        'هذا المرجع موجود مسبقاً.',
      ),
      'BARCODE_ALREADY_USED': context.tr(
        'Ce code-barres existe déjà.',
        'هذا الباركود موجود مسبقاً.',
      ),
      'REJECTION_REASON_REQUIRED': context.tr(
        'Le motif du refus est obligatoire.',
        'سبب الرفض إجباري.',
      ),
      'REQUEST_ALREADY_PROCESSED': context.tr(
        'Cette demande a déjà été traitée.',
        'تمت معالجة هذا الطلب مسبقاً.',
      ),
      'STOCK_ALREADY_AVAILABLE': context.tr(
        'La quantité est déjà disponible. Créez une demande normale.',
        'الكمية متوفرة. أنشئ طلباً عادياً.',
      ),
      'INVALID_PRICE': context.tr(
        'Prix ou TVA invalide.',
        'الثمن أو الضريبة غير صالحين.',
      ),
    };

    _message(
      context,
      messages[raw] ??
          context.tr(
            'Opération impossible.',
            'تعذر تنفيذ العملية.',
          ),
    );
  }

  void _message(
    BuildContext context,
    String message,
  ) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(
      SnackBar(
        content: Text(
          message,
        ),
      ),
    );
  }

  String _requestStatus(
    BuildContext context,
    SupplyRequestStatus status,
  ) =>
      switch (status) {
        SupplyRequestStatus.pending => context.tr(
            'En attente',
            'قيد الانتظار',
          ),
        SupplyRequestStatus.approved => context.tr(
            'Acceptée - prête à récupérer',
            'مقبولة - جاهزة للاستلام',
          ),
        SupplyRequestStatus.rejected => context.tr(
            'Refusée',
            'مرفوضة',
          ),
        SupplyRequestStatus.received => context.tr(
            'Reçue - sortie enregistrée',
            'تم الاستلام - الخروج مسجل',
          ),
      };
}

class _BarcodeScannerScreen extends StatefulWidget {
  const _BarcodeScannerScreen();

  @override
  State<_BarcodeScannerScreen> createState() => _BarcodeScannerScreenState();
}

class _BarcodeScannerScreenState extends State<_BarcodeScannerScreen> {
  bool _done = false;

  @override
  Widget build(
    BuildContext context,
  ) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          context.tr(
            'Scanner le code-barres',
            'مسح الباركود',
          ),
        ),
      ),
      body: MobileScanner(
        onDetect: (
          capture,
        ) {
          if (_done || capture.barcodes.isEmpty) {
            return;
          }

          final value = capture.barcodes.first.rawValue;

          if (value == null || value.isEmpty) {
            return;
          }

          _done = true;

          Navigator.pop(
            context,
            value,
          );
        },
      ),
    );
  }
}
