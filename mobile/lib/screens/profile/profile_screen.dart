import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/localization/bilingual.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final user = state.currentUser;
    if (user == null) return const SizedBox.shrink();
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SectionCard(
          child: Column(children: [
            CircleAvatar(radius: 38, child: Text(user.firstName.isEmpty ? '?' : user.firstName[0], style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800))),
            const SizedBox(height: 10),
            Text(state.isArabic ? user.fullNameAr : user.fullName, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
            Text(user.email),
            const SizedBox(height: 6),
            Chip(label: Text(user.role.name)),
          ]),
        ),
        const SizedBox(height: 12),
        SectionCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.phone_outlined), title: Text(context.tr('Téléphone', 'الهاتف')), subtitle: Text(user.phone)),
            ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.badge_outlined), title: const Text('CIN'), subtitle: Text(user.cin)),
            const SizedBox(height: 6),
            FilledButton.tonalIcon(onPressed: () => _edit(context), icon: const Icon(Icons.edit_outlined), label: Text(context.tr('Modifier le profil', 'تعديل الملف الشخصي'))),
            const SizedBox(height: 8),
            OutlinedButton.icon(onPressed: () => _password(context), icon: const Icon(Icons.lock_reset_outlined), label: Text(context.tr('Changer le mot de passe', 'تغيير كلمة المرور'))),
          ]),
        ),
      ],
    );
  }

  void _edit(BuildContext context) {
    final state = context.read<AppState>(); final u = state.currentUser!;
    final first = TextEditingController(text: u.firstName); final last = TextEditingController(text: u.lastName); final phone = TextEditingController(text: u.phone);
    showDialog<void>(context: context, builder: (context) => AlertDialog(title: Text(context.tr('Modifier le profil', 'تعديل الملف الشخصي')), content: Column(mainAxisSize: MainAxisSize.min, children: [TextField(controller: first, decoration: InputDecoration(labelText: context.tr('Prénom', 'الاسم'))), const SizedBox(height: 8), TextField(controller: last, decoration: InputDecoration(labelText: context.tr('Nom', 'النسب'))), const SizedBox(height: 8), TextField(controller: phone, decoration: InputDecoration(labelText: context.tr('Téléphone', 'الهاتف')))]), actions: [TextButton(onPressed: () => Navigator.pop(context), child: Text(context.tr('Annuler', 'إلغاء'))), FilledButton(onPressed: () { state.updateProfile(firstName: first.text, lastName: last.text, phone: phone.text); Navigator.pop(context); }, child: Text(context.tr('Enregistrer', 'حفظ')))]));
  }

  void _password(BuildContext context) {
    final parentContext = context;
    final current = TextEditingController();
    final next = TextEditingController();

    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(dialogContext.tr('Changer le mot de passe', 'تغيير كلمة المرور')),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: current,
              obscureText: true,
              decoration: InputDecoration(labelText: dialogContext.tr('Mot de passe actuel', 'كلمة المرور الحالية')),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: next,
              obscureText: true,
              decoration: InputDecoration(labelText: dialogContext.tr('Nouveau mot de passe', 'كلمة المرور الجديدة')),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: Text(dialogContext.tr('Annuler', 'إلغاء'))),
          FilledButton(
            onPressed: () {
              final ok = parentContext.read<AppState>().changePassword(current.text, next.text);
              Navigator.pop(dialogContext);
              ScaffoldMessenger.of(parentContext).showSnackBar(
                SnackBar(
                  content: Text(
                    ok
                        ? parentContext.tr('Mot de passe modifié.', 'تم تغيير كلمة المرور.')
                        : parentContext.tr('Mot de passe actuel incorrect.', 'كلمة المرور الحالية غير صحيحة.'),
                  ),
                ),
              );
            },
            child: Text(dialogContext.tr('Modifier', 'تعديل')),
          ),
        ],
      ),
    );
  }
}
