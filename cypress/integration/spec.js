describe("Aperture Science Enhancement Center Cypress Tests", () => {
  it("finds the home page", function () {
    cy.visit("http://host.docker.internal:3000");
    cy.get("h1");
  });

  it("cant find the subjects page without logging in", function () {
    cy.visit("http://host.docker.internal:3000/subjects");
    cy.location("pathname").should("eq", "/");
  });

  it("can log in and see a list of subjects", function () {
    cy.visit("http://host.docker.internal:3000");
    cy.get("#email").type(Cypress.env("email"));
    cy.get("#password").type(Cypress.env("password"));

    cy.get("#submit").click({ force: true });
    // Waiting time below is tricky coz if less time it hasn't been directed to subjects page yet
    // But if a bit more time it has loaded the subjects-table instead of skeleton
    // So not passing every time
    cy.wait(16000);

    cy.location("pathname").should("eq", "/subjects");
    cy.get("h1").contains("Testing Subjects");

    // Use alias limits the waiting time, so use cy.wait(20000) directly to give it more time waiting
    // cy.intercept("POST", "http://host.docker.internal/graphql").as("graphql");
    cy.intercept("POST", "http://host.docker.internal/graphql");

    cy.get("h1").contains("Testing Subjects");
    cy.get('div[data-testid="skeleton"]');

    // Each cy.wait() command has a default requestTimeout of 5000 ms,
    // Failed sometimes coz cy.wait() timed out waiting `5000ms` before going to the 2nd phase
    // cy.wait('@graphql');
    cy.wait(20000);
    cy.get('table[data-testid="subjects-table"]');
  });

  it("can request subjects", function () {
    const query = `
      query {
        subjects {
          id
          name
          test_chamber
          date_of_birth
          score
          alive
          created_at
        }
      }
    `;
    cy.request({
      method: "POST",
      url: "http://host.docker.internal/graphql",
      body: { query },
    }).then((res) => {
      cy.log(res.body);
      expect(res.body, "response body")
        .property("data")
        .property("subjects")
        // Will fail if subject number changes
        .to.have.lengthOf(163);
    });
  });

  it("cant request users without authentication", function () {
    const query = `
      query {
        users {
          id
          name
        }
      }
    `;
    cy.request({
      method: "POST",
      url: "http://host.docker.internal/graphql",
      body: { query },
    }).then((res) => {
      cy.log(res.body);
      expect(res.body, "response body").property("errors").to.exist;
    });
  });
});
