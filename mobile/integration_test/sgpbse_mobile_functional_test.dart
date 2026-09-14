import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sgpbse_mobile/main.dart' as app;

const apiBaseUrl = String.fromEnvironment('API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8081');
const adminEmail = String.fromEnvironment('TEST_ADMIN_EMAIL', defaultValue: '');
const adminPassword =
    String.fromEnvironment('TEST_ADMIN_PASSWORD', defaultValue: '');
final mojibake = RegExp(r'(Ã.|Â.|â€™|â€“|â€”|â€œ|â€|Ø.|Ù.|�)');

bool get credentialsReady =>
    adminEmail.trim().isNotEmpty &&
    adminPassword.isNotEmpty &&
    !adminEmail.contains('REMPLACER_') &&
    !adminPassword.contains('REMPLACER_');

Future<void> waitFor(WidgetTester tester, Finder finder,
    {int attempts = 100, String? description}) async {
  for (var i = 0; i < attempts; i++) {
    await tester.pump(const Duration(milliseconds: 100));
    await Future<void>.delayed(const Duration(milliseconds: 80));
    if (finder.evaluate().isNotEmpty) return;
  }
  throw TestFailure('Timeout: ${description ?? finder.toString()}');
}

Future<void> launchFreshApp(WidgetTester tester) async {
  await tester.pumpWidget(const SizedBox.shrink());
  await tester.pump();
  final prefs = await SharedPreferences.getInstance();
  await prefs.clear();
  app.main();
  await waitFor(tester, find.text('Signaler une panne d’éclairage public'),
      description: 'page publique');
}

Future<void> openLogin(WidgetTester tester) async {
  if (find.text('Adresse e-mail').evaluate().isNotEmpty) return;
  final tooltip = find.byTooltip('Se connecter');
  if (tooltip.evaluate().isNotEmpty) {
    await tester.tap(tooltip.first);
  } else {
    final icon = find.byIcon(Icons.login);
    expect(icon, findsWidgets);
    await tester.tap(icon.first);
  }
  await tester.pump();
  await waitFor(tester, find.text('Adresse e-mail'),
      description: 'écran de connexion');
}

Future<void> loginUi(WidgetTester tester,
    {required String email,
    required String password,
    bool expectSuccess = true}) async {
  await openLogin(tester);
  final fields = find.byType(TextFormField);
  expect(fields.evaluate().length, greaterThanOrEqualTo(2));
  await tester.enterText(fields.at(0), email);
  await tester.enterText(fields.at(1), password);
  final button = find.widgetWithText(FilledButton, 'Se connecter');
  expect(button, findsOneWidget);
  await tester.tap(button);
  await tester.pump();
  if (expectSuccess) {
    await waitFor(tester, find.text('Tableau de bord'),
        attempts: 150, description: 'tableau de bord');
  } else {
    await waitFor(
        tester, find.text('Adresse e-mail ou mot de passe incorrect.'),
        description: 'message identifiants incorrects');
  }
}

Future<void> loginAdminUi(WidgetTester tester) async {
  expect(credentialsReady, isTrue,
      reason: 'Configurez integration_test/test_env.json.');
  await loginUi(tester, email: adminEmail, password: adminPassword);
}

Future<void> openDrawer(WidgetTester tester) async {
  final icon = find.byIcon(Icons.menu);
  expect(icon, findsWidgets, reason: 'Menu latéral introuvable.');
  await tester.tap(icon.first);
  await tester.pump(const Duration(milliseconds: 350));
}

Future<void> navigateDrawer(WidgetTester tester, String label) async {
  await openDrawer(tester);
  final item = find.text(label);
  await waitFor(tester, item, description: 'menu $label');
  await tester.ensureVisible(item.last);
  await tester.tap(item.last);
  await tester.pump(const Duration(milliseconds: 250));
  await waitFor(tester, find.text(label), description: 'module $label');
}

void assertNoMojibake(WidgetTester tester, String label) {
  final bad = <String>[];
  for (final element in find.byType(Text).evaluate()) {
    final widget = element.widget as Text;
    final value = widget.data ?? widget.textSpan?.toPlainText() ?? '';
    if (value.isNotEmpty && mojibake.hasMatch(value)) bad.add(value);
  }
  expect(bad, isEmpty, reason: 'Mojibake dans $label: ${bad.join(' | ')}');
}

String? jwtCookie(http.Response response) {
  final value = response.headers['set-cookie'];
  if (value == null) return null;
  return RegExp(r'jwt-token=[^;,\s]+').firstMatch(value)?.group(0);
}

