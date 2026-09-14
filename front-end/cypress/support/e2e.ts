/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
      assertNoMojibake(): Chainable<void>;
      assertPageHealthy(): Chainable<void>;
      currentAuthUser(): Chainable<any>;
      visitProtected(path: string): Chainable<void>;
    }
  }
}

const mojibakePattern = /(Ã.|Â.|â€™|â€“|â€”|â€œ|â€|Ø.|Ù.|�)/;

Cypress.Commands.add("loginAsAdmin", () => {
  cy.env(["ADMIN_EMAIL", "ADMIN_PASSWORD"]).then(
    ({ ADMIN_EMAIL, ADMIN_PASSWORD }) => {
      const email = String(ADMIN_EMAIL ?? "");
      const password = String(ADMIN_PASSWORD ?? "");

      // Do not assert directly on secret values: only on derived booleans.
      expect(Boolean(email), "ADMIN_EMAIL configured").to.eq(true);
      expect(Boolean(password), "ADMIN_PASSWORD configured").to.eq(true);

      cy.visit("/connexion");
      cy.get('input[type="email"]')
        .first()
        .clear()
        .type(email, { log: false });
      cy.get('input[type="password"]')
        .first()
        .clear()
        .type(password, { log: false });
      cy.get('button[type="submit"]').first().click();

      cy.location("pathname", { timeout: 15000 }).should((pathname) => {
        expect(
          ["/tableau-de-bord", "/profil"].some((p) =>
            pathname.startsWith(p),
          ),
        ).to.eq(true);
      });

      cy.window()
        .its("localStorage")
        .invoke("getItem", "user")
        .should("not.be.null");
    },
  );
});

Cypress.Commands.add("assertNoMojibake", () => {
  cy.get("body")
    .invoke("text")
    .then((text) => expect(text).not.to.match(mojibakePattern));
});

Cypress.Commands.add("assertPageHealthy", () => {
  cy.get("body").should("be.visible");
  cy.get("body")
    .invoke("text")
    .should(
      "not.match",
      /Whitelabel Error Page|Internal Server Error|Application Error/i,
    );
  cy.get("body").invoke("text").should("not.be.empty");
});

Cypress.Commands.add("currentAuthUser", () => {
  return cy.window().then((win) => {
    const raw = win.localStorage.getItem("user");
    expect(raw).not.to.be.null;
    return raw ? JSON.parse(raw) : null;
  });
});

Cypress.Commands.add("visitProtected", (path: string) => {
  cy.visit(path);
  cy.location("pathname", { timeout: 12000 }).should((pathname) => {
    expect([path, "/403", "/connexion"]).to.include(pathname);
  });
  cy.assertPageHealthy();
});

Cypress.on("uncaught:exception", (err) => {
  if (/ResizeObserver loop|Leaflet|tile/i.test(err.message)) return false;
});

export {};
