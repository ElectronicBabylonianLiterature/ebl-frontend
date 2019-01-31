import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'

import './Statistics.css'

function Statistics ({ data }) {
  const localizedStatistics = _.mapValues(data, value => value.toLocaleString())

  return (
    <div className='Wrapper'>
      <section className='Statistics'>
        <header>Current size of the corpus:</header>
        <p className='Statistics__values'>
          <span className='Statistics_value'> {localizedStatistics.transliteratedFragments} </span> tablets transliterated
        </p>
        <p className='Statistics__values'>
          <span className='Statistics_value'> {localizedStatistics.lines} </span> lines of text
        </p>
      </section>
    </div>
  )
}

export default withData(
  Statistics,
  props => props.fragmentService.statistics()
)
