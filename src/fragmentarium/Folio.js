import React, { Component } from 'react'

import './Folio.css'

class Folio extends Component {
  render () {
    return (
      <ul className='Folio'>
        {this.props.folio.map((entry, index) =>
          <li className='Folio-entry' key={index}>{entry}</li>
        )}
      </ul>
    )
  }
}

export default Folio
