import React, { Component } from 'react'
import { Image } from 'react-bootstrap'

class ApiImage extends Component {
  state = {
    image: ''
  }

  get imageUrl () {
    return `/images/${this.props.fileName}`
  }

  componentDidMount () {
    this.props.apiClient.fetchBlob(this.imageUrl)
      .then(blob => {
        this.setState({image: URL.createObjectURL(blob)})
      })
      .catch(() => this.setState({image: ''}))
  }

  componentWillUnmount () {
    if (this.state.image) {
      URL.revokeObjectURL(this.state.image)
    }
  }

  render () {
    return <Image src={this.state.image} alt={this.props.fileName} responsive />
  }
}

export default ApiImage
