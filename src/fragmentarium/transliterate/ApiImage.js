import React, { Component } from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from 'ExternalLink'
import withData from 'http/withData'

class ApiImage extends Component {
  constructor (props) {
    super(props)
    this.image = URL.createObjectURL(props.data)
  }

  componentWillUnmount () {
    URL.revokeObjectURL(this.image)
  }

  render () {
    return <ExternalLink href={this.image}>
      <Image src={this.image} alt={this.props.fileName} responsive />
    </ExternalLink>
  }
}

export default withData(
  ApiImage,
  props => `/images/${props.fileName}`,
  { method: 'fetchBlob' }
)
