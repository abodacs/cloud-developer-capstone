import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Segment,
  Form,
  Container
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, updateItem, getUploadUrl, uploadFile } from '../api/items-api'
import Auth from '../auth/Auth'
import { Item } from '../types/Item'
import {UploadState} from '../components/EditItem'
import Jimp from 'jimp'

interface ItemsProps {
  auth: Auth
  history: History
}

interface ItemsState {
  items: Item[]
  newItemTitle: string
  newItemDesc: string
  newItemImage: any
  loadingItems: boolean

  //image upload state
  uploadState: UploadState
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    items: [],
    newItemTitle: '',
    newItemDesc: '',
    newItemImage: undefined,
    loadingItems: true,

    uploadState: UploadState.NoUpload
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemTitle: event.target.value })
  }

  handleDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemDesc: event.target.value })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      newItemImage: files[0]
    })
  }  

  handleSubmit = (event:React.SyntheticEvent) =>{
    this.onItemCreate(event)
  }

  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/items/${itemId}/edit`)
  }

  onItemCreate = async (event: React.SyntheticEvent) => {
    try {
      console.log('image:', this.state.newItemImage)

      const newItem = await createItem(this.props.auth.getIdToken(), {
        title: this.state.newItemTitle,
        desc: this.state.newItemDesc
      })

      if(newItem)
      {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newItem.itemId)

        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.newItemImage)
      }

      this.setState({
        items: [...this.state.items, newItem],
        newItemTitle: '',
        newItemDesc: '',
        newItemImage: '',
        uploadState: UploadState.NoUpload
      })

      this.renderCreateItemInput()

      alert('Item was uploaded!')

    } catch(e) {
      alert('Item creation failed')
    }
  }

  onItemDelete = async (itemId: string) => {
    try {
      await deleteItem(this.props.auth.getIdToken(), itemId)
      this.setState({
        items: this.state.items.filter(item => item.itemId != itemId)
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  
  async componentDidMount() {
    try {
      const items = await getItems(this.props.auth.getIdToken())
      this.setState({
        items,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        {this.renderCreateItemInput()}

        {this.renderItems()}
      </div>
    )
  }

  renderCreateItemInput() {
    return (
      <div>

        <Divider horizontal><h2>Write new diary</h2></Divider>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
              <label>Title</label>
              <input
                type="text"
                placeholder="Enter Title..."
                onChange={this.handleTitleChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Desc</label>
              <input
                type="text"
                placeholder="Enter Description..."
                onChange={this.handleDescChange}
              />
            </Form.Field>
            <Form.Field>
              <label>File</label>
              <input
                type="file"
                accept="image/*"
                name="filePath"
                placeholder="Image to upload"
                onChange={this.handleFileChange}
              />
            </Form.Field>

            {this.renderButton()}

        </Form>
      </div>
    )
  }

  renderItems() {
    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return this.renderItemsList()
  }

  renderLoading() {
    return (
      
      <Grid.Row>
        <Divider horizontal><h3>Your Diaries</h3></Divider>

        <Loader indeterminate active inline="centered">
          Loading Items
        </Loader>
      </Grid.Row>
    )
  }

  renderItemsList() {
    return (
      <Container>
        <Divider horizontal><h3>Your Diaries</h3></Divider>

        <Grid>
          {this.state.items.map((item, pos) => {
            return (
              <Grid.Row centered={true} key={item.itemId}>
                <Grid.Column width={8}>
                  <Segment>
                    <Image src={item.ImageUrl} />
                  </Segment>
                </Grid.Column>
                <Grid.Column width={4}>
                  <Segment>
                    {item.title}
                  </Segment>
                  <Segment>
                    {item.desc}
                  </Segment>
                  <Segment>
                    last modified<br></br>
                    {item.createdAt}
                  </Segment>
                </Grid.Column>
                <Grid.Column width={2}>
                  <Segment>
                    <Button icon color="blue" onClick={() => this.onEditButtonClick(item.itemId)} >
                      <Icon name="pencil" />
                    </Button>
                  </Segment>
                  <Segment>
                    <Button icon color="red" onClick={() => this.onItemDelete(item.itemId)}>
                      <Icon name="delete" />  
                    </Button>
                  </Segment>
                </Grid.Column>
              </Grid.Row>              
            )
          })}
        </Grid>
      </Container>
    )
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Submit
        </Button>
      </div>
    )
  }

  calculateCreateDate(): string {
    const date = new Date()

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  setUploadState(uploadState: UploadState)
  {
    this.setState({
      uploadState
    })
  }
}
