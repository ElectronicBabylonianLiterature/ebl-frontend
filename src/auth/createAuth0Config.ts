export default function createAuth0Config() {
  return {
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
    redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI,
    returnTo: process.env.REACT_APP_AUTH0_RETURN_TO,
    audience: 'dictionary-api',
  }
}
