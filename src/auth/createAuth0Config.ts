interface Auth0Config {
  readonly domain: string
  readonly clientID: string
  readonly redirectUri: string
  readonly returnTo: string
  readonly audience: string
}

export default function createAuth0Config(): Auth0Config {
  return {
    domain: process.env.REACT_APP_AUTH0_DOMAIN ?? '',
    clientID: process.env.REACT_APP_AUTH0_CLIENT_ID ?? '',
    redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI ?? '',
    returnTo: process.env.REACT_APP_AUTH0_RETURN_TO ?? '',
    audience: process.env.REACT_APP_AUTH0_AUDIENCE ?? '',
  }
}
