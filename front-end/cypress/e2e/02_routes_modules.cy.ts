describe("FT-WEB-03/09 — Routes modules + permissions", () => {
  beforeEach(() => cy.loginAsAdmin());

  const routes = [
    "/tableau-de-bord", "/utilisateurs", "/utilisateurs/ajouter", "/roles", "/roles/ajouter",
    "/biens", "/biens/ajouter", "/biens/archives", "/stock", "/stock/articles/ajouter",
    "/stock/historique", "/eclairage", "/eclairage/ajouter", "/eclairage/historique",
    "/notifications", "/profil", "/rapports", "/parametres"
  ];

  routes.forEach((route) => {
    it(`route ${route} saine ou 403 selon permission`, () => {
      cy.visitProtected(route);
      cy.assertNoMojibake();
    });
  });

  it("403 explicite saine", () => { cy.visit("/403"); cy.assertPageHealthy(); });
  it("404 saine", () => { cy.visit("/route-cypress-inexistante"); cy.assertPageHealthy(); });
});
