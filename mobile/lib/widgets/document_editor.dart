import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../core/localization/bilingual.dart';
import '../models/app_document.dart';
import 'common.dart';

class DocumentEditor extends StatelessWidget {
  const DocumentEditor({super.key, required this.documents, required this.onChanged});

  final List<AppDocument> documents;
  final ValueChanged<List<AppDocument>> onChanged;

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
              Expanded(child: Text(context.tr('Documents', 'الوثائق'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17))),
              IconButton(
                tooltip: context.tr('Ajouter', 'إضافة'),
                onPressed: () => _addDocument(context),
                icon: const Icon(Icons.add_circle_outline),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            context.tr(
              'Pièce jointe simple ou document officiel avec date d’expiration et rappel.',
              'مرفق عادي أو وثيقة رسمية بتاريخ انتهاء وتذكير.',
            ),
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 12),
          if (documents.isEmpty)
            Text(context.tr('Aucun document ajouté.', 'لم تتم إضافة أي وثيقة.'), style: Theme.of(context).textTheme.bodyMedium)
          else
            ...documents.map(
              (doc) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: CircleAvatar(child: Icon(doc.isOfficial ? Icons.verified_outlined : Icons.attach_file)),
                title: Text(doc.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                subtitle: Text(
                  doc.isOfficial && doc.expirationDate != null
                      ? '${doc.fileName}\n${context.tr('Expire le', 'تنتهي في')} ${formatDate(doc.expirationDate!)} · ${doc.reminderDaysBefore ?? 0} ${context.tr('j avant', 'يوم قبل')}'
                      : doc.fileName,
                ),
                isThreeLine: doc.isOfficial && doc.expirationDate != null,
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                  onPressed: () {
                    final next = [...documents]..removeWhere((item) => item.id == doc.id);
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
    final result = await showModalBottomSheet<AppDocument>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) => _DocumentForm(nextId: documents.isEmpty ? 1 : documents.map((e) => e.id).reduce((a, b) => a > b ? a : b) + 1),
    );

    if (result != null) onChanged([...documents, result]);
  }
}

class _DocumentForm extends StatefulWidget {
  const _DocumentForm({required this.nextId});
  final int nextId;

  @override
  State<_DocumentForm> createState() => _DocumentFormState();
}

class _DocumentFormState extends State<_DocumentForm> {
  final _name = TextEditingController();
  DocumentCategory _category = DocumentCategory.attachment;
  DocumentType _type = DocumentType.other;
  DateTime? _expirationDate;
  int _reminderDays = 7;
  String _fileName = '';

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles();
    if (result != null && result.files.isNotEmpty) {
      setState(() => _fileName = result.files.single.name);
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final value = await showDatePicker(
      context: context,
      initialDate: _expirationDate ?? now.add(const Duration(days: 30)),
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 20),
    );
    if (value != null) setState(() => _expirationDate = value);
  }

  void _submit() {
    if (_name.text.trim().isEmpty || _fileName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('Nom et fichier sont obligatoires.', 'الاسم والملف إجباريان.'))));
      return;
    }
    if (_category == DocumentCategory.official && _expirationDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('Choisissez la date d’expiration.', 'اختر تاريخ انتهاء الصلاحية.'))));
      return;
    }

    Navigator.pop(
      context,
      AppDocument(
        id: widget.nextId,
        name: _name.text.trim(),
        type: _type,
        fileName: _fileName,
        uploadDate: DateTime.now(),
        category: _category,
        expirationDate: _category == DocumentCategory.official ? _expirationDate : null,
        reminderDaysBefore: _category == DocumentCategory.official ? _reminderDays : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(20, 0, 20, 20 + MediaQuery.of(context).viewInsets.bottom),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(context.tr('Ajouter un document', 'إضافة وثيقة'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(height: 16),
              SegmentedButton<DocumentCategory>(
                segments: [
                  ButtonSegment(value: DocumentCategory.attachment, label: Text(context.tr('Pièce jointe', 'مرفق')), icon: const Icon(Icons.attach_file)),
                  ButtonSegment(value: DocumentCategory.official, label: Text(context.tr('Officiel', 'رسمية')), icon: const Icon(Icons.verified_outlined)),
                ],
                selected: {_category},
                onSelectionChanged: (value) => setState(() => _category = value.first),
              ),
              const SizedBox(height: 14),
              TextField(controller: _name, decoration: InputDecoration(labelText: context.tr('Nom du document', 'اسم الوثيقة'))),
              const SizedBox(height: 12),
              DropdownButtonFormField<DocumentType>(
                value: _type,
                decoration: InputDecoration(labelText: context.tr('Type', 'النوع')),
                items: DocumentType.values.map((type) => DropdownMenuItem(value: type, child: Text(_typeLabel(context, type)))).toList(),
                onChanged: (value) => setState(() => _type = value ?? DocumentType.other),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _pickFile,
                icon: const Icon(Icons.upload_file),
                label: Text(_fileName.isEmpty ? context.tr('Choisir un fichier', 'اختيار ملف') : _fileName),
              ),
              if (_category == DocumentCategory.official) ...[
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _pickDate,
                  icon: const Icon(Icons.event),
                  label: Text(_expirationDate == null ? context.tr('Date d’expiration', 'تاريخ انتهاء الصلاحية') : formatDate(_expirationDate!)),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<int>(
                  value: _reminderDays,
                  decoration: InputDecoration(labelText: context.tr('Notifier avant expiration', 'التذكير قبل الانتهاء')),
                  items: const [1, 3, 7, 15, 30, 60, 90]
                      .map((days) => DropdownMenuItem(value: days, child: Text(context.tr('$days jour(s) avant', 'قبل $days يوم'))))
                      .toList(),
                  onChanged: (value) => setState(() => _reminderDays = value ?? 7),
                ),
              ],
              const SizedBox(height: 18),
              FilledButton.icon(onPressed: _submit, icon: const Icon(Icons.add), label: Text(context.tr('Ajouter', 'إضافة'))),
            ],
          ),
        ),
      ),
    );
  }

  String _typeLabel(BuildContext context, DocumentType type) {
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
