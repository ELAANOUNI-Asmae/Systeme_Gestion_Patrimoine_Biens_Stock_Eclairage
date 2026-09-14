describe("FT-WEB-04 — Dashboard + Profil", () => {
  beforeEach(() => cy.loginAsAdmin());

  it("dashboard charge", () => {
    cy.visit("/tableau-de-bord");
    cy.assertPageHealthy();
    cy.assertNoMojibake();
    cy.get("article, section, main, div").should("have.length.greaterThan", 5);
    cy.screenshot("FT-WEB-DASHBOARD");
  });

  it("profil correspond à l'utilisateur connecté", () => {
    cy.visit("/profil");
    cy.location("pathname").should("eq", "/profil");
    cy.currentAuthUser().then((user) => {
      if (user?.email) cy.get("body").should("contain.text", user.email);
    });
    cy.assertNoMojibake();
  });
});
