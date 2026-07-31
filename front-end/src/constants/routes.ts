export const ROUTES = {
  LOGIN: "/connexion",
  FORGOT_PASSWORD: "/mot-de-passe-oublie",
  RESET_PASSWORD: "/reinitialiser-mot-de-passe",

  DASHBOARD: "/tableau-de-bord",

  USERS: "/utilisateurs",
  ADD_USER: "/utilisateurs/ajouter",
  USER_DETAILS: "/utilisateurs/:id",
  EDIT_USER: "/utilisateurs/:id/modifier",

  ROLES: "/roles",
  BIENS: "/biens",
  SETTINGS: "/parametres",

  ADD_ROLE: "/roles/ajouter",
  ROLE_DETAILS: "/roles/:id",
  EDIT_ROLE: "/roles/:id/modifier",
} as const;