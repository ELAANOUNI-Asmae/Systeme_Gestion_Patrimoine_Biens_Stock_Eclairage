import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/localization/bilingual.dart';
import '../../models/app_document.dart';
import '../../models/lighting.dart';
import '../../state/app_state.dart';
import '../../widgets/document_editor.dart';
import '../auth/login_screen.dart';

class PublicFailureScreen extends StatefulWidget {
  const PublicFailureScreen({super.key});

  @override
  State<PublicFailureScreen> createState() => _PublicFailureScreenState();
}

class _PublicFailureScreenState extends State<PublicFailureScreen> {
  final _search = TextEditingController();
  final _description = TextEditingController();
  int? _selectedLightId;
  List<AppDocument> _documents = [];
  int? _reportId;

  @override
  void dispose() {
    _search.dispose();
    _description.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final query = _search.text.trim().toLowerCase();
    final openLightIds = state.unresolvedFailures.map((e) => e.lightId).toSet();
    final filtered = state.lights.where((light) {
      if (query.isEmpty) return true;
      return light.reference.toLowerCase().contains(query) ||
          light.designation.toLowerCase().contains(query) ||
          light.designationAr.contains(query) ||
          light.zone.toLowerCase().contains(query) ||
          light.zoneAr.contains(query) ||
          light.address.toLowerCase().contains(query) ||
          light.addressAr.contains(query);
    }).toList();

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(18),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 760),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.asset('assets/images/logo.png', width: 50, height: 50, fit: BoxFit.cover),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(child: Text('SGPBSE', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900))),
                      PopupMenuButton<String>(
                        icon: const Icon(Icons.language),
                        onSelected: (value) => state.setLocale(Locale(value)),
                        itemBuilder: (_) => const [
                          PopupMenuItem(value: 'fr', child: Text('Français')),
                          PopupMenuItem(value: 'ar', child: Text('العربية')),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary.withOpacity(.09),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(.18)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: Theme.of(context).colorScheme.primary,
                          child: const Icon(Icons.lightbulb_outline, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(color: Colors.green.withOpacity(.14), borderRadius: BorderRadius.circular(20)),
                                child: Text(context.tr('Accès public — sans connexion', 'ولوج عمومي — بدون تسجيل الدخول'), style: const TextStyle(color: Colors.green, fontWeight: FontWeight.w700, fontSize: 12)),
                              ),
                              const SizedBox(height: 8),
                              Text(context.tr('Signaler une panne d’éclairage public', 'التبليغ عن عطل في الإنارة العمومية'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
                              const SizedBox(height: 6),
                              Text(context.tr('Tout citoyen peut signaler une panne sans compte.', 'يمكن لأي مواطن التبليغ عن عطل دون حساب.')),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  if (_reportId != null)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(22),
                        child: Column(
                          children: [
                            const Icon(Icons.check_circle, color: Colors.green, size: 54),
                            const SizedBox(height: 10),
                            Text(context.tr('Signalement envoyé', 'تم إرسال التبليغ'), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                            const SizedBox(height: 6),
                            Text(context.tr('Numéro du signalement : #$_reportId', 'رقم التبليغ: #$_reportId')),
                            const SizedBox(height: 16),
                            FilledButton.icon(
                              onPressed: () => setState(() {
                                _reportId = null;
                                _selectedLightId = null;
                                _description.clear();
                                _search.clear();
                                _documents = [];
                              }),
                              icon: const Icon(Icons.add_alert_outlined),
                              label: Text(context.tr('Signaler une autre panne', 'التبليغ عن عطل آخر')),
                            ),
                          ],
                        ),
                      ),
                    )
                  else ...[
                    TextField(
                      controller: _search,
                      onChanged: (_) => setState(() {}),
                      decoration: InputDecoration(
                        labelText: context.tr('Rechercher le point lumineux', 'البحث عن نقطة الإنارة'),
                        hintText: context.tr('Référence, zone, adresse...', 'المرجع، المنطقة، العنوان...'),
                        prefixIcon: const Icon(Icons.search),
                      ),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<int>(
                      value: _selectedLightId,
                      decoration: InputDecoration(labelText: context.tr('Point lumineux', 'نقطة الإنارة')),
                      items: filtered
                          .map(
                            (light) => DropdownMenuItem<int>(
                              value: light.id,
                              enabled: !openLightIds.contains(light.id),
                              child: Text('${light.reference} — ${context.isArabic ? light.designationAr : light.designation}${openLightIds.contains(light.id) ? ' (${context.tr('déjà signalée', 'مبلغ عنها')})' : ''}'),
                            ),
                          )
                          .toList(),
                      onChanged: (value) => setState(() => _selectedLightId = value),
                    ),
                    if (_selectedLightId != null) ...[
                      const SizedBox(height: 10),
                      _SelectedLight(light: state.lights.firstWhere((l) => l.id == _selectedLightId)),
                    ],
                    const SizedBox(height: 12),
                    TextField(
                      controller: _description,
                      minLines: 4,
                      maxLines: 6,
                      decoration: InputDecoration(
                        labelText: context.tr('Description de la panne', 'وصف العطل'),
                        hintText: context.tr('Lampe éteinte, clignotement, poteau endommagé...', 'المصباح لا يعمل، وميض، عمود متضرر...'),
                      ),
                    ),
                    const SizedBox(height: 14),
                    DocumentEditor(documents: _documents, onChanged: (value) => setState(() => _documents = value)),
                    const SizedBox(height: 14),
                    FilledButton.icon(onPressed: _submit, icon: const Icon(Icons.send), label: Text(context.tr('Envoyer le signalement', 'إرسال التبليغ'))),
                  ],
                  const SizedBox(height: 14),
                  OutlinedButton.icon(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                    icon: const Icon(Icons.login),
                    label: Text(context.tr('Connexion des agents', 'دخول الموظفين')),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _submit() {
    final state = context.read<AppState>();
    if (_selectedLightId == null || _description.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('Sélectionnez le point et décrivez la panne.', 'اختر نقطة الإنارة واكتب وصف العطل.'))));
      return;
    }
    try {
      final failure = state.createFailure(
        lightId: _selectedLightId!,
        description: _description.text.trim(),
        reportedBy: 'PUBLIC',
        documents: _documents,
      );
      setState(() => _reportId = failure.id);
    } on StateError {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('Une panne non résolue existe déjà pour ce point.', 'يوجد بالفعل عطل غير محلول في هذه النقطة.'))));
    }
  }
}

class _SelectedLight extends StatelessWidget {
  const _SelectedLight({required this.light});
  final LightPoint light;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary.withOpacity(.08), borderRadius: BorderRadius.circular(16)),
      child: Row(
        children: [
          const Icon(Icons.location_on_outlined),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(context.isArabic ? light.designationAr : light.designation, style: const TextStyle(fontWeight: FontWeight.w800)),
                Text('${light.reference} · ${context.isArabic ? light.zoneAr : light.zone}'),
                Text(context.isArabic ? light.addressAr : light.address, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
