export const ROUTES = {
  // Auth
  LOGIN: "/connexion",
  FORGOT_PASSWORD: "/mot-de-passe-oublie",
  RESET_PASSWORD: "/reinitialiser-mot-de-passe",
  UNAUTHORIZED: "/403",

  // Dashboard
  DASHBOARD: "/tableau-de-bord",

  // Users
  USERS: "/utilisateurs",
  ADD_USER: "/utilisateurs/ajouter",
  USER_DETAILS: "/utilisateurs/:id",
  EDIT_USER: "/utilisateurs/:id/modifier",

  // Roles
  ROLES: "/roles",
  ADD_ROLE: "/roles/ajouter",
  ROLE_DETAILS: "/roles/:id",
  EDIT_ROLE: "/roles/:id/modifier",

  // Biens
  BIENS: "/biens",
  ADD_BIEN: "/biens/ajouter",
  BIEN_DETAILS: "/biens/:id",
  EDIT_BIEN: "/biens/:id/modifier",
  BIENS_ARCHIVE: "/biens/archives",

  // Stock
  STOCK: "/stock",
  ADD_ARTICLE: "/stock/articles/ajouter",
  ARTICLE_DETAILS: "/stock/articles/:id",
  EDIT_ARTICLE: "/stock/articles/:id/modifier",
  STOCK_HISTORY: "/stock/historique",

  // Éclairage
  LIGHTING: "/eclairage",
  ADD_LIGHT: "/eclairage/ajouter",
  LIGHT_DETAILS: "/eclairage/:id",
  EDIT_LIGHT: "/eclairage/:id/modifier",
  LIGHTING_HISTORY: "/eclairage/historique",

  // Reports
  REPORTS: "/rapports",

  // Other
  SETTINGS: "/parametres",
  NOTIFICATIONS: "/notifications",
  PROFILE: "/profil",
} as const;