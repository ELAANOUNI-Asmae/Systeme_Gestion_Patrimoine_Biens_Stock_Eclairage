import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/localization/bilingual.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key, this.onNavigate});
  final ValueChanged<String>? onNavigate;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final user = state.currentUser;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(context.tr('Bonjour ${user?.firstName ?? ''}', 'مرحباً ${user?.firstNameAr ?? ''}'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
        const SizedBox(height: 4),
        Text(context.tr('Vue globale du système communal.', 'نظرة عامة على النظام الجماعي.')),
        const SizedBox(height: 16),
        LayoutBuilder(
          builder: (context, constraints) {
            final width = (constraints.maxWidth - 12) / 2;
            return Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                SizedBox(width: width, child: StatCard(label: context.tr('Biens', 'الممتلكات'), value: '${state.activeBiens.length}', icon: Icons.apartment_outlined)),
                SizedBox(width: width, child: StatCard(label: context.tr('Articles', 'المواد'), value: '${state.articles.length}', icon: Icons.inventory_2_outlined, tint: Colors.blue)),
                SizedBox(width: width, child: StatCard(label: context.tr('Alertes stock', 'تنبيهات المخزون'), value: '${state.lowStockArticles.length}', icon: Icons.warning_amber_rounded, tint: Colors.orange)),
                SizedBox(width: width, child: StatCard(label: context.tr('Pannes ouvertes', 'الأعطال المفتوحة'), value: '${state.unresolvedFailures.length}', icon: Icons.report_problem_outlined, tint: Colors.red)),
              ],
            );
          },
        ),
        const SizedBox(height: 16),
        SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(context.tr('À surveiller', 'للمتابعة'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
              const SizedBox(height: 10),
              if (state.lowStockArticles.isEmpty && state.unresolvedFailures.isEmpty)
                Text(context.tr('Aucune alerte importante.', 'لا توجد تنبيهات مهمة.')),
              ...state.lowStockArticles.take(3).map((article) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const CircleAvatar(child: Icon(Icons.inventory_2_outlined)),
                    title: Text(context.isArabic ? article.designationAr : article.designation),
                    subtitle: Text('${context.tr('Stock', 'المخزون')}: ${article.quantity} / ${article.minimumQuantity}'),
                  )),
              ...state.unresolvedFailures.take(3).map((failure) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const CircleAvatar(child: Icon(Icons.lightbulb_outline)),
                    title: Text('${failure.lightReference} — ${context.isArabic ? failure.lightDesignationAr : failure.lightDesignation}'),
                    subtitle: Text(failure.reportedBy == 'PUBLIC' ? context.tr('Signalement public', 'تبليغ عمومي') : failure.reportedBy),
                  )),
            ],
          ),
        ),
      ],
    );
  }
}
