import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/app_document.dart';
import '../../services/bien_api_service.dart';
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
  final BienApiService _service = BienApiService();

  List<BienApiListItem> _activeItems = [];
  List<BienApiListItem> _archivedItems = [];

  bool _archives = false;
  String _typeFilter = '';
  String _statusFilter = '';
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadActive());
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _loadActive() async {
    if (!mounted) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final data = await _service.getAll();
      if (!mounted) return;
      setState(() => _activeItems = data);
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _activeItems = [];
        _error = error.toString();
      });
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _loadArchived() async {
    if (!mounted) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final data = await _service.getArchived();
      if (!mounted) return;
      setState(() => _archivedItems = data);
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _archivedItems = [];
        _error = error.toString();
      });
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _reload() => _archives ? _loadArchived() : _loadActive();

  List<BienApiListItem> get _filtered {
    final source = _archives ? _archivedItems : _activeItems;
    final query = _search.text.trim().toLowerCase();

    return source.where((bien) {
      final matchesSearch = query.isEmpty ||
          bien.designation.toLowerCase().contains(query) ||
          bien.inventoryNumber.toLowerCase().contains(query) ||
          (bien.assignment ?? '').toLowerCase().contains(query);

      final matchesType = _typeFilter.isEmpty || bien.type == _typeFilter;
      final matchesStatus =
          _archives || _statusFilter.isEmpty || bien.status == _statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final canViewArchives =
        state.currentUser?.role.permissions.contains(Permissions.getArchivedAssets) ??
            false;
    final items = _filtered;

    return RefreshIndicator(
      onRefresh: _reload,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  context.tr('Gestion des biens', 'تدبير الممتلكات'),
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                ),
              ),
              if (!_archives && state.hasPermission(Permissions.createAsset))
                IconButton.filled(
                  tooltip: context.tr('Ajouter un bien', 'إضافة ممتلك'),
                  onPressed: _openCreatePage,
                  icon: const Icon(Icons.add),
                ),
              const SizedBox(width: 8),
              IconButton.filledTonal(
                tooltip: context.tr('Actualiser', 'تحديث'),
                onPressed: _loading ? null : _reload,
                icon: _loading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.refresh),
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
          if (canViewArchives) ...[
            const SizedBox(height: 10),
            SegmentedButton<bool>(
              segments: [
                ButtonSegment<bool>(
                  value: false,
                  label: Text(context.tr('Actifs', 'النشطة')),
                ),
                ButtonSegment<bool>(
                  value: true,
                  label: Text(context.tr('Archives', 'الأرشيف')),
                ),
              ],
              selected: {_archives},
              onSelectionChanged: (selection) async {
                final next = selection.first;
                setState(() {
                  _archives = next;
                  _statusFilter = '';
                });

                if (next && _archivedItems.isEmpty) {
                  await _loadArchived();
                }
              },
            ),
          ],
          const SizedBox(height: 10),
          LayoutBuilder(
            builder: (context, constraints) {
              final compact = constraints.maxWidth < 430;
              final typeFilter = DropdownButtonFormField<String>(
                initialValue: _typeFilter,
                decoration: InputDecoration(
                  labelText: context.tr('Type', 'النوع'),
                ),
                items: [
                  DropdownMenuItem<String>(
                    value: '',
                    child: Text(context.tr('Tous les types', 'كل الأنواع')),
                  ),
                  DropdownMenuItem<String>(
                    value: 'VEHICLE',
                    child: Text(context.tr('Véhicule', 'مركبة')),
                  ),
                  DropdownMenuItem<String>(
                    value: 'MACHINE',
                    child: Text(context.tr('Machine', 'آلة')),
                  ),
                  DropdownMenuItem<String>(
                    value: 'REAL_ESTATE',
                    child: Text(context.tr('Immobilier', 'عقار')),
                  ),
                ],
                onChanged: (value) {
                  setState(() => _typeFilter = value ?? '');
                },
              );

              final statusFilter = DropdownButtonFormField<String>(
                initialValue: _statusFilter,
                decoration: InputDecoration(
                  labelText: context.tr('Statut', 'الحالة'),
                ),
                items: [
                  DropdownMenuItem<String>(
                    value: '',
                    child: Text(context.tr('Tous les statuts', 'كل الحالات')),
                  ),
                  ..._filterStatuses.map(
                    (status) => DropdownMenuItem<String>(
                      value: status,
                      child: Text(_statusLabel(context, status)),
                    ),
                  ),
                ],
                onChanged: (value) {
                  setState(() => _statusFilter = value ?? '');
                },
              );

              if (compact) {
                return Column(
                  children: [
                    typeFilter,
                    if (!_archives) ...[
                      const SizedBox(height: 10),
                      statusFilter,
                    ],
                  ],
                );
              }

              return Row(
                children: [
                  Expanded(child: typeFilter),
                  if (!_archives) ...[
                    const SizedBox(width: 10),
                    Expanded(child: statusFilter),
                  ],
                ],
              );
            },
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
                  'L’archive contient uniquement les biens renvoyés par le backend.',
                  'يحتوي الأرشيف فقط على الممتلكات التي يعيدها الخادم.',
                ),
              ),
            ),
          ],
          if (_error != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.errorContainer,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(
                context.tr(
                  'Impossible de charger les données du backend.',
                  'تعذر تحميل البيانات من الخادم.',
                ),
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onErrorContainer,
                ),
              ),
            ),
          ],
          const SizedBox(height: 14),
          Text(
            context.tr('${items.length} bien(s)', '${items.length} ممتلك'),
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 8),
          if (_loading)
            const Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: CircularProgressIndicator()),
            )
          else if (items.isEmpty)
            EmptyState(
              icon: Icons.apartment_outlined,
              title: _archives
                  ? context.tr('Aucun bien archivé', 'لا توجد ممتلكات مؤرشفة')
                  : context.tr('Aucun bien trouvé', 'لم يتم العثور على أي ممتلك'),
            )
          else
            ...items.map(
              (bien) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SectionCard(
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: state.hasPermission(Permissions.getAssetInfos)
                        ? () => _openDetails(bien)
                        : null,
                    child: Padding(
                      padding: const EdgeInsets.all(2),
                      child: Row(
                        children: [
                          CircleAvatar(child: Icon(_typeIcon(bien.type))),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  bien.designation,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  [
                                    bien.inventoryNumber,
                                    if (!_archives &&
                                        bien.assignment != null &&
                                        bien.assignment!.trim().isNotEmpty)
                                      bien.assignment!,
                                  ].join(' · '),
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                                const SizedBox(height: 7),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 6,
                                  children: [
                                    Chip(
                                      label: Text(_typeLabel(context, bien.type)),
                                      visualDensity: VisualDensity.compact,
                                    ),
                                    Chip(
                                      label: Text(
                                        _archives
                                            ? context.tr('Archivé', 'مؤرشف')
                                            : _statusLabel(context, bien.status),
                                      ),
                                      visualDensity: VisualDensity.compact,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          if (_hasAnyAction(state))
                            PopupMenuButton<String>(
                              onSelected: (value) => _handleMenuAction(
                                value,
                                bien,
                              ),
                              itemBuilder: (_) => [
                                if (state.hasPermission(Permissions.getAssetInfos))
                                  PopupMenuItem<String>(
                                    value: 'view',
                                    child: ListTile(
                                      contentPadding: EdgeInsets.zero,
                                      leading: const Icon(Icons.visibility_outlined),
                                      title: Text(context.tr('Voir', 'عرض')),
                                    ),
                                  ),
                                if (!_archives &&
                                    state.hasPermission(Permissions.updateAsset))
                                  PopupMenuItem<String>(
                                    value: 'edit',
                                    enabled: bien.id != null && bien.type != null,
                                    child: ListTile(
                                      contentPadding: EdgeInsets.zero,
                                      leading: const Icon(Icons.edit_outlined),
                                      title: Text(context.tr('Modifier', 'تعديل')),
                                    ),
                                  ),
                                if (!_archives &&
                                    state.hasPermission(Permissions.deleteAsset))
                                  PopupMenuItem<String>(
                                    value: 'delete',
                                    enabled: bien.id != null && bien.type != null,
                                    child: ListTile(
                                      contentPadding: EdgeInsets.zero,
                                      leading: const Icon(
                                        Icons.delete_outline,
                                        color: Colors.red,
                                      ),
                                      title: Text(context.tr('Supprimer', 'حذف')),
                                    ),
                                  ),
                              ],
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  bool _hasAnyAction(AppState state) {
    return state.hasPermission(Permissions.getAssetInfos) ||
        (!_archives &&
            (state.hasPermission(Permissions.updateAsset) ||
                state.hasPermission(Permissions.deleteAsset)));
  }

  Future<void> _handleMenuAction(String value, BienApiListItem bien) async {
    if (value == 'view') {
      await _openDetails(bien);
      return;
    }

    if (value == 'edit') {
      await _openEditPage(bien);
      return;
    }

    if (value == 'delete') {
      await _confirmDelete(bien);
    }
  }

  Future<void> _openDetails(BienApiListItem bien) async {
    final state = context.read<AppState>();
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => _BienDetailsPage(
          service: _service,
          initial: bien,
          archived: _archives,
          canEdit: !_archives && state.hasPermission(Permissions.updateAsset),
          canRent: !_archives && state.hasPermission(Permissions.rentAsset),
          canDispose: !_archives && state.hasPermission(Permissions.disposeAsset),
          onEdit: _openEditPage,
        ),
      ),
    );

    if (changed == true && mounted) {
      await _loadActive();
      if (_archives || _archivedItems.isNotEmpty) {
        await _loadArchived();
      }
    }
  }

  Future<bool> _openEditPage(BienApiListItem bien) async {
    if (bien.id == null || bien.type == null) {
      _showMessage(
        context.tr(
          'Impossible de modifier ce bien : identifiant ou type manquant.',
          'تعذر تعديل هذا الممتلك: المعرّف أو النوع غير متوفر.',
        ),
      );
      return false;
    }

    BienApiListItem details = bien;
    try {
      details = await _service.getById(bien.id!, bien.type!);
    } catch (_) {
      if (!mounted) return false;
    }

    if (!mounted) return false;

    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => _AssetFormPage(
          service: _service,
          initial: details,
        ),
      ),
    );

    if (changed == true && mounted) {
      await _loadActive();
      return true;
    }

    return false;
  }

  Future<void> _openCreatePage() async {
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => _AssetFormPage(
          service: _service,
        ),
      ),
    );

    if (changed == true && mounted) {
      await _loadActive();
    }
  }

  Future<void> _confirmDelete(BienApiListItem bien) async {
    if (bien.id == null || bien.type == null) {
      _showMessage(
        context.tr(
          'Impossible de supprimer ce bien : identifiant ou type manquant.',
          'تعذر حذف هذا الممتلك: المعرّف أو النوع غير متوفر.',
        ),
      );
      return;
    }

    final confirmed = await showDialog<bool>(
          context: context,
          builder: (dialogContext) => AlertDialog(
            title: Text(context.tr('Supprimer le bien', 'حذف الممتلك')),
            content: Text(
              context.tr(
                'Voulez-vous vraiment supprimer « ${bien.designation} » ?',
                'هل تريد فعلاً حذف « ${bien.designation} »؟',
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, false),
                child: Text(context.tr('Annuler', 'إلغاء')),
              ),
              FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: Theme.of(dialogContext).colorScheme.error,
                ),
                onPressed: () => Navigator.pop(dialogContext, true),
                child: Text(context.tr('Supprimer', 'حذف')),
              ),
            ],
          ),
        ) ??
        false;

    if (!confirmed) return;

    try {
      await _service.remove(bien.id!, bien.type!);
      if (!mounted) return;
      _showMessage(
        context.tr('Bien supprimé avec succès.', 'تم حذف الممتلك بنجاح.'),
      );
      await _loadActive();
    } catch (error) {
      if (!mounted) return;
      _showMessage(
        context.tr('Impossible de supprimer ce bien.', 'تعذر حذف هذا الممتلك.'),
      );
    }
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

