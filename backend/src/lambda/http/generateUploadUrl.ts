import 'source-map-support/register'

//import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import * as AWS from 'aws-sdk'

import {getUploadUrl} from '../../businessLogic/items'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'

import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'
import { Item } from '../../models/Item'

// get express class
const app = express()

// import body parser
app.use(express.json())

const docClient = new AWS.DynamoDB.DocumentClient()

const logger = createLogger('generateUploadUrl')

const ItemsTable = process.env.JOURNAL_ITEMS_TABLE

//request get Items
app.post('/items/:itemId/attachment', async(_req, res) => {
  //post all items
  res.setHeader('Access-Control-Allow-Origin', '*');

  const itemId = _req.params.itemId

  const headers = _req.headers
  const authorization = headers.authorization

  const split = authorization.split(' ')
  const jwtToken = split[1]
 
  const userId = parseUserId(jwtToken)
  
  try{
    //Check is item exists
    const validItem =  await itemExists(userId, itemId) as Item

    if(!validItem)
        throw new Error('item not exists')

    const url = await getUploadUrl(itemId)

    res.json({
      uploadUrl: url
    })
  }
  catch(e)
  {
    logger.error("post created fail", {error: e.message})
  }

  
})

const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => {awsServerlessExpress.proxy(server, event, context)}

async function itemExists(userId:string, itemId:string): Promise<Item>
{
    const result = await docClient
    .get({
        TableName: ItemsTable,
        Key: {
        userId: userId,
        itemId: itemId
        }
    })
    .promise()

    return result.Item as Item
}