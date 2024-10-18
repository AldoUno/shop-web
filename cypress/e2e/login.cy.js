describe('Test de Login en La Candelaria', () => {
  it('Usuario logueándose en la web', () => {
    cy.visit('http://localhost:3000/auth/login/')

    cy.get("input[name=email]").type("damian@crm.com.py");
    cy.get("input[name=password]").type("passw0rd");

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