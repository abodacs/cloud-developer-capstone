// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'bkb4udymr5'
export const apiEndpoint = `https://${apiId}.execute-api.eu-west-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
   domain: 'dev-6y08m7uy.auth0.com',            // Auth0 domain
   clientId: 'DjFEYQBUio69EAD8PRMg15WJxczh2lMe',          // Auth0 client id
   callbackUrl: 'http://localhost:3000/callback'
}