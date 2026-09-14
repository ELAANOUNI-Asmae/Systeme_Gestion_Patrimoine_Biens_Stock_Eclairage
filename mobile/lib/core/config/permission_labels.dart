import 'package:flutter/material.dart';

import '../localization/bilingual.dart';

class PermissionLabels {
  PermissionLabels._();

  static const Map<
    String,
    List<String>
  > _labels = {
    // USERS
    'CREATE_USER': [
      'Ajouter un utilisateur',
      'إضافة مستخدم',
    ],

    'UPDATE_USER': [
      'Modifier un utilisateur',
      'تعديل مستخدم',
    ],

    'DELETE_USER': [
      'Supprimer un utilisateur',
      'حذف مستخدم',
    ],

    'GET_PROFIL': [
      'Consulter les détails d’un utilisateur',
      'عرض تفاصيل مستخدم',
    ],

    'GET_ALL_PROFILS': [
      'Consulter les utilisateurs',
      'عرض المستخدمين',
    ],

    'SEARCH_USER': [
      'Rechercher un utilisateur',
      'البحث عن مستخدم',
    ],

    'FILTER_USERS_BY_ROLE': [
      'Filtrer les utilisateurs par rôle',
      'تصفية المستخدمين حسب الدور',
    ],

    'ACTIVATE_ACCOUNT': [
      'Activer un compte',
      'تفعيل حساب',
    ],

    'DEACTIVATE_ACCOUNT': [
      'Désactiver un compte',
      'تعطيل حساب',
    ],

    'COUNT_USERS': [
      'Consulter le nombre d’utilisateurs',
      'عرض عدد المستخدمين',
    ],

    'GET_CONNECTED_USERNAME': [
      'Consulter le nom de l’utilisateur connecté',
      'عرض اسم المستخدم المتصل',
    ],

    // ROLES
    'CREATE_ROLE': [
      'Ajouter un rôle',
      'إضافة دور',
    ],

    'UPDATE_ROLE': [
      'Modifier un rôle',
      'تعديل دور',
    ],

    'DELETE_ROLE': [
      'Supprimer un rôle',
      'حذف دور',
    ],

    'GET_ALL_ROLES': [
      'Consulter les rôles',
      'عرض الأدوار',
    ],

    'GET_ROLE_PERMISSIONS': [
      'Consulter les permissions d’un rôle',
      'عرض صلاحيات الدور',
    ],

    'GET_ROLE_NAME': [
      'Consulter le rôle d’un utilisateur',
      'عرض دور المستخدم',
    ],

    'GET_ROLE_NAMES': [
      'Consulter les noms des rôles',
      'عرض أسماء الأدوار',
    ],

    // ASSETS
    'CREATE_ASSET': [
      'Ajouter un bien',
      'إضافة ممتلك',
    ],

    'UPDATE_ASSET': [
      'Modifier un bien',
      'تعديل ممتلك',
    ],

    'DELETE_ASSET': [
      'Supprimer un bien',
      'حذف ممتلك',
    ],

    'GET_ASSET': [
      'Consulter un bien',
      'عرض ممتلك',
    ],

    'GET_ALL_ASSETS': [
      'Consulter les biens',
      'عرض الممتلكات',
    ],

    'GET_ASSET_INFOS': [
      'Consulter les détails d’un bien',
      'عرض تفاصيل ممتلك',
    ],

    'GET_ASSETS_BY_STATUS': [
      'Consulter les biens par statut',
      'عرض الممتلكات حسب الحالة',
    ],

    'GET_ASSETS_BY_TYPE': [
      'Consulter les biens par type',
      'عرض الممتلكات حسب النوع',
    ],

    'SEARCH_ASSET': [
      'Rechercher un bien',
      'البحث عن ممتلك',
    ],

    'GET_ARCHIVED_ASSETS': [
      'Consulter les biens archivés',
      'عرض الممتلكات المؤرشفة',
    ],

    'SEARCH_ARCHIVED_ASSETS': [
      'Rechercher dans les biens archivés',
      'البحث في الممتلكات المؤرشفة',
    ],

    'DISPOSE_ASSET': [
      'Mettre un bien hors service',
      'إخراج ممتلك من الخدمة',
    ],

    'COUNT_ASSET': [
      'Consulter le nombre de biens',
      'عرض عدد الممتلكات',
    ],

    'COUNT_ASSETS': [
      'Consulter le nombre total de biens',
      'عرض العدد الإجمالي للممتلكات',
    ],

    'COUNT_ASSETS_BY_STATUS': [
      'Consulter le nombre de biens par statut',
      'عرض عدد الممتلكات حسب الحالة',
    ],

    // RENTALS
    'RENT_ASSET': [
      'Enregistrer une location de bien',
      'تسجيل كراء ممتلك',
    ],

    'GET_RENTAL': [
      'Consulter une location',
      'عرض عملية كراء',
    ],

    'GET_ALL_RENTALS': [
      'Consulter les locations',
      'عرض عمليات الكراء',
    ],

    'UPDATE_RENTAL': [
      'Modifier une location',
      'تعديل عملية كراء',
    ],

    'CANCEL_RENTAL': [
      'Annuler une location',
      'إلغاء عملية كراء',
    ],

    // MAINTENANCE
    'SCHEDULE_MAINTENANCE': [
      'Planifier une maintenance',
      'برمجة صيانة',
    ],

    'START_MAINTENANCE': [
      'Démarrer une maintenance',
      'بدء الصيانة',
    ],

    'COMPLETE_MAINTENANCE': [
      'Terminer une maintenance',
      'إنهاء الصيانة',
    ],

    'CANCEL_MAINTENANCE': [
      'Annuler une maintenance',
      'إلغاء الصيانة',
    ],

    'UPDATE_MAINTENANCE': [
      'Modifier une maintenance',
      'تعديل الصيانة',
    ],

    'UPDATE_MAINTENANCE_STATUS': [
      'Modifier le statut d’une maintenance',
      'تعديل حالة الصيانة',
    ],

    'GET_MAINTENANCE': [
      'Consulter une maintenance',
      'عرض عملية صيانة',
    ],

    'GET_ALL_MAINTENANCE': [
      'Consulter les maintenances',
      'عرض عمليات الصيانة',
    ],

    'DELETE_MAINTENANCE': [
      'Supprimer une maintenance',
      'حذف عملية صيانة',
    ],

    // ACCIDENTS
    'REGISTER_ACCIDENT': [
      'Enregistrer un accident',
      'تسجيل حادث',
    ],

    'GET_ACCIDENT': [
      'Consulter un accident',
      'عرض حادث',
    ],

    'GET_ALL_ACCIDENT': [
      'Consulter les accidents',
      'عرض الحوادث',
    ],

    // DISPOSAL
    'GET_DISPOSAL': [
      'Consulter une mise hors service',
      'عرض عملية إخراج من الخدمة',
    ],

    'GET_ALL_DISPOSALS': [
      'Consulter les mises hors service',
      'عرض عمليات الإخراج من الخدمة',
    ],

    // FUEL
    'GET_FUEL_TANK': [
      'Consulter une opération de carburant',
      'عرض عملية وقود',
    ],

    'GET_ALL_FUEL_TANKS': [
      'Consulter les opérations de carburant',
      'عرض عمليات الوقود',
    ],

    'REFUL_VEHICLE': [
      'Ravitailler un véhicule en carburant',
      'تزويد مركبة بالوقود',
    ],

    // ITEMS
    'CREATE_ITEM': [
      'Ajouter un article',
      'إضافة مادة',
    ],

    'UPDATE_ITEM': [
      'Modifier un article',
      'تعديل مادة',
    ],

    'DELETE_ITEM': [
      'Supprimer un article',
      'حذف مادة',
    ],

    'GET_ITEM': [
      'Consulter un article',
      'عرض مادة',
    ],

    'GET_ALL_ITEMS': [
      'Consulter les articles',
      'عرض المواد',
    ],

    'SEARCH_ITEM': [
      'Rechercher un article',
      'البحث عن مادة',
    ],

    'UPDATE_ITEM_QUANTITY': [
      'Modifier la quantité d’un article',
      'تعديل كمية مادة',
    ],

    'GET_ITEM_STAT': [
      'Consulter les statistiques d’un article',
      'عرض إحصائيات مادة',
    ],

    'COUNT_ITEMS': [
      'Consulter le nombre d’articles',
      'عرض عدد المواد',
    ],

    'COUNT_TOTAL_QUANTITIES': [
      'Consulter la quantité totale du stock',
      'عرض الكمية الإجمالية للمخزون',
    ],

    // STOCK
    'CREATE_IN_STOCK': [
      'Enregistrer une entrée en stock',
      'تسجيل إدخال للمخزون',
    ],

    'GET_STOCK_MOVEMENT_PER_ITEM': [
      'Consulter les mouvements d’un article',
      'عرض حركات مادة',
    ],

    'COUNT_STOCK_MOVEMENT_BY_PERIOD': [
      'Consulter les mouvements de stock par période',
      'عرض حركات المخزون حسب الفترة',
    ],

    'COUNT_IN_STOCK_BY_ITEM': [
      'Consulter les entrées de stock par article',
      'عرض إدخالات المخزون حسب المادة',
    ],

    'COUNT_IN_STOCK_BY_PERIOD': [
      'Consulter les entrées de stock par période',
      'عرض إدخالات المخزون حسب الفترة',
    ],

    'COUNT_TOTAL_IN_STOCK': [
      'Consulter le total des entrées en stock',
      'عرض إجمالي إدخالات المخزون',
    ],

    // ITEM REQUESTS
    'CREATE_ITEM_REQUEST': [
      'Créer une demande de fourniture',
      'إنشاء طلب تموين',
    ],

    'GET_ITEM_REQUEST': [
      'Consulter une demande de fourniture',
      'عرض طلب تموين',
    ],

    'GET_ALL_ITEM_REQUESTS': [
      'Consulter les demandes de fourniture',
      'عرض طلبات التموين',
    ],

    'FILTER_ITEM_REQUESTS_BY_USER': [
      'Filtrer les demandes par utilisateur',
      'تصفية الطلبات حسب المستخدم',
    ],

    'APROUVE_ITEM_REQUEST': [
      'Approuver une demande de fourniture',
      'الموافقة على طلب تموين',
    ],

    'REJECT_ITEM_REQUEST': [
      'Refuser une demande de fourniture',
      'رفض طلب تموين',
    ],

    'CANCEL_ITEM_REQUEST': [
      'Annuler une demande de fourniture',
      'إلغاء طلب تموين',
    ],

    'CONFIRM_ITEM_REQUEST_DELIVERY': [
      'Confirmer la livraison d’une demande',
      'تأكيد تسليم طلب تموين',
    ],

    'COUNT_ITEM_REQUESTS_BY_STATUS': [
      'Consulter le nombre de demandes par statut',
      'عرض عدد الطلبات حسب الحالة',
    ],

    // STOCK ALERTS
    'GET_ITEMS_WITH_LOW_STOCK': [
      'Consulter les articles à stock faible',
      'عرض المواد ذات المخزون المنخفض',
    ],

    'GET_LOW_STOCK_ALERTS_BY_PERIOD': [
      'Consulter les alertes de stock par période',
      'عرض تنبيهات المخزون حسب الفترة',
    ],

    'COUNT_LOW_STOCK_ALERTS': [
      'Consulter le nombre d’alertes de stock',
      'عرض عدد تنبيهات المخزون',
    ],

    'READ_STOCK_ALERTS': [
      'Consulter les alertes de stock',
      'عرض تنبيهات المخزون',
    ],

    'GET_ALERT_STOCK_MVMT_OFF_DOCS': [
      'Consulter les alertes liées aux documents de stock',
      'عرض تنبيهات وثائق المخزون',
    ],

    // LIGHTING
    'CREATE_LIGHT_POINT': [
      'Ajouter un point lumineux',
      'إضافة نقطة إنارة',
    ],

    'UPDATE_LIGHT_POINT': [
      'Modifier un point lumineux',
      'تعديل نقطة إنارة',
    ],

    'DELETE_LIGHT_POINT': [
      'Supprimer un point lumineux',
      'حذف نقطة إنارة',
    ],

    'GET_LIGHT_POINT': [
      'Consulter un point lumineux',
      'عرض نقطة إنارة',
    ],

    'GET_ALL_LIGHT_POINT': [
      'Consulter les points lumineux',
      'عرض نقاط الإنارة',
    ],

    'SEARCH_LIGHT_POINTS': [
      'Rechercher un point lumineux',
      'البحث عن نقطة إنارة',
    ],

    'FILTER_LIGHT_POINTS_BY_STATUS': [
      'Filtrer les points lumineux par statut',
      'تصفية نقاط الإنارة حسب الحالة',
    ],

    'UPDATE_LIGHT_POINT_STATUS': [
      'Modifier le statut d’un point lumineux',
      'تعديل حالة نقطة إنارة',
    ],

    'COUNT_LIGHT_POINTS': [
      'Consulter le nombre de points lumineux',
      'عرض عدد نقاط الإنارة',
    ],

    'COUNT_LIGHT_POINTS_BY_STATUS': [
      'Consulter le nombre de points lumineux par statut',
      'عرض عدد نقاط الإنارة حسب الحالة',
    ],

    // FAILURES
    'REPORT_FAILURE': [
      'Déclarer une panne',
      'الإبلاغ عن عطل',
    ],

    'GET_FAILURE': [
      'Consulter une panne',
      'عرض عطل',
    ],

    'GET_ALL_FAILURE': [
      'Consulter les pannes',
      'عرض الأعطال',
    ],

    'COUNT_FAILURES': [
      'Consulter le nombre de pannes',
      'عرض عدد الأعطال',
    ],

    // INTERVENTIONS
    'SCHEDULE_INTERVENTION': [
      'Planifier une intervention',
      'برمجة تدخل',
    ],

    'START_INTERVENTION': [
      'Démarrer une intervention',
      'بدء تدخل',
    ],

    'COMPLETE_INTERVENTION': [
      'Terminer une intervention',
      'إنهاء تدخل',
    ],

    'GET_INTERVENTION': [
      'Consulter une intervention',
      'عرض تدخل',
    ],

    'SEARCH_INTERVENTIONS': [
      'Rechercher une intervention',
      'البحث عن تدخل',
    ],

    'COUNT_INTERVENTIONS_BY_STATUS': [
      'Consulter le nombre d’interventions par statut',
      'عرض عدد التدخلات حسب الحالة',
    ],

    // NOTIFICATIONS
    'COUNT_NOTIF': [
      'Consulter le nombre de notifications',
      'عرض عدد الإشعارات',
    ],

    'FILTER_NOTIF_BY_STATUS': [
      'Filtrer les notifications par statut',
      'تصفية الإشعارات حسب الحالة',
    ],

    'MARK_NOTIF_AS_READ': [
      'Marquer une notification comme lue',
      'تحديد إشعار كمقروء',
    ],

    'MARK_ALL_NOTIF_AS_READ': [
      'Marquer toutes les notifications comme lues',
      'تحديد جميع الإشعارات كمقروءة',
    ],

    'GET_ACCIDENT_NOTIFICATION': [
      'Consulter les notifications d’accidents',
      'عرض إشعارات الحوادث',
    ],

    'GET_DISPOSAL_NOTIFICATION': [
      'Consulter les notifications de mise hors service',
      'عرض إشعارات الإخراج من الخدمة',
    ],

    'GET_FUEL_TANK_NOTIFICATION': [
      'Consulter les notifications de carburant',
      'عرض إشعارات الوقود',
    ],

    'GET_MAINTENANCE_NOTIFICATION': [
      'Consulter les notifications de maintenance',
      'عرض إشعارات الصيانة',
    ],

    'GET_RENTAL_NOTIFICATION': [
      'Consulter les notifications de location',
      'عرض إشعارات الكراء',
    ],

    'GET_FAILURE_NOTIFICATION': [
      'Consulter les notifications de pannes',
      'عرض إشعارات الأعطال',
    ],

    'GET_INTERVENTION_NOTIFICATION': [
      'Consulter les notifications d’interventions',
      'عرض إشعارات التدخلات',
    ],

    'GET_ITEM_REQUEST_NOTIFICATION': [
      'Consulter les notifications de demandes de fourniture',
      'عرض إشعارات طلبات التموين',
    ],

    // LEGACY
    'GET_ALL_USERS': [
      'Consulter les utilisateurs',
      'عرض المستخدمين',
    ],

    'GET_USER_INFOS': [
      'Consulter les détails d’un utilisateur',
      'عرض تفاصيل مستخدم',
    ],

    'GET_ROLE_INFOS': [
      'Consulter les permissions d’un rôle',
      'عرض صلاحيات الدور',
    ],

    'CREATE_ARTICLE': [
      'Ajouter un article',
      'إضافة مادة',
    ],

    'UPDATE_ARTICLE': [
      'Modifier un article',
      'تعديل مادة',
    ],

    'DELETE_ARTICLE': [
      'Supprimer un article',
      'حذف مادة',
    ],

    'GET_ALL_ARTICLES': [
      'Consulter les articles',
      'عرض المواد',
    ],

    'CREATE_STOCK_ENTRY': [
      'Enregistrer une entrée de stock',
      'تسجيل إدخال للمخزون',
    ],

    'CREATE_STOCK_EXIT': [
      'Enregistrer une sortie de stock',
      'تسجيل إخراج من المخزون',
    ],

    'CREATE_SUPPLY_REQUEST': [
      'Créer une demande de fourniture',
      'إنشاء طلب تموين',
    ],

    'VALIDATE_SUPPLY_REQUEST': [
      'Valider une demande de fourniture',
      'الموافقة على طلب تموين',
    ],

    'REJECT_SUPPLY_REQUEST': [
      'Refuser une demande de fourniture',
      'رفض طلب تموين',
    ],

    'GET_STOCK_HISTORY': [
      'Consulter l’historique du stock',
      'عرض سجل المخزون',
    ],

    'GET_STOCK_ALERTS': [
      'Consulter les alertes de stock',
      'عرض تنبيهات المخزون',
    ],

    'CREATE_LIGHT': [
      'Ajouter un point lumineux',
      'إضافة نقطة إنارة',
    ],

    'UPDATE_LIGHT': [
      'Modifier un point lumineux',
      'تعديل نقطة إنارة',
    ],

    'DELETE_LIGHT': [
      'Supprimer un point lumineux',
      'حذف نقطة إنارة',
    ],

    'GET_ALL_LIGHTS': [
      'Consulter les points lumineux',
      'عرض نقاط الإنارة',
    ],

    'CREATE_INTERVENTION': [
      'Planifier une intervention',
      'برمجة تدخل',
    ],

    'UPDATE_INTERVENTION': [
      'Modifier une intervention',
      'تعديل تدخل',
    ],

    'GENERATE_REPORT': [
      'Générer un rapport',
      'إنشاء تقرير',
    ],

    'EXPORT_PDF': [
      'Exporter un rapport en PDF',
      'تصدير تقرير بصيغة PDF',
    ],

    'EXPORT_EXCEL': [
      'Exporter un rapport en Excel',
      'تصدير تقرير بصيغة Excel',
    ],

    'UPDATE_PROFILE': [
      'Modifier le profil',
      'تعديل الملف الشخصي',
    ],

    'CHANGE_PASSWORD': [
      'Changer le mot de passe',
      'تغيير كلمة المرور',
    ],

    'MANAGE_SETTINGS': [
      'Gérer les paramètres',
      'إدارة الإعدادات',
    ],
  };

  static String of(
    BuildContext context,
    String permission,
  ) {
    final normalized =
        permission
            .trim()
            .toUpperCase();

    final labels =
        _labels[
          normalized
        ];

    if (labels != null) {
      return context.tr(
        labels[0],
        labels[1],
      );
    }

    final fallback =
        normalized
            .split('_')
            .map(
              (part) =>
                  part
                      .toLowerCase(),
            )
            .join(' ');

    if (fallback.isEmpty) {
      return permission;
    }

    return '${fallback[0].toUpperCase()}${fallback.substring(1)}';
  }
}