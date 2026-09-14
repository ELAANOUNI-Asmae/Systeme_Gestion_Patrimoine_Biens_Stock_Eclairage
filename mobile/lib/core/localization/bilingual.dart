import 'package:flutter/material.dart';

extension BilingualContext on BuildContext {
  bool get isArabic => Localizations.localeOf(this).languageCode == 'ar';

  String tr(String fr, String ar) => isArabic ? ar : fr;
}
