import React, { Component } from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from './ExternalLink'

class BlobImage extends Component {
  constructor (props) {
    super(props)
    this.image = URL.createObjectURL(props.data)
  }

  componentWillUnmount () {
    URL.revokeObjectURL(this.image)
  }

  render () {
    return <ExternalLink href={this.image}>
      <Image src={this.image} alt={this.props.alt} fluid />
    </ExternalLink>
  }
}

export default BlobImage
