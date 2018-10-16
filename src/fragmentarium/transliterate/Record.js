import React, { Component, Fragment } from 'react'
import _ from 'lodash'
import Moment from 'moment'
import { extendMoment } from 'moment-range'

import './Record.css'

const moment = extendMoment(Moment)

function Date ({ date, humanFormat, machineFormat }) {
  const humanDate = date.format(humanFormat)
  const machineDate = date.format(machineFormat)
  return <time dateTime={machineDate}>{humanDate}</time>
}

function Year ({ date }) {
  return <Date date={date} humanFormat='YYYY' machineFormat='YYYY' />
}

function BasicEntry ({ entry }) {
  return (<Fragment>
    {entry.user} ({entry.type}, <Date
      date={moment(entry.date)}
      humanFormat='D/M/YYYY'
      machineFormat='YYYY-MM-DD'
    />)
  </Fragment>)
}

function HistoricalTransliteration ({ entry }) {
  const range = moment.range(entry.date)
  return (<Fragment>
    {entry.user} (Transliteration, <Year date={range.start} />–<Year date={range.end} />)
  </Fragment>)
}

function Entry ({ entry }) {
  return entry.type === 'HistoricalTransliteration'
    ? <HistoricalTransliteration entry={entry} />
    : <BasicEntry entry={entry} />
}

class Record extends Component {
  get record () {
    return _.sortBy(this.props.record, 'date')
  }

  render () {
    return (
      <section>
        <h3>Record</h3>
        <ol className='Record'>
          {this.record.map((entry, index) =>
            <li className='Record__entry' key={index}>
              <Entry entry={entry} />
            </li>
          )}
          {_.isEmpty(this.record) && <li className='Record__entry'>No record</li>}
        </ol>
      </section>
    )
  }
}

export default Record
