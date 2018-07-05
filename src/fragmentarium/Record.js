import React, { Component } from 'react'
import _ from 'lodash'
import moment from 'moment'

import './Record.css'

function formatDate (date) {
  return moment(date).format('D/M/YYYY')
}

class Record extends Component {
  get record () {
    return _.sortBy(this.props.record, 'date')
  }

  render () {
    return (
      <ol className='Record'>
        {this.record.map((entry, index) =>
          <li className='Record-entry' key={index}>
            {entry.user} ({entry.type}, {formatDate(entry.date)})
          </li>
        )}
      </ol>
    )
  }
}

export default Record
