class AppPermission {
  AppPermission({
    required this.id,
    required this.name,
    required this.permission,
  });

  final int id;
  final String name;
  final String permission;

  factory AppPermission.fromJson(
    Map<String, dynamic> json,
  ) {
    final name =
        json['name']
                ?.toString()
                .trim() ??
            '';

    return AppPermission(
      id:
          (json['id'] as num?)
                  ?.toInt() ??
              0,

      name:
          name,

      permission:
          json['permission']
                  ?.toString()
                  .trim() ??
              name,
    );
  }
}

class AppRole {
  AppRole({
    required this.id,
    required this.name,
    required this.permissions,
  });

  final int id;
  String name;
  Set<String> permissions;

  factory AppRole.fromJson(
    Map<String, dynamic> json,
  ) {
    final permissions = <String>{};

    final rawPermissions =
        json['permissions'];

    if (rawPermissions is List) {
      for (final item in rawPermissions) {
        if (item is Map) {
          final permissionName =
              item['name']
                  ?.toString()
                  .trim();

          if (permissionName != null &&
              permissionName.isNotEmpty) {
            permissions.add(
              permissionName,
            );
          }
        } else if (item is String) {
          final permissionName =
              item.trim();

          if (permissionName.isNotEmpty) {
            permissions.add(
              permissionName,
            );
          }
        }
      }
    }

    return AppRole(
      id:
          (json['id'] as num?)
                  ?.toInt() ??
              0,
      name:
          json['name']
                  ?.toString()
                  .trim() ??
              '',
      permissions:
          permissions,
    );
  }
}

class AppUser {
  AppUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.firstNameAr,
    required this.lastNameAr,
    required this.email,
    required this.gender,
    required this.phone,
    required this.cin,
    required this.role,
    this.password = '',
    this.isActive = true,
  });

  final int id;

  String firstName;
  String lastName;

  String firstNameAr;
  String lastNameAr;

  String email;
  String gender;
  String phone;
  String cin;

  AppRole role;

  String password;

  bool isActive;

  String get fullName =>
      '$firstName $lastName'.trim();

  String get fullNameAr =>
      '$firstNameAr $lastNameAr'.trim();

  factory AppUser.fromCurrentUserJson(
    Map<String, dynamic> json,
  ) {
    final email =
        json['email']
                ?.toString()
                .trim() ??
            '';

    final frenchFullName =
        _splitName(
      json['fullname_fr']
          ?.toString(),
      fallback:
          email.isNotEmpty
              ? email
                  .split('@')
                  .first
              : '',
    );

    final arabicFullName =
        _splitName(
      json['fullname_ar']
          ?.toString(),
      fallback: '',
    );

    final firstName =
        json['firstname_fr']
                ?.toString()
                .trim() ??
            '';

    final lastName =
        json['lastname_fr']
                ?.toString()
                .trim() ??
            '';

    final firstNameAr =
        json['firstname_ar']
                ?.toString()
                .trim() ??
            '';

    final lastNameAr =
        json['lastname_ar']
                ?.toString()
                .trim() ??
            '';

    final roleJson =
        json['role'];

    final accountStatus =
        json['accountStatus']
                ?.toString()
                .trim()
                .toUpperCase() ??
            '';

    return AppUser(
      id:
          (json['id'] as num?)
                  ?.toInt() ??
              0,

      firstName:
          firstName.isNotEmpty
              ? firstName
              : frenchFullName.$1,

      lastName:
          lastName.isNotEmpty
              ? lastName
              : frenchFullName.$2,

      firstNameAr:
          firstNameAr.isNotEmpty
              ? firstNameAr
              : arabicFullName.$1,

      lastNameAr:
          lastNameAr.isNotEmpty
              ? lastNameAr
              : arabicFullName.$2,

      email:
          email,

      gender:
          json['gender']
                  ?.toString()
                  .trim() ??
              '',

      phone:
          json['phone']
                  ?.toString()
                  .trim() ??
              '',

      cin:
          json['cin']
                  ?.toString()
                  .trim()
                  .toUpperCase() ??
              '',

      role:
          roleJson is Map
              ? AppRole.fromJson(
                  Map<String, dynamic>.from(
                    roleJson,
                  ),
                )
              : AppRole(
                  id: 0,
                  name: '',
                  permissions: {},
                ),

      password: '',

      isActive:
          accountStatus !=
              'INACTIVE',
    );
  }

  static (String, String)
      _splitName(
    String? value, {
    required String fallback,
  }) {
    final normalized =
        value?.trim() ?? '';

    if (normalized.isEmpty ||
        normalized.toLowerCase() ==
            'null null') {
      return (
        fallback,
        '',
      );
    }

    final parts =
        normalized
            .split(
              RegExp(r'\s+'),
            )
            .where(
              (part) =>
                  part.isNotEmpty,
            )
            .toList();

    if (parts.isEmpty) {
      return (
        fallback,
        '',
      );
    }

    return (
      parts.first,
      parts
          .skip(1)
          .join(' '),
    );
  }
}