import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/localization/bilingual.dart';
import '../../state/app_state.dart';
import '../../widgets/main_shell.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController(text: 'admin@sgpbse.ma');
  final _password = TextEditingController(text: 'Admin@123');
  bool _loading = false;
  bool _obscure = true;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('Connexion', 'تسجيل الدخول'))),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(22),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Center(child: Image.asset('assets/images/logo.png', width: 92, height: 92)),
                    const SizedBox(height: 16),
                    Text('SGPBSE', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900)),
                    const SizedBox(height: 6),
                    Text(context.tr('Accès réservé aux agents', 'ولوج خاص بالموظفين'), textAlign: TextAlign.center),
                    const SizedBox(height: 20),
                    TextField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(labelText: context.tr('E-mail', 'البريد الإلكتروني'), prefixIcon: const Icon(Icons.email_outlined)),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _password,
                      obscureText: _obscure,
                      decoration: InputDecoration(
                        labelText: context.tr('Mot de passe', 'كلمة المرور'),
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined), onPressed: () => setState(() => _obscure = !_obscure)),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: AlignmentDirectional.centerEnd,
                      child: TextButton(
                        onPressed: _forgotPassword,
                        child: Text(context.tr('Mot de passe oublié ?', 'نسيت كلمة المرور؟')),
                      ),
                    ),
                    const SizedBox(height: 6),
                    FilledButton.icon(onPressed: _loading ? null : _login, icon: const Icon(Icons.login), label: Text(_loading ? context.tr('Connexion...', 'جارٍ الدخول...') : context.tr('Se connecter', 'دخول'))),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary.withOpacity(.07), borderRadius: BorderRadius.circular(14)),
                      child: Text(
                        'Admin: admin@sgpbse.ma / Admin@123\nAgent: agent@sgpbse.ma / Agent@123',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _login() async {
    setState(() => _loading = true);
    final ok = await context.read<AppState>().login(_email.text, _password.text);
    if (!mounted) return;
    setState(() => _loading = false);
    if (!ok) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('Identifiants incorrects.', 'بيانات الدخول غير صحيحة.'))));
      return;
    }
    Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const MainShell()), (_) => false);
  }

  void _forgotPassword() {
    final email = TextEditingController();
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(context.tr('Mot de passe oublié', 'نسيت كلمة المرور')),
        content: TextField(controller: email, decoration: InputDecoration(labelText: context.tr('Votre e-mail', 'بريدك الإلكتروني'))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text(context.tr('Annuler', 'إلغاء'))),
          FilledButton(
            onPressed: () {
              final exists = context.read<AppState>().emailExists(email.text);
              Navigator.pop(context);
              ScaffoldMessenger.of(this.context).showSnackBar(SnackBar(content: Text(exists ? this.context.tr('Lien de réinitialisation simulé envoyé.', 'تم إرسال رابط إعادة التعيين بشكل تجريبي.') : this.context.tr('E-mail introuvable.', 'البريد غير موجود.'))));
            },
            child: Text(context.tr('Envoyer', 'إرسال')),
          ),
        ],
      ),
    );
  }
}
