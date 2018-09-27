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
        {localizedStatistics.transliteratedFragments} tablets transliterated
      </p>
      <p className='Statistics__values'>
        {localizedStatistics.lines} lines of text
      </p>
    </section>
  )
}

export default withData(
  Statistics,
  props => props.fragmentRepository.statistics()
)
