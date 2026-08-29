import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:sgpbse_mobile/app.dart';
import 'package:sgpbse_mobile/state/app_state.dart';

void main() {
  testWidgets(
    'SGPBSE application starts correctly',
    (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider(
          create: (_) => AppState(),
          child: const SgpbseApp(),
        ),
      );

      await tester.pumpAndSettle();

      expect(
        find.byType(SgpbseApp),
        findsOneWidget,
      );
    },
  );
}