Future<http.Response> apiLogin() => http.post(
      Uri.parse('$apiBaseUrl/sgpbse/auth/login'),
      headers: const {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: jsonEncode(
          {'email': adminEmail.trim().toLowerCase(), 'pwd': adminPassword}),
    );

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('SGPBSE Mobile - API', () {
    test('FT-MOB-01 configuration du compte de test', () {
      expect(credentialsReady, isTrue,
          reason: 'Configurez TEST_ADMIN_EMAIL et TEST_ADMIN_PASSWORD.');
      expect(apiBaseUrl, contains('8081'));
    });

    test('FT-MOB-02 points lumineux publics sans login', () async {
      final r =
          await http.get(Uri.parse('$apiBaseUrl/sgpbse/lightPoint/public/all'));
      expect(r.statusCode, 200);
      expect(jsonDecode(utf8.decode(r.bodyBytes)), isA<List<dynamic>>());
    });

    test('FT-MOB-03 pannes publiques ouvertes sans login', () async {
      final r =
          await http.get(Uri.parse('$apiBaseUrl/sgpbse/failure/public/open'));
      expect(r.statusCode, 200);
      expect(jsonDecode(utf8.decode(r.bodyBytes)), isA<List<dynamic>>());
    });

    test('FT-MOB-04 /user/me refuse un anonyme', () async {
      final r = await http.get(Uri.parse('$apiBaseUrl/sgpbse/user/me'));
      expect(r.statusCode, anyOf(401, 403));
    });

    test('FT-MOB-05 login API réel retourne jwt-token', () async {
      expect(credentialsReady, isTrue);
      final r = await apiLogin();
      expect(r.statusCode, 200);
      expect(jwtCookie(r), isNotNull);
    });

    test('FT-MOB-06 /user/me fonctionne avec le cookie réel', () async {
      final login = await apiLogin();
      expect(login.statusCode, 200);
      final cookie = jwtCookie(login);
      expect(cookie, isNotNull);
      final r = await http.get(Uri.parse('$apiBaseUrl/sgpbse/user/me'),
          headers: {'Accept': 'application/json', 'Cookie': cookie!});
      expect(r.statusCode, 200);
      expect(jsonDecode(utf8.decode(r.bodyBytes)), isA<Map<String, dynamic>>());
    });
  });

  group('SGPBSE Mobile - UI', () {
    testWidgets('FT-MOB-07 page publique avant login', (tester) async {
      await launchFreshApp(tester);
      expect(find.text('Signalement public · aucun compte requis'),
          findsOneWidget);
      expect(
          find.text('Signaler une panne d’éclairage public'), findsOneWidget);
      expect(find.byIcon(Icons.login), findsWidgets);
      assertNoMojibake(tester, 'page publique FR');
    });

    testWidgets('FT-MOB-08 bascule FR/AR', (tester) async {
      await launchFreshApp(tester);
      expect(find.text('AR'), findsOneWidget);
      await tester.tap(find.text('AR'));
      await tester.pump(const Duration(milliseconds: 300));
      expect(find.text('التبليغ عن عطب في الإنارة العمومية'), findsOneWidget);
      expect(find.text('FR'), findsOneWidget);
      assertNoMojibake(tester, 'page publique AR');
      await tester.tap(find.text('FR'));
      await tester.pump(const Duration(milliseconds: 300));
      expect(
          find.text('Signaler une panne d’éclairage public'), findsOneWidget);
    });

    testWidgets('FT-MOB-09 validation non destructive du signalement public',
        (tester) async {
      await launchFreshApp(tester);

      final fields = find.byType(TextField);
      expect(fields.evaluate().length, greaterThanOrEqualTo(2));

      await tester.enterText(fields.at(0), 'Lieu inexistant FT-MOB');
      await tester.enterText(fields.at(1), 'Test fonctionnel non destructif');

      final submit = find.widgetWithText(
        FilledButton,
        'Envoyer le signalement',
      );

      await waitFor(
        tester,
        submit,
        description: 'bouton Envoyer le signalement',
      );
      await tester.ensureVisible(submit);

      // Les données publiques d'éclairage se chargent en arrière-plan.
      // Le bouton reste désactivé pendant ce chargement ; on attend donc
      // qu'il soit réellement cliquable avant de valider le formulaire.
      var enabled = false;
      for (var i = 0; i < 150; i++) {
        final button = tester.widget<FilledButton>(submit);
        if (button.onPressed != null) {
          enabled = true;
          break;
        }
        await tester.pump(const Duration(milliseconds: 100));
        await Future<void>.delayed(const Duration(milliseconds: 80));
      }

      expect(
        enabled,
        isTrue,
        reason: 'Le bouton de signalement est resté désactivé.',
      );

      await tester.tap(submit);
      await tester.pump();

      final error = find.text(
        'Localisation introuvable. Essayez la carte.',
      );

      await waitFor(
        tester,
        error,
        attempts: 100,
        description: 'validation de localisation inexistante',
      );

      expect(error, findsOneWidget);
    });

    testWidgets('FT-MOB-10 formulaire login et validations locales',
        (tester) async {
      await launchFreshApp(tester);
      await openLogin(tester);
      expect(find.text('Adresse e-mail'), findsWidgets);
      expect(find.text('Mot de passe'), findsWidgets);
      expect(find.text('Mot de passe oublié ?'), findsOneWidget);
      final button = find.widgetWithText(FilledButton, 'Se connecter');
      await tester.tap(button);
      await tester.pump(const Duration(milliseconds: 250));
      expect(find.text('L’adresse e-mail est obligatoire.'), findsOneWidget);
      expect(find.text('Le mot de passe est obligatoire.'), findsOneWidget);
    });

    testWidgets('FT-MOB-11 identifiants incorrects refusés', (tester) async {
      await launchFreshApp(tester);
      await loginUi(tester,
          email: 'nobody.functional@invalid.local',
          password: 'WrongPass!123',
          expectSuccess: false);
      expect(find.text('Adresse e-mail'), findsWidgets);
    });

    testWidgets('FT-MOB-12 login réel ouvre le tableau de bord',
        (tester) async {
      await launchFreshApp(tester);
      await loginAdminUi(tester);
      expect(find.text('Tableau de bord'), findsWidgets);
      assertNoMojibake(tester, 'Tableau de bord');
    });

    testWidgets('FT-MOB-13 navigation Utilisateurs, Rôles et Biens',
        (tester) async {
      await launchFreshApp(tester);
      await loginAdminUi(tester);

      await navigateDrawer(tester, 'Utilisateurs');
      expect(find.text('Utilisateurs'), findsWidgets);
      assertNoMojibake(tester, 'Utilisateurs');

      await navigateDrawer(tester, 'Rôles');
      expect(find.text('Rôles'), findsWidgets);
      assertNoMojibake(tester, 'Rôles');

      await navigateDrawer(tester, 'Biens');
      expect(find.text('Gestion des biens'), findsWidgets);
      assertNoMojibake(tester, 'Biens');
    });

    testWidgets('FT-MOB-14 navigation Stock et Éclairage public',
        (tester) async {
      await launchFreshApp(tester);
      await loginAdminUi(tester);
      await navigateDrawer(tester, 'Stock');
      expect(find.text('Gestion du stock'), findsWidgets);
      expect(find.text('Articles'), findsWidgets);
      expect(find.text('Historique'), findsWidgets);
      expect(find.text('Demandes'), findsWidgets);
      assertNoMojibake(tester, 'Stock');
      await navigateDrawer(tester, 'Éclairage public');
      expect(find.text('Éclairage public'), findsWidgets);
      assertNoMojibake(tester, 'Éclairage public');
    });

    testWidgets(
        'FT-MOB-15 navigation Rapports, Notifications, Profil et Paramètres',
        (tester) async {
      await launchFreshApp(tester);
      await loginAdminUi(tester);

      for (final label in const ['Rapports', 'Notifications', 'Profil']) {
        await navigateDrawer(tester, label);
        expect(find.text(label), findsWidgets);
        assertNoMojibake(tester, label);
      }

      // Paramètres est volontairement masqué tant qu'aucune fonctionnalité
      // Backend dédiée n'existe.
      await openDrawer(tester);
      expect(find.text('Paramètres'), findsNothing);
    });

    testWidgets('FT-MOB-16 déconnexion retourne à la page publique',
        (tester) async {
      await launchFreshApp(tester);
      await loginAdminUi(tester);
      await openDrawer(tester);
      final logout = find.text('Déconnexion');
      await waitFor(tester, logout, description: 'Déconnexion');
      await tester.ensureVisible(logout);
      await tester.tap(logout);
      await tester.pump();
      await waitFor(tester, find.text('Signaler une panne d’éclairage public'),
          attempts: 120, description: 'page publique après logout');
      expect(find.byIcon(Icons.login), findsWidgets);
    });
  });
}
