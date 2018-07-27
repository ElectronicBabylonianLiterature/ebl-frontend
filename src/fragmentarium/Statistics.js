import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'

import './Statistics.css'

function Statistics ({data}) {
  const localizedStatistics = _.mapValues(data, value => value.toLocaleString())

  return (
    <section className='Statistics'>
      <header>Current size of the corpus:</header>
      <p className='Statistics__values'>
        {localizedStatistics.transliteratedFragments} tablets transliterated<br />
        {localizedStatistics.lines} lines of text
      </p>
    </section>
  )
}

export default withData(
  Statistics,
  props => '/statistics',
  (prevProps, props) => false,
  false
)
