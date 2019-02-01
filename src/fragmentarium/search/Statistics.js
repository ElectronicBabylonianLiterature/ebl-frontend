import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'

import './Statistics.css'

function Statistics ({ data }) {
  const localizedStatistics = _.mapValues(data, value => value.toLocaleString())

  return (
    <section className='Statistics'>
      <div className='Statistics__content'>
        <header>Current size of the corpus:</header>
        <p className='Statistics__row'>
          <span className='Statistics__value'> {localizedStatistics.transliteratedFragments} </span> tablets transliterated
        </p>
        <p className='Statistics__row'>
          <span className='Statistics__value'> {localizedStatistics.lines} </span> lines of text
        </p>
      </div>
    </section>
  )
}

export default withData(
  Statistics,
  props => props.fragmentService.statistics()
)
