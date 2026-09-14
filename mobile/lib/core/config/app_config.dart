class AppConfig {
  AppConfig._();

  static const bool useMockData = true;

  /// Sur téléphone Android avec `adb reverse tcp:8080 tcp:8080`,
  /// le backend Spring Boot du PC devient accessible via 127.0.0.1:8080.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8080',
  );

  static const String appName = 'SGPBSE';
}
