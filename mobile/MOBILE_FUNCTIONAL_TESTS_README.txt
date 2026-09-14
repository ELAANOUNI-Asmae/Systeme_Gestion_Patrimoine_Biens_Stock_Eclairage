SGPBSE - MOBILE FUNCTIONAL TEST PACK
=====================================

16 non-destructive functional tests for Flutter Mobile.

Coverage:
FT-MOB-01 test configuration
FT-MOB-02 public light-points API
FT-MOB-03 public open-failures API
FT-MOB-04 anonymous /user/me security
FT-MOB-05 real login API + jwt-token cookie
FT-MOB-06 authenticated /user/me
FT-MOB-07 public page before login
FT-MOB-08 FR/AR switch
FT-MOB-09 non-destructive public failure validation
FT-MOB-10 login form + required validation
FT-MOB-11 invalid credentials
FT-MOB-12 valid login -> Dashboard
FT-MOB-13 Users / Roles / Assets navigation
FT-MOB-14 Stock / Public Lighting navigation + Stock tabs
FT-MOB-15 Reports / Notifications / Profile / Settings navigation
FT-MOB-16 logout -> public page

The pack intentionally does NOT create/delete business records.
Backend and PostgreSQL must be running. Emulator must be online.
Use a real admin/test account with enough permissions.
Do not commit integration_test/test_env.json.

INSTALL:
powershell -ExecutionPolicy Bypass -File ".\install_mobile_functional_tests.ps1" -ProjectRoot "F:\SGPBSE\Systeme_Gestion_Patrimoine_Biens_Stock_Eclairage"

Then edit:
F:\SGPBSE\Systeme_Gestion_Patrimoine_Biens_Stock_Eclairage\mobile\integration_test\test_env.json

RUN from mobile:
powershell -ExecutionPolicy Bypass -File ".\run_mobile_functional_tests.ps1"

FINAL REPORT EVIDENCE:
Take one screenshot only after the final successful run showing the last tests and "All tests passed!".
Suggested filename: FT-MOBILE-FINAL-all-tests-passed.png
