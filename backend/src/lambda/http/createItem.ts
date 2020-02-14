import 'source-map-support/register'

import {createItem} from '../../businessLogic/items'
import { createLogger } from '../../utils/logger'
import { CreateItemRequest } from '../../requests/CreateItemRequest'

import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'
import { Item } from '../../models/Item'

// get express class
const app = express()

// import body parser
app.use(express.json())

const logger = createLogger('createItems')

//request get items
app.post('/items', async(_req, res) => {
  //post all items
  res.setHeader('Access-Control-Allow-Origin', '*');

  const headers = _req.headers
  const authorization = headers.authorization

  const split = authorization.split(' ')
  const jwtToken = split[1]

  try{
    var newItem: CreateItemRequest= _req.body

    const items: Item = await createItem(newItem, jwtToken)

    res.json({
      item: items
    })
  }
  catch(e)
  {    
    logger.error("post created fail", {error: e.message})
  }

  
})

const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => {awsServerlessExpress.proxy(server, event, context)}
