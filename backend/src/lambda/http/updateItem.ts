import 'source-map-support/register'

import * as AWS from 'aws-sdk'

import { UpdateItemRequest } from '../../requests/UpdateItemRequest'

import {updateItem} from '../../businessLogic/items'
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

const logger = createLogger('updateItem')

const itemTable = process.env.JOURNAL_ITEMS_TABLE

//request get Items
app.put('/items/:itemId', async(_req, res) => {
  //post all items
  res.setHeader('Access-Control-Allow-Origin', '*');

  logger.info('start update item:', {itemid: _req.params.itemId})

  const itemId = _req.params.itemId

  const headers = _req.headers
  const authorization = headers.authorization

  const split = authorization.split(' ')
  const jwtToken = split[1]
 
  const userId = parseUserId(jwtToken)
  
  try{
    //Check is item exists
    const validItem =  await itemExists(userId, itemId)

    if(!validItem)
        throw new Error('item not exists')

    var newItem: UpdateItemRequest= _req.body

    if(newItem.title == '')
    {
      newItem.title = validItem.title
    }

    if(newItem.desc == ''){
      newItem.desc = validItem.desc
    }

    const Items = await updateItem(userId, itemId, newItem)

    res.json({
      items: Items
    })
  }
  catch(e)
  {
    logger.error("post created fail", {error: e.message})
  }

  
})

const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => {awsServerlessExpress.proxy(server, event, context)}

async function itemExists(userId:string, itemId:string)
{
    const result = await docClient
    .get({
        TableName: itemTable,
        Key: {
        userId: userId,
        itemId: itemId
        }
    })
    .promise()

    return result.Item as Item
}