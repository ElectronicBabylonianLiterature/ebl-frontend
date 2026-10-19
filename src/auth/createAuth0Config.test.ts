import createAuth0Config from 'auth/createAuth0Config'

const keys = [
  'REACT_APP_AUTH0_DOMAIN',
  'REACT_APP_AUTH0_CLIENT_ID',
  'REACT_APP_AUTH0_AUDIENCE',
]
const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
})

test('reads the auth0 settings from the environment', () => {
  process.env.REACT_APP_AUTH0_DOMAIN = 'test-domain.auth0.com'
  process.env.REACT_APP_AUTH0_CLIENT_ID = 'test-client-id'
  process.env.REACT_APP_AUTH0_AUDIENCE = 'test-audience'
  expect(createAuth0Config()).toEqual({
    domain: 'test-domain.auth0.com',
    clientID: 'test-client-id',
    audience: 'test-audience',
  })
})

test('falls back to empty domain, client id and audience when unset', () => {
  keys.forEach((key) => delete process.env[key])
  expect(createAuth0Config()).toEqual({
    domain: '',
    clientID: '',
    audience: '',
  })
})