class _BienDetailsPage extends StatefulWidget {
  const _BienDetailsPage({
    required this.service,
    required this.initial,
    required this.archived,
    required this.canEdit,
    required this.canRent,
    required this.canDispose,
    required this.onEdit,
  });

  final BienApiService service;
  final BienApiListItem initial;
  final bool archived;
  final bool canEdit;
  final bool canRent;
  final bool canDispose;
  final Future<bool> Function(BienApiListItem bien) onEdit;

  @override
  State<_BienDetailsPage> createState() => _BienDetailsPageState();
}

class _BienDetailsPageState extends State<_BienDetailsPage> {
  late BienApiListItem _details;
  bool _loading = true;
  bool _changed = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _details = widget.initial;
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final id = widget.initial.id;
      if (id == null) {
        setState(() => _loading = false);
        return;
      }

      final type = widget.initial.type;
      final loaded = type != null
          ? await widget.service.getById(id, type)
          : await widget.service.getAssetInfo(id);

      if (!mounted) return;
      setState(() => _details = loaded);
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString();
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        Navigator.of(context).pop(_changed);
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            tooltip: context.tr('Retour', 'رجوع'),
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.of(context).pop(_changed),
          ),
          title: Text(
            _details.designation,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: _load,
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  children: [
                    if (_error != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.errorContainer,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Text(
                          context.tr(
                            'Les dernières informations n’ont pas pu être rechargées.',
                            'تعذر إعادة تحميل أحدث المعلومات.',
                          ),
                        ),
                      ),
                    Text(
                      _details.inventoryNumber,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                    const SizedBox(height: 12),
                    _buildActions(context),
                    const SizedBox(height: 14),
                    _InfoGrid(
                      items: [
                        _InfoEntry(
                          context.tr('Numéro d’inventaire', 'رقم الجرد'),
                          _details.inventoryNumber,
                        ),
                        _InfoEntry(
                          context.tr('Type', 'النوع'),
                          _typeLabel(context, _details.type),
                        ),
                        _InfoEntry(
                          context.tr('Statut', 'الحالة'),
                          widget.archived
                              ? context.tr('Archivé', 'مؤرشف')
                              : _statusLabel(context, _details.status),
                        ),
                        _InfoEntry(
                          context.tr('Affectation', 'الجهة المستعملة'),
                          _cleanOrDash(_details.assignment),
                        ),
                        _InfoEntry(
                          context.tr('Date d’acquisition', 'تاريخ الاقتناء'),
                          _details.acquisitionDate.trim().isEmpty
                              ? '—'
                              : _details.acquisitionDate,
                        ),
                        _InfoEntry(
                          context.tr('Valeur d’acquisition', 'قيمة الاقتناء'),
                          _details.purchaseValue == null
                              ? '—'
                              : '${_details.purchaseValue!.toStringAsFixed(2)} DH',
                        ),
                        if (widget.archived)
                          _InfoEntry(
                            context.tr('Date de cession', 'تاريخ التفويت'),
                            _cleanOrDash(_details.archivedAt),
                          ),
                        ..._specificInfo(context, _details),
                      ],
                    ),
                    const SizedBox(height: 14),
                    DocumentEditor(
                      documents: _details.documents,
                      onChanged: (_) {},
                      readOnly: true,
                      showGuidance: false,
                      remoteLoader: (document) async {
                        final backendId = document.backendId;
                        if (backendId == null) {
                          throw const BienApiException(
                            statusCode: 400,
                            message: 'Document id missing.',
                          );
                        }
                        return widget.service.downloadDocumentBytes(backendId);
                      },
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildActions(BuildContext context) {
    if (widget.archived) return const SizedBox.shrink();

    final canActuallyRent = _details.status == 'AVAILABLE';
    final canActuallyDispose = !{
      'IN_USE',
      'RENTED',
      'ARCHIVED',
    }.contains(_details.status);

    if (!widget.canEdit && !widget.canRent && !widget.canDispose) {
      return const SizedBox.shrink();
    }

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        if (widget.canEdit)
          OutlinedButton.icon(
            onPressed: () async {
              final changed = await widget.onEdit(_details);
              if (!mounted || !changed) return;
              _changed = true;
              await _load();
            },
            icon: const Icon(Icons.edit_outlined),
            label: Text(context.tr('Modifier', 'تعديل')),
          ),
        if (widget.canRent)
          OutlinedButton.icon(
            onPressed: canActuallyRent ? _rent : null,
            icon: const Icon(Icons.key_outlined),
            label: Text(context.tr('Louer', 'كراء')),
          ),
        if (widget.canDispose)
          FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            onPressed: canActuallyDispose ? _dispose : null,
            icon: const Icon(Icons.archive_outlined),
            label: Text(context.tr('Céder / archiver', 'تفويت / أرشفة')),
          ),
      ],
    );
  }

  Future<void> _rent() async {
    if (_details.id == null) return;

    final result = await Navigator.of(context).push<_RentalFormResult>(
      MaterialPageRoute(
        builder: (_) => const _RentalFormPage(),
      ),
    );

    if (result == null || !mounted) return;

    try {
      final rentalId = await widget.service.rent(
        _details.id!,
        tenantName: result.tenantName,
        startDate: result.startDate,
        endDate: result.endDate,
        frequency: result.frequency,
        amount: result.amount,
      );
      await widget.service.uploadRentalDocuments(rentalId, result.documents);

      if (!mounted) return;
      _changed = true;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Le bien a été loué avec succès.',
              'تم كراء الممتلك بنجاح.',
            ),
          ),
        ),
      );
      await _load();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Impossible de finaliser la location ou d’envoyer ses documents.',
              'تعذر إتمام الكراء أو رفع وثائقه.',
            ),
          ),
        ),
      );
    }
  }

  Future<void> _dispose() async {
    if (_details.id == null) return;

    final result = await Navigator.of(context).push<_DisposalFormResult>(
      MaterialPageRoute(
        builder: (_) => const _DisposalFormPage(),
      ),
    );

    if (result == null || !mounted) return;

    try {
      final disposalId = await widget.service.dispose(
        _details.id!,
        disposalDate: result.disposalDate,
        amount: result.amount,
        disposalMethod: result.disposalMethod,
        purchaser: result.purchaser,
      );
      await widget.service.uploadDisposalDocuments(
        disposalId,
        result.documents,
      );

      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Impossible de finaliser la cession ou d’envoyer ses documents.',
              'تعذر إتمام التفويت أو رفع وثائقه.',
            ),
          ),
        ),
      );
    }
  }
}

