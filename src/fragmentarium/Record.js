import React, { Component } from 'react'
import _ from 'lodash'
import moment from 'moment'

import './Record.css'

class Record extends Component {
  get record () {
    return _.sortBy(this.props.record, 'date')
  }

  date ({date}) {
    const humanDate = moment(date).format('D/M/YYYY')
    const machineDate = moment(date).format('YYYY-MM-DD')
    return <time dateTime={machineDate}>{humanDate}</time>
  }

  render () {
    return (
      <ol className='Record'>
        {this.record.map((entry, index) =>
          <li className='Record__entry' key={index}>
            {entry.user} ({entry.type}, <this.date date={entry.date} />)
          </li>
        )}
        {_.isEmpty(this.record) && <li className='Record__entry'>No record</li>}
      </ol>
    )
  }
}

export default Record
