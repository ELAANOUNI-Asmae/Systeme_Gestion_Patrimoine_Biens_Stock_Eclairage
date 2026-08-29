import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/config/permissions.dart';
import '../../core/localization/bilingual.dart';
import '../../models/user_models.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  final _search = TextEditingController();

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final q = _search.text.toLowerCase();
    final users = state.users.where((u) => q.isEmpty || u.fullName.toLowerCase().contains(q) || u.fullNameAr.contains(q) || u.email.toLowerCase().contains(q) || u.cin.toLowerCase().contains(q)).toList();
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(children: [
          Expanded(child: Text(context.tr('Utilisateurs', 'المستخدمون'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900))),
          if (state.hasPermission(Permissions.createUser)) IconButton.filled(onPressed: () => _form(context), icon: const Icon(Icons.person_add_alt_1)),
        ]),
        const SizedBox(height: 12),
        TextField(controller: _search, onChanged: (_) => setState(() {}), decoration: InputDecoration(prefixIcon: const Icon(Icons.search), hintText: context.tr('Nom, e-mail, CIN...', 'الاسم، البريد، البطاقة...'))),
        const SizedBox(height: 14),
        ...users.map((u) => Card(
              child: ListTile(
                leading: CircleAvatar(child: Text((u.firstName.isEmpty ? '?' : u.firstName[0]).toUpperCase())),
                title: Text(context.isArabic ? u.fullNameAr : u.fullName),
                subtitle: Text('${u.email}\n${u.role.name} · ${u.phone}'),
                isThreeLine: true,
                trailing: PopupMenuButton<String>(
                  onSelected: (value) async {
                    if (value == 'edit') _form(context, user: u);
                    if (value == 'delete') {
                      final ok = await confirmAction(context, fr: 'Supprimer cet utilisateur ?', ar: 'حذف هذا المستخدم؟');
                      if (ok && context.mounted) state.deleteUser(u.id);
                    }
                  },
                  itemBuilder: (_) => [
                    if (state.hasPermission(Permissions.updateUser)) PopupMenuItem(value: 'edit', child: Text(context.tr('Modifier', 'تعديل'))),
                    if (state.hasPermission(Permissions.deleteUser) && state.currentUser?.id != u.id) PopupMenuItem(value: 'delete', child: Text(context.tr('Supprimer', 'حذف'))),
                  ],
                ),
              ),
            )),
      ],
    );
  }

  Future<void> _form(BuildContext context, {AppUser? user}) async {
    final state = context.read<AppState>();
    final first = TextEditingController(text: user?.firstName ?? ''); final last = TextEditingController(text: user?.lastName ?? ''); final firstAr = TextEditingController(text: user?.firstNameAr ?? ''); final lastAr = TextEditingController(text: user?.lastNameAr ?? ''); final email = TextEditingController(text: user?.email ?? ''); final phone = TextEditingController(text: user?.phone ?? ''); final cin = TextEditingController(text: user?.cin ?? ''); final pwd = TextEditingController(); var gender = user?.gender ?? 'FEMME'; var role = user?.role ?? state.roles.first;
    await showModalBottomSheet<void>(context: context, isScrollControlled: true, showDragHandle: true, builder: (context) => StatefulBuilder(builder: (context, setLocal) => Padding(padding: EdgeInsets.fromLTRB(18, 0, 18, 18 + MediaQuery.of(context).viewInsets.bottom), child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Text(user == null ? context.tr('Ajouter un utilisateur', 'إضافة مستخدم') : context.tr('Modifier l’utilisateur', 'تعديل المستخدم'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)), const SizedBox(height: 12),
      Row(children: [Expanded(child: TextField(controller: first, decoration: const InputDecoration(labelText: 'Prénom FR'))), const SizedBox(width: 8), Expanded(child: TextField(controller: last, decoration: const InputDecoration(labelText: 'Nom FR')))]), const SizedBox(height: 8),
      Row(children: [Expanded(child: TextField(controller: firstAr, decoration: const InputDecoration(labelText: 'الاسم'))), const SizedBox(width: 8), Expanded(child: TextField(controller: lastAr, decoration: const InputDecoration(labelText: 'النسب')))]), const SizedBox(height: 8),
      TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: InputDecoration(labelText: context.tr('E-mail', 'البريد الإلكتروني'))), const SizedBox(height: 8),
      TextField(controller: phone, keyboardType: TextInputType.phone, decoration: InputDecoration(labelText: context.tr('Téléphone', 'الهاتف'))), const SizedBox(height: 8),
      TextField(controller: cin, decoration: const InputDecoration(labelText: 'CIN')), const SizedBox(height: 8),
      Row(children: [Expanded(child: DropdownButtonFormField<String>(value: gender, decoration: InputDecoration(labelText: context.tr('Genre', 'الجنس')), items: const [DropdownMenuItem(value: 'HOMME', child: Text('Homme / ذكر')), DropdownMenuItem(value: 'FEMME', child: Text('Femme / أنثى'))], onChanged: (v) => setLocal(() => gender = v ?? gender))), const SizedBox(width: 8), Expanded(child: DropdownButtonFormField<AppRole>(value: role, decoration: InputDecoration(labelText: context.tr('Rôle', 'الدور')), items: state.roles.map((r) => DropdownMenuItem(value: r, child: Text(r.name))).toList(), onChanged: (v) => setLocal(() => role = v ?? role)))]), const SizedBox(height: 8),
      TextField(controller: pwd, obscureText: true, decoration: InputDecoration(labelText: user == null ? context.tr('Mot de passe', 'كلمة المرور') : context.tr('Nouveau mot de passe (optionnel)', 'كلمة مرور جديدة (اختياري)'))), const SizedBox(height: 14),
      FilledButton(onPressed: () { state.saveUser(id: user?.id, firstName: first.text.trim(), lastName: last.text.trim(), firstNameAr: firstAr.text.trim(), lastNameAr: lastAr.text.trim(), email: email.text.trim(), gender: gender, phone: phone.text.trim(), cin: cin.text.trim(), role: role, password: pwd.text); Navigator.pop(context); }, child: Text(context.tr('Enregistrer', 'حفظ'))),
    ])))));
  }
}