class _AssetFormPage extends StatefulWidget {
  const _AssetFormPage({
    required this.service,
    this.initial,
  });

  final BienApiService service;
  final BienApiListItem? initial;

  bool get isEdit => initial != null;

  @override
  State<_AssetFormPage> createState() => _AssetFormPageState();
}

class _AssetFormPageState extends State<_AssetFormPage> {
  final _formKey = GlobalKey<FormState>();

  final _inventory = TextEditingController();
  final _designation = TextEditingController();
  final _acquisitionValue = TextEditingController();
  final _assignment = TextEditingController();

  final _registration = TextEditingController();
  final _chassis = TextEditingController();
  final _make = TextEditingController();
  final _year = TextEditingController();
  final _fiscalHorsepower = TextEditingController();
  final _firstRegistrationDate = TextEditingController();
  final _odometer = TextEditingController();

  final _serial = TextEditingController();
  final _brand = TextEditingController();
  final _model = TextEditingController();
  final _technicalRef = TextEditingController();
  final _machinePower = TextEditingController();

  final _landTitle = TextEditingController();
  final _cadastral = TextEditingController();
  final _area = TextEditingController();
  final _gps = TextEditingController();
  final _realEstateType = TextEditingController();

  String _type = 'VEHICLE';
  String _status = 'AVAILABLE';
  String _originalStatus = 'AVAILABLE';
  String _acquisitionDate = '';
  String _domain = '';
  List<AppDocument> _documents = [];
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _fillInitial();
  }

  void _fillInitial() {
    final bien = widget.initial;
    if (bien == null) return;

    _type = bien.type ?? 'VEHICLE';
    _status = bien.status;
    _originalStatus = bien.status;
    _inventory.text = bien.inventoryNumber == '—' ? '' : bien.inventoryNumber;
    _designation.text = bien.designation == '—' ? '' : bien.designation;
    _acquisitionDate = bien.acquisitionDate;
    _acquisitionValue.text = bien.purchaseValue?.toString() ?? '';
    _assignment.text = bien.assignment ?? '';
    _documents = [...bien.documents];

    final raw = bien.raw;
    if (_type == 'VEHICLE') {
      _registration.text = _text(raw['registrationNumber']);
      _chassis.text = _text(raw['chassisNumber']);
      _make.text = _text(raw['make']);
      _year.text = _text(raw['manufactureYear']);
      _fiscalHorsepower.text = _text(raw['fiscalHorsepower']);
      _firstRegistrationDate.text = _text(raw['firstRegistrationDate']);
      _odometer.text = _text(raw['odometer']);
    } else if (_type == 'MACHINE') {
      _serial.text = _text(raw['serialNumber']);
      _brand.text = _text(raw['brand']);
      _model.text = _text(raw['model']);
      _technicalRef.text = _text(raw['technicalRef']);
      _machinePower.text = _text(raw['power']);
    } else if (_type == 'REAL_ESTATE') {
      _landTitle.text = _text(raw['landTitleReference']);
      _cadastral.text = _text(raw['cadastralReference']);
      _area.text = _text(raw['areaM2']);
      _gps.text = _text(raw['gpsLocation']);
      _realEstateType.text = _text(raw['realEstateType']);
      _domain = _text(raw['domain']);
    }
  }

  @override
  void dispose() {
    for (final controller in [
      _inventory,
      _designation,
      _acquisitionValue,
      _assignment,
      _registration,
      _chassis,
      _make,
      _year,
      _fiscalHorsepower,
      _firstRegistrationDate,
      _odometer,
      _serial,
      _brand,
      _model,
      _technicalRef,
      _machinePower,
      _landTitle,
      _cadastral,
      _area,
      _gps,
      _realEstateType,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final statusSystemManaged = _systemManagedStatuses.contains(_status);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.isEdit
              ? context.tr('Modifier un bien', 'تعديل ممتلك')
              : context.tr('Ajouter un bien', 'إضافة ممتلك'),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
          children: [
            _FormSection(
              title: context.tr('Informations générales', 'المعلومات العامة'),
              child: Column(
                children: [
                  if (widget.isEdit)
                    _readOnlyField(
                      context,
                      context.tr('Type du bien', 'نوع الممتلك'),
                      _typeLabel(context, _type),
                    )
                  else
                    DropdownButtonFormField<String>(
                      initialValue: _type,
                      decoration: InputDecoration(
                        labelText: context.tr('Type du bien', 'نوع الممتلك'),
                      ),
                      items: [
                        DropdownMenuItem(
                          value: 'VEHICLE',
                          child: Text(context.tr('Véhicule', 'مركبة')),
                        ),
                        DropdownMenuItem(
                          value: 'MACHINE',
                          child: Text(context.tr('Machine', 'آلة')),
                        ),
                        DropdownMenuItem(
                          value: 'REAL_ESTATE',
                          child: Text(context.tr('Immobilier', 'عقار')),
                        ),
                      ],
                      onChanged: (value) {
                        if (value != null) setState(() => _type = value);
                      },
                    ),
                  const SizedBox(height: 12),
                  _requiredTextField(
                    context,
                    _inventory,
                    context.tr('Identifiant d’inventaire', 'رقم الجرد'),
                  ),
                  const SizedBox(height: 12),
                  _requiredTextField(
                    context,
                    _designation,
                    context.tr('Désignation', 'التسمية'),
                  ),
                  const SizedBox(height: 12),
                  _dateField(
                    context,
                    label: context.tr('Date d’acquisition', 'تاريخ الاقتناء'),
                    value: _acquisitionDate,
                    onChanged: (value) => setState(() => _acquisitionDate = value),
                    required: true,
                    lastDate: DateTime.now(),
                  ),
                  const SizedBox(height: 12),
                  _requiredTextField(
                    context,
                    _acquisitionValue,
                    context.tr('Valeur d’acquisition (DH)', 'قيمة الاقتناء (درهم)'),
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    validator: (value) {
                      final number = double.tryParse((value ?? '').trim());
                      if (number == null || number <= 0) {
                        return context.tr(
                          'La valeur doit être supérieure à zéro.',
                          'يجب أن تكون القيمة أكبر من صفر.',
                        );
                      }
                      return null;
                    },
                  ),
                  if (widget.isEdit) ...[
                    const SizedBox(height: 12),
                    if (statusSystemManaged)
                      _readOnlyField(
                        context,
                        context.tr('Statut', 'الحالة'),
                        _statusLabel(context, _status),
                      )
                    else
                      DropdownButtonFormField<String>(
                        initialValue: _status,
                        decoration: InputDecoration(
                          labelText: context.tr('Statut', 'الحالة'),
                        ),
                        items: _manualStatuses
                            .map(
                              (status) => DropdownMenuItem(
                                value: status,
                                child: Text(_statusLabel(context, status)),
                              ),
                            )
                            .toList(),
                        onChanged: (value) {
                          if (value != null) setState(() => _status = value);
                        },
                      ),
                    if (_status == 'IN_USE') ...[
                      const SizedBox(height: 12),
                      _requiredTextField(
                        context,
                        _assignment,
                        context.tr(
                          'Affectation / utilisateur du bien',
                          'الجهة أو الشخص المستعمل للممتلك',
                        ),
                      ),
                    ],
                  ],
                ],
              ),
            ),
            const SizedBox(height: 14),
            if (_type == 'VEHICLE') _vehicleSection(context),
            if (_type == 'MACHINE') _machineSection(context),
            if (_type == 'REAL_ESTATE') _realEstateSection(context),
            const SizedBox(height: 14),
            DocumentEditor(
              documents: _documents,
              onChanged: (value) => setState(() => _documents = value),
              remoteLoader: widget.isEdit
                  ? (document) async {
                      final id = document.backendId;
                      if (id == null) {
                        throw const BienApiException(
                          statusCode: 400,
                          message: 'Document id missing.',
                        );
                      }
                      return widget.service.downloadDocumentBytes(id);
                    }
                  : null,
            ),
            const SizedBox(height: 18),
            FilledButton.icon(
              onPressed: _saving ? null : _submit,
              icon: _saving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.save_outlined),
              label: Text(
                widget.isEdit
                    ? context.tr(
                        'Enregistrer les modifications',
                        'حفظ التعديلات',
                      )
                    : context.tr('Créer le bien', 'إنشاء الممتلك'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _vehicleSection(BuildContext context) {
    return _FormSection(
      title: context.tr('Informations du véhicule', 'معلومات المركبة'),
      child: Column(
        children: [
          _requiredTextField(
            context,
            _registration,
            context.tr('Immatriculation', 'رقم التسجيل'),
          ),
          const SizedBox(height: 12),
          _requiredTextField(
            context,
            _make,
            context.tr('Marque', 'العلامة'),
          ),
          const SizedBox(height: 12),
          _requiredTextField(
            context,
            _year,
            context.tr('Année de fabrication', 'سنة الصنع'),
            keyboardType: TextInputType.number,
            validator: (value) {
              final number = int.tryParse((value ?? '').trim());
              if (number == null || number <= 0) {
                return context.tr('Champ obligatoire', 'حقل إجباري');
              }
              return null;
            },
          ),
          const SizedBox(height: 12),
          _requiredTextField(
            context,
            _chassis,
            context.tr('Numéro de châssis', 'رقم الهيكل'),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _fiscalHorsepower,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              labelText: context.tr('Puissance fiscale (CV)', 'القوة الجبائية (حصان)'),
            ),
          ),
          const SizedBox(height: 12),
          _controllerDateField(
            context,
            controller: _firstRegistrationDate,
            label: context.tr(
              'Date de première mise en circulation',
              'تاريخ أول وضع في السير',
            ),
            required: true,
            lastDate: DateTime.now(),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _odometer,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: context.tr('Kilométrage', 'عداد الكيلومترات'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _machineSection(BuildContext context) {
    return _FormSection(
      title: context.tr('Informations de la machine', 'معلومات الآلة'),
      child: Column(
        children: [
          _requiredTextField(
            context,
            _brand,
            context.tr('Marque', 'العلامة'),
          ),
          const SizedBox(height: 12),
          _requiredTextField(
            context,
            _model,
            context.tr('Modèle', 'الطراز'),
          ),
          const SizedBox(height: 12),
          _requiredTextField(
            context,
            _serial,
            context.tr('Numéro de série', 'الرقم التسلسلي'),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _technicalRef,
            decoration: InputDecoration(
              labelText: context.tr('Référence technique', 'المرجع التقني'),
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _machinePower,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              labelText: context.tr('Puissance', 'القدرة'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _realEstateSection(BuildContext context) {
    return _FormSection(
      title: context.tr('Informations du bien immobilier', 'معلومات العقار'),
      child: Column(
        children: [
          _requiredTextField(
            context,
            _gps,
            context.tr('Localisation GPS', 'الموقع GPS'),
          ),
          const SizedBox(height: 12),
          _requiredTextField(
            context,
            _area,
            context.tr('Superficie (m²)', 'المساحة (م²)'),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            validator: (value) {
              final number = double.tryParse((value ?? '').trim());
              if (number == null || number <= 0) {
                return context.tr('Champ obligatoire', 'حقل إجباري');
              }
              return null;
            },
          ),
          const SizedBox(height: 12),
          _requiredTextField(
            context,
            _landTitle,
            context.tr('Numéro du titre foncier', 'رقم الرسم العقاري'),
          ),
          const SizedBox(height: 12),
          _requiredTextField(
            context,
            _realEstateType,
            context.tr('Type immobilier', 'نوع العقار'),
          ),
          const SizedBox(height: 12),
          _requiredTextField(
            context,
            _cadastral,
            context.tr('Référence cadastrale', 'المرجع المساحي'),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _domain,
            decoration: InputDecoration(
              labelText: context.tr('Domaine', 'المجال'),
            ),
            items: [
              const DropdownMenuItem(value: '', child: Text('—')),
              DropdownMenuItem(
                value: 'PUBLIC',
                child: Text(context.tr('Domaine public', 'الملك العام')),
              ),
              DropdownMenuItem(
                value: 'PRIVATE',
                child: Text(context.tr('Domaine privé', 'الملك الخاص')),
              ),
            ],
            onChanged: (value) => setState(() => _domain = value ?? ''),
          ),
        ],
      ),
    );
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    if (_acquisitionDate.isEmpty) {
      _message(
        context.tr('Choisissez la date d’acquisition.', 'اختر تاريخ الاقتناء.'),
      );
      return;
    }

    if (_type == 'VEHICLE' && _firstRegistrationDate.text.trim().isEmpty) {
      _message(
        context.tr(
          'Choisissez la date de première mise en circulation.',
          'اختر تاريخ أول وضع في السير.',
        ),
      );
      return;
    }

    setState(() => _saving = true);

    try {
      final payload = _buildPayload();

      if (widget.isEdit) {
        final id = widget.initial!.id;
        if (id == null) {
          throw const BienApiException(
            statusCode: 400,
            message: 'Asset id missing.',
          );
        }

        await widget.service.update(id, _type, payload);

        if (_status != _originalStatus && _manualStatuses.contains(_status)) {
          await widget.service.updateStatus(id, _status);
        }

        await widget.service.uploadAssetDocuments(id, _documents);
      } else {
        final created = await widget.service.create(_type, payload);
        if (created.id != null) {
          await widget.service.uploadAssetDocuments(created.id!, _documents);
        }
      }

      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (error) {
      if (!mounted) return;
      _message(
        widget.isEdit
            ? context.tr(
                'Impossible de modifier ce bien ou d’envoyer ses documents.',
                'تعذر تعديل هذا الممتلك أو رفع وثائقه.',
              )
            : context.tr(
                'Impossible de créer le bien ou d’envoyer ses documents.',
                'تعذر إنشاء الممتلك أو رفع وثائقه.',
              ),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Map<String, dynamic> _buildPayload() {
    final assignment = _status == 'IN_USE' ? _assignment.text.trim() : '';
    final base = <String, dynamic>{
      'inventoryNumber': _inventory.text.trim().toUpperCase(),
      'designation': _designation.text.trim(),
      'acquisitionDate': _acquisitionDate,
      'acquisitionValue': double.parse(_acquisitionValue.text.trim()),
      'assignment': assignment,
    };

    if (_type == 'VEHICLE') {
      return {
        ...base,
        'registrationNumber': _registration.text.trim(),
        'chassisNumber': _chassis.text.trim(),
        'make': _make.text.trim(),
        'fiscalHorsepower': _optionalDouble(_fiscalHorsepower.text) ?? 0,
        'firstRegistrationDate': _firstRegistrationDate.text.trim(),
        'odometer': _optionalInt(_odometer.text),
        'manufactureYear': int.parse(_year.text.trim()),
      };
    }

    if (_type == 'MACHINE') {
      return {
        ...base,
        'serialNumber': _serial.text.trim(),
        'brand': _brand.text.trim(),
        'model': _model.text.trim(),
        'power': _optionalDouble(_machinePower.text),
        'technicalRef': _emptyToNull(_technicalRef.text),
      };
    }

    return {
      ...base,
      'landTitleReference': _landTitle.text.trim(),
      'cadastralReference': _cadastral.text.trim(),
      'areaM2': double.parse(_area.text.trim()),
      'gpsLocation': _gps.text.trim(),
      'domain': _domain.isEmpty ? null : _domain,
      'realEstateType': _realEstateType.text.trim(),
    };
  }

  void _message(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

class _RentalFormPage extends StatefulWidget {
  const _RentalFormPage();

  @override
  State<_RentalFormPage> createState() => _RentalFormPageState();
}

class _RentalFormPageState extends State<_RentalFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _tenant = TextEditingController();
  final _frequency = TextEditingController(text: '1');
  final _amount = TextEditingController();
  String _startDate = '';
  String _endDate = '';
  List<AppDocument> _documents = [];

  @override
  void dispose() {
    _tenant.dispose();
    _frequency.dispose();
    _amount.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('Louer le bien', 'كراء الممتلك'))),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
          children: [
            _requiredTextField(
              context,
              _tenant,
              context.tr('Locataire', 'المكتري'),
            ),
            const SizedBox(height: 12),
            _dateField(
              context,
              label: context.tr('Date de début', 'تاريخ البداية'),
              value: _startDate,
              onChanged: (value) => setState(() => _startDate = value),
              required: true,
            ),
            const SizedBox(height: 12),
            _dateField(
              context,
              label: context.tr('Date de fin', 'تاريخ النهاية'),
              value: _endDate,
              onChanged: (value) => setState(() => _endDate = value),
              required: true,
            ),
            const SizedBox(height: 12),
            _requiredTextField(
              context,
              _frequency,
              context.tr('Fréquence', 'التردد'),
              keyboardType: TextInputType.number,
              validator: (value) {
                final number = int.tryParse((value ?? '').trim());
                if (number == null || number <= 0) {
                  return context.tr('Valeur invalide', 'قيمة غير صالحة');
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            _requiredTextField(
              context,
              _amount,
              context.tr('Montant (DH)', 'المبلغ (درهم)'),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              validator: (value) {
                final number = double.tryParse((value ?? '').trim());
                if (number == null || number < 0) {
                  return context.tr('Valeur invalide', 'قيمة غير صالحة');
                }
                return null;
              },
            ),
            const SizedBox(height: 14),
            DocumentEditor(
              documents: _documents,
              onChanged: (value) => setState(() => _documents = value),
            ),
            const SizedBox(height: 18),
            FilledButton(
              onPressed: _submit,
              child: Text(
                context.tr('Confirmer la location', 'تأكيد الكراء'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    if (_startDate.isEmpty || _endDate.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.tr('Choisissez les deux dates.', 'اختر تاريخ البداية والنهاية.'),
          ),
        ),
      );
      return;
    }

    if (_endDate.compareTo(_startDate) < 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'La date de fin doit être postérieure ou égale à la date de début.',
              'يجب أن يكون تاريخ النهاية بعد أو مساوياً لتاريخ البداية.',
            ),
          ),
        ),
      );
      return;
    }

    Navigator.of(context).pop(
      _RentalFormResult(
        tenantName: _tenant.text.trim(),
        startDate: _startDate,
        endDate: _endDate,
        frequency: int.parse(_frequency.text.trim()),
        amount: double.parse(_amount.text.trim()),
        documents: _documents,
      ),
    );
  }
}

class _DisposalFormPage extends StatefulWidget {
  const _DisposalFormPage();

  @override
  State<_DisposalFormPage> createState() => _DisposalFormPageState();
}

class _DisposalFormPageState extends State<_DisposalFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _amount = TextEditingController();
  final _purchaser = TextEditingController();
  String _date = '';
  String _method = 'SALE';
  List<AppDocument> _documents = [];

  @override
  void dispose() {
    _amount.dispose();
    _purchaser.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(context.tr('Céder et archiver', 'تفويت وأرشفة الممتلك')),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
          children: [
            _dateField(
              context,
              label: context.tr('Date de cession', 'تاريخ التفويت'),
              value: _date,
              onChanged: (value) => setState(() => _date = value),
              required: true,
              lastDate: DateTime.now(),
            ),
            const SizedBox(height: 12),
            _requiredTextField(
              context,
              _amount,
              context.tr('Montant (DH)', 'المبلغ (درهم)'),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              validator: (value) {
                final number = double.tryParse((value ?? '').trim());
                if (number == null || number < 0) {
                  return context.tr('Valeur invalide', 'قيمة غير صالحة');
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _method,
              decoration: InputDecoration(
                labelText: context.tr('Mode de cession', 'طريقة التفويت'),
              ),
              items: [
                DropdownMenuItem(value: 'SALE', child: Text(context.tr('Vente', 'بيع'))),
                DropdownMenuItem(value: 'DONATION', child: Text(context.tr('Don', 'هبة'))),
                DropdownMenuItem(value: 'TRANSFER', child: Text(context.tr('Transfert', 'تحويل'))),
                DropdownMenuItem(value: 'SCRAPPING', child: Text(context.tr('Mise au rebut', 'إتلاف'))),
              ],
              onChanged: (value) {
                if (value != null) setState(() => _method = value);
              },
            ),
            const SizedBox(height: 12),
            _requiredTextField(
              context,
              _purchaser,
              context.tr('Acquéreur / bénéficiaire', 'المشتري / المستفيد'),
            ),
            const SizedBox(height: 14),
            DocumentEditor(
              documents: _documents,
              onChanged: (value) => setState(() => _documents = value),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context)
                    .colorScheme
                    .errorContainer
                    .withValues(alpha: .55),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(
                context.tr(
                  'Après confirmation, le bien sera retiré de la liste active et placé dans les archives.',
                  'بعد التأكيد، سيتم حذف الممتلك من اللائحة النشطة ووضعه في الأرشيف.',
                ),
              ),
            ),
            const SizedBox(height: 18),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.error,
              ),
              onPressed: _submit,
              child: Text(context.tr('Céder et archiver', 'تفويت وأرشفة')),
            ),
          ],
        ),
      ),
    );
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (_date.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.tr('Choisissez la date de cession.', 'اختر تاريخ التفويت.'),
          ),
        ),
      );
      return;
    }

    Navigator.of(context).pop(
      _DisposalFormResult(
        disposalDate: _date,
        amount: double.parse(_amount.text.trim()),
        disposalMethod: _method,
        purchaser: _purchaser.text.trim(),
        documents: _documents,
      ),
    );
  }
}

class _RentalFormResult {
  const _RentalFormResult({
    required this.tenantName,
    required this.startDate,
    required this.endDate,
    required this.frequency,
    required this.amount,
    required this.documents,
  });

  final String tenantName;
  final String startDate;
  final String endDate;
  final int frequency;
  final double amount;
  final List<AppDocument> documents;
}

class _DisposalFormResult {
  const _DisposalFormResult({
    required this.disposalDate,
    required this.amount,
    required this.disposalMethod,
    required this.purchaser,
    required this.documents,
  });

  final String disposalDate;
  final double amount;
  final String disposalMethod;
  final String purchaser;
  final List<AppDocument> documents;
}

class _FormSection extends StatelessWidget {
  const _FormSection({
    required this.title,
    required this.child,
  });

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _InfoEntry {
  const _InfoEntry(this.label, this.value);
  final String label;
  final String value;
}

class _InfoGrid extends StatelessWidget {
  const _InfoGrid({required this.items});
  final List<_InfoEntry> items;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const gap = 10.0;
        final columns = constraints.maxWidth >= 720 ? 3 : 2;
        final width = (constraints.maxWidth - gap * (columns - 1)) / columns;

        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: items
              .map(
                (item) => SizedBox(
                  width: width,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: Theme.of(context).dividerColor.withValues(alpha: .45),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.label,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color: Theme.of(context)
                                    .colorScheme
                                    .onSurfaceVariant,
                              ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          item.value,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                ),
              )
              .toList(),
        );
      },
    );
  }
}

List<_InfoEntry> _specificInfo(BuildContext context, BienApiListItem bien) {
  final raw = bien.raw;
  final result = <_InfoEntry>[];

  void add(String label, dynamic value, {String suffix = ''}) {
    if (value == null) return;
    final text = value.toString().trim();
    if (text.isEmpty) return;
    result.add(_InfoEntry(label, '$text$suffix'));
  }

  if (bien.type == 'VEHICLE') {
    add(context.tr('Immatriculation', 'رقم التسجيل'), raw['registrationNumber']);
    add(context.tr('Marque', 'العلامة'), raw['make']);
    add(context.tr('Numéro de châssis', 'رقم الهيكل'), raw['chassisNumber']);
    add(
      context.tr('Puissance fiscale', 'القوة الجبائية'),
      raw['fiscalHorsepower'],
      suffix: ' CV',
    );
    add(
      context.tr('Première mise en circulation', 'أول وضع في السير'),
      raw['firstRegistrationDate'],
    );
    add(context.tr('Année', 'السنة'), raw['manufactureYear']);
    add(
      context.tr('Kilométrage', 'عداد الكيلومترات'),
      raw['odometer'],
      suffix: ' km',
    );
  } else if (bien.type == 'MACHINE') {
    add(context.tr('Marque', 'العلامة'), raw['brand']);
    add(context.tr('Modèle', 'الطراز'), raw['model']);
    add(context.tr('Numéro de série', 'الرقم التسلسلي'), raw['serialNumber']);
    add(context.tr('Référence technique', 'المرجع التقني'), raw['technicalRef']);
    add(context.tr('Puissance', 'القدرة'), raw['power']);
  } else if (bien.type == 'REAL_ESTATE') {
    add(context.tr('Référence foncière', 'المرجع العقاري'), raw['landTitleReference']);
    add(context.tr('Référence cadastrale', 'المرجع المساحي'), raw['cadastralReference']);
    add(context.tr('Superficie', 'المساحة'), raw['areaM2'], suffix: ' m²');
    add(context.tr('Localisation GPS', 'الموقع GPS'), raw['gpsLocation']);
    add(context.tr('Domaine', 'المجال'), raw['domain']);
    add(context.tr('Type immobilier', 'نوع العقار'), raw['realEstateType']);
  }

  return result;
}

Widget _requiredTextField(
  BuildContext context,
  TextEditingController controller,
  String label, {
  TextInputType? keyboardType,
  String? Function(String?)? validator,
}) {
  return TextFormField(
    controller: controller,
    keyboardType: keyboardType,
    decoration: InputDecoration(labelText: label),
    validator: validator ??
        (value) => value == null || value.trim().isEmpty
            ? context.tr('Champ obligatoire', 'حقل إجباري')
            : null,
  );
}

Widget _readOnlyField(BuildContext context, String label, String value) {
  return InputDecorator(
    decoration: InputDecoration(labelText: label),
    child: Text(
      value.trim().isEmpty ? '—' : value,
      style: const TextStyle(fontWeight: FontWeight.w700),
    ),
  );
}

Widget _dateField(
  BuildContext context, {
  required String label,
  required String value,
  required ValueChanged<String> onChanged,
  bool required = false,
  DateTime? lastDate,
}) {
  return FormField<String>(
    initialValue: value,
    validator: (_) {
      if (required && value.trim().isEmpty) {
        return context.tr('Champ obligatoire', 'حقل إجباري');
      }
      return null;
    },
    builder: (field) => InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () async {
        final now = DateTime.now();
        final initial = DateTime.tryParse(value) ?? now;
        final picked = await showDatePicker(
          context: context,
          initialDate: initial,
          firstDate: DateTime(1950),
          lastDate: lastDate ?? DateTime(now.year + 20),
        );
        if (picked == null) return;
        final formatted = _isoDate(picked);
        onChanged(formatted);
        field.didChange(formatted);
      },
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          errorText: field.errorText,
          suffixIcon: const Icon(Icons.calendar_today_outlined),
        ),
        child: Text(value.isEmpty ? '—' : value),
      ),
    ),
  );
}

Widget _controllerDateField(
  BuildContext context, {
  required TextEditingController controller,
  required String label,
  bool required = false,
  DateTime? lastDate,
}) {
  return TextFormField(
    controller: controller,
    readOnly: true,
    decoration: InputDecoration(
      labelText: label,
      suffixIcon: const Icon(Icons.calendar_today_outlined),
    ),
    validator: (value) {
      if (required && (value == null || value.trim().isEmpty)) {
        return context.tr('Champ obligatoire', 'حقل إجباري');
      }
      return null;
    },
    onTap: () async {
      final now = DateTime.now();
      final initial = DateTime.tryParse(controller.text) ?? now;
      final picked = await showDatePicker(
        context: context,
        initialDate: initial,
        firstDate: DateTime(1950),
        lastDate: lastDate ?? DateTime(now.year + 20),
      );
      if (picked != null) controller.text = _isoDate(picked);
    },
  );
}

String _isoDate(DateTime value) =>
    '${value.year.toString().padLeft(4, '0')}-'
    '${value.month.toString().padLeft(2, '0')}-'
    '${value.day.toString().padLeft(2, '0')}';

String _text(dynamic value) => value == null ? '' : value.toString().trim();

String _cleanOrDash(String? value) {
  final text = value?.trim() ?? '';
  return text.isEmpty ? '—' : text;
}

String? _emptyToNull(String value) {
  final text = value.trim();
  return text.isEmpty ? null : text;
}

double? _optionalDouble(String value) {
  final text = value.trim();
  return text.isEmpty ? null : double.tryParse(text);
}

int? _optionalInt(String value) {
  final text = value.trim();
  return text.isEmpty ? null : int.tryParse(text);
}

const _filterStatuses = [
  'AVAILABLE',
  'IN_USE',
  'RENTED',
  'UNDER_MAINTENANCE',
  'OUT_OF_SERVICE',
  'DAMAGED',
];

const _manualStatuses = [
  'AVAILABLE',
  'IN_USE',
  'OUT_OF_SERVICE',
  'DAMAGED',
];

const _systemManagedStatuses = [
  'RENTED',
  'UNDER_MAINTENANCE',
  'DISPOSED',
  'ARCHIVED',
];

IconData _typeIcon(String? type) {
  switch (type) {
    case 'VEHICLE':
      return Icons.directions_car_outlined;
    case 'MACHINE':
      return Icons.precision_manufacturing_outlined;
    case 'REAL_ESTATE':
      return Icons.apartment_outlined;
    default:
      return Icons.inventory_2_outlined;
  }
}

String _typeLabel(BuildContext context, String? type) {
  switch (type) {
    case 'VEHICLE':
      return context.tr('Véhicule', 'مركبة');
    case 'MACHINE':
      return context.tr('Machine', 'آلة');
    case 'REAL_ESTATE':
      return context.tr('Immobilier', 'عقار');
    default:
      return '—';
  }
}

String _statusLabel(BuildContext context, String status) {
  switch (status) {
    case 'AVAILABLE':
      return context.tr('Disponible', 'متاح');
    case 'IN_USE':
      return context.tr('En service', 'قيد الاستعمال');
    case 'RENTED':
      return context.tr('Loué', 'مكترى');
    case 'UNDER_MAINTENANCE':
      return context.tr('En maintenance', 'في الصيانة');
    case 'OUT_OF_SERVICE':
      return context.tr('Hors service', 'خارج الخدمة');
    case 'DAMAGED':
      return context.tr('Endommagé', 'متضرر');
    case 'DISPOSED':
      return context.tr('Cédé', 'مفوّت');
    case 'ARCHIVED':
      return context.tr('Archivé', 'مؤرشف');
    default:
      return status;
  }
}
