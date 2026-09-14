describe("FT-WEB-13 — Régression / navigation", () => {
  beforeEach(() => cy.loginAsAdmin());

  it("enchaîne les modules sans perte de session", () => {
    const routes = ["/tableau-de-bord", "/profil", "/utilisateurs", "/roles", "/biens", "/stock", "/eclairage", "/notifications"];
    routes.forEach((route) => {
      cy.visit(route);
      cy.location("pathname").should((p) => expect([route, "/403"]).to.include(p));
      cy.assertPageHealthy();
    });
    cy.window().its("localStorage").invoke("getItem", "user").should("not.be.null");
  });

  it("page publique ne casse pas la session", () => {
    cy.visit("/signaler-panne"); cy.location("pathname").should("eq", "/signaler-panne");
    cy.visit("/profil"); cy.location("pathname").should("eq", "/profil");
  });
});
