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
            Text(state.isArabic && user.fullNameAr.trim().isNotEmpty ? user.fullNameAr : user.fullName, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
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

  Future<void> _edit(BuildContext parentContext) async {
    final state = parentContext.read<AppState>();
    final u = state.currentUser!;
    final first = TextEditingController(text: u.firstName);
    final last = TextEditingController(text: u.lastName);
    final firstAr = TextEditingController(text: u.firstNameAr);
    final lastAr = TextEditingController(text: u.lastNameAr);
    final phone = TextEditingController(text: u.phone);

    await showDialog<void>(
      context: parentContext,
      builder: (dialogContext) => AlertDialog(
        title: Text(dialogContext.tr('Modifier le profil', 'تعديل الملف الشخصي')),
        content: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: first, decoration: InputDecoration(labelText: dialogContext.tr('Prénom', 'الاسم'))),
            const SizedBox(height: 8),
            TextField(controller: last, decoration: InputDecoration(labelText: dialogContext.tr('Nom', 'النسب'))),
            const SizedBox(height: 8),
            TextField(controller: firstAr, textDirection: TextDirection.rtl, decoration: InputDecoration(labelText: dialogContext.tr('Prénom en arabe', 'الاسم بالعربية'))),
            const SizedBox(height: 8),
            TextField(controller: lastAr, textDirection: TextDirection.rtl, decoration: InputDecoration(labelText: dialogContext.tr('Nom en arabe', 'النسب بالعربية'))),
            const SizedBox(height: 8),
            TextField(controller: phone, keyboardType: TextInputType.phone, decoration: InputDecoration(labelText: dialogContext.tr('Téléphone', 'الهاتف'))),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: Text(dialogContext.tr('Annuler', 'إلغاء'))),
          FilledButton(
            onPressed: () async {
              try {
                await state.updateProfile(
                  firstName: first.text,
                  lastName: last.text,
                  firstNameAr: firstAr.text,
                  lastNameAr: lastAr.text,
                  phone: phone.text,
                );
                if (!dialogContext.mounted) return;
                Navigator.pop(dialogContext);
                if (!parentContext.mounted) return;
                ScaffoldMessenger.of(parentContext).showSnackBar(SnackBar(content: Text(parentContext.tr('Profil mis à jour.', 'تم تحديث الملف الشخصي.'))));
              } catch (_) {
                if (!dialogContext.mounted) return;
                ScaffoldMessenger.of(dialogContext).showSnackBar(SnackBar(content: Text(dialogContext.tr('Impossible de modifier le profil.', 'تعذر تعديل الملف الشخصي.'))));
              }
            },
            child: Text(dialogContext.tr('Enregistrer', 'حفظ')),
          ),
        ],
      ),
    );
  }

  Future<void> _password(BuildContext parentContext) async {
    final current = TextEditingController();
    final next = TextEditingController();
    final confirm = TextEditingController();

    await showDialog<void>(
      context: parentContext,
      builder: (dialogContext) => AlertDialog(
        title: Text(dialogContext.tr('Changer le mot de passe', 'تغيير كلمة المرور')),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: current, obscureText: true, decoration: InputDecoration(labelText: dialogContext.tr('Mot de passe actuel', 'كلمة المرور الحالية'))),
            const SizedBox(height: 8),
            TextField(controller: next, obscureText: true, decoration: InputDecoration(labelText: dialogContext.tr('Nouveau mot de passe', 'كلمة المرور الجديدة'))),
            const SizedBox(height: 8),
            TextField(controller: confirm, obscureText: true, decoration: InputDecoration(labelText: dialogContext.tr('Confirmer', 'تأكيد كلمة المرور'))),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: Text(dialogContext.tr('Annuler', 'إلغاء'))),
          FilledButton(
            onPressed: () async {
              if (next.text != confirm.text) {
                ScaffoldMessenger.of(dialogContext).showSnackBar(SnackBar(content: Text(dialogContext.tr('Les mots de passe ne correspondent pas.', 'كلمتا المرور غير متطابقتين.'))));
                return;
              }
              try {
                await parentContext.read<AppState>().changePassword(current.text, next.text);
                if (!dialogContext.mounted) return;
                Navigator.pop(dialogContext);
                if (!parentContext.mounted) return;
                ScaffoldMessenger.of(parentContext).showSnackBar(SnackBar(content: Text(parentContext.tr('Mot de passe modifié.', 'تم تغيير كلمة المرور.'))));
              } catch (_) {
                if (!dialogContext.mounted) return;
                ScaffoldMessenger.of(dialogContext).showSnackBar(SnackBar(content: Text(dialogContext.tr('Vérifiez le mot de passe actuel et les règles du nouveau mot de passe.', 'تحقق من كلمة المرور الحالية وشروط كلمة المرور الجديدة.'))));
              }
            },
            child: Text(dialogContext.tr('Modifier', 'تعديل')),
          ),
        ],
      ),
    );
  }
}
