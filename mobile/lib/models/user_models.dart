class AppRole {
  AppRole({
    required this.id,
    required this.name,
    required this.permissions,
  });

  final int id;
  String name;
  Set<String> permissions;
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
    this.password = '12345678',
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
      '$firstName $lastName';

  String get fullNameAr =>
      '$firstNameAr $lastNameAr';
}
