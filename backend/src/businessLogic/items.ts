import * as uuid from 'uuid'

import { Item } from '../models/Item'
import { ItemAccess } from '../dataLayer/itemsAccess'
import { CreateItemRequest } from '../requests/CreateItemRequest'
import { UpdateItemRequest } from '../requests/UpdateItemRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'
import { ItemUpdate } from '../models/ItemUpdate'

const logger = createLogger('items')
const itemAccess = new ItemAccess()

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getAllItems(userId: string): Promise<Item[]> {
    try{
        logger.info('[Items] start getAllItems')
        return itemAccess.getAllItems(userId)
    }
    catch(e){
        console.log(e.message);
    }
    
}

export async function createItem(
  createItemRequest: CreateItemRequest,
  jwtToken: string
): Promise<Item> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  const imageUrl = `https://${bucketName}.s3.amazonaws.com/${itemId}`

  const _title = createItemRequest.title

  const _desc = createItemRequest.desc

  const date = new Date().toISOString()

  logger.info('create Item', {item: itemId})

  return await itemAccess.createItem({
    userId: userId,
    itemId: itemId,
    title: _title,
    desc: _desc,
    ImageUrl: imageUrl,
    createdAt: date,
    modifiedAt: date
  })
}

export async function updateItem(
  userId: string,
  itemId: string,
  updateItemRequest: UpdateItemRequest
): Promise<ItemUpdate> {
  const date = new Date().toISOString()

  return await itemAccess.updateItem(userId, itemId, {
    title: updateItemRequest.title,
    desc: updateItemRequest.desc,
    modifiedAt: date
  })
}

export async function deleteItem(
  userId: string,
  itemId: string ){

  return await itemAccess.deleteItem(userId, itemId)
}

export async function getUploadUrl(itemId:string){
  return await itemAccess.getUploadUrl(itemId)
}

