import 'package:flutter/material.dart';

import '../localization/bilingual.dart';

class PermissionLabels {
  PermissionLabels._();

  static const Map<String, List<String>> _labels = {
    'GET_ALL_USERS': [
      'Consulter les utilisateurs',
      'عرض المستخدمين',
    ],
    'GET_USER_INFOS': [
      'Consulter les détails d’un utilisateur',
      'عرض تفاصيل مستخدم',
    ],
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
    'GET_ALL_ROLES': [
      'Consulter les rôles',
      'عرض الأدوار',
    ],
    'GET_ROLE_INFOS': [
      'Consulter les détails d’un rôle',
      'عرض تفاصيل دور',
    ],
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
    'GET_ALL_ASSETS': [
      'Consulter les biens',
      'عرض الممتلكات',
    ],
    'GET_ASSET_INFOS': [
      'Consulter les détails d’un bien',
      'عرض تفاصيل ممتلك',
    ],
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
    'ASSIGN_ASSET': [
      'Affecter un bien',
      'إسناد ممتلك',
    ],
    'GET_ALL_ARTICLES': [
      'Consulter les articles',
      'عرض المواد',
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
      'قبول طلب تموين',
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
    'GET_ALL_LIGHTS': [
      'Consulter les points lumineux',
      'عرض نقاط الإنارة',
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
    'REPORT_FAILURE': [
      'Déclarer une panne',
      'الإبلاغ عن عطل',
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
      'تصدير التقرير بصيغة PDF',
    ],
    'EXPORT_EXCEL': [
      'Exporter un rapport en Excel',
      'تصدير التقرير بصيغة Excel',
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
    final labels =
        _labels[permission];

    if (labels == null) {
      return permission;
    }

    return context.tr(
      labels[0],
      labels[1],
    );
  }
}
