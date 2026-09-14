describe("FT-WEB-11 — Encodage / i18n", () => {
  it("public sans mojibake", () => { cy.visit("/signaler-panne"); cy.assertNoMojibake(); });
  it("login sans mojibake", () => { cy.visit("/connexion"); cy.assertNoMojibake(); });

  it("pages principales sans mojibake", () => {
    cy.loginAsAdmin();
    ["/tableau-de-bord", "/profil", "/biens", "/stock", "/eclairage", "/notifications"].forEach((route) => {
      cy.visit(route); cy.assertNoMojibake();
    });
  });

  it("contrôle de langue présent", () => {
    cy.visit("/signaler-panne");
    cy.get("button, a").invoke("text").should((text) => {
      expect(/العربية|FR|Français|لغة/i.test(text)).to.eq(true);
    });
  });
});
