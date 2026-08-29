import 'dart:io';
import 'package:cross_file/cross_file.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/localization/bilingual.dart';
import '../../state/app_state.dart';
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

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final rows = _rows(state);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(context.tr('Rapports', 'التقارير'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
        const SizedBox(height: 12),
        SectionCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            DropdownButtonFormField<String>(
              value: _type,
              decoration: InputDecoration(labelText: context.tr('Type de rapport', 'نوع التقرير')),
              items: [
                DropdownMenuItem(value: 'USERS', child: Text(context.tr('Utilisateurs', 'المستخدمون'))),
                DropdownMenuItem(value: 'ASSETS', child: Text(context.tr('Biens', 'الممتلكات'))),
                DropdownMenuItem(value: 'STOCK', child: Text(context.tr('Stock', 'المخزون'))),
                DropdownMenuItem(value: 'LIGHTING', child: Text(context.tr('Éclairage public', 'الإنارة العمومية'))),
              ],
              onChanged: (v) => setState(() => _type = v ?? _type),
            ),
            const SizedBox(height: 10),
            Row(children: [
              Expanded(child: OutlinedButton.icon(onPressed: () => _pickDate(true), icon: const Icon(Icons.event), label: Text('${context.tr('Début', 'البداية')}: ${formatDate(_start)}'))),
              const SizedBox(width: 8),
              Expanded(child: OutlinedButton.icon(onPressed: () => _pickDate(false), icon: const Icon(Icons.event), label: Text('${context.tr('Fin', 'النهاية')}: ${formatDate(_end)}'))),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: FilledButton.tonalIcon(onPressed: () => _exportPdf(context, state), icon: const Icon(Icons.picture_as_pdf_outlined), label: const Text('PDF'))),
              const SizedBox(width: 8),
              Expanded(child: FilledButton.tonalIcon(onPressed: () => _exportCsv(context, state), icon: const Icon(Icons.table_view_outlined), label: Text(context.tr('Excel / CSV', 'Excel / CSV')))),
            ]),
          ]),
        ),
        const SizedBox(height: 14),
        Row(children: [
          Expanded(child: StatCard(label: context.tr('Lignes', 'الأسطر'), value: '${rows.length}', icon: Icons.table_rows_outlined)),
          const SizedBox(width: 8),
          Expanded(child: StatCard(label: context.tr('Période', 'الفترة'), value: '${_end.difference(_start).inDays + 1} j', icon: Icons.date_range_outlined, tint: Colors.blue)),
        ]),
        const SizedBox(height: 14),
        SectionCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(context.tr('Aperçu', 'معاينة'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
            const SizedBox(height: 8),
            if (rows.isEmpty)
              Text(context.tr('Aucune donnée dans la période.', 'لا توجد بيانات في هذه الفترة.'))
            else
              ...rows.take(20).map((row) => ListTile(contentPadding: EdgeInsets.zero, dense: true, leading: const Icon(Icons.chevron_right), title: Text(row.join(' · ')))),
          ]),
        ),
      ],
    );
  }

  Future<void> _pickDate(bool start) async {
    final initial = start ? _start : _end;
    final value = await showDatePicker(context: context, initialDate: initial, firstDate: DateTime(2000), lastDate: DateTime.now().add(const Duration(days: 3650)));
    if (value != null) setState(() { if (start) _start = value; else _end = value; });
  }

  List<List<String>> _rows(AppState state) {
    switch (_type) {
      case 'USERS':
        return state.users.map((u) => [u.fullName, u.email, u.role.name, u.phone]).toList();
      case 'ASSETS':
        return state.biens.where((b) => !b.acquisitionDate.isBefore(_start) && !b.acquisitionDate.isAfter(_end)).map((b) => [b.inventoryId, b.designation, b.assignment, '${b.purchaseValue.toStringAsFixed(0)} DH']).toList();
      case 'STOCK':
        return state.articles.map((a) => [a.reference, a.designation, '${a.quantity}', a.location, a.barcode]).toList();
      case 'LIGHTING':
        return state.lights.map((l) => [l.reference, l.designation, l.zone, l.status.name, '${l.power.toStringAsFixed(0)} W']).toList();
      default:
        return [];
    }
  }

  List<String> _headers(BuildContext context) {
    switch (_type) {
      case 'USERS':
        return [context.tr('Nom', 'الاسم'), 'E-mail', context.tr('Rôle', 'الدور'), context.tr('Téléphone', 'الهاتف')];
      case 'ASSETS':
        return [context.tr('Inventaire', 'الجرد'), context.tr('Désignation', 'التسمية'), context.tr('Affectation', 'المصلحة'), context.tr('Valeur', 'القيمة')];
      case 'STOCK':
        return [context.tr('Référence', 'المرجع'), context.tr('Article', 'المادة'), context.tr('Quantité', 'الكمية'), context.tr('Emplacement', 'المكان'), context.tr('Code-barres', 'الباركود')];
      case 'LIGHTING':
        return [context.tr('Référence', 'المرجع'), context.tr('Point', 'النقطة'), context.tr('Zone', 'المنطقة'), context.tr('Statut', 'الحالة'), context.tr('Puissance', 'القدرة')];
      default:
        return [];
    }
  }

  Future<void> _exportPdf(BuildContext context, AppState state) async {
    final rows = _rows(state);
    final headers = _headers(context);
    final doc = pw.Document();
    doc.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4.landscape,
        margin: const pw.EdgeInsets.all(24),
        build: (_) => [
          pw.Text('SGPBSE - $_type', style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 6),
          pw.Text('${_start.toIso8601String().substring(0, 10)} - ${_end.toIso8601String().substring(0, 10)}'),
          pw.SizedBox(height: 16),
          pw.TableHelper.fromTextArray(headers: headers, data: rows),
        ],
      ),
    );
    await Printing.sharePdf(bytes: await doc.save(), filename: 'SGPBSE_${_type}_${DateTime.now().millisecondsSinceEpoch}.pdf');
  }

  Future<void> _exportCsv(BuildContext context, AppState state) async {
    final rows = [_headers(context), ..._rows(state)];
    String esc(String value) => '"${value.replaceAll('"', '""')}"';
    final csv = rows.map((row) => row.map(esc).join(',')).join('\n');
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/SGPBSE_${_type}_${DateTime.now().millisecondsSinceEpoch}.csv');
    await file.writeAsString('\uFEFF$csv');
    await Share.shareXFiles([XFile(file.path)], text: 'SGPBSE $_type');
  }
}
