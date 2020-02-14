import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

import { Item } from '../models/Item'
import { ItemUpdate } from '../models/ItemUpdate'

export class ItemAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly ItemsTable = process.env.JOURNAL_ITEMS_TABLE,
    private readonly ItemsImageBucket = process.env.JOURNAL_ITEMS_IMAGES_S3_BUCKET) {
    }
    

  async getAllItems(userId: string): Promise<Item[]> {
    console.log('Getting all Items')

    console.log('userId:', userId)

    const result = await this.docClient.query({
      TableName: this.ItemsTable,
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues:
      {
        ':u' : userId
      }
    }).promise()

    const items = result.Items
    return items as Item[]
  }

  async createItem(item: Item): Promise<Item> {
    await this.docClient.put({
      TableName: this.ItemsTable,
      Item: item
    }).promise()

    return item
  }

  async updateItem(userId:string , ItemId: string, item: ItemUpdate): Promise<ItemUpdate> {
    await this.docClient.update({
      TableName: this.ItemsTable,
      Key: {
        "userId": userId,
        "itemId": ItemId
      },
      UpdateExpression: "set title=:t, #desc=:d, modifiedAt=:m",
      ExpressionAttributeValues:{
        ":t": item.title,
        ":d": item.desc,
        ":m": item.modifiedAt
      },
      ExpressionAttributeNames:{
        "#desc": "desc"
      }
      
    }).promise()

    console.log('updated Item', {item: ItemId})

    return item
  }

  async deleteItem(userId:string , itemId: string){
    await this.docClient.delete({
      TableName: this.ItemsTable,
      Key: {
        "userId": userId,
        "itemId": itemId
      }
    }).promise().then(result => {
      console.log("result: ", JSON.stringify(result))
    })
  }  

  async getUploadUrl(itemId:string){
    return await s3.getSignedUrl('putObject', {
      Bucket: this.ItemsImageBucket,
      Key: itemId,
      Expires: 300
    })
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
