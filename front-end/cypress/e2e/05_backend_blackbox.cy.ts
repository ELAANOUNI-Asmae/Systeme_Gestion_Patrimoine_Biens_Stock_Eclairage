describe("FT-WEB-10 — Backend black-box", () => {
  const api = "http://localhost:8081";

  it("points lumineux publics sans login", () => {
    cy.request(`${api}/sgpbse/lightPoint/public/all`).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.be.an("array");
    });
  });

  it("pannes publiques ouvertes sans login", () => {
    cy.request(`${api}/sgpbse/failure/public/open`).then((r) =>
      expect(r.status).to.eq(200),
    );
  });

  it("/user/me refuse anonyme", () => {
    cy.clearCookies();
    cy.request({
      url: `${api}/sgpbse/user/me`,
      failOnStatusCode: false,
    }).then((r) => {
      expect([401, 403]).to.include(r.status);
    });
  });

  it("login API réel puis /user/me", () => {
    cy.env(["ADMIN_EMAIL", "ADMIN_PASSWORD"]).then(
      ({ ADMIN_EMAIL, ADMIN_PASSWORD }) => {
        const email = String(ADMIN_EMAIL ?? "");
        const password = String(ADMIN_PASSWORD ?? "");

        expect(Boolean(email), "ADMIN_EMAIL configured").to.eq(true);
        expect(Boolean(password), "ADMIN_PASSWORD configured").to.eq(true);

        cy.request({
          method: "POST",
          url: `${api}/sgpbse/auth/login`,
          body: { email, pwd: password },
          log: false,
        })
          .its("status")
          .should("eq", 200);
      },
    );

    cy.request(`${api}/sgpbse/user/me`).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.have.property("email");
    });
  });
});
