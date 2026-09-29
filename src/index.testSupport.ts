import createAuth0Config from 'auth/createAuth0Config'

export const mockAuth0Config = {
  domain: 'test-domain.auth0.com',
  clientID: 'test-client-id',
  audience: 'test-audience',
}

export function setupAuth0ConfigMock(): void {
  beforeEach(() => {
    ;(createAuth0Config as jest.Mock).mockReturnValue(mockAuth0Config)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
}
