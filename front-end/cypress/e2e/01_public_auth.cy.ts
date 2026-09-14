describe("FT-WEB-01/02 — Public + Auth", () => {
  it("root -> page publique", () => {
    cy.visit("/");
    cy.location("pathname").should("eq", "/signaler-panne");
    cy.contains(/Signaler une panne d[’']éclairage public/i).should("be.visible");
    cy.contains(/Accès public.*aucun compte requis/i).should("be.visible");
    cy.assertNoMojibake();
  });

  it("page publique sans login", () => {
    cy.clearCookies(); cy.clearLocalStorage();
    cy.visit("/signaler-panne");
    cy.get("form").should("exist");
    cy.get('a[href="/connexion"]').should("exist");
    cy.assertPageHealthy();
  });

  it("validation du formulaire public vide", () => {
    cy.visit("/signaler-panne");
    cy.get("form").find('button[type="submit"]').click();
    cy.contains(/Veuillez saisir la localisation de la panne|Veuillez choisir l’endroit de la panne sur la carte|Veuillez décrire la panne constatée/i).should("be.visible");
  });

  it("formulaire login visible", () => {
    cy.visit("/connexion");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.get('button[type="submit"]').should("exist");
    cy.assertNoMojibake();
  });

  it("login invalide refusé", () => {
    cy.visit("/connexion");
    cy.get('input[type="email"]').type("cypress.invalid@example.invalid");
    cy.get('input[type="password"]').type("WrongPassword!123");
    cy.get('button[type="submit"]').click();
    cy.location("pathname", { timeout: 10000 }).should("eq", "/connexion");
  });

  it("login réel réussi", () => {
    cy.loginAsAdmin();
    cy.currentAuthUser().then((user) => {
      expect(user).to.have.property("email");
      expect(user).to.have.property("role");
    });
    cy.screenshot("FT-WEB-LOGIN-SUCCESS");
  });

  it("mot de passe oublié accessible", () => {
    cy.visit("/mot-de-passe-oublie");
    cy.get('input[type="email"]').should("exist");
    cy.assertPageHealthy();
  });

  it("route protégée refuse visiteur", () => {
    cy.clearCookies(); cy.clearLocalStorage();
    cy.visit("/profil");
    cy.location("pathname").should("eq", "/connexion");
  });
});
