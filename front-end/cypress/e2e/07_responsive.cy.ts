describe("FT-WEB-12 — Responsive", () => {
  it("public mobile 390x844", () => {
    cy.viewport(390, 844); cy.visit("/signaler-panne"); cy.assertPageHealthy();
    cy.get("body").should(($b) => expect($b[0].scrollWidth).to.be.at.most(420));
    cy.screenshot("FT-WEB-RESPONSIVE-PUBLIC-MOBILE");
  });

  it("public desktop", () => { cy.viewport(1366,768); cy.visit("/signaler-panne"); cy.assertPageHealthy(); });

  it("dashboard mobile", () => {
    cy.viewport(390,844); cy.loginAsAdmin(); cy.visit("/tableau-de-bord"); cy.assertPageHealthy();
    cy.screenshot("FT-WEB-RESPONSIVE-DASHBOARD-MOBILE");
  });

  it("profil mobile", () => { cy.viewport(390,844); cy.loginAsAdmin(); cy.visit("/profil"); cy.assertPageHealthy(); });
});
