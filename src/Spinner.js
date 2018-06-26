import React, { Component } from 'react'

class Spinner extends Component {
  render () {
    return <div><i className='fa fa-spinner fa-spin' />{this.props.children || 'Loading...'}</div>
  }
}

export default Spinner
