import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJQoL0tv6hGdF7MA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1ncjZzeWR2bC5ldS5hdXRoMC5jb20wHhcNMjAwMjA4MDk1OTI1WhcN
MzMxMDE3MDk1OTI1WjAkMSIwIAYDVQQDExlkZXYtZ3I2c3lkdmwuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwkOhBuyL7B5zoHVu
CVSo93gEgBSiNlws+J21PGARBvUU9YOjV7OMrOSx9LbbgTHN9koLWINRizJ6TS23
x6NQtRa8nzAXXr3l7WR7bFLg50qzDWRnIMZk8GJ7364i0AwfMtJZ7QE4n0sKtpbu
sMHxeiPi1BVr2QxR2I6r8IgPHn4qhHACeMWgHO5Q0rZdzZ1jAi+2Uvw4Fi8Bt/D1
3NGKHFtLLHYCkuCEIjIHQPcOLyKUsMcY5l94yoqHibwHWBsantW0igQz4TWEV/2o
V9fpUozrqISjtF1Jb0FYHgMIq0vX0SSnt4ryOiqe1Z6CV85bdIbGnfubk6jcBCHa
MDsBVwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQXaUvujCge
TW0R3OoXDID2dE8jZjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AKi4oB8zwzLE77TgOx8NcLw0/GJrqJRq+clAQCXVoJhBz0eM4OfrZNWTr+6Fhh/Q
MWkNnLPj0XV6TDhKtKPRwvEi97WwlFlpydyrjW9RZnkFicgS94wk04dGZhx/PxpU
EyC4RzNo12vcz0ZQgh7HNIOhTC7aSx7BLFfuZgN7CX0quZVwG02ru1Fj5lw1TrUv
2vMfQak96Wz+UDdh+L8OgtKugMDK2Eu4bJJL1Ncg7CogEUMIC5qGAbAh3FdVY/sW
UuGhqPltx2idssDO6D93vRwSHJhI0SNj8llKXK9OXPghyesvX43b/g4NX8IonTfa
ShQNF2C659Bz+FIQJr/0KT8=
-----END CERTIFICATE-----`

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
