import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'

import './Statistics.css'

function Statistics ({ data }) {
  const localizedStatistics = _.mapValues(data, value => value.toLocaleString())

  return (
    <section className='Statistics'>
      <header>Current size of the corpus:</header>
      <p className='Statistics__values'>
        <strong> {localizedStatistics.transliteratedFragments} </strong> tablets transliterated
      </p>
      <p className='Statistics__values'>
        <strong> {localizedStatistics.lines} </strong> lines of text
      </p>
    </section>
  )
}

export default withData(
  Statistics,
  props => props.fragmentService.statistics()
)
