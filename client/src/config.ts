// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'qz8aifyw0b'
export const apiEndpoint = `https://${apiId}.execute-api.eu-west-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-gr6sydvl.eu.auth0.com',            // Auth0 domain
  clientId: 'ORV2A8bl4ohbXpbuUS6ex1NXyyUeFLtI',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
