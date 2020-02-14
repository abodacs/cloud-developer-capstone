import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJH8sf96O5M+2EMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi02eTA4bTd1eS5hdXRoMC5jb20wHhcNMjAwMTE0MDcyMDM1WhcNMzMw
OTIyMDcyMDM1WjAhMR8wHQYDVQQDExZkZXYtNnkwOG03dXkuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwAjKVkR03j5OY7MfdXRdQY+1
wEswQT1XmSDYIAY73q99yQL45+K5V6gmQGU7Vtj0ZejxGsADsjK2JA8gVGw1ssC8
XS4EkaAD3KMfwcGVgjwYj+FNRP+xSkk6OSTfHU02rIqZsOobNsu3FuEYjTCGVvRV
8YKCmNA15CSy61pEaolnHb+gOC1C225AkmKpLhqg92E1NeAqL/1pOI1zm9+oAhfs
muCVZ40bXhkfJszTGZMTQfRGh8cN2TVm0WJVnUuVfcZ5hy9Nf3z149fhPfiMoSRy
sykhi+rE2aiLoiNsbGI698BNlBwrktmpV30sk/+ipNnde0X4hXfkjeGXYdNU9wID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTunwCNporB8A71Jg7U
l3sDEPthIDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBADtMd3i8
3NJzoIvygZ3xf0V487trIDS1fuXOMv9V2rD31SBcolDMvCus4Q2vIq3FScnAVXKF
mGpw2ONaLoY7hhxuTRcfJbaClQODd1buRgTvF9BzBFoBWSbNgShtNo01uA50sZUW
J1hs29pPsknWb+siFcsNJAUgCFBihbBTzIz+8xFw3JKM2AzEaaonD/xOEBlGhof4
66pJsaVSVQ/AvoWb2p5KxlQFYtx7XY9VnBCZsNQ9DpvstRAQBrNvsJtZUZ63UElv
FbDOfFjdd51axpAMaiEs6UZi9Y50IzKTfcW0V7PaEmjbTyjSJNJqPtj+elNlk3gg
+XZOH8tco2K5Se8=
-----END CERTIFICATE-----
`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  console.log(jwt, Axios, verify, jwt)

  return verify(token, cert,  { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
