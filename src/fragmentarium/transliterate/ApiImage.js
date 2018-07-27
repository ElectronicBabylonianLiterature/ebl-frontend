/* global AbortController */
import React, { Component } from 'react'
import { Image } from 'react-bootstrap'

class ApiImage extends Component {
  abortController = new AbortController()

  state = {
    image: ''
  }

  get imageUrl () {
    return `/images/${this.props.fileName}`
  }

  componentDidMount () {
    this.props.apiClient.fetchBlob(this.imageUrl, true, this.abortController.signal)
      .then(blob => {
        this.setState({image: URL.createObjectURL(blob)})
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          this.setState({image: ''})
        }
      })
  }

  componentWillUnmount () {
    if (this.state.image) {
      URL.revokeObjectURL(this.state.image)
    }
    this.abortController.abort()
  }

  render () {
    return <Image src={this.state.image} alt={this.props.fileName} responsive />
  }
}

export default ApiImage
