import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/user_models.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';

class RolesScreen extends StatelessWidget {
  const RolesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(children: [
          Expanded(child: Text(context.tr('Rôles et permissions', 'الأدوار والصلاحيات'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900))),
          if (state.hasPermission(Permissions.createRole)) IconButton.filled(onPressed: () => _form(context), icon: const Icon(Icons.add_moderator_outlined)),
        ]),
        const SizedBox(height: 14),
        ...state.roles.map((r) => Card(
              child: ExpansionTile(
                leading: const CircleAvatar(child: Icon(Icons.admin_panel_settings_outlined)),
                title: Text(r.name, style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text('${r.permissions.length} ${context.tr('permissions', 'صلاحيات')}'),
                trailing: PopupMenuButton<String>(
                  onSelected: (value) async {
                    if (value == 'edit') _form(context, role: r);
                    if (value == 'delete') {
                      final ok = await confirmAction(context, fr: 'Supprimer ce rôle ?', ar: 'حذف هذا الدور؟');
                      if (!ok || !context.mounted) return;
                      try { state.deleteRole(r.id); } on StateError { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('Ce rôle est utilisé par un utilisateur.', 'هذا الدور مستعمل من طرف مستخدم.')))); }
                    }
                  },
                  itemBuilder: (_) => [
                    if (state.hasPermission(Permissions.updateRole)) PopupMenuItem(value: 'edit', child: Text(context.tr('Modifier', 'تعديل'))),
                    if (state.hasPermission(Permissions.deleteRole) && r.name != 'ADMIN') PopupMenuItem(value: 'delete', child: Text(context.tr('Supprimer', 'حذف'))),
                  ],
                ),
                children: r.permissions.map((p) => ListTile(dense: true, leading: const Icon(Icons.check, size: 18), title: Text(p))).toList(),
              ),
            )),
      ],
    );
  }

  Future<void> _form(BuildContext context, {AppRole? role}) async {
    final state = context.read<AppState>();
    final name = TextEditingController(text: role?.name ?? '');
    var selected = {...?role?.permissions};
    await showModalBottomSheet<void>(context: context, isScrollControlled: true, showDragHandle: true, builder: (context) => StatefulBuilder(builder: (context, setLocal) => DraggableScrollableSheet(expand: false, initialChildSize: .9, maxChildSize: .96, builder: (_, controller) => ListView(controller: controller, padding: const EdgeInsets.fromLTRB(18, 0, 18, 24), children: [
      Text(role == null ? context.tr('Ajouter un rôle', 'إضافة دور') : context.tr('Modifier le rôle', 'تعديل الدور'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)), const SizedBox(height: 12),
      TextField(controller: name, decoration: InputDecoration(labelText: context.tr('Nom du rôle', 'اسم الدور'))), const SizedBox(height: 12),
      Text(context.tr('Permissions', 'الصلاحيات'), style: const TextStyle(fontWeight: FontWeight.w800)),
      ...Permissions.all.map((p) => CheckboxListTile(value: selected.contains(p), title: Text(p), onChanged: (v) => setLocal(() { if (v == true) selected.add(p); else selected.remove(p); }))),
      const SizedBox(height: 10), FilledButton(onPressed: () { state.saveRole(id: role?.id, name: name.text.trim(), permissions: selected); Navigator.pop(context); }, child: Text(context.tr('Enregistrer', 'حفظ'))),
    ]))));
  }
}
