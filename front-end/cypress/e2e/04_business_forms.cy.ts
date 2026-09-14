describe("FT-WEB-05/08 — Business forms non destructifs", () => {
  beforeEach(() => cy.loginAsAdmin());

  const forms = [
    { route: "/utilisateurs/ajouter", name: "utilisateur" },
    { route: "/roles/ajouter", name: "rôle" },
    { route: "/biens/ajouter", name: "bien" },
    { route: "/stock/articles/ajouter", name: "article" },
    { route: "/eclairage/ajouter", name: "point lumineux" },
  ];

  forms.forEach(({ route, name }) => {
    it(`formulaire ${name}: validation sans création`, () => {
      cy.visit(route);
      cy.location("pathname").then((p) => {
        if (p === route) {
          cy.get('button[type="submit"]').first().click();
          cy.location("pathname").should("eq", route);
          cy.assertPageHealthy();
        } else {
          expect(p).to.eq("/403");
        }
      });
    });
  });

  const listPages = ["/utilisateurs", "/roles", "/biens", "/stock", "/eclairage"];
  listPages.forEach((route) => {
    it(`liste ${route}: contrôles métier + stabilité`, () => {
      cy.visit(route);
      cy.location("pathname").then((p) => {
        if (p === route) {
          cy.get("button, input, select, a").should("have.length.greaterThan", 2);
          cy.assertPageHealthy();
          cy.assertNoMojibake();
        } else {
          expect(p).to.eq("/403");
        }
      });
    });
  });
});
