import React, { Component } from 'react'
import { Image } from 'react-bootstrap'

class BlobImage extends Component {
  constructor (props) {
    super(props)
    this.image = URL.createObjectURL(props.data)
  }

  componentWillUnmount () {
    URL.revokeObjectURL(this.image)
  }

  render () {
    return <Image src={this.image} alt={this.props.alt} fluid />
  }
}

export default BlobImage
