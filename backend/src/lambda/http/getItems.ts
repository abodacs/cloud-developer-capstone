import 'source-map-support/register'

import {getAllItems} from '../../businessLogic/Items'

import { createLogger } from '../../utils/logger'

import { parseUserId } from '../../auth/utils'

import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'

// get express class
const app = express()

const logger = createLogger('getItems')

//request get Items
app.get('/items', async(_req, res) => {
  //get all items

  const headers = _req.headers
  const authorization = headers.authorization

  const split = authorization.split(' ')
  const jwtToken = split[1]

  const userId = parseUserId(jwtToken)

  const Items = await getAllItems(userId)

  res.setHeader('Access-Control-Allow-Origin', '*');

  res.json({
    items: Items
  })
})

logger.info("start request get Items")

const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => {awsServerlessExpress.proxy(server, event, context)}
