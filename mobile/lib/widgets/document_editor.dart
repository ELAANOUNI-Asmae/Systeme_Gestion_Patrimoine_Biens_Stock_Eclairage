
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:printing/printing.dart';

import '../core/localization/bilingual.dart';
import '../models/app_document.dart';
import 'common.dart';

class DocumentEditor extends StatelessWidget {
  const DocumentEditor({
    super.key,
    required this.documents,
    required this.onChanged,
    this.readOnly = false,
    this.showGuidance = true,
  });

  final List<AppDocument> documents;
  final ValueChanged<List<AppDocument>> onChanged;
  final bool readOnly;
  final bool showGuidance;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.description_outlined),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  context.tr('Documents associés', 'الوثائق المرتبطة'),
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 17,
                  ),
                ),
              ),
              if (!readOnly)
                IconButton(
                  tooltip: context.tr('Ajouter', 'إضافة'),
                  onPressed: () => _addDocument(context),
                  icon: const Icon(Icons.add_circle_outline),
                ),
            ],
          ),
          if (showGuidance) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context)
                    .colorScheme
                    .primaryContainer
                    .withValues(alpha: .45),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(
                context.tr(
                  'Document officiel : utilisez-le pour une pièce avec date d’expiration (assurance, certificat, garantie…). Une alerte peut être générée avant l’échéance. Pièce jointe : fichier simple sans date d’expiration.',
                  'وثيقة رسمية: اخترها للوثائق التي لها تاريخ انتهاء مثل التأمين أو الشهادة أو الضمان، ويمكن إنشاء تنبيه قبل الانتهاء. مرفق: ملف عادي بدون تاريخ انتهاء.',
                ),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ],
          const SizedBox(height: 12),
          if (documents.isEmpty)
            Text(
              context.tr(
                'Aucun document ajouté.',
                'لم تتم إضافة أي وثيقة.',
              ),
            )
          else
            ...documents.map(
              (document) => ListTile(
                contentPadding: EdgeInsets.zero,
                onTap: () => _previewDocument(context, document),
                leading: CircleAvatar(
                  child: Icon(
                    document.isOfficial
                        ? Icons.verified_outlined
                        : Icons.attach_file,
                  ),
                ),
                title: Text(
                  document.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(
                  document.isOfficial &&
                          document.expirationDate != null
                      ? '${document.fileName}\n${context.tr('Expire le', 'تنتهي في')} ${formatDate(document.expirationDate!)} · ${document.reminderDaysBefore ?? 0} ${context.tr('j avant', 'يوم قبل')}'
                      : document.fileName,
                ),
                isThreeLine:
                    document.isOfficial &&
                    document.expirationDate != null,
                trailing: readOnly
                    ? const Icon(Icons.visibility_outlined)
                    : IconButton(
                        icon: const Icon(
                          Icons.delete_outline,
                          color: Colors.redAccent,
                        ),
                        onPressed: () {
                          final next = [...documents]
                            ..removeWhere(
                              (item) => item.id == document.id,
                            );
                          onChanged(next);
                        },
                      ),
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _addDocument(BuildContext context) async {
    final nextId = documents.isEmpty
        ? 1
        : documents
                .map((item) => item.id)
                .reduce((a, b) => a > b ? a : b) +
            1;

    final result = await showModalBottomSheet<AppDocument>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) => _DocumentForm(nextId: nextId),
    );

    if (result != null) {
      onChanged([...documents, result]);
    }
  }

  Future<void> _previewDocument(
    BuildContext context,
    AppDocument document,
  ) async {
    final bytes = document.fileBytes;
    final lower = document.fileName.toLowerCase();
    final isPdf = lower.endsWith('.pdf');
    final isImage = lower.endsWith('.png') ||
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.webp');

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => Dialog(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: 850,
            maxHeight: 760,
          ),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment:
                            CrossAxisAlignment.start,
                        children: [
                          Text(
                            document.name,
                            style: Theme.of(dialogContext)
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                  fontWeight: FontWeight.w900,
                                ),
                          ),
                          Text(
                            document.fileName,
                            style: Theme.of(dialogContext)
                                .textTheme
                                .bodySmall,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () =>
                          Navigator.of(dialogContext).pop(),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: bytes == null
                      ? _MissingPreview(document: document)
                      : isImage
                          ? InteractiveViewer(
                              child: Center(
                                child: Image.memory(
                                  bytes,
                                  fit: BoxFit.contain,
                                ),
                              ),
                            )
                          : isPdf
                              ? PdfPreview(
                                  build: (_) async => bytes,
                                )
                              : _MissingPreview(
                                  document: document,
                                  message: dialogContext.tr(
                                    'Aperçu non disponible pour ce format.',
                                    'المعاينة غير متاحة لهذا النوع من الملفات.',
                                  ),
                                ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MissingPreview extends StatelessWidget {
  const _MissingPreview({
    required this.document,
    this.message,
  });

  final AppDocument document;
  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.description_outlined,
              size: 64,
            ),
            const SizedBox(height: 12),
            Text(
              document.fileName,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              message ??
                  context.tr(
                    'Le fichier de démonstration n’est pas stocké localement. Les documents ajoutés depuis l’application peuvent être prévisualisés. Après connexion au backend, cet écran utilisera le téléchargement du document.',
                    'ملف العرض التجريبي غير مخزن محلياً. يمكن معاينة الوثائق المضافة من التطبيق، وبعد ربط الواجهة بالخلفية سيتم استعمال تحميل الوثيقة.',
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _DocumentForm extends StatefulWidget {
  const _DocumentForm({
    required this.nextId,
  });

  final int nextId;

  @override
  State<_DocumentForm> createState() =>
      _DocumentFormState();
}

class _DocumentFormState extends State<_DocumentForm> {
  final _name = TextEditingController();
  DocumentCategory _category =
      DocumentCategory.attachment;
  DocumentType _type = DocumentType.other;
  DateTime? _expirationDate;
  int _reminderDays = 7;
  PlatformFile? _selectedFile;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      withData: true,
    );

    if (result != null && result.files.isNotEmpty) {
      setState(() {
        _selectedFile = result.files.single;
      });
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();

    final value = await showDatePicker(
      context: context,
      initialDate: _expirationDate ??
          now.add(const Duration(days: 30)),
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 20),
    );

    if (value != null) {
      setState(() {
        _expirationDate = value;
      });
    }
  }

  void _submit() {
    if (_name.text.trim().isEmpty || _selectedFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Nom et fichier sont obligatoires.',
              'الاسم والملف إجباريان.',
            ),
          ),
        ),
      );
      return;
    }

    if (_category == DocumentCategory.official &&
        _expirationDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.tr(
              'Choisissez la date d’expiration.',
              'اختر تاريخ انتهاء الصلاحية.',
            ),
          ),
        ),
      );
      return;
    }

    Navigator.pop(
      context,
      AppDocument(
        id: widget.nextId,
        name: _name.text.trim(),
        type: _type,
        fileName: _selectedFile!.name,
        uploadDate: DateTime.now(),
        category: _category,
        expirationDate:
            _category == DocumentCategory.official
                ? _expirationDate
                : null,
        reminderDaysBefore:
            _category == DocumentCategory.official
                ? _reminderDays
                : null,
        fileBytes: _selectedFile!.bytes,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          0,
          20,
          20 + MediaQuery.of(context).viewInsets.bottom,
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                context.tr(
                  'Ajouter un document',
                  'إضافة وثيقة',
                ),
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 16),
              SegmentedButton<DocumentCategory>(
                segments: [
                  ButtonSegment<DocumentCategory>(
                    value: DocumentCategory.attachment,
                    label: Text(
                      context.tr('Pièce jointe', 'مرفق'),
                    ),
                    icon: const Icon(Icons.attach_file),
                  ),
                  ButtonSegment<DocumentCategory>(
                    value: DocumentCategory.official,
                    label: Text(
                      context.tr('Officiel', 'رسمية'),
                    ),
                    icon: const Icon(Icons.verified_outlined),
                  ),
                ],
                selected: {_category},
                onSelectionChanged: (value) {
                  setState(() {
                    _category = value.first;
                  });
                },
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _name,
                decoration: InputDecoration(
                  labelText: context.tr(
                    'Nom du document',
                    'اسم الوثيقة',
                  ),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<DocumentType>(
                initialValue: _type,
                decoration: InputDecoration(
                  labelText: context.tr('Type', 'النوع'),
                ),
                items: DocumentType.values
                    .map(
                      (type) => DropdownMenuItem<DocumentType>(
                        value: type,
                        child: Text(
                          _typeLabel(context, type),
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (value) {
                  setState(() {
                    _type = value ?? DocumentType.other;
                  });
                },
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _pickFile,
                icon: const Icon(Icons.upload_file),
                label: Text(
                  _selectedFile == null
                      ? context.tr(
                          'Choisir un fichier',
                          'اختيار ملف',
                        )
                      : _selectedFile!.name,
                ),
              ),
              if (_category == DocumentCategory.official) ...[
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _pickDate,
                  icon: const Icon(Icons.event),
                  label: Text(
                    _expirationDate == null
                        ? context.tr(
                            'Date d’expiration',
                            'تاريخ انتهاء الصلاحية',
                          )
                        : formatDate(_expirationDate!),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<int>(
                  initialValue: _reminderDays,
                  decoration: InputDecoration(
                    labelText: context.tr(
                      'Notifier avant expiration',
                      'التذكير قبل الانتهاء',
                    ),
                  ),
                  items: const [
                    1,
                    3,
                    7,
                    15,
                    30,
                    60,
                    90,
                  ]
                      .map(
                        (days) => DropdownMenuItem<int>(
                          value: days,
                          child: Text(
                            context.tr(
                              '$days jour(s) avant',
                              'قبل $days يوم',
                            ),
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (value) {
                    setState(() {
                      _reminderDays = value ?? 7;
                    });
                  },
                ),
              ],
              const SizedBox(height: 18),
              FilledButton.icon(
                onPressed: _submit,
                icon: const Icon(Icons.add),
                label: Text(
                  context.tr('Ajouter', 'إضافة'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _typeLabel(
    BuildContext context,
    DocumentType type,
  ) {
    switch (type) {
      case DocumentType.invoice:
        return context.tr('Facture', 'فاتورة');
      case DocumentType.receipt:
        return context.tr('Reçu', 'وصل');
      case DocumentType.contract:
        return context.tr('Contrat', 'عقد');
      case DocumentType.registration:
        return context.tr('Immatriculation', 'التسجيل');
      case DocumentType.insurance:
        return context.tr('Assurance', 'التأمين');
      case DocumentType.certificate:
        return context.tr('Certificat', 'شهادة');
      case DocumentType.deliveryNote:
        return context.tr('Bon de livraison', 'سند التسليم');
      case DocumentType.exitVoucher:
        return context.tr('Bon de sortie', 'إذن الخروج');
      case DocumentType.technicalSheet:
        return context.tr('Fiche technique', 'ورقة تقنية');
      case DocumentType.warranty:
        return context.tr('Garantie', 'ضمان');
      case DocumentType.report:
        return context.tr('Rapport', 'تقرير');
      case DocumentType.photo:
        return context.tr('Photo', 'صورة');
      case DocumentType.other:
        return context.tr('Autre', 'أخرى');
    }
  }
}
