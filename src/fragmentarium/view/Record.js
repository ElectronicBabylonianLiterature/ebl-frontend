import React, { Component, Fragment } from 'react'

import './Record.css'

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
      date={entry.moment}
      humanFormat='D/M/YYYY'
      machineFormat='YYYY-MM-DD'
    />)
  </Fragment>)
}

function HistoricalTransliteration ({ entry }) {
  return (<Fragment>
    {entry.user} (Transliteration, <Year date={entry.moment.start} />–<Year date={entry.moment.end} />)
  </Fragment>)
}

function Entry ({ entry }) {
  return entry.type === 'HistoricalTransliteration'
    ? <HistoricalTransliteration entry={entry} />
    : <BasicEntry entry={entry} />
}

class Record extends Component {
  get record () {
    return this.props.record
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
          {this.record.isEmpty() && <li className='Record__entry'>No record</li>}
        </ol>
      </section>
    )
  }
}

export default Record
