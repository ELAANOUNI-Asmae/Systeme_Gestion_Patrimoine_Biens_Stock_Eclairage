import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/localization/bilingual.dart';
import '../../models/app_notification.dart';
import '../../state/app_state.dart';
import '../../widgets/common.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _filter = 'ALL';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        await context.read<AppState>().loadNotifications();
      } catch (_) {
        // Keep the page usable if the network is temporarily unavailable.
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final all = state.notifications;
    final visible = all.where((n) => _filter == 'ALL' || (_filter == 'UNREAD' && !n.read) || (_filter == 'READ' && n.read)).toList();
    final unread = all.where((n) => !n.read).length;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(children: [
          Expanded(child: Text(context.tr('Notifications', 'الإشعارات'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900))),
          TextButton.icon(onPressed: unread == 0 ? null : state.markAllNotificationsRead, icon: const Icon(Icons.done_all), label: Text(context.tr('Tout lire', 'تحديد الكل كمقروء'))),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: StatCard(label: context.tr('Total', 'المجموع'), value: '${all.length}', icon: Icons.notifications_outlined)),
          const SizedBox(width: 8),
          Expanded(child: StatCard(label: context.tr('Non lues', 'غير مقروء'), value: '$unread', icon: Icons.mark_email_unread_outlined, tint: Colors.orange)),
        ]),
        const SizedBox(height: 12),
        SegmentedButton<String>(
          segments: [
            ButtonSegment(value: 'ALL', label: Text(context.tr('Toutes', 'الكل'))),
            ButtonSegment(value: 'UNREAD', label: Text(context.tr('Non lues', 'غير المقروء'))),
            ButtonSegment(value: 'READ', label: Text(context.tr('Lues', 'المقروء'))),
          ],
          selected: {_filter},
          onSelectionChanged: (value) => setState(() => _filter = value.first),
        ),
        const SizedBox(height: 14),
        if (visible.isEmpty)
          EmptyState(icon: Icons.notifications_none, title: context.tr('Aucune notification', 'لا توجد إشعارات'))
        else
          ...visible.map((n) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SectionCard(
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    CircleAvatar(backgroundColor: _color(n.kind).withValues(alpha: .13), child: Icon(_icon(n.kind), color: _color(n.kind))),
                    const SizedBox(width: 12),
                    Expanded(
                      child: InkWell(
                        onTap: () => state.markNotificationRead(n.id),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [Expanded(child: Text(context.isArabic ? n.titleAr : n.title, style: const TextStyle(fontWeight: FontWeight.w800))), if (!n.read) const Badge(label: Text('NEW'))]),
                          const SizedBox(height: 5),
                          Text(context.isArabic ? n.messageAr : n.message),
                          const SizedBox(height: 6),
                          Text('${_module(context, n.module)} · ${formatDate(n.createdAt)}', style: Theme.of(context).textTheme.bodySmall),
                        ]),
                      ),
                    ),
                    IconButton(onPressed: () => state.deleteNotification(n.id), icon: const Icon(Icons.delete_outline, color: Colors.redAccent)),
                  ]),
                ),
              )),
      ],
    );
  }

  Color _color(NotificationKind kind) => switch (kind) { NotificationKind.info => Colors.blue, NotificationKind.warning => Colors.orange, NotificationKind.success => Colors.green, NotificationKind.error => Colors.red };
  IconData _icon(NotificationKind kind) => switch (kind) { NotificationKind.info => Icons.info_outline, NotificationKind.warning => Icons.warning_amber_rounded, NotificationKind.success => Icons.check_circle_outline, NotificationKind.error => Icons.error_outline };
  String _module(BuildContext context, NotificationModule module) => switch (module) { NotificationModule.users => context.tr('Utilisateurs', 'المستخدمون'), NotificationModule.assets => context.tr('Biens', 'الممتلكات'), NotificationModule.stock => context.tr('Stock', 'المخزون'), NotificationModule.lighting => context.tr('Éclairage', 'الإنارة'), NotificationModule.system => context.tr('Système', 'النظام') };
}