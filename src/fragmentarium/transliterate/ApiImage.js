import React, { Component } from 'react'
import { Image } from 'react-bootstrap'
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
    return <Image src={this.image} alt={this.props.fileName} responsive />
  }
}

export default withData(
  ApiImage,
  props => `/images/${props.fileName}`,
  {
    method: 'fetchBlob'
  }
)
