import React, { Component } from 'react'

class Spinner extends Component {
  render () {
    return <span><i className='fa fa-spinner fa-spin' />{this.props.children || 'Loading...'}</span>
  }
}

export default Spinner
