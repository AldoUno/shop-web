describe('Test de Login en Santa Librada', () => {
  it('Usuario logeandose en la web', () => {
    cy.visit('http://localhost:3000/')

    cy.get("input[name=email]").type("santiago-heilborn@ajvierci.com.py");
    cy.get("input[name=password]").type("H4zun4n0n1");

    cy.contains('Iniciar Sesión').focus()
    cy.contains('Iniciar Sesión').click()

    cy.wait(5000)
    
    cy.location("pathname").should("include", "/");

    cy.get('.layout-topbar').should('contain', 'DEVOLUCIONES');

    cy.getCookie('token').should('exist')

    cy.reload()

    cy.contains('Inicio')
  })
})