import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/localization/bilingual.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final TextEditingController _name;
  late final TextEditingController _city;

  @override
  void initState() {
    super.initState();
    final state = context.read<AppState>();
    _name = TextEditingController(text: state.communeName);
    _city = TextEditingController(text: state.communeCity);
  }

  @override
  void dispose() {
    _name.dispose(); _city.dispose(); super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(context.tr('Paramètres', 'الإعدادات'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
        const SizedBox(height: 12),
        SectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          TextField(controller: _name, decoration: InputDecoration(labelText: context.tr('Nom de la commune', 'اسم الجماعة'))), const SizedBox(height: 10),
          TextField(controller: _city, decoration: InputDecoration(labelText: context.tr('Ville', 'المدينة'))), const SizedBox(height: 14),
          Text(context.tr('Langue', 'اللغة'), style: const TextStyle(fontWeight: FontWeight.w800)), const SizedBox(height: 8),
          SegmentedButton<String>(segments: const [ButtonSegment(value: 'fr', label: Text('FR')), ButtonSegment(value: 'ar', label: Text('العربية'))], selected: {state.locale.languageCode}, onSelectionChanged: (v) => state.setLocale(Locale(v.first))),
          const SizedBox(height: 14),
          Text(context.tr('Apparence', 'المظهر'), style: const TextStyle(fontWeight: FontWeight.w800)), const SizedBox(height: 8),
          SegmentedButton<ThemeMode>(segments: [ButtonSegment(value: ThemeMode.light, label: Text(context.tr('Clair', 'فاتح')), icon: const Icon(Icons.light_mode_outlined)), ButtonSegment(value: ThemeMode.dark, label: Text(context.tr('Sombre', 'داكن')), icon: const Icon(Icons.dark_mode_outlined))], selected: {state.themeMode == ThemeMode.dark ? ThemeMode.dark : ThemeMode.light}, onSelectionChanged: (v) => state.setThemeMode(v.first)),
          const SizedBox(height: 12),
          FilledButton.icon(onPressed: () { state.updateSettings(name: _name.text, city: _city.text); ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('Paramètres enregistrés.', 'تم حفظ الإعدادات.')))); }, icon: const Icon(Icons.save_outlined), label: Text(context.tr('Enregistrer', 'حفظ'))),
        ])),
        const SizedBox(height: 12),
        SectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(context.tr('À propos', 'حول التطبيق'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17)), const SizedBox(height: 8),
          const Text('SGPBSE Mobile 1.0.0'),
          Text(context.tr('Version mobile Flutter du système de gestion du patrimoine, des biens, du stock et de l’éclairage.', 'نسخة Flutter المحمولة لنظام تدبير الممتلكات والمخزون والإنارة.')),
        ])),
      ],
    );
  }
}
