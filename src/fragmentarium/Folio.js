import React, { Component } from 'react'
import _ from 'lodash'

import './Folio.css'

class Folio extends Component {
  render () {
    return (
      <ul className='Folio'>
        {this.props.folio.map((entry, index) =>
          <li key={index}>{entry}</li>
        )}
        {_.isEmpty(this.props.folio) && <li>No folios</li>}
      </ul>
    )
  }
}

export default Folio
