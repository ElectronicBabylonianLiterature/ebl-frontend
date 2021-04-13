interface Auth0Config {
  readonly domain: string
  readonly clientID: string
  readonly audience: string
}

export default function createAuth0Config(): Auth0Config {
  return {
    domain: process.env.REACT_APP_AUTH0_DOMAIN ?? '',
    clientID: process.env.REACT_APP_AUTH0_CLIENT_ID ?? '',
    audience: process.env.REACT_APP_AUTH0_AUDIENCE ?? '',
  }
}